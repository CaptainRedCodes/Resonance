from datetime import datetime

from pydantic import BaseModel


class Document(BaseModel):
    id: str
    filename: str
    file_path: str
    file_size: int
    content_type: str
    user_id: str
    created_at: datetime
    updated_at: datetime

class DocumentResponse(BaseModel):
    id: str
    filename: str
    file_size: int
    content_type: str
    created_at: datetime
