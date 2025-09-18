from fastapi import FastAPI
from .routes.file_upload import router as file_upload_router
from .routes.optimize_resume import router as resume_data_extract
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()



@app.get("/")
def helloWorld():
    return {"message": "FastAPI Running"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# include router
app.include_router(file_upload_router, prefix="/files", tags=["File Upload"])
app.include_router(resume_data_extract,prefix="/api", tags=["Optimize"])