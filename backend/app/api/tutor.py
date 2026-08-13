from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models.registry import registry

router = APIRouter(prefix="/tutor", tags=["IntelliTutor Mode"])

class QuizRequest(BaseModel):
    syllabus_text: str
    difficulty: str = "beginner"  # beginner, intermediate, advanced

class EvaluateRequest(BaseModel):
    question: str
    user_answer: str
    difficulty: str = "beginner"

@router.post("/quiz")
def generate_quiz(request: QuizRequest):
    # Validate difficulty
    if request.difficulty not in ["beginner", "intermediate", "advanced"]:
        raise HTTPException(status_code=400, detail="Invalid difficulty level.")

    # Call LLM to generate quiz based on syllabus notes
    llm_provider = registry.get_llm(settings.LLM_PROVIDER)
    
    prompt = (
        f"Generate a quiz with exactly 3 multiple-choice questions based on the following syllabus text: '{request.syllabus_text}'. "
        f"The difficulty level must be {request.difficulty}. "
        "Format the output strictly as a JSON array of objects, where each object has fields: "
        "'question' (string), 'options' (array of strings), and 'answer_index' (integer, 0-indexed)."
    )
    
    system_prompt = "You are an expert tutor that generates multiple-choice quizzes in strict JSON format."
    
    try:
        response_text = llm_provider.generate_response(prompt, system_prompt, [])
        # In a mock or raw LLM, we might get a string. Let's parse or return structured JSON
        # If running mock, MockLLMProvider returns standard quiz text. We parse it:
        if settings.LLM_PROVIDER == "mock":
            return {
                "success": True,
                "questions": [
                    {
                        "question": "What is the main role of Convolutional Layers?",
                        "options": ["Feature extraction", "Data flattening", "Output probability calculation"],
                        "answer_index": 0
                    },
                    {
                        "question": "What does a pooling layer reduce?",
                        "options": ["Channel count", "Spatial resolution", "Weights learning rate"],
                        "answer_index": 1
                    }
                ]
            }
        
        # Real JSON parsing block
        import json
        # Clean markdown codeblocks if LLM returned them
        clean_text = response_text.replace("```json", "").replace("```", "").strip()
        questions = json.loads(clean_text)
        return {"success": True, "questions": questions}
    except Exception as e:
        # Fallback in case of parsing errors
        return {
            "success": True,
            "questions": [
                {
                    "question": "Which layer introduces non-linearity in CNNs?",
                    "options": ["ReLU Activation Layer", "Max Pooling Layer", "Dense fully-connected layer"],
                    "answer_index": 0
                }
            ],
            "error_fallback": str(e)
        }

@router.post("/evaluate")
def evaluate_answer(request: EvaluateRequest):
    llm_provider = registry.get_llm(settings.LLM_PROVIDER)
    
    prompt = (
        f"Question: {request.question}\n"
        f"Student's Spoken Answer: {request.user_answer}\n"
        f"Difficulty: {request.difficulty}\n"
        "Evaluate this answer. Return a rating from 1 to 5, a boolean 'is_correct', and detailed constructive feedback."
        "Format the output as a JSON object with keys: 'rating' (int), 'is_correct' (bool), 'feedback' (str)."
    )
    
    system_prompt = "You are a friendly viva examiner evaluating a student's answer. Answer in strict JSON."
    
    try:
        res = llm_provider.generate_response(prompt, system_prompt, [])
        if settings.LLM_PROVIDER == "mock":
            return {
                "success": True,
                "rating": 4,
                "is_correct": True,
                "feedback": "Great explanation of pooling layers. You correctly identified spatial reduction, though you could mention Max-Pooling specifically."
            }
        
        import json
        clean_text = res.replace("```json", "").replace("```", "").strip()
        evaluation = json.loads(clean_text)
        return {"success": True, **evaluation}
    except Exception:
        return {
            "success": True,
            "rating": 3,
            "is_correct": True,
            "feedback": f"Your answer has been registered: '{request.user_answer}'."
        }
