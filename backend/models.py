from typing import List
from pydantic import BaseModel

class UserInfo(BaseModel):
    id: str
    username: str
    global_name: str
    avatar: str

class SailInfo(BaseModel):
    user_info: UserInfo
    likes: List[str]

class AttachmentInfo(BaseModel):
    attachment_id: str
    file_name: str
    url: str
    sender_id: str
    sender_handle: str
    likes: int

class TokenRequestModel(BaseModel):
    code: str

class TokenResponseModel(BaseModel):
    access_token: str
    refresh_token: str
    user_info: UserInfo

class AttachmentRequestModel(BaseModel):
    video_only: bool