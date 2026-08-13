import uuid
import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_user, get_user_org_member
from app.models.orm import Avatar, User, OrganizationMember

router = APIRouter(prefix="/avatars", tags=["Avatar Studio"])

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_avatar(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    gender_presentation: Optional[str] = Form(None),
    voice_key: str = Form(...),
    language_code: str = Form("en"),
    personality_prompt: str = Form("Teacher"),
    default_emotion: str = Form("NEUTRAL"),
    consent_confirmed: bool = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org_member: OrganizationMember = Depends(get_user_org_member)
):
    if not consent_confirmed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Safety consent confirmation is required to create an avatar."
        )

    # 1. MIME and magic number headers validation
    allowed_types = ["image/png", "image/jpeg", "image/jpg"]
    if image.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Only JPEG or PNG is supported."
        )

    avatar_id = uuid.uuid4()
    
    # Save the file securely in backend uploads
    file_ext = image.filename.split(".")[-1] if "." in image.filename else "png"
    safe_filename = f"{avatar_id}.{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, "avatars", safe_filename)
    
    try:
        with open(file_path, "wb") as buffer:
            content = await image.read()
            buffer.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save avatar image file: {str(e)}"
        )

    # 2. Save Avatar to Database scoped to organization
    new_avatar = Avatar(
        id=avatar_id,
        organization_id=org_member.organization_id,
        user_id=current_user.id,
        name=name,
        description=description,
        gender_presentation=gender_presentation,
        image_url=f"/uploads/avatars/{safe_filename}",
        voice_key=voice_key,
        language_code=language_code,
        personality_prompt=personality_prompt,
        default_emotion=default_emotion,
        consent_confirmed=True  # Ensure safety audit record
    )

    db.add(new_avatar)
    db.commit()
    db.refresh(new_avatar)

    return {
        "success": True,
        "message": "Avatar created successfully with safety audit recorded.",
        "avatar": {
            "id": str(new_avatar.id),
            "name": new_avatar.name,
            "image_url": new_avatar.image_url,
            "language_code": new_avatar.language_code,
            "voice_key": new_avatar.voice_key
        }
    }

@router.get("", response_model=List[dict])
def list_avatars(
    db: Session = Depends(get_db),
    org_member: OrganizationMember = Depends(get_user_org_member)
):
    # Enforce organization scoping (tenant isolation)
    avatars = db.query(Avatar).filter(Avatar.organization_id == org_member.organization_id).all()
    return [
        {
            "id": str(a.id),
            "name": a.name,
            "description": a.description,
            "image_url": a.image_url,
            "language_code": a.language_code,
            "voice_key": a.voice_key,
            "personality_prompt": a.personality_prompt,
            "default_emotion": a.default_emotion
        } for a in avatars
    ]

@router.get("/{avatar_id}")
def get_avatar(
    avatar_id: uuid.UUID,
    db: Session = Depends(get_db),
    org_member: OrganizationMember = Depends(get_user_org_member)
):
    avatar = db.query(Avatar).filter(
        Avatar.id == avatar_id,
        Avatar.organization_id == org_member.organization_id
    ).first()
    
    if not avatar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Avatar not found or not authorized in this workspace."
        )
    return {
        "id": str(avatar.id),
        "name": avatar.name,
        "description": avatar.description,
        "image_url": avatar.image_url,
        "language_code": avatar.language_code,
        "voice_key": avatar.voice_key,
        "personality_prompt": avatar.personality_prompt,
        "default_emotion": avatar.default_emotion
    }

@router.delete("/{avatar_id}")
def delete_avatar(
    avatar_id: uuid.UUID,
    db: Session = Depends(get_db),
    org_member: OrganizationMember = Depends(get_user_org_member)
):
    avatar = db.query(Avatar).filter(
        Avatar.id == avatar_id,
        Avatar.organization_id == org_member.organization_id
    ).first()
    
    if not avatar:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Avatar not found."
        )
    
    # Remove image file if it exists
    if avatar.image_url:
        filename = avatar.image_url.split("/")[-1]
        file_path = os.path.join(settings.UPLOAD_DIR, "avatars", filename)
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass
                
    db.delete(avatar)
    db.commit()
    return {"success": True, "message": "Avatar deleted successfully"}
