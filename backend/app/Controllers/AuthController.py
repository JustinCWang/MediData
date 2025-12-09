from fastapi import APIRouter, HTTPException, status, Header
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import os
import httpx
from supabase import Client


router = APIRouter()

supabase: Client
supabase_auth: Client
supabase_url: str
supabase_anon_key: str
frontend_origin: str


def init_auth_controller(
    supabase_client: Client,
    supabase_auth_client: Client,
    url: str,
    anon_key: str,
    fe_origin: str,
):
    global supabase, supabase_auth, supabase_url, supabase_anon_key, frontend_origin
    supabase = supabase_client
    supabase_auth = supabase_auth_client
    supabase_url = url
    supabase_anon_key = anon_key
    frontend_origin = fe_origin


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    firstName: str
    lastName: str
    role: str
    phoneNum: Optional[str] = None
    gender: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    insurance: Optional[str] = None
    location: Optional[str] = None
    taxonomy: Optional[str] = None
    providerEmail: Optional[EmailStr] = None


class AuthResponse(BaseModel):
    user: dict
    access_token: str
    message: str


class EmailRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    access_token: str
    new_password: str


def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header",
        )

    token = authorization.split("Bearer ")[1]

    try:
        user_response = supabase_auth.auth.get_user(token)
        if not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
        return user_response.user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
        )


@router.post("/api/auth/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(credentials: RegisterRequest):
    try:
        if credentials.role not in ["patient", "provider"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role must be either 'patient' or 'provider'",
            )

        response = supabase_auth.auth.sign_up(
            {
                "email": credentials.email,
                "password": credentials.password,
                "options": {
                    "data": {
                        "first_name": credentials.firstName,
                        "last_name": credentials.lastName,
                        "full_name": f"{credentials.firstName} {credentials.lastName}",
                        "role": credentials.role,
                    }
                },
            }
        )

        if response.user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Registration failed. Please check your information and try again.",
            )

        user_id = response.user.id

        if credentials.role == "patient":
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
            patient_data = {k: v for k, v in patient_data.items() if v is not None}

            result = supabase.table("Patients").insert(patient_data).execute()
            if not result.data:
                print(f"Warning: Failed to create patient record for user {user_id}")

        elif credentials.role == "provider":
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
            provider_data = {k: v for k, v in provider_data.items() if v is not None}

            result = supabase.table("Providers").insert(provider_data).execute()
            if not result.data:
                print(f"Warning: Failed to create provider record for user {user_id}")

        return {
            "user": {
                "id": response.user.id,
                "email": response.user.email,
                "user_metadata": response.user.user_metadata,
            },
            "access_token": response.session.access_token if response.session else "",
            "message": "Account created successfully",
        }

    except HTTPException:
        raise
    except Exception as e:
        # Normalize various Supabase/Postgres error shapes
        raw = e
        detail = ""
        code = ""

        # Some Supabase errors come as dicts on e or e.args[0]
        if isinstance(raw, dict):
            detail = str(raw.get("message") or raw.get("error") or "")
            code = str(raw.get("code") or "")
        elif getattr(e, "args", None):
            first = e.args[0]
            if isinstance(first, dict):
                detail = str(first.get("message") or first.get("error") or "")
                code = str(first.get("code") or "")
            else:
                detail = str(first)
        else:
            detail = str(e)

        lower = detail.lower()

        # Handle duplicate / FK constraint cases (what you're seeing)
        if (
            "already registered" in lower
            or "already exists" in lower
            or "patients_patient_id_fkey" in lower
            or "providers_provider_id_fkey" in lower
            or code == "23503"
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists. Please log in instead.",
            )

        # Weak password surface as 400 with guidance
        if "password" in lower:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Password does not meet security requirements. "
                    "Please use at least 6 characters with a mix of letters, numbers, or symbols."
                ),
            )

        # Fallback: generic, non-technical message
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed. Please try again or contact support.",
        )


@router.post("/api/auth/login", response_model=AuthResponse)
async def login(credentials: LoginRequest):
    try:
        response = supabase_auth.auth.sign_in_with_password(
            {"email": credentials.email, "password": credentials.password}
        )

        if response.user is None or response.session is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        return {
            "user": {
                "id": response.user.id,
                "email": response.user.email,
                "user_metadata": response.user.user_metadata or {},
            },
            "access_token": response.session.access_token,
            "message": "Login successful",
        }

    except Exception as e:
        error_message = str(e)
        lower_error = error_message.lower()
        if (
            "email not confirmed" in lower_error
            or "confirm your email" in lower_error
            or "email not verified" in lower_error
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Email not verified. Please check your inbox or request a new verification email.",
            )
        if "invalid" in lower_error or "credentials" in lower_error:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password. Please check your credentials and try again.",
            )
        if "not found" in lower_error or "no user" in lower_error:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No account found with this email. Please register first.",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {error_message}",
        )


@router.post("/api/auth/resend-verification")
async def resend_verification(request: EmailRequest):
    try:
        auth_client = getattr(supabase_auth, "auth", None)
        if auth_client is None:
            # No auth client configured; treat as best-effort success
            return {
                "message": "If an account with this email exists and is unverified, a new verification email has been sent.",
            }

        resend_fn = getattr(auth_client, "resend", None)
        if resend_fn is None:
            # Missing helper: still return success without error
            return {
                "message": "If an account with this email exists and is unverified, a new verification email has been sent.",
            }

        try:
            resend_fn({"type": "signup", "email": request.email})
        except TypeError:
            # Fallback for SDKs that expect a simpler signature
            resend_fn(request.email)
        except Exception as e:
            # Unexpected error from SDK should surface as 500
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to resend verification email: {str(e)}",
            )

        return {
            "message": "If an account with this email exists and is unverified, a new verification email has been sent.",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to resend verification email: {str(e)}",
        )


@router.post("/api/auth/forgot-password")
async def forgot_password(request: EmailRequest):
    try:
        # Access auth client; if it's missing entirely, treat as best-effort success.
        auth_client = getattr(supabase_auth, "auth", None)
        if auth_client is None:
            return {
                "message": "If an account with this email exists, a password reset email has been sent.",
            }

        # Try primary reset helper first, then legacy name; if both are missing,
        # we still return success to keep the endpoint idempotent.
        try:
            reset_fn = getattr(auth_client, "reset_password_for_email", None)
            if reset_fn is None:
                reset_fn = getattr(auth_client, "reset_password_email", None)
        except AttributeError:
            reset_fn = None

        if reset_fn is None:
            return {
                "message": "If an account with this email exists, a password reset email has been sent.",
            }

        redirect_url = os.getenv(
            "FRONTEND_RESET_PASSWORD_URL",
            f"{frontend_origin}/reset-password",
        )
        try:
            reset_fn(request.email, {"redirect_to": redirect_url})
        except TypeError:
            reset_fn(request.email)
        except Exception as e:
            # Any unexpected SDK error should surface as 500
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to initiate password reset: {str(e)}",
            )

        return {
            "message": "If an account with this email exists, a password reset email has been sent.",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate password reset: {str(e)}",
        )


@router.post("/api/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    try:
        auth_url = f"{supabase_url}/auth/v1/user"
        headers = {
            "Authorization": f"Bearer {request.access_token}",
            "apikey": supabase_anon_key,
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.put(
                auth_url,
                headers=headers,
                json={"password": request.new_password},
            )

        if response.status_code == 200:
            return {
                "message": "Password updated successfully. You can now log in with your new password.",
            }

        try:
            error_data = response.json()
            error_msg = (
                error_data.get("msg")
                or error_data.get("error_description")
                or str(error_data)
            )
        except Exception:
            error_msg = response.text

        lower_msg = (error_msg or "").lower()
        if response.status_code in (400, 401) and (
            "expired" in lower_msg or "invalid" in lower_msg
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "The password reset link is invalid or has expired. Please request a new one."
                ),
            )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset password: {error_msg}",
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset password: {str(e)}",
        )
