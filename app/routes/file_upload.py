
from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
from ..client.supabase_client import supabase

BUCKET_NAME = "Resume Storage"
router = APIRouter()

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

@router.get("/all_files")
async def list_files():
    try:
        files = supabase.storage.from_(BUCKET_NAME).list()
        return [
            {
                "name": file["name"],
                "url": file["name"],  # or generate public URL
                "uploadedAt": file["created_at"][:10],  # Format date
            }
            for file in files
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))