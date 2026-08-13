def test_tutor_quiz_and_evaluation(client):
    # 1. Generate quiz questions
    quiz_res = client.post(
        "/api/v1/tutor/quiz",
        json={
            "syllabus_text": "Neural networks use activation functions like ReLU to introduce non-linearity.",
            "difficulty": "beginner"
        }
    )
    assert quiz_res.status_code == 200
    quiz_data = quiz_res.json()
    assert quiz_data["success"] is True
    assert len(quiz_data["questions"]) > 0
    assert "question" in quiz_data["questions"][0]

    # 2. Evaluate answer
    eval_res = client.post(
        "/api/v1/tutor/evaluate",
        json={
            "question": "What is the purpose of activation functions?",
            "user_answer": "They add non-linearity to the network so it can learn complex patterns.",
            "difficulty": "beginner"
        }
    )
    assert eval_res.status_code == 200
    eval_data = eval_res.json()
    assert eval_data["success"] is True
    assert "rating" in eval_data
    assert "feedback" in eval_data
