"""
QueryController.py - Provider search routes

Provides endpoints to query provider data, proxying requests and handling search parameters.
"""
from fastapi import APIRouter, HTTPException, Query, status
from typing import Optional
import httpx
from supabase import Client
import logging
import traceback


router = APIRouter()

supabase: Client


def init_query_controller(supabase_client: Client):
    global supabase
    supabase = supabase_client


def search_affiliated_providers(
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
    taxonomy_description: Optional[str] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
) -> list:
    try:
        query = supabase.table("Providers").select("*")

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

        affiliated_results = []
        if result.data:
            for provider in result.data:
                first = provider.get("first_name", "")
                last = provider.get("last_name", "")
                name = f"{first} {last}".strip() if first or last else "Unknown Provider"

                provider_city = provider.get("city", "")
                provider_state = provider.get("state", "")
                location_parts = [provider_city, provider_state]
                location = ", ".join([part for part in location_parts if part]).strip()

                enum_type = (
                    "NPI-1" if provider.get("provider_type") == "individual" else "NPI-2"
                )

                affiliated_results.append(
                    {
                        "id": provider.get("provider_id", ""),
                        "name": name,
                        "specialty": provider.get("taxonomy", "") or "Not specified",
                        "location": location or "Location not available",
                        "rating": 0,
                        "insurance": [provider.get("insurance", "")] if provider.get("insurance") else [],
                        "npi_number": "",
                        "enumeration_type": enum_type,
                        "is_affiliated": True,
                        "email": provider.get("email", ""),
                    }
                )

        return affiliated_results
    except Exception as e:
        logging.error(f"Error searching affiliated providers: {str(e)}")
        return []


def transform_npi_result(npi_result: dict) -> Optional[dict]:
    try:
        npi_number = str(npi_result.get("number", ""))
        if not npi_number:
            return None

        basic_info = npi_result.get("basic", {})
        if not basic_info:
            return None

        enumeration_type = basic_info.get("enumeration_type")
        if not enumeration_type:
            if "organization_name" in basic_info:
                enumeration_type = "NPI-2"
            else:
                enumeration_type = "NPI-1"

        name = ""

        if (
            enumeration_type == "NPI-1"
            or "first_name" in basic_info
            or "last_name" in basic_info
        ):
            first_name = basic_info.get("first_name", "")
            last_name = basic_info.get("last_name", "")
            middle_name = basic_info.get("middle_name", "")
            credential = basic_info.get("credential", "")

            name_parts = [first_name, middle_name, last_name]
            name = " ".join([part for part in name_parts if part]).strip()
            if credential:
                name = f"{name}, {credential}"
        elif enumeration_type == "NPI-2" or "organization_name" in basic_info:
            name = basic_info.get("organization_name", "")

        if not name:
            return None

        taxonomies = npi_result.get("taxonomies", [])
        specialty = ""
        if taxonomies and len(taxonomies) > 0:
            primary_taxonomy = next(
                (t for t in taxonomies if t.get("primary", False)), None
            )
            if primary_taxonomy:
                specialty = primary_taxonomy.get("desc", "")
            else:
                specialty = taxonomies[0].get("desc", "")

        addresses = npi_result.get("addresses", [])
        location = ""
        phone = ""
        if addresses and len(addresses) > 0:
            primary_address = next(
                (a for a in addresses if a.get("address_purpose", "") == "LOCATION"),
                addresses[0],
            )
            city = primary_address.get("city", "")
            state = primary_address.get("state", "")
            postal_code = primary_address.get("postal_code", "")
            location_parts = [city, state, postal_code]
            location = ", ".join([part for part in location_parts if part]).strip()
            phone = primary_address.get("telephone_number", "") or ""

        email = ""
        endpoints = npi_result.get("endpoints", [])
        if isinstance(endpoints, list) and endpoints:
            email_endpoint = next(
                (
                    e
                    for e in endpoints
                    if "email" in str(e.get("endpoint_type", "")).lower()
                    or "email" in str(e.get("endpoint_description", "")).lower()
                ),
                None,
            )
            if email_endpoint:
                email = email_endpoint.get("endpoint", "") or ""

        return {
            "id": npi_number,
            "name": name,
            "specialty": specialty or "Not specified",
            "location": location or "Location not available",
            "phone": phone,
            "email": email,
            "rating": 0,
            "insurance": [],
            "npi_number": npi_number,
            "enumeration_type": enumeration_type,
        }
    except Exception as e:
        logging.error(f"Error transforming NPI result: {str(e)}")
        return None


@router.get("/api/providers/search")
async def search_providers(
    number: Optional[str] = Query(None, description="10-digit NPI number"),
    enumeration_type: Optional[str] = Query(
        None, description="NPI-1 (Individual) or NPI-2 (Organization)"
    ),
    taxonomy_description: Optional[str] = Query(
        None, description="Provider specialty/taxonomy"
    ),
    first_name: Optional[str] = Query(None, description="Provider first name"),
    last_name: Optional[str] = Query(None, description="Provider last name"),
    organization_name: Optional[str] = Query(None, description="Organization name"),
    city: Optional[str] = Query(None, description="City"),
    state: Optional[str] = Query(None, description="State (2-letter code)"),
    postal_code: Optional[str] = Query(None, description="Postal/ZIP code"),
    country_code: Optional[str] = Query(None, description="Country code (default: US)"),
    limit: Optional[int] = Query(10, ge=1, le=200, description="Number of results to return"),
):
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

    if not params or (len(params) == 1 and "limit" in params):
        return {"result_count": 0, "results": []}

    all_results = []
    npi_results = []
    affiliated_results = []

    try:
        affiliated_results = search_affiliated_providers(
            first_name=first_name,
            last_name=last_name,
            taxonomy_description=taxonomy_description,
            city=city,
            state=state,
        )

        npi_params = params.copy()
        npi_params["version"] = "2.1"

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                "https://npiregistry.cms.hhs.gov/api/",
                params=npi_params,
            )
            response.raise_for_status()
            data = response.json()

            api_result_count = data.get("result_count", 0)

            if "results" in data and isinstance(data["results"], list):
                for result in data["results"]:
                    provider = transform_npi_result(result)
                    if provider:
                        provider["is_affiliated"] = False
                        npi_results.append(provider)

        all_results = affiliated_results + npi_results

        if limit and len(all_results) > limit:
            all_results = all_results[:limit]

        return {
            "result_count": len(all_results),
            "results": all_results,
            "affiliated_count": len(affiliated_results),
            "npi_count": len(npi_results),
            "api_result_count": api_result_count,
        }

    except httpx.HTTPStatusError as e:
        if affiliated_results:
            return {
                "result_count": len(affiliated_results),
                "results": affiliated_results[:limit] if limit else affiliated_results,
                "affiliated_count": len(affiliated_results),
                "npi_count": 0,
                "api_result_count": 0,
                "error": f"NPI Registry API error: {e.response.status_code}",
            }
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"NPI Registry API error: {e.response.status_code}",
        )
    except httpx.RequestError as e:
        if affiliated_results:
            return {
                "result_count": len(affiliated_results),
                "results": affiliated_results[:limit] if limit else affiliated_results,
                "affiliated_count": len(affiliated_results),
                "npi_count": 0,
                "api_result_count": 0,
                "error": f"Failed to connect to NPI Registry API: {str(e)}",
            }
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to connect to NPI Registry API: {str(e)}",
        )
    except Exception as e:
        error_detail = f"Error searching providers: {str(e)}\n{traceback.format_exc()}"
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_detail,
        )


@router.get("/api/providers/{npi_number}")
async def get_provider_by_npi(npi_number: str):
    params = {"number": npi_number, "version": "2.1"}

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                "https://npiregistry.cms.hhs.gov/api/",
                params=params,
            )
            response.raise_for_status()
            data = response.json()

        results = data.get("results") or []
        if not results:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Provider not found",
            )

        provider = transform_npi_result(results[0])
        if not provider:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Provider not found",
            )

        provider["is_affiliated"] = False
        return provider

    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"NPI Registry API error: {e.response.status_code}",
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to connect to NPI Registry API: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching provider: {str(e)}",
        )
