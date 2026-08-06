from pydantic import BaseModel
from typing import Optional


class CompareRequest(BaseModel):
    followers_content: str
    following_content: str
    followerFileType: Optional[str] = "auto"
    followingFileType: Optional[str] = "auto"
