"""
main.py - FastAPI Application Entry Point

This module contains the main FastAPI application instance and configuration.
It sets up CORS middleware to allow requests from the frontend development server
and defines API routes.

To run the server:
    uvicorn app.main:app --reload --port 8000

The app will be available at http://127.0.0.1:8000
API documentation will be available at http://127.0.0.1:8000/docs
"""

import os
from typing import Optional
from fastapi import FastAPI, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv
from supabase import create_client, Client
import httpx

# Load environment variables from .env file
load_dotenv()

# Initialize Supabase client
# These keys are kept secure on the backend and never exposed to the frontend
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file")

supabase: Client = create_client(supabase_url, supabase_key)

# Create the FastAPI application instance
app = FastAPI(
    title="MediData API",
    description="API for connecting patients with healthcare providers",
    version="0.1.0"
)

# CORS configuration - allow requests from frontend dev server
# These origins match the Vite dev server default ports
origins = ["http://localhost:5173", "http://127.0.0.1:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models for request/response validation
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    firstName: str
    lastName: str


class AuthResponse(BaseModel):
    user: dict
    access_token: str
    message: str


class ProviderSearchRequest(BaseModel):
    number: Optional[str] = None
    enumeration_type: Optional[str] = None  # NPI-1 or NPI-2
    taxonomy_description: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    organization_name: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country_code: Optional[str] = None
    limit: Optional[int] = 10


@app.get("/api/health")
def health():
    """
    Health check endpoint
    
    Returns a simple status object to verify the API is running.
    Used by the frontend to check backend connectivity.
    
    Returns:
        dict: {"status": "ok"}
    """
    return {"status": "ok"}


@app.post("/api/auth/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(credentials: RegisterRequest):
    """
    User registration endpoint
    
    Creates a new user account in Supabase with email and password authentication.
    Also stores the user's first and last name in the user metadata.
    
    Args:
        credentials: RegisterRequest containing email, password, firstName, lastName
    
    Returns:
        AuthResponse: User data and access token
    
    Raises:
        HTTPException: If registration fails (email already exists, weak password, etc.)
    """
    try:
        # Register user with Supabase Auth
        # The user metadata will store firstName and lastName
        response = supabase.auth.sign_up({
            "email": credentials.email,
            "password": credentials.password,
            "options": {
                "data": {
                    "first_name": credentials.firstName,
                    "last_name": credentials.lastName,
                    "full_name": f"{credentials.firstName} {credentials.lastName}"
                }
            }
        })
        
        if response.user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration failed. Please check your information and try again."
            )
        
        # Return user data and session token
        return {
            "user": {
                "id": response.user.id,
                "email": response.user.email,
                "user_metadata": response.user.user_metadata
            },
            "access_token": response.session.access_token if response.session else "",
            "message": "Account created successfully"
        }
    
    except Exception as e:
        error_message = str(e)
        
        # Handle common Supabase errors
        if "already registered" in error_message.lower() or "already exists" in error_message.lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists. Please log in instead."
            )
        elif "password" in error_message.lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password does not meet requirements. Please use a stronger password."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Registration failed: {error_message}"
            )


@app.post("/api/auth/login", response_model=AuthResponse)
async def login(credentials: LoginRequest):
    """
    User login endpoint
    
    Authenticates a user with email and password using Supabase Auth.
    
    Args:
        credentials: LoginRequest containing email and password
    
    Returns:
        AuthResponse: User data and access token
    
    Raises:
        HTTPException: If login fails (invalid credentials, user not found, etc.)
    """
    try:
        # Authenticate user with Supabase
        response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        
        if response.user is None or response.session is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Return user data and session token
        return {
            "user": {
                "id": response.user.id,
                "email": response.user.email,
                "user_metadata": response.user.user_metadata or {}
            },
            "access_token": response.session.access_token,
            "message": "Login successful"
        }
    
    except Exception as e:
        error_message = str(e)
        
        # Handle authentication errors
        if "invalid" in error_message.lower() or "credentials" in error_message.lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password. Please check your credentials and try again."
            )
        elif "not found" in error_message.lower() or "no user" in error_message.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No account found with this email. Please register first."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Login failed: {error_message}"
            )


@app.get("/api/providers/search")
async def search_providers(
    number: Optional[str] = Query(None, description="10-digit NPI number"),
    enumeration_type: Optional[str] = Query(None, description="NPI-1 (Individual) or NPI-2 (Organization)"),
    taxonomy_description: Optional[str] = Query(None, description="Provider specialty/taxonomy"),
    first_name: Optional[str] = Query(None, description="Provider first name"),
    last_name: Optional[str] = Query(None, description="Provider last name"),
    organization_name: Optional[str] = Query(None, description="Organization name"),
    city: Optional[str] = Query(None, description="City"),
    state: Optional[str] = Query(None, description="State (2-letter code)"),
    postal_code: Optional[str] = Query(None, description="Postal/ZIP code"),
    country_code: Optional[str] = Query(None, description="Country code (default: US)"),
    limit: Optional[int] = Query(10, ge=1, le=200, description="Number of results to return")
):
    """
    Search for healthcare providers using the NPI Registry API
    
    Queries the CMS NPI Registry API and returns provider information.
    All parameters are optional - at least one should be provided for meaningful results.
    
    Returns:
        dict: Contains results array with provider information
    """
    # Build query parameters, excluding None values
    params = {}
    if number:
        params["number"] = number
    if enumeration_type:
        params["enumeration_type"] = enumeration_type
    if taxonomy_description:
        params["taxonomy_description"] = taxonomy_description
    if first_name:
        params["first_name"] = first_name
    if last_name:
        params["last_name"] = last_name
    if organization_name:
        params["organization_name"] = organization_name
    if city:
        params["city"] = city
    if state:
        params["state"] = state
    if postal_code:
        params["postal_code"] = postal_code
    if country_code:
        params["country_code"] = country_code
    if limit:
        params["limit"] = limit
    
    # If no search parameters provided, return empty results
    if not params or (len(params) == 1 and "limit" in params):
        return {
            "result_count": 0,
            "results": []
        }
    
    try:
        # Query the NPI Registry API
        # Note: NPI API requires version parameter (2.1 is the current version)
        params["version"] = "2.1"
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                "https://npiregistry.cms.hhs.gov/api/",
                params=params
            )
            response.raise_for_status()
            data = response.json()
            
            # Transform NPI API response to match our Provider interface
            transformed_results = []
            
            # Check if we have results in the response
            # NPI API returns: {"result_count": N, "results": [...]}
            api_result_count = data.get("result_count", 0)
            
            if "results" in data and isinstance(data["results"], list):
                for result in data["results"]:
                    provider = transform_npi_result(result)
                    if provider:
                        transformed_results.append(provider)
            
            # If API returned results but we transformed none, there might be an issue
            # Return the API result count for debugging
            return {
                "result_count": len(transformed_results),
                "results": transformed_results,
                "api_result_count": api_result_count,  # Include original API count for debugging
                "debug_info": {
                    "api_returned_count": api_result_count,
                    "transformed_count": len(transformed_results),
                    "params_sent": {k: v for k, v in params.items() if k != "version"}
                } if api_result_count > 0 and len(transformed_results) == 0 else None
            }
    
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"NPI Registry API error: {e.response.status_code}"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to connect to NPI Registry API: {str(e)}"
        )
    except Exception as e:
        import traceback
        error_detail = f"Error searching providers: {str(e)}\n{traceback.format_exc()}"
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_detail
        )


def transform_npi_result(npi_result: dict) -> Optional[dict]:
    """
    Transform NPI Registry API result to match Provider interface
    
    Args:
        npi_result: Raw result from NPI Registry API
        
    Returns:
        dict: Transformed provider data matching Provider interface
    """
    try:
        # Extract basic info - NPI number is at the top level
        npi_number = str(npi_result.get("number", ""))
        
        if not npi_number:
            return None
        
        # Extract name (can be individual or organization)
        # The "basic" object contains provider information
        basic_info = npi_result.get("basic", {})
        if not basic_info:
            return None
            
        name = ""
        enumeration_type = basic_info.get("enumeration_type", "")
        
        if enumeration_type == "NPI-1" or "first_name" in basic_info or "last_name" in basic_info:
            # Individual provider
            first_name = basic_info.get("first_name", "")
            last_name = basic_info.get("last_name", "")
            middle_name = basic_info.get("middle_name", "")
            credential = basic_info.get("credential", "")
            
            # Build name with credential if available
            name_parts = [first_name, middle_name, last_name]
            name = " ".join([part for part in name_parts if part]).strip()
            if credential:
                name = f"{name}, {credential}"
        elif enumeration_type == "NPI-2" or "organization_name" in basic_info:
            # Organization
            name = basic_info.get("organization_name", "")
        
        if not name:
            return None
        
        # Extract specialty (taxonomy)
        # Taxonomies are in an array, use the primary one (usually first)
        taxonomies = npi_result.get("taxonomies", [])
        specialty = ""
        if taxonomies and len(taxonomies) > 0:
            # Find primary taxonomy (primary: true) or use first one
            primary_taxonomy = next((t for t in taxonomies if t.get("primary", False)), None)
            if primary_taxonomy:
                specialty = primary_taxonomy.get("desc", "")
            else:
                specialty = taxonomies[0].get("desc", "")
        
        # Extract location from addresses array
        addresses = npi_result.get("addresses", [])
        location = ""
        if addresses and len(addresses) > 0:
            # Find primary address or use first one
            primary_address = next((a for a in addresses if a.get("address_purpose", "") == "LOCATION"), addresses[0])
            city = primary_address.get("city", "")
            state = primary_address.get("state", "")
            postal_code = primary_address.get("postal_code", "")
            location_parts = [city, state, postal_code]
            location = ", ".join([part for part in location_parts if part]).strip()
        
        # NPI API doesn't provide rating or insurance, so we'll use defaults
        # In a real app, you'd fetch this from another source
        
        return {
            "id": npi_number,
            "name": name,
            "specialty": specialty or "Not specified",
            "location": location or "Location not available",
            "rating": 0,  # NPI API doesn't provide ratings
            "insurance": [],  # NPI API doesn't provide insurance info
            "npi_number": npi_number,
            "enumeration_type": enumeration_type,
        }
    except Exception as e:
        # Log error but don't crash - return None to skip this result
        import logging
        logging.error(f"Error transforming NPI result: {str(e)}")
        return None