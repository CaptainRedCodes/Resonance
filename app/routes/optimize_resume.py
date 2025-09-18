
from fastapi import APIRouter, HTTPException, Query, Body, Response
from ..client.supabase_client import supabase
from ..services.latex_parser import call_ai_for_optimization
from ..models.resume_model import ResumeOptimizationRequest

BUCKET_NAME = "Resume Storage"
router = APIRouter()

@router.post("/optimize/")
async def optimize_resume(request: ResumeOptimizationRequest = Body(...),file_url: str = Query(..., description="Path of the resume file in Supabase storage")):
    """
    Optimizes a LaTeX resume and returns the raw text, ready for compilation.
    """
    try:
        try:
            data: bytes = supabase.storage.from_(BUCKET_NAME).download(file_url)
        except Exception as e:
            print(f"Supabase storage error: {e}")
            raise HTTPException(status_code=404, detail=f"File not found at path: {file_url}")

        original_content = data.decode("utf-8")
        optimized_code = await call_ai_for_optimization(original_content,request.job_description,request.additional_info or "")
        return Response(content=optimized_code, media_type="text/plain")

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred while processing the resume.")