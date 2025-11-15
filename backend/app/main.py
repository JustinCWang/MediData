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
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv
from supabase import create_client, Client

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