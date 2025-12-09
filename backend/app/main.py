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
from typing import Optional, List
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, status, Query, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv
from supabase import create_client, Client
import httpx
import google.generativeai as genai

from app.Controllers.AuthController import router as auth_router, init_auth_controller, get_current_user
from app.Controllers.QueryController import router as query_router, init_query_controller
from app.Controllers.ChatbotController import (
    router as chatbot_router,
    init_chatbot_controller,
    ChatRequest,
)
from app.Controllers.RequestController import (
    router as request_router,
    init_request_controller,
    CreateRequest,
    UpdateRequest,
)

# Load environment variables from .env file
load_dotenv()

# Initialize Supabase clients
# Service role key bypasses RLS and should only be used on the backend
# Anon key is used for auth operations that need to respect user context
supabase_url = os.getenv("SUPABASE_URL")
supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")
frontend_origin = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")

if not supabase_url:
    raise ValueError("SUPABASE_URL must be set in .env file")
if not supabase_service_key:
    raise ValueError("SUPABASE_SERVICE_ROLE_KEY must be set in .env file")
if not supabase_anon_key:
    raise ValueError("SUPABASE_ANON_KEY must be set in .env file")

# Initialize Gemini AI
gemini_api_key = os.getenv("GEMINI_API_KEY")
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)
else:
    print("Warning: GEMINI_API_KEY not found in .env file. Chatbot functionality may be disabled.")

# Service role client for admin operations (bypasses RLS)
supabase: Client = create_client(supabase_url, supabase_service_key)
# Anon client for auth operations (respects user context)
supabase_auth: Client = create_client(supabase_url, supabase_anon_key)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler.

    Replaces the deprecated @app.on_event("startup") hook and performs all
    controller initialisation and router inclusion when the app starts.
    """
    # Initialise controllers with the already-created Supabase and Gemini
    # clients so tests and the running app share the same instances.
    init_auth_controller(
        supabase_client=supabase,
        supabase_auth_client=supabase_auth,
        url=supabase_url,
        anon_key=supabase_anon_key,
        fe_origin=frontend_origin,
    )
    init_query_controller(supabase_client=supabase)
    init_chatbot_controller(api_key=gemini_api_key)
    init_request_controller(supabase_client=supabase, get_current_user_fn=get_current_user)

    # Include routers once during startup
    app.include_router(auth_router)
    app.include_router(query_router)
    app.include_router(chatbot_router)
    app.include_router(request_router)

    yield


# Create the FastAPI application instance
app = FastAPI(
    title="MediData API",
    description="API for connecting patients with healthcare providers",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS configuration - allow requests from frontend dev server
# These origins match the Vite dev server default ports
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    frontend_origin,
    "https://medidata-frontend.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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



def search_affiliated_providers(
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
    taxonomy_description: Optional[str] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
) -> list:
    """Backward-compat shim calling the real implementation in QueryController.

    Kept purely for test/helpers that call app.main.search_affiliated_providers
    directly; HTTP routing for providers search lives in QueryController.
    """
    from app.Controllers.QueryController import search_affiliated_providers as _impl

    return _impl(
        first_name=first_name,
        last_name=last_name,
        taxonomy_description=taxonomy_description,
        city=city,
        state=state,
    )


def transform_npi_result(npi_result: dict) -> Optional[dict]:
    """Backward-compat shim delegating to QueryController.transform_npi_result."""
    from app.Controllers.QueryController import transform_npi_result as _impl

    return _impl(npi_result)


async def callAuthController_get_profile(current_user = Depends(get_current_user)):
    """Get the current user's profile via the existing logic in main.

    Kept in main for now (not moved to QueryController) since it depends
    on auth and role-specific tables; this ensures existing frontend calls
    to /api/profile continue to work unchanged.
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


@app.get("/api/profile")
async def callAuthController_profile(current_user = Depends(get_current_user)):
    """Wrapper that calls the auth/profile handler logic."""
    return await callAuthController_get_profile(current_user=current_user)


async def callAuthController_update_profile(profile_data: ProfileUpdateRequest, current_user = Depends(get_current_user)):
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


@app.put("/api/profile")
async def callAuthController_update_profile_route(profile_data: ProfileUpdateRequest, current_user = Depends(get_current_user)):
    """Wrapper that calls the auth/profile update logic."""
    return await callAuthController_update_profile(profile_data=profile_data, current_user=current_user)


async def callRequestController_add_favorite(provider_id: str, current_user = Depends(get_current_user)):
    """
    Add a provider to favorites
    
    Adds the specified provider to the current patient's favorites list.
    Only patients can favorite providers.
    """
    try:
        user_id = current_user.id
        user_role = current_user.user_metadata.get("role", "patient")

        # Only patients can favorite providers
        if user_role != "patient":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only patients can favorite providers"
            )

        # Determine if this is an affiliated provider (UUID) or an external NPI provider (10-digit number)
        is_npi_favorite = provider_id.isdigit() and len(provider_id) == 10

        if is_npi_favorite:
            provider_npi = int(provider_id)

            # Check if favorite already exists for this NPI
            existing = (
                supabase
                .table("FavProviders")
                .select("favorite_id")
                .eq("patient_id", user_id)
                .eq("provider_npi", provider_npi)
                .execute()
            )

            if existing.data and len(existing.data) > 0:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Provider is already in favorites"
                )

            # For NPI favorites we only store provider_npi and leave provider_id null
            insert_data = {
                "patient_id": user_id,
                "provider_npi": provider_npi,
            }
        else:
            # Affiliated provider favorite (stored by provider_id UUID)
            existing = (
                supabase
                .table("FavProviders")
                .select("favorite_id")
                .eq("patient_id", user_id)
                .eq("provider_id", provider_id)
                .execute()
            )

            if existing.data and len(existing.data) > 0:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Provider is already in favorites"
                )

            insert_data = {
                "patient_id": user_id,
                "provider_id": provider_id,
            }

        # Insert favorite
        result = supabase.table("FavProviders").insert(insert_data).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to add favorite"
            )
        
        return {"message": "Provider added to favorites", "provider_id": provider_id}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding favorite: {str(e)}"
        )


@app.post("/api/favorites/{provider_id}")
async def callRequestController_add_favorite_route(provider_id: str, current_user = Depends(get_current_user)):
    """Wrapper that calls the request/favorites add logic."""
    return await callRequestController_add_favorite(provider_id=provider_id, current_user=current_user)


async def callRequestController_remove_favorite(provider_id: str, current_user = Depends(get_current_user)):
    """
    Remove a provider from favorites
    
    Removes the specified provider from the current patient's favorites list.
    """
    try:
        user_id = current_user.id

        # Determine if this is an affiliated provider (UUID) or an external NPI provider (10-digit number)
        is_npi_favorite = provider_id.isdigit() and len(provider_id) == 10

        if is_npi_favorite:
            provider_npi = int(provider_id)
            supabase.table("FavProviders").delete().eq("patient_id", user_id).eq("provider_npi", provider_npi).execute()
        else:
            supabase.table("FavProviders").delete().eq("patient_id", user_id).eq("provider_id", provider_id).execute()

        return {"message": "Provider removed from favorites", "provider_id": provider_id}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error removing favorite: {str(e)}"
        )


@app.delete("/api/favorites/{provider_id}")
async def callRequestController_remove_favorite_route(provider_id: str, current_user = Depends(get_current_user)):
    """Wrapper that calls the request/favorites remove logic."""
    return await callRequestController_remove_favorite(provider_id=provider_id, current_user=current_user)


async def callRequestController_get_favorites(current_user = Depends(get_current_user)):
    """
    Get all favorited providers for the current patient
    
    Returns a list of provider IDs that the current patient has favorited.
    """
    try:
        user_id = current_user.id
        user_role = current_user.user_metadata.get("role", "patient")

        # Only patients can have favorites
        if user_role != "patient":
            return {"favorites": []}

        # Get favorites; include provider_npi so we can return IDs that match the search results
        result = (
            supabase
            .table("FavProviders")
            .select("provider_id, provider_npi")
            .eq("patient_id", user_id)
            .execute()
        )

        favorite_ids: list[str] = []
        if result.data:
            for fav in result.data:
                # For NPI-based favorites, return the NPI as a string so it matches the id used in search results
                provider_npi = fav.get("provider_npi")
                if provider_npi is not None:
                    favorite_ids.append(str(provider_npi))
                else:
                    favorite_ids.append(fav.get("provider_id"))

        return {"favorites": favorite_ids}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching favorites: {str(e)}"
        )


@app.get("/api/favorites")
async def callRequestController_get_favorites_route(current_user = Depends(get_current_user)):
    """Wrapper that calls the request/favorites list logic."""
    return await callRequestController_get_favorites(current_user=current_user)


async def callRequestController_get_favorite_providers(current_user = Depends(get_current_user)):
    """
    Get full provider details for all favorited providers
    
    Returns complete provider information for all providers the current patient has favorited.
    """
    try:
        user_id = current_user.id
        user_role = current_user.user_metadata.get("role", "patient")
        
        # Only patients can have favorites
        if user_role != "patient":
            return {"providers": []}
        
        # Get favorite provider IDs and NPIs
        fav_result = (
            supabase
            .table("FavProviders")
            .select("provider_id, provider_npi")
            .eq("patient_id", user_id)
            .execute()
        )
        
        if not fav_result.data or len(fav_result.data) == 0:
            return {"providers": []}

        provider_ids = [fav["provider_id"] for fav in fav_result.data if fav.get("provider_id")]
        npi_numbers = [str(fav["provider_npi"]) for fav in fav_result.data if fav.get("provider_npi") is not None]
        
        providers: list[dict] = []

        # Get affiliated provider details from Providers table
        if provider_ids:
            providers_result = (
                supabase
                .table("Providers")
                .select("*")
                .in_("provider_id", provider_ids)
                .execute()
            )

            if providers_result.data:
                for provider in providers_result.data:
                    first = provider.get("first_name", "")
                    last = provider.get("last_name", "")
                    name = f"{first} {last}".strip() if first or last else "Unknown Provider"
                    
                    provider_city = provider.get("city", "")
                    provider_state = provider.get("state", "")
                    location_parts = [provider_city, provider_state]
                    location = ", ".join([part for part in location_parts if part]).strip()
                    
                    providers.append({
                        "id": provider.get("provider_id", ""),
                        "name": name,
                        "specialty": provider.get("taxonomy", "") or "Not specified",
                        "location": location or "Location not available",
                        "phone": provider.get("phone_num", ""),
                        "email": provider.get("email", ""),
                        "rating": 0,
                        "insurance": [provider.get("insurance", "")] if provider.get("insurance") else [],
                        "is_affiliated": True,
                    })

        # Get NPI-based favorite providers from NPI Registry API
        if npi_numbers:
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    # Fetch each NPI individually so a failure for one doesn't hide all others
                    for npi in npi_numbers:
                        try:
                            npi_params = {
                                "version": "2.1",
                                "number": npi,
                            }
                            response = await client.get(
                                "https://npiregistry.cms.hhs.gov/api/",
                                params=npi_params,
                            )
                            response.raise_for_status()
                            data = response.json()

                            if "results" in data and isinstance(data["results"], list):
                                for result in data["results"]:
                                    provider = transform_npi_result(result)
                                    if provider:
                                        provider["is_affiliated"] = False
                                        providers.append(provider)
                        except Exception:
                            # Skip individual NPI failures but continue with others
                            continue
            except Exception:
                # If NPI API client setup fails, we still return affiliated providers
                pass
        
        return {"providers": providers}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching favorite providers: {str(e)}"
        )


@app.get("/api/favorites/providers")
async def callRequestController_get_favorite_providers_route(current_user = Depends(get_current_user)):
    """Wrapper that calls the request/favorites detailed list logic."""
    return await callRequestController_get_favorite_providers(current_user=current_user)


async def callRequestController_create_request(request_data: CreateRequest, current_user = Depends(get_current_user)):
    """
    Create a new appointment request
    
    Creates a new request in the Requests table for the current patient.
    Only patients can create requests.
    """
    try:
        user_id = current_user.id
        user_role = current_user.user_metadata.get("role", "patient")
        
        # Only patients can create requests
        if user_role != "patient":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only patients can create requests"
            )
        
        # Validate provider_id exists
        provider_check = supabase.table("Providers").select("provider_id").eq("provider_id", request_data.provider_id).execute()
        if not provider_check.data or len(provider_check.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Provider not found"
            )
        
        # Prepare request data
        request_insert = {
            "patient_id": user_id,
            "provider_id": request_data.provider_id,
            "message": request_data.message,
            "status": "pending",  # Default status
        }
        
        # Add optional fields if provided
        if request_data.date:
            request_insert["date"] = request_data.date
        if request_data.time:
            request_insert["time"] = request_data.time
        if request_data.npi_num is not None:
            request_insert["npi_num"] = request_data.npi_num
        
        # Insert request
        result = supabase.table("Requests").insert(request_insert).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create request"
            )
        
        return {
            "message": "Request created successfully",
            "request": result.data[0]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating request: {str(e)}"
        )


@app.post("/api/requests")
async def callRequestController_create_request_route(request_data: CreateRequest, current_user = Depends(get_current_user)):
    """Wrapper that calls the request/create logic."""
    return await callRequestController_create_request(request_data=request_data, current_user=current_user)


async def callRequestController_get_requests(current_user = Depends(get_current_user)):
    """
    Get all requests for the current user
    
    Patients: Returns requests they created
    Providers: Returns requests made to them
    """
    try:
        user_id = current_user.id
        user_role = current_user.user_metadata.get("role", "patient")
        
        # Fetch requests based on role
        if user_role == "patient":
            requests_result = supabase.table("Requests").select("*").eq("patient_id", user_id).execute()
        elif user_role == "provider":
            requests_result = supabase.table("Requests").select("*").eq("provider_id", user_id).execute()
        else:
            return {"requests": []}
        
        if not requests_result.data or len(requests_result.data) == 0:
            return {"requests": []}
        
        # Get unique provider IDs and patient IDs
        provider_ids = list(set([req.get("provider_id") for req in requests_result.data if req.get("provider_id")]))
        patient_ids = list(set([req.get("patient_id") for req in requests_result.data if req.get("patient_id")]))
        
        # Fetch provider details
        providers_map = {}
        if provider_ids:
            providers_result = supabase.table("Providers").select("*").in_("provider_id", provider_ids).execute()
            if providers_result.data:
                for provider in providers_result.data:
                    first = provider.get("first_name", "")
                    last = provider.get("last_name", "")
                    name = f"{first} {last}".strip() if first or last else "Unknown Provider"
                    providers_map[provider.get("provider_id")] = {
                        "name": name,
                        "specialty": provider.get("taxonomy", "") or "Not specified",
                    }
        
        # Fetch patient details (for providers viewing requests)
        patients_map = {}
        if user_role == "provider" and patient_ids:
            patients_result = supabase.table("Patients").select("*").in_("patient_id", patient_ids).execute()
            if patients_result.data:
                for patient in patients_result.data:
                    first = patient.get("first_name", "")
                    last = patient.get("last_name", "")
                    name = f"{first} {last}".strip() if first or last else "Unknown Patient"
                    patients_map[patient.get("patient_id")] = {
                        "name": name,
                    }
        
        # Transform requests to match frontend Request interface
        requests = []
        for req in requests_result.data:
            provider_id = req.get("provider_id")
            provider_info = providers_map.get(provider_id, {"name": "Unknown Provider", "specialty": "Not specified"})
            
            # For providers, show patient name instead of provider name
            if user_role == "provider":
                patient_id = req.get("patient_id")
                patient_info = patients_map.get(patient_id, {"name": "Unknown Patient"})
                display_name = patient_info["name"]
            else:
                display_name = provider_info["name"]
            
            # Get requested date/time (for appointment scheduling)
            request_date = req.get("date") or ""
            request_time = req.get("time") or ""
            
            # Get created_at for "requested on" timestamp
            created_at = req.get("created_at") or ""
            
            requests.append({
                "id": str(req.get("appointment_id", "")),
                "providerName": display_name,  # Provider name for patients, patient name for providers
                "specialty": provider_info["specialty"],
                "requestedDate": request_date,  # Appointment date
                "requestedTime": request_time,  # Appointment time
                "createdAt": created_at,  # When the request was created
                "status": req.get("status", "pending"),
                "message": req.get("message", ""),
                "response": req.get("response", ""),  # Provider response
                "provider_id": str(provider_id) if provider_id else "",
                "patient_id": str(req.get("patient_id", "")),
            })
        
        return {"requests": requests}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching requests: {str(e)}"
        )


@app.get("/api/requests")
async def callRequestController_get_requests_route(current_user = Depends(get_current_user)):
    """Wrapper that calls the request/list logic."""
    return await callRequestController_get_requests(current_user=current_user)


async def callRequestController_update_request(request_id: str, request_data: UpdateRequest, current_user = Depends(get_current_user)):
    """
    Update a request
    
    Patients can update: date, time, message (NOT status)
    Providers can update: status, response
    """
    try:
        user_id = current_user.id
        user_role = current_user.user_metadata.get("role", "patient")
        
        # Fetch the request to check ownership
        request_result = supabase.table("Requests").select("*").eq("appointment_id", request_id).execute()
        
        if not request_result.data or len(request_result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Request not found"
            )
        
        request = request_result.data[0]
        is_patient = user_role == "patient" and request.get("patient_id") == user_id
        is_provider = user_role == "provider" and request.get("provider_id") == user_id
        
        if not is_patient and not is_provider:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to update this request"
            )
        
        # Build update data based on role
        update_data = {}
        
        if is_patient:
            # Patients can update date, time, and message (NOT status)
            if request_data.date is not None:
                update_data["date"] = request_data.date
            if request_data.time is not None:
                # Format time as HH:MM:SS
                time_value = request_data.time
                if time_value and ':' in time_value:
                    time_parts = time_value.split(':')
                    if len(time_parts) == 2:
                        update_data["time"] = f"{time_value}:00"
                    else:
                        update_data["time"] = time_value
                else:
                    update_data["time"] = time_value
            if request_data.message is not None:
                update_data["message"] = request_data.message
            # Explicitly prevent patients from updating status
            if request_data.status is not None:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only providers can update request status"
                )
            # If the patient changes any of the request details, reset status so provider must re-approve
            if any(field in update_data for field in ["date", "time", "message"]):
                update_data["status"] = "pending"
                # Clear any previous provider response when request is effectively resubmitted
                update_data["response"] = None
        
        if is_provider:
            # Providers can update status and response
            if request_data.status is not None:
                if request_data.status not in ["pending", "approved", "rejected"]:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid status. Must be pending, approved, or rejected"
                    )
                update_data["status"] = request_data.status
            if request_data.response is not None:
                update_data["response"] = request_data.response
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid fields to update"
            )
        
        # Update request
        result = supabase.table("Requests").update(update_data).eq("appointment_id", request_id).execute()
        
        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update request"
            )
        
        return {
            "message": "Request updated successfully",
            "request": result.data[0]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating request: {str(e)}"
        )


@app.put("/api/requests/{request_id}")
async def callRequestController_update_request_route(request_id: str, request_data: UpdateRequest, current_user = Depends(get_current_user)):
    """Wrapper that calls the request/update logic."""
    return await callRequestController_update_request(request_id=request_id, request_data=request_data, current_user=current_user)


async def callRequestController_cancel_request(request_id: str, current_user = Depends(get_current_user)):
    """
    Cancel a request (patients only)
    
    Deletes the request entirely from the table.
    """
    try:
        user_id = current_user.id
        user_role = current_user.user_metadata.get("role", "patient")
        
        # Only patients can cancel requests
        if user_role != "patient":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only patients can cancel requests"
            )
        
        # Fetch the request to verify ownership
        request_result = supabase.table("Requests").select("*").eq("appointment_id", request_id).eq("patient_id", user_id).execute()
        
        if not request_result.data or len(request_result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Request not found or you don't have permission to cancel it"
            )
        
        # Delete the request entirely
        result = supabase.table("Requests").delete().eq("appointment_id", request_id).execute()
        
        return {
            "message": "Request cancelled successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error cancelling request: {str(e)}"
        )


@app.delete("/api/requests/{request_id}")
async def callRequestController_cancel_request_route(request_id: str, current_user = Depends(get_current_user)):
    """Wrapper that calls the request/cancel logic."""
    return await callRequestController_cancel_request(request_id=request_id, current_user=current_user)


async def callChatbotController_chat(chat_request: ChatRequest):
    """
    Chat endpoint using Google Gemini API
    
    Accepts a conversation history and returns the AI assistant's response.
    """
    try:
        if not gemini_api_key:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Chatbot service is not configured. Please set GEMINI_API_KEY in .env file."
            )
        
        # Initialize the model
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        if not chat_request.messages:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No messages provided"
            )
        
        # Get the last user message
        last_message = chat_request.messages[-1]
        if last_message.role != "user":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Last message must be from user"
            )
        
        # Build conversation history for context
        # Include previous messages to maintain context
        conversation_context = ""
        if len(chat_request.messages) > 1:
            context_parts = []
            for msg in chat_request.messages[:-1]:
                role_label = "User" if msg.role == "user" else "Assistant"
                context_parts.append(f"{role_label}: {msg.content}")
            conversation_context = "\n".join(context_parts) + "\n\n"
        
        # Add system context about MediData
        system_prompt = """You are a helpful assistant for MediData, a healthcare provider matching platform. 
You help users with questions about:
- Finding healthcare providers
- Understanding how to use the platform
- Provider requests and appointments
- General healthcare-related questions

Be friendly, professional, and helpful. If you don't know something specific about the platform, 
suggest that the user check the relevant page or contact support."""
        
        # Combine system prompt, conversation context, and user message
        if conversation_context:
            full_prompt = f"{system_prompt}\n\nPrevious conversation:\n{conversation_context}User: {last_message.content}\nAssistant:"
        else:
            full_prompt = f"{system_prompt}\n\nUser: {last_message.content}\nAssistant:"
        
        # Generate response
        response = model.generate_content(full_prompt)
        
        if not response or not response.text:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate response from AI"
            )
        
        return {
            "message": response.text,
            "role": "assistant"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        error_message = str(e)
        # Handle specific Gemini API errors
        if "API key" in error_message.lower() or "authentication" in error_message.lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Gemini API key. Please check your GEMINI_API_KEY in .env file."
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating chat response: {error_message}"
        )


@app.post("/api/chat")
async def callChatbotController_chat_route(chat_request: ChatRequest):
    """Wrapper that calls the chatbot controller logic."""
    return await callChatbotController_chat(chat_request=chat_request)
