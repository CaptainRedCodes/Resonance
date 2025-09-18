from fastapi import APIRouter, Body, Query, Depends, HTTPException, Response
from ..client.supabase_client import supabase
from ..services.auth_util import get_current_user
import os
from dotenv import load_dotenv
from ..models.resume_model import ResumeOptimizationRequest
from ..services.resume_parser import call_ai_for_optimization

load_dotenv()

router = APIRouter()

BUCKET_NAME = os.getenv("BUCKET_NAME")
if not BUCKET_NAME:
    raise ValueError("BUCKET_NAME environment variable is not set")


@router.post("/optimize/")
async def optimize_resume(
    request: ResumeOptimizationRequest = Body(...),
    filename: str = Query(..., description="Name of the resume file uploaded by the user"),
    current_user: dict = Depends(get_current_user)
):
    """
    Optimizes a resume file belonging to the logged-in user.
    """
    try:
        user_id = current_user["id"]
        file_path = f"{user_id}/{filename}"  # Ensure this matches your storage path

        try:
            # Fetch file securely from Supabase private bucket
            data: bytes = supabase.storage.from_(str(BUCKET_NAME)).download(file_path)
        except Exception as e:
            print(f"Supabase storage error: {e}")
            raise HTTPException(status_code=404, detail=f"File not found: {filename}")

        original_content = data.decode("utf-8")

        # Call your AI optimization function
        optimized_code = await call_ai_for_optimization(
            original_content,
            request.job_description,
            request.additional_info or ""
        )

        return Response(content=optimized_code, media_type="text/plain")

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error while processing the resume."
        )