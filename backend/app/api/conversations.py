import os
import time
import uuid
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional, List
from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_user, get_user_org_member
from app.models.orm import Conversation, Message, Avatar, OrganizationMember, KnowledgeBase
from app.models.registry import registry
from app.rag.pipeline import query_knowledge_base

router = APIRouter(prefix="/conversations", tags=["Conversations"])

class CreateConversationRequest(BaseModel):
    avatar_id: uuid.UUID

@router.post("")
def start_conversation(
    request: CreateConversationRequest,
    db: Session = Depends(get_db),
    org_member: OrganizationMember = Depends(get_user_org_member)
):
    # 1. Enforce organization boundary (tenant isolation)
    avatar = db.query(Avatar).filter(
        Avatar.id == request.avatar_id,
        Avatar.organization_id == org_member.organization_id
    ).first()
    
    if not avatar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Avatar not found or unauthorized in this organization workspace."
        )

    conv_id = uuid.uuid4()
    new_conv = Conversation(
        id=conv_id,
        organization_id=org_member.organization_id,
        user_id=org_member.user_id,
        avatar_id=avatar.id
    )
    db.add(new_conv)
    db.commit()

    return {
        "success": True,
        "conversation_id": str(conv_id),
        "history": []
    }

@router.post("/{conversation_id}/message")
async def send_message(
    conversation_id: uuid.UUID,
    text: Optional[str] = Form(None),
    audio: Optional[UploadFile] = File(None),
    mode: str = Form("general"),
    language: str = Form("en"),
    db: Session = Depends(get_db),
    org_member: OrganizationMember = Depends(get_user_org_member)
):
    t0 = time.time()
    
    # 1. Verify conversation scope
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.organization_id == org_member.organization_id
    ).first()
    
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation session not found.")

    avatar = db.query(Avatar).filter(Avatar.id == conv.avatar_id).first()
    if not avatar:
        raise HTTPException(status_code=404, detail="Avatar profile not found.")

    # 2. Speech-to-Text (ASR) if audio is uploaded
    transcribed_text = text
    is_code_switched = False
    detected_lang = language
    
    if audio:
        audio_bytes = await audio.read()
        asr_engine = registry.get_asr(settings.ASR_PROVIDER)
        asr_res = asr_engine.transcribe(audio_bytes, language=language)
        transcribed_text = asr_res["text"]
        detected_lang = asr_res["language"]
        is_code_switched = asr_res["is_code_switched"]
        
    if not transcribed_text:
        raise HTTPException(status_code=400, detail="Either text or audio input must be provided.")

    # 3. Code-switching text detection fallback
    if not is_code_switched:
        has_english = any(c.isalpha() and c.isascii() for c in transcribed_text)
        has_indic = any(ord(c) >= 0x0900 and ord(c) <= 0x0dff for c in transcribed_text)
        if has_english and has_indic:
            is_code_switched = True

    # 4. Emotion analysis
    emotion_engine = registry.get_emotion("mock")
    emotion_res = emotion_engine.analyze_text(transcribed_text)

    # 4. Context assembly and RAG Grounding
    sources = []
    rag_context = ""
    
    # Check if RAG/PDF mode is triggered
    if (mode == "rag_only" or mode == "hybrid") and avatar.knowledge_base_id:
        # Retrieve grounded excerpts
        search_results = query_knowledge_base(db, str(avatar.knowledge_base_id), transcribed_text)
        if search_results:
            sources = search_results
            rag_context = "\n".join([f"Source: {res['document_name']} (Page {res['page']}): {res['excerpt']}" for res in search_results])

    # 5. LLM Response Generation
    llm_provider = registry.get_llm(settings.LLM_PROVIDER)
    
    # Fetch history
    past_messages = db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at.asc()).all()
    history = [{"role": msg.role, "content": msg.content} for msg in past_messages]
    
    system_prompt = f"You are a conversational digital human named {avatar.name} speaking in {detected_lang}."
    if avatar.personality_prompt:
        system_prompt += f" Persona: {avatar.personality_prompt}."
    if rag_context:
        system_prompt += f"\nAnswer strictly using the following document context:\n{rag_context}"
    
    llm_text = llm_provider.generate_response(transcribed_text, system_prompt, history)

    # 6. Text-to-Speech (TTS)
    tts_engine = registry.get_tts(settings.TTS_PROVIDER)
    audio_filename = f"tts_{uuid.uuid4()}.wav"
    audio_output_path = os.path.join(settings.UPLOAD_DIR, "generated", audio_filename)
    
    tts_engine.synthesize(
        text=llm_text,
        language=detected_lang,
        voice_key=avatar.voice_key,
        emotion=emotion_res["emotion"],
        output_path=audio_output_path
    )

    # 7. Avatar Portrait Video Animation & Lip Sync
    avatar_engine = registry.get_avatar(settings.AVATAR_ENGINE)
    lipsync_engine = registry.get_lipsync(settings.LIPSYNC_ENGINE)
    
    video_filename = f"render_{uuid.uuid4()}.mp4"
    video_output_path = os.path.join(settings.UPLOAD_DIR, "generated", video_filename)
    
    avatar_engine.generate_animation(
        driving_video_path="mock_drive.mp4",
        source_image_path="mock_portrait.png",
        output_path=video_output_path
    )
    
    synced_filename = f"synced_{uuid.uuid4()}.mp4"
    synced_output_path = os.path.join(settings.UPLOAD_DIR, "generated", synced_filename)
    
    lipsync_engine.sync_audio_video(
        audio_path=audio_output_path,
        video_path=video_output_path,
        output_path=synced_output_path
    )

    latency = time.time() - t0

    # 8. Save User & Assistant Messages to DB
    user_msg = Message(
        conversation_id=conv.id,
        role="user",
        content=transcribed_text,
        language=detected_lang
    )
    db.add(user_msg)
    db.flush()

    assistant_msg = Message(
        conversation_id=conv.id,
        role="assistant",
        content=llm_text,
        language=detected_lang,
        emotion=emotion_res,
        latency=latency,
        sources=sources
    )
    db.add(assistant_msg)
    db.commit()

    return {
        "success": True,
        "message_id": str(assistant_msg.id),
        "text": llm_text,
        "language": detected_lang,
        "is_code_switched": is_code_switched,
        "emotion": emotion_res,
        "audio_url": f"/uploads/generated/{audio_filename}",
        "video_url": f"/uploads/generated/{synced_filename}",
        "latency_seconds": latency,
        "sources": sources
    }

@router.get("/{conversation_id}")
def get_conversation_history(
    conversation_id: uuid.UUID,
    db: Session = Depends(get_db),
    org_member: OrganizationMember = Depends(get_user_org_member)
):
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.organization_id == org_member.organization_id
    ).first()
    
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    messages = db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at.asc()).all()
    
    return {
        "id": str(conv.id),
        "avatar_id": str(conv.avatar_id),
        "messages": [
            {
                "id": str(m.id),
                "role": m.role,
                "content": m.content,
                "language": m.language,
                "emotion": m.emotion,
                "timestamp": m.created_at.isoformat() if hasattr(m.created_at, "isoformat") else str(m.created_at)
            } for m in messages
        ]
    }
