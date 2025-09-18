import os
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

if not all([SUPABASE_URL, SUPABASE_KEY, JWT_SECRET]):
    raise ValueError("Missing required environment variables")

supabase: Client = create_client(str(SUPABASE_URL), str(SUPABASE_KEY))
security = HTTPBearer()