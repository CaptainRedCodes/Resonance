from typing import List, Optional
from pydantic import BaseModel

class PersonalInfo(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    linkedin: Optional[str] = ""
    github: Optional[str] = ""
    location: Optional[str] = ""
    website: Optional[str] = ""

class EducationItem(BaseModel):
    college: str = ""
    degree: str = ""

class ExperienceItem(BaseModel):
    company: str = ""
    role: str = ""
    dates: str = ""
    description: List[str] = []

class ProjectItem(BaseModel):
    title: str = ""
    description: List[str] = []

class ResumeContent(BaseModel):
    education: List[EducationItem] = []
    experience: List[ExperienceItem] = []
    skills: List[str] = []
    projects: List[ProjectItem] = []
    certifications: List[str] = []
    languages: List[str] = []
    summary: str = ""
    raw_markdown: str = ""
    extracted_text: str = ""
