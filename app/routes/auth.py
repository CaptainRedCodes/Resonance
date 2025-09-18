from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from ..services.auth_util import get_current_user
from ..models.auth_model import AuthResponse, ForgotPasswordRequest, MessageResponse, OTPRequest, UserProfile, UserSignIn, UserSignUp
from ..client.auth_client import supabase

router = APIRouter()

@router.post("/signup", response_model=MessageResponse)
async def sign_up(user_data: UserSignUp):
        """Register a new user"""
        try:
            auth_response = supabase.auth.sign_up({
                "email": user_data.email,
                "password": user_data.password,
                "options": {
                    "data": {"full_name": user_data.full_name}
                }
            })

            if auth_response.user:
                return {"message": "User created successfully. Please verify your email."}
            raise HTTPException(status_code=400, detail="Failed to create user")

        except Exception as e:
            raise HTTPException(status_code=400, detail="Signup failed")

@router.post("/signin", response_model=AuthResponse)
async def sign_in(user_data: UserSignIn):
        """Sign in user and return access token"""
        try:
            auth_response = supabase.auth.sign_in_with_password({
                "email": user_data.email,
                "password": user_data.password
            })

            if auth_response.user and auth_response.session:
                return {
                    "access_token": auth_response.session.access_token,
                    "token_type": "bearer",
                    "user": {
                        "id": auth_response.user.id,
                        "email": auth_response.user.email,
                        "full_name": auth_response.user.user_metadata.get("full_name")
                    }
                }

            raise HTTPException(status_code=401, detail="Invalid email or password")

        except Exception:
            raise HTTPException(status_code=401, detail="Invalid credentials")


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(request: ForgotPasswordRequest):
        """Send password reset link"""
        try:
            supabase.auth.reset_password_email(request.email)
            return {"message": "Password reset email sent"}
        except Exception:
            raise HTTPException(status_code=400, detail="Failed to send reset email")


@router.post("/signin-otp", response_model=MessageResponse)
async def sign_in_with_otp(request: OTPRequest):
        """Send magic link/OTP to email"""
        try:
            supabase.auth.sign_in_with_otp({"email": request.email})
            return {"message": "OTP sent to email"}
        except Exception:
            raise HTTPException(status_code=400, detail="Failed to send OTP")


@router.post("/signout", response_model=MessageResponse)
async def sign_out(current_user: str = Depends(get_current_user)):
        """Sign out current user"""
        try:
            supabase.auth.sign_out()
            return {"message": "Successfully signed out"}
        except Exception:
            raise HTTPException(status_code=400, detail="Failed to sign out")


@router.get("/profile", response_model=UserProfile)
async def get_profile(current_user: str = Depends(get_current_user)):
        """Get current user profile"""
        try:
            user = supabase.auth.get_user()
            if user and user.user and user.user.email:
                return UserProfile(
                    id=user.user.id,
                    email=user.user.email,
                    full_name=user.user.user_metadata.get("full_name"),
                    created_at=user.user.created_at
                )
            raise HTTPException(status_code=404, detail="User not found")
        except Exception:
            raise HTTPException(status_code=400, detail="Failed to fetch profile")