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
    timestamp: int
    likes: int
    related_message_id: str

class MessageInfo(BaseModel):
    message_id: str
    content: str
    sender_id: str
    sender_handle: str
    channel_name: str
    timestamp: int
    likes: int

class TokenRequestModel(BaseModel):
    code: str

class RefreshTokenRequestModel(BaseModel):
    refresh_token: str

class TokenResponseModel(BaseModel):
    access_token: str
    refresh_token: str
    exp: int
    user_info: UserInfo

class AttachmentRequestModel(BaseModel):
    video_only: bool