from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class ChatMessageCreate(BaseModel):
    message: str
    conversation_id: Optional[int] = None

class ChatMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    conversation_id: int
    sender: str
    message_text: str
    intent: Optional[str] = None
    matched_food: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None
    created_at: datetime

class ConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessageResponse] = []

class ConversationSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    last_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
