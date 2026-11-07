from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Conversation, ChatMessage
from app.schemas.chat import (
    ChatMessageCreate,
    ChatMessageResponse,
    ConversationResponse,
    ConversationSummary
)
from app.services.auth_service import get_current_user
from app.services.chatbot_service import chatbot_service

router = APIRouter(prefix="/api/chat", tags=["AI Chatbot"])

@router.post("", response_model=ChatMessageResponse)
def send_chat_message(
    payload: ChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    msg_text = payload.message.strip()
    if not msg_text:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    result = chatbot_service.process_message(
        db=db,
        user=current_user,
        message_text=msg_text,
        conversation_id=payload.conversation_id
    )

    assistant_msg = result["assistant_message"]
    return ChatMessageResponse(
        id=assistant_msg.id,
        conversation_id=assistant_msg.conversation_id,
        sender=assistant_msg.sender,
        message_text=assistant_msg.message_text,
        intent=assistant_msg.intent,
        matched_food=assistant_msg.matched_food,
        metadata_json=assistant_msg.metadata_json,
        created_at=assistant_msg.created_at
    )

@router.get("/conversations", response_model=List[ConversationSummary])
def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    convs = db.query(Conversation).filter(
        Conversation.user_id == current_user.id
    ).order_by(Conversation.updated_at.desc()).all()

    summaries = []
    for c in convs:
        last_msg = c.messages[-1].message_text if c.messages else "New conversation"
        if len(last_msg) > 60:
            last_msg = last_msg[:57] + "..."
        summaries.append(ConversationSummary(
            id=c.id,
            title=c.title,
            last_message=last_msg,
            created_at=c.created_at,
            updated_at=c.updated_at
        ))
    return summaries

@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
def get_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found or access denied.")

    msgs = [
        ChatMessageResponse(
            id=m.id,
            conversation_id=m.conversation_id,
            sender=m.sender,
            message_text=m.message_text,
            intent=m.intent,
            matched_food=m.matched_food,
            metadata_json=m.metadata_json,
            created_at=m.created_at
        )
        for m in conv.messages
    ]

    return ConversationResponse(
        id=conv.id,
        title=conv.title,
        created_at=conv.created_at,
        updated_at=conv.updated_at,
        messages=msgs
    )

@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_200_OK)
def delete_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found or access denied.")

    db.delete(conv)
    db.commit()
    return {"message": "Conversation deleted successfully."}

