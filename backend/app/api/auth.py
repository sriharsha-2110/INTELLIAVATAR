from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.orm import User, Organization, OrganizationMember

router = APIRouter(prefix="/auth", tags=["Authentication"])

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    organization_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserRegister, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    # 1. Create Organization
    org = Organization(name=user_data.organization_name)
    db.add(org)
    db.flush()  # gets org.id

    # 2. Create User
    new_user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password)
    )
    db.add(new_user)
    db.flush()  # gets new_user.id

    # 3. Create Membership as OWNER
    member = OrganizationMember(
        organization_id=org.id,
        user_id=new_user.id,
        role="OWNER"
    )
    db.add(member)
    db.commit()

    return {
        "success": True,
        "message": "Registration successful.",
        "user": {"id": str(new_user.id), "email": new_user.email},
        "organization": {"id": str(org.id), "name": org.name}
    }

@router.post("/login")
def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    # Retrieve organization member details
    membership = db.query(OrganizationMember).filter(OrganizationMember.user_id == user.id).first()
    org_id = str(membership.organization_id) if membership else None

    # Generate token
    token = create_access_token(subject=user.id)

    return {
        "success": True,
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "organization_id": org_id
        }
    }
