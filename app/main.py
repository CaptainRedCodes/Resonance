from fastapi import FastAPI
from .routes.file_upload import router as file_upload_router
from .routes.optimize_resume import router as resume_data_extract

app = FastAPI()

BUCKET_NAME = "Resume Storage"

@app.get("/")
def helloWorld():
    return {"message": "FastAPI Running"}

# include router
app.include_router(file_upload_router, prefix="/files", tags=["File Upload"])
app.include_router(resume_data_extract,prefix="/optimize", tags=["Optimize"])