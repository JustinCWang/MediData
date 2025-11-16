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
from fastapi import FastAPI, HTTPException, status, Query, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv
from supabase import create_client, Client
import httpx
from uuid import UUID

# Load environment variables from .env file
load_dotenv()

# Initialize Supabase clients
# Service role key bypasses RLS and should only be used on the backend
# Anon key is used for auth operations that need to respect user context
supabase_url = os.getenv("SUPABASE_URL")
supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")

if not supabase_url:
    raise ValueError("SUPABASE_URL must be set in .env file")
if not supabase_service_key:
    raise ValueError("SUPABASE_SERVICE_ROLE_KEY must be set in .env file")
if not supabase_anon_key:
    raise ValueError("SUPABASE_ANON_KEY must be set in .env file")

# Service role client for admin operations (bypasses RLS)
supabase: Client = create_client(supabase_url, supabase_service_key)
# Anon client for auth operations (respects user context)
supabase_auth: Client = create_client(supabase_url, supabase_anon_key)

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
    role: str  # 'patient' or 'provider'
    phoneNum: Optional[str] = None
    gender: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    insurance: Optional[str] = None
    # Provider-specific fields
    location: Optional[str] = None
    taxonomy: Optional[str] = None
    providerEmail: Optional[EmailStr] = None


class ProfileUpdateRequest(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    phoneNum: Optional[str] = None
    gender: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    insurance: Optional[str] = None
    # Provider-specific fields
    location: Optional[str] = None
    taxonomy: Optional[str] = None


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


def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Extract and verify user from Authorization header
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )
    
    token = authorization.split("Bearer ")[1]
    
    try:
        # Verify token and get user (use anon key for auth operations)
        user_response = supabase_auth.auth.get_user(token)
        if not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        return user_response.user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )


@app.post("/api/auth/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(credentials: RegisterRequest):
    """
    User registration endpoint
    
    Creates a new user account in Supabase with email and password authentication.
    Creates corresponding entry in Patients or Providers table based on role.
    
    Args:
        credentials: RegisterRequest containing email, password, role, and profile information
    
    Returns:
        AuthResponse: User data and access token
    
    Raises:
        HTTPException: If registration fails (email already exists, weak password, etc.)
    """
    try:
        # Validate role
        if credentials.role not in ['patient', 'provider']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role must be either 'patient' or 'provider'"
            )
        
        # Register user with Supabase Auth (use anon key for auth operations)
        response = supabase_auth.auth.sign_up({
            "email": credentials.email,
            "password": credentials.password,
            "options": {
                "data": {
                    "first_name": credentials.firstName,
                    "last_name": credentials.lastName,
                    "full_name": f"{credentials.firstName} {credentials.lastName}",
                    "role": credentials.role
                }
            }
        })
        
        if response.user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration failed. Please check your information and try again."
            )
        
        user_id = response.user.id
        
        # Create entry in Patients or Providers table
        if credentials.role == 'patient':
            patient_data = {
                "patient_id": user_id,
                "first_name": credentials.firstName,
                "last_name": credentials.lastName,
                "phone_num": credentials.phoneNum,
                "gender": credentials.gender,
                "state": credentials.state,
                "city": credentials.city,
                "insurance": credentials.insurance,
            }
            # Remove None values
            patient_data = {k: v for k, v in patient_data.items() if v is not None}
            
            result = supabase.table("Patients").insert(patient_data).execute()
            if not result.data:
                # If insert fails, we should ideally rollback the auth user creation
                # For now, we'll just log the error
                print(f"Warning: Failed to create patient record for user {user_id}")
        
        elif credentials.role == 'provider':
            provider_data = {
                "provider_id": user_id,
                "first_name": credentials.firstName,
                "last_name": credentials.lastName,
                "phone_num": credentials.phoneNum,
                "gender": credentials.gender,
                "state": credentials.state,
                "city": credentials.city,
                "insurance": credentials.insurance,
                "location": credentials.location,
                "taxonomy": credentials.taxonomy,
                "email": credentials.providerEmail or credentials.email,
            }
            # Remove None values
            provider_data = {k: v for k, v in provider_data.items() if v is not None}
            
            result = supabase.table("Providers").insert(provider_data).execute()
            if not result.data:
                print(f"Warning: Failed to create provider record for user {user_id}")
        
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
    
    except HTTPException:
        raise
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
        # Authenticate user with Supabase (use anon key for auth operations)
        response = supabase_auth.auth.sign_in_with_password({
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


def search_affiliated_providers(
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
    taxonomy_description: Optional[str] = None,
    city: Optional[str] = None,
    state: Optional[str] = None
) -> list:
    """
    Search for providers in the Providers table (affiliated providers)
    
    Returns:
        list: List of provider dictionaries matching Provider interface
    """
    try:
        query = supabase.table("Providers").select("*")
        
        # Apply filters
        if first_name:
            query = query.ilike("first_name", f"%{first_name}%")
        if last_name:
            query = query.ilike("last_name", f"%{last_name}%")
        if taxonomy_description:
            query = query.ilike("taxonomy", f"%{taxonomy_description}%")
        if city:
            query = query.ilike("city", f"%{city}%")
        if state:
            query = query.ilike("state", f"%{state}%")
        
        result = query.execute()
        
        # Transform Providers table results to match Provider interface
        affiliated_results = []
        if result.data:
            for provider in result.data:
                # Build name
                first = provider.get("first_name", "")
                last = provider.get("last_name", "")
                name = f"{first} {last}".strip() if first or last else "Unknown Provider"
                
                # Build location
                provider_city = provider.get("city", "")
                provider_state = provider.get("state", "")
                location_parts = [provider_city, provider_state]
                location = ", ".join([part for part in location_parts if part]).strip()
                
                affiliated_results.append({
                    "id": provider.get("provider_id", ""),
                    "name": name,
                    "specialty": provider.get("taxonomy", "") or "Not specified",
                    "location": location or "Location not available",
                    "rating": 0,  # Providers table doesn't have ratings
                    "insurance": [provider.get("insurance", "")] if provider.get("insurance") else [],
                    "npi_number": "",  # Providers table doesn't store NPI
                    "enumeration_type": "",
                    "is_affiliated": True,  # Mark as affiliated provider
                    "email": provider.get("email", ""),
                })
        
        return affiliated_results
    except Exception as e:
        # Log error but don't fail the entire search
        import logging
        logging.error(f"Error searching affiliated providers: {str(e)}")
        return []


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
    Search for healthcare providers from both NPI Registry API and affiliated Providers table
    
    Queries both the CMS NPI Registry API and the local Providers table, then combines results.
    All parameters are optional - at least one should be provided for meaningful results.
    
    Returns:
        dict: Contains results array with provider information from both sources
    """
    # Build query parameters for NPI API, excluding None values
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
    
    all_results = []
    npi_results = []
    affiliated_results = []
    
    try:
        # Search affiliated providers from Providers table
        affiliated_results = search_affiliated_providers(
            first_name=first_name,
            last_name=last_name,
            taxonomy_description=taxonomy_description,
            city=city,
            state=state
        )
        
        # Query the NPI Registry API
        # Note: NPI API requires version parameter (2.1 is the current version)
        npi_params = params.copy()
        npi_params["version"] = "2.1"
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                "https://npiregistry.cms.hhs.gov/api/",
                params=npi_params
            )
            response.raise_for_status()
            data = response.json()
            
            # Transform NPI API response to match our Provider interface
            api_result_count = data.get("result_count", 0)
            
            if "results" in data and isinstance(data["results"], list):
                for result in data["results"]:
                    provider = transform_npi_result(result)
                    if provider:
                        provider["is_affiliated"] = False  # Mark as external provider
                        npi_results.append(provider)
        
        # Combine results - affiliated providers first, then NPI results
        all_results = affiliated_results + npi_results
        
        # Apply limit to combined results
        if limit and len(all_results) > limit:
            all_results = all_results[:limit]
        
        return {
            "result_count": len(all_results),
            "results": all_results,
            "affiliated_count": len(affiliated_results),
            "npi_count": len(npi_results),
            "api_result_count": api_result_count,  # Original NPI API count
        }
    
    except httpx.HTTPStatusError as e:
        # If NPI API fails, still return affiliated providers if available
        if affiliated_results:
            return {
                "result_count": len(affiliated_results),
                "results": affiliated_results[:limit] if limit else affiliated_results,
                "affiliated_count": len(affiliated_results),
                "npi_count": 0,
                "api_result_count": 0,
                "error": f"NPI Registry API error: {e.response.status_code}"
            }
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"NPI Registry API error: {e.response.status_code}"
        )
    except httpx.RequestError as e:
        # If NPI API fails, still return affiliated providers if available
        if affiliated_results:
            return {
                "result_count": len(affiliated_results),
                "results": affiliated_results[:limit] if limit else affiliated_results,
                "affiliated_count": len(affiliated_results),
                "npi_count": 0,
                "api_result_count": 0,
                "error": f"Failed to connect to NPI Registry API: {str(e)}"
            }
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


@app.get("/api/profile")
async def get_profile(current_user = Depends(get_current_user)):
    """
    Get user profile information
    
    Returns profile data from Patients or Providers table based on user role.
    """
    try:
        user_id = current_user.id
        user_role = current_user.user_metadata.get("role", "patient")
        
        if user_role == "provider":
            result = supabase.table("Providers").select("*").eq("provider_id", user_id).execute()
            if result.data and len(result.data) > 0:
                provider = result.data[0]
                return {
                    "role": "provider",
                    "firstName": provider.get("first_name", ""),
                    "lastName": provider.get("last_name", ""),
                    "phoneNum": provider.get("phone_num", ""),
                    "gender": provider.get("gender", ""),
                    "state": provider.get("state", ""),
                    "city": provider.get("city", ""),
                    "insurance": provider.get("insurance", ""),
                    "location": provider.get("location", ""),
                    "taxonomy": provider.get("taxonomy", ""),
                    "email": provider.get("email") or current_user.email,
                }
        else:
            result = supabase.table("Patients").select("*").eq("patient_id", user_id).execute()
            if result.data and len(result.data) > 0:
                patient = result.data[0]
                return {
                    "role": "patient",
                    "firstName": patient.get("first_name", ""),
                    "lastName": patient.get("last_name", ""),
                    "phoneNum": patient.get("phone_num", ""),
                    "gender": patient.get("gender", ""),
                    "state": patient.get("state", ""),
                    "city": patient.get("city", ""),
                    "insurance": patient.get("insurance", ""),
                    "email": current_user.email,
                }
        
        # If no profile found, return basic info
        return {
            "role": user_role,
            "firstName": current_user.user_metadata.get("first_name", ""),
            "lastName": current_user.user_metadata.get("last_name", ""),
            "phoneNum": "",
            "gender": "",
            "state": "",
            "city": "",
            "insurance": "",
            "email": current_user.email,
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching profile: {str(e)}"
        )


@app.put("/api/profile")
async def update_profile(profile_data: ProfileUpdateRequest, current_user = Depends(get_current_user)):
    """
    Update user profile information
    
    Updates profile data in Patients or Providers table based on user role.
    """
    try:
        user_id = current_user.id
        user_role = current_user.user_metadata.get("role", "patient")
        
        # Build update data, excluding None values
        update_data = {}
        if profile_data.firstName is not None:
            update_data["first_name"] = profile_data.firstName
        if profile_data.lastName is not None:
            update_data["last_name"] = profile_data.lastName
        if profile_data.phoneNum is not None:
            update_data["phone_num"] = profile_data.phoneNum
        if profile_data.gender is not None:
            update_data["gender"] = profile_data.gender
        if profile_data.state is not None:
            update_data["state"] = profile_data.state
        if profile_data.city is not None:
            update_data["city"] = profile_data.city
        if profile_data.insurance is not None:
            update_data["insurance"] = profile_data.insurance
        
        if user_role == "provider":
            if profile_data.location is not None:
                update_data["location"] = profile_data.location
            if profile_data.taxonomy is not None:
                update_data["taxonomy"] = profile_data.taxonomy
            
            result = supabase.table("Providers").update(update_data).eq("provider_id", user_id).execute()
            if result.data and len(result.data) > 0:
                provider = result.data[0]
                return {
                    "role": "provider",
                    "firstName": provider.get("first_name", ""),
                    "lastName": provider.get("last_name", ""),
                    "phoneNum": provider.get("phone_num", ""),
                    "gender": provider.get("gender", ""),
                    "state": provider.get("state", ""),
                    "city": provider.get("city", ""),
                    "insurance": provider.get("insurance", ""),
                    "location": provider.get("location", ""),
                    "taxonomy": provider.get("taxonomy", ""),
                    "email": provider.get("email") or current_user.email,
                }
        else:
            result = supabase.table("Patients").update(update_data).eq("patient_id", user_id).execute()
            if result.data and len(result.data) > 0:
                patient = result.data[0]
                return {
                    "role": "patient",
                    "firstName": patient.get("first_name", ""),
                    "lastName": patient.get("last_name", ""),
                    "phoneNum": patient.get("phone_num", ""),
                    "gender": patient.get("gender", ""),
                    "state": patient.get("state", ""),
                    "city": patient.get("city", ""),
                    "insurance": patient.get("insurance", ""),
                    "email": current_user.email,
                }
        
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating profile: {str(e)}"
        )