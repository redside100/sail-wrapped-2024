from pydantic import BaseModel

class TokenRequestModel(BaseModel):
    code: str

class TokenResponseModel(BaseModel):
    access_token: str