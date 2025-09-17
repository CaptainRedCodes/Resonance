import requests
from fastapi import APIRouter, HTTPException, Query

from ..models.resume import ResumeRequest
from ..supabase_client import supabase
from ..services.latex_parser import ComprehensiveLatexExtractor, extract_comprehensive_resume_data

router = APIRouter()
BUCKET_NAME = "Resume Storage"

@router.post("/resume_data")
async def parsed_resume_data(file_url: str = Query(...)):
    data = supabase.storage.from_(BUCKET_NAME).download(file_url)
    if data is None:
        raise HTTPException(status_code=400, detail="Could not fetch file from storage")
    
    content = data.decode("utf-8")
    resume_data = extract_comprehensive_resume_data(content)
    extractor = ComprehensiveLatexExtractor()
    return extractor.to_json(resume_data)
