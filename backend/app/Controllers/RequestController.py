"""
RequestController.py - Provider request routes

Manages CRUD operations for patient-provider requests, including listing, creation, updates, and deletions.
"""
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Optional
from supabase import Client


router = APIRouter()

supabase: Client
get_current_user = None  # type: ignore


def init_request_controller(supabase_client: Client, get_current_user_fn):
    global supabase, get_current_user
    supabase = supabase_client
    get_current_user = get_current_user_fn


class CreateRequest(BaseModel):
    provider_id: str
    message: str
    date: Optional[str] = None
    time: Optional[str] = None
    npi_num: Optional[int] = None


class UpdateRequest(BaseModel):
    date: Optional[str] = None
    time: Optional[str] = None
    message: Optional[str] = None
    status: Optional[str] = None
    response: Optional[str] = None


@router.post("/api/requests")
async def create_request(request_data: CreateRequest, current_user = Depends(get_current_user)):
    try:
        user_id = current_user.id
        user_role = current_user.user_metadata.get("role", "patient")

        if user_role != "patient":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only patients can create requests",
            )

        provider_check = (
            supabase.table("Providers")
            .select("provider_id")
            .eq("provider_id", request_data.provider_id)
            .execute()
        )
        if not provider_check.data or len(provider_check.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Provider not found",
            )

        request_insert = {
            "patient_id": user_id,
            "provider_id": request_data.provider_id,
            "message": request_data.message,
            "status": "pending",
        }

        if request_data.date:
            request_insert["date"] = request_data.date
        if request_data.time:
            request_insert["time"] = request_data.time
        if request_data.npi_num is not None:
            request_insert["npi_num"] = request_data.npi_num

        result = supabase.table("Requests").insert(request_insert).execute()

        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create request",
            )

        return {"message": "Request created successfully", "request": result.data[0]}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating request: {str(e)}",
        )


@router.get("/api/requests")
async def get_requests(current_user = Depends(get_current_user)):
    try:
        user_id = current_user.id
        user_role = current_user.user_metadata.get("role", "patient")

        if user_role == "patient":
            requests_result = (
                supabase.table("Requests").select("*").eq("patient_id", user_id).execute()
            )
        elif user_role == "provider":
            requests_result = (
                supabase.table("Requests").select("*").eq("provider_id", user_id).execute()
            )
        else:
            return {"requests": []}

        if not requests_result.data or len(requests_result.data) == 0:
            return {"requests": []}

        provider_ids = list(
            set(
                [
                    req.get("provider_id")
                    for req in requests_result.data
                    if req.get("provider_id")
                ]
            )
        )
        patient_ids = list(
            set(
                [
                    req.get("patient_id")
                    for req in requests_result.data
                    if req.get("patient_id")
                ]
            )
        )

        providers_map = {}
        if provider_ids:
            providers_result = (
                supabase.table("Providers")
                .select("*")
                .in_("provider_id", provider_ids)
                .execute()
            )
            if providers_result.data:
                for provider in providers_result.data:
                    first = provider.get("first_name", "")
                    last = provider.get("last_name", "")
                    name = f"{first} {last}".strip() if first or last else "Unknown Provider"
                    providers_map[provider.get("provider_id")] = {
                        "name": name,
                        "specialty": provider.get("taxonomy", "")
                        or "Not specified",
                    }

        patients_map = {}
        if user_role == "provider" and patient_ids:
            patients_result = (
                supabase.table("Patients")
                .select("*")
                .in_("patient_id", patient_ids)
                .execute()
            )
            if patients_result.data:
                for patient in patients_result.data:
                    first = patient.get("first_name", "")
                    last = patient.get("last_name", "")
                    name = (
                        f"{first} {last}".strip()
                        if first or last
                        else "Unknown Patient"
                    )
                    patients_map[patient.get("patient_id")] = {"name": name}

        requests = []
        for req in requests_result.data:
            provider_id = req.get("provider_id")
            provider_info = providers_map.get(
                provider_id, {"name": "Unknown Provider", "specialty": "Not specified"}
            )

            if user_role == "provider":
                patient_id = req.get("patient_id")
                patient_info = patients_map.get(
                    patient_id, {"name": "Unknown Patient"}
                )
                display_name = patient_info["name"]
            else:
                display_name = provider_info["name"]

            request_date = req.get("date") or ""
            request_time = req.get("time") or ""
            created_at = req.get("created_at") or ""

            requests.append(
                {
                    "id": str(req.get("appointment_id", "")),
                    "providerName": display_name,
                    "specialty": provider_info["specialty"],
                    "requestedDate": request_date,
                    "requestedTime": request_time,
                    "createdAt": created_at,
                    "status": req.get("status", "pending"),
                    "message": req.get("message", ""),
                    "response": req.get("response", ""),
                    "provider_id": str(provider_id) if provider_id else "",
                    "patient_id": str(req.get("patient_id", "")),
                }
            )

        return {"requests": requests}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching requests: {str(e)}",
        )


@router.put("/api/requests/{request_id}")
async def update_request(
    request_id: str,
    request_data: UpdateRequest,
    current_user = Depends(get_current_user),
):
    try:
        user_id = current_user.id
        user_role = current_user.user_metadata.get("role", "patient")

        request_result = (
            supabase.table("Requests")
            .select("*")
            .eq("appointment_id", request_id)
            .execute()
        )

        if not request_result.data or len(request_result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Request not found",
            )

        request = request_result.data[0]
        is_patient = user_role == "patient" and request.get("patient_id") == user_id
        is_provider = user_role == "provider" and request.get("provider_id") == user_id

        if not is_patient and not is_provider:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to update this request",
            )

        update_data = {}

        if is_patient:
            if request_data.date is not None:
                update_data["date"] = request_data.date
            if request_data.time is not None:
                time_value = request_data.time
                if time_value and ":" in time_value:
                    parts = time_value.split(":")
                    if len(parts) == 2:
                        time_value = f"{parts[0]}:{parts[1]}:00"
                update_data["time"] = time_value
            if request_data.message is not None:
                update_data["message"] = request_data.message
            if request_data.status is not None:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Patients cannot update request status",
                )
            if any(field in update_data for field in ["date", "time", "message"]):
                update_data["status"] = "pending"

        if is_provider:
            if request_data.status is not None:
                if request_data.status not in ["pending", "approved", "rejected"]:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid status value",
                    )
                update_data["status"] = request_data.status
            if request_data.response is not None:
                update_data["response"] = request_data.response

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid fields to update",
            )

        result = (
            supabase.table("Requests")
            .update(update_data)
            .eq("appointment_id", request_id)
            .execute()
        )

        if not result.data or len(result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update request",
            )

        return {"message": "Request updated successfully", "request": result.data[0]}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating request: {str(e)}",
        )


@router.delete("/api/requests/{request_id}")
async def cancel_request(request_id: str, current_user = Depends(get_current_user)):
    try:
        user_id = current_user.id
        user_role = current_user.user_metadata.get("role", "patient")

        if user_role != "patient":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only patients can cancel requests",
            )

        request_result = (
            supabase.table("Requests")
            .select("*")
            .eq("appointment_id", request_id)
            .eq("patient_id", user_id)
            .execute()
        )

        if not request_result.data or len(request_result.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Request not found",
            )

        supabase.table("Requests").delete().eq("appointment_id", request_id).execute()

        return {"message": "Request cancelled successfully"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error cancelling request: {str(e)}",
        )
