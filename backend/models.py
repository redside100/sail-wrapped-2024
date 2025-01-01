from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class UserInfo(BaseModel):
    id: str
    username: str
    global_name: str
    avatar: str = Field(
        default_factory="https://cdn.discordapp.com/embed/avatars/0.png"
    )


class SailInfo(BaseModel):
    user_info: UserInfo
    likes: List[str]


class AttachmentInfo(BaseModel):
    attachment_id: str
    file_name: str
    url: str
    sender_id: str
    sender_handle: str
    timestamp: str
    likes: int
    related_message_id: str
    related_channel_id: str
    related_channel_name: str
    related_message_content: str


class AttachmentSummary(BaseModel):
    attachment_id: str
    file_name: str
    url: str
    sender_handle: str
    related_message_content: str
    related_channel_name: str
    likes: Optional[int] = None
    rank: Optional[int] = None


class MessageInfo(BaseModel):
    message_id: str
    content: str
    sender_id: str
    sender_handle: str
    timestamp: int
    likes: int
    channel_id: str
    channel_name: str


class MessageSummary(BaseModel):
    message_id: str
    content: str
    sender_handle: str
    channel_name: str
    likes: Optional[int] = None
    rank: Optional[int] = None


class LikeRequestModel(BaseModel):
    id: str
    is_attachment: bool


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


class UserStats(BaseModel):
    user_nickname: str
    mentions_received: int
    mentions_given: int
    reactions_received: int
    reactions_given: int
    messages_sent: int
    attachments_sent: int
    attachments_size: int
    most_frequent_time: int
    most_mentioned_given_name: str
    most_mentioned_received_name: str
    most_mentioned_given_count: int
    most_mentioned_received_count: int


class TimeMachineScreenshot(BaseModel):
    messages: List[MessageInfo]
    attachments: List[AttachmentInfo]
