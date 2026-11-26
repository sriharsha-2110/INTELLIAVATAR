import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface IQuiz extends Document {
  userId: string;
  topic: string;
  questions: IQuizQuestion[];
  answers: { questionIndex: number; selectedAnswer: string; isCorrect: boolean }[];
  score: number;
  createdAt: Date;
}

const QuizSchema = new Schema<IQuiz>({
  userId: { type: String, required: true, index: true },
  topic: { type: String, required: true },
  questions: [
    {
      question: { type: String, required: true },
      options: [{ type: String }],
      correctAnswer: { type: String, required: true },
      explanation: { type: String, default: '' },
    },
  ],
  answers: [
    {
      questionIndex: { type: Number, required: true },
      selectedAnswer: { type: String, required: true },
      isCorrect: { type: Boolean, required: true },
    },
  ],
  score: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const QuizModel = mongoose.model<IQuiz>('Quiz', QuizSchema);
