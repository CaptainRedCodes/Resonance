
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


@dataclass
class ContactInfo:
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    website: Optional[str] = None

@dataclass
class ExperienceItem:
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: List[str] = None
    
    def __post_init__(self):
        if self.description is None:
            self.description = []

@dataclass
class EducationItem:
    degree: Optional[str] = None
    institution: Optional[str] = None
    location: Optional[str] = None
    graduation_date: Optional[str] = None
    gpa: Optional[str] = None
    relevant_coursework: List[str] = None
    
    def __post_init__(self):
        if self.relevant_coursework is None:
            self.relevant_coursework = []

@dataclass
class ProjectItem:
    name: Optional[str] = None
    description: Optional[str] = None
    technologies: List[str] = None
    url: Optional[str] = None
    date: Optional[str] = None
    
    def __post_init__(self):
        if self.technologies is None:
            self.technologies = []

@dataclass
class ResumeData:
    contact_info: ContactInfo
    sections: Dict[str, str]  # Raw sections
    experience: List[ExperienceItem]
    education: List[EducationItem]
    projects: List[ProjectItem]
    skills: Dict[str, List[str]]  # Category -> skills
    certifications: List[str]
    awards: List[str]
    publications: List[str]
    languages: List[str]
    metadata: Dict[str, Any]

class ResumeRequest(BaseModel):
    file_url: str