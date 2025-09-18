from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from ..client.supabase_client import supabase
from ..services.auth_util import get_current_user
import os
from dotenv import load_dotenv
load_dotenv()

router = APIRouter()

BUCKET_NAME = os.getenv("BUCKET_NAME")
if not BUCKET_NAME:
    raise ValueError("BUCKET_NAME environment variable is not set")


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["id"]
    file_path = f"{user_id}/{file.filename}"  # store under user-specific folder

    try:
        content = await file.read()
        res = supabase.storage.from_(str(BUCKET_NAME)).upload(
            file_path,
            content
        )

        if isinstance(res, dict) and res.get("error"):
            raise HTTPException(status_code=500, detail=f"Upload failed: {res['error']['message']}")

        return {"message": "File uploaded successfully", "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/all_files")
async def list_files(current_user: dict = Depends(get_current_user)):
    """List files uploaded by the logged-in user (with signed URLs)"""
    try:
        user_id = current_user["id"]
        files = supabase.storage.from_(str(BUCKET_NAME)).list(user_id)

        file_list = []
        for file in files:
            signed_url_data = supabase.storage.from_(str(BUCKET_NAME)).create_signed_url(
                f"{user_id}/{file['name']}",
                3600  # 1 hour expiry
            )
            signed_url = signed_url_data.get("signedURL")

            file_list.append({
                "name": file["name"],
                "url": signed_url,
                "uploadedAt": file.get("created_at", "")[:10] if file.get("created_at") else None,
            })

        return file_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/download/{filename}")
async def download_file(filename: str, current_user: dict = Depends(get_current_user)):
    """Generate a fresh signed URL for downloading a specific file"""
    try:
        user_id = current_user["id"]
        file_path = f"{user_id}/{filename}"

        signed_url_data = supabase.storage.from_(str(BUCKET_NAME)).create_signed_url(
            file_path,
            600  # 10 min expiry
        )
        signed_url = signed_url_data.get("signedURL")

        if not signed_url:
            raise HTTPException(status_code=404, detail="File not found")

        return {"download_url": signed_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete/{filename}")
async def delete_file(filename: str, current_user: dict = Depends(get_current_user)):
    """Delete a file uploaded by the logged-in user"""
    try:
        user_id = current_user["id"]
        file_path = f"{user_id}/{filename}"

        res = supabase.storage.from_(str(BUCKET_NAME)).remove([file_path])

        error = getattr(res, 'error', None) if not isinstance(res, dict) else res.get('error')
        if error:
            error_message = error.get('message') if isinstance(error, dict) else str(error)
            raise HTTPException(status_code=500, detail=f"Delete failed: {error_message}")

        return {"message": f"File '{filename}' deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))