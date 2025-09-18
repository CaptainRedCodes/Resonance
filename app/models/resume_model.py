from typing import Optional
from pydantic import BaseModel


class ResumeOptimizationRequest(BaseModel):
    job_description: str
    additional_info: Optional[str]

class ResumeOptimizationResponse(BaseModel):
    optimized_latex: str