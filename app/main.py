from fastapi import FastAPI
from .routes.file_operation import router as file_upload_router
from .routes.optimize_resume import router as data_extract_router
from .routes.auth import router as auth_router
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
app.include_router(data_extract_router,prefix="/api", tags=["Optimize"])
app.include_router(auth_router,prefix="/auth",tags=["Authorization"])