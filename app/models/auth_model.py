from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta

class UserSignUp(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserSignIn(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    created_at: datetime

class AuthResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

class MessageResponse(BaseModel):
    message: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class OTPRequest(BaseModel):
    email: EmailStr