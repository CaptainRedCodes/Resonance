from fastapi import APIRouter, Body, Query, Depends, HTTPException
from ..services.extract_info import ResumeParser
from app.models.resume_model import PersonalInfo, ResumeContent
from ..services.auth_util import get_current_user
from ..client.supabase_client import supabase
import os, io
from ..services.resume_parser import call_ai_for_optimization
from app.models.resume_model import ResumeContent
from ..services.auth_util import get_current_user

router = APIRouter()
BUCKET_NAME = os.getenv("BUCKET_NAME")

@router.post("/parse-resume/")
async def parse_resume(
    filename: str = Query(...),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    file_path = f"{user_id}/{filename}"

    # Download file
    try:
        pdf_bytes: bytes = supabase.storage.from_(BUCKET_NAME).download(file_path)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"File not found: {filename}")

    parser = ResumeParser()
    result = parser.parse_resume(pdf_bytes)

    personal_info = PersonalInfo(
        name=result["extracted_info"].get("name", ""),
        email=result["extracted_info"].get("email", ""),
        phone=result["extracted_info"].get("phone", ""),
        linkedin=result["extracted_info"].get("linkedin", ""),
        github=result["extracted_info"].get("github", ""),
        location=result["extracted_info"].get("location", ""),
        website=result["extracted_info"].get("website", "")
    )

    resume_content = ResumeContent(
        education=result["extracted_info"].get("education", []),
        experience=result["extracted_info"].get("experience", []),
        skills=result["extracted_info"].get("skills", []),
        projects=result["extracted_info"].get("projects", []),
        certifications=result["extracted_info"].get("certifications", []),
        languages=result["extracted_info"].get("languages", []),
        summary=result["extracted_info"].get("summary", ""),
        raw_markdown=result.get("markdown", ""),
        extracted_text=result.get("raw_text", "")
    )

    return {
        "personal_info": personal_info,
        "resume_content": resume_content
    }


@router.post("/optimize-resume/")
async def optimize_resume(
    resume_content: ResumeContent = Body(...),
    job_description: str = Body(...),
    additional_info: str | None = Body(None),
    current_user: dict = Depends(get_current_user)
):
    """
    Optimize a parsed resume content using AI.
    Personal info is NOT sent to AI.
    """
    try:
        # Convert Pydantic model to dict
        resume_data = resume_content.dict()
        
        optimized_result = call_ai_for_optimization(
            ai_data=resume_data, 
            job_description=job_description, 
            additional_info=additional_info
        )
        return optimized_result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI optimization failed: {str(e)}")
