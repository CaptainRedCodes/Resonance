import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
from ..supabase_client import supabase
router = APIRouter()

BUCKET_NAME = "Resume Storage"

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    if not file or not file.filename or not file.filename.endswith(".tex"):
        raise HTTPException(status_code=400, detail="Only .tex files are allowed")

    content = await file.read()
    res = supabase.storage.from_(BUCKET_NAME).upload(file.filename, content)

    if "error" in str(res):
        raise HTTPException(status_code=500, detail=f"Upload failed: {res}")
    
    public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(file.filename)

    return {"filename": file.filename, "url": public_url}
