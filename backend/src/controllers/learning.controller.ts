import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { LearningProfileModel } from '../models/LearningProfile.js';
import { QuizModel } from '../models/Quiz.js';
import { memoryStore } from '../config/memoryStore.js';
import { isMongoConnected } from '../config/database.js';
import { aiService } from '../services/ai/aiService.js';

export async function getLearningProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.userId || 'guest-teacher-user';

  if (isMongoConnected) {
    try {
      const profile = await LearningProfileModel.findOne({ userId });
      if (profile) {
        res.json({ profile });
        return;
      }
    } catch (err) {}
  }

  let profile = memoryStore.learningProfiles.get(userId);
  if (!profile) {
    profile = {
      userId,
      masteredConcepts: ['Basic Programming Syntax', 'Variables & Data Types', 'Conditional Control Flow'],
      weakConcepts: ['Memory Pointers & Dynamic Allocation', 'Recursive Base Cases'],
      misconceptions: [
        {
          concept: 'Method Overriding vs Overloading',
          observedErrors: ['Conflated same-class signature matching with subclass dynamic dispatch.'],
          lastOccurred: new Date(),
          resolved: false,
        },
      ],
      revisionHistory: [
        { topic: 'Object-Oriented Programming Fundamentals', revisedAt: new Date(), teachBackScore: 82 },
      ],
    };
    memoryStore.learningProfiles.set(userId, profile);
  }

  res.json({ profile });
}

export async function logMisconception(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.userId || 'guest-teacher-user';
  const { concept, observedError } = req.body;

  const profile = memoryStore.learningProfiles.get(userId);
  if (profile) {
    profile.misconceptions.push({
      concept,
      observedErrors: [observedError],
      lastOccurred: new Date(),
      resolved: false,
    });
  }

  res.json({ message: 'Misconception logged in student learning profile.' });
}

export async function evaluateTeachBack(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { topic, studentExplanation } = req.body;
  const userId = req.user?.userId || 'guest-teacher-user';

  const evaluation = await aiService.evaluateTeachBack({ topic, studentExplanation });

  // Update profile revision history
  const profile = memoryStore.learningProfiles.get(userId);
  if (profile) {
    profile.revisionHistory.push({
      topic,
      revisedAt: new Date(),
      teachBackScore: evaluation.understandingScore,
    });
  }

  res.json({ evaluation });
}

export async function createQuiz(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { topic = 'Computer Science Core Concepts' } = req.body;
  const userId = req.user?.userId || 'guest-teacher-user';

  const defaultQuestions = [
    {
      question: 'Which Java keyword establishes an inheritance relationship between classes?',
      options: ['implements', 'extends', 'inherits', 'super'],
      correctAnswer: 'extends',
      explanation: 'The extends keyword is used to inherit properties and methods from a superclass.',
    },
    {
      question: 'What is the average time complexity of Bubble Sort on an array of size n?',
      options: ['O(log n)', 'O(n)', 'O(n log n)', 'O(n²)'],
      correctAnswer: 'O(n²)',
      explanation: 'Bubble Sort compares adjacent elements in nested passes, yielding quadratic O(n²) complexity.',
    },
    {
      question: 'Which OSI layer handles end-to-end packet transmission and port addressing?',
      options: ['Data Link Layer', 'Network Layer', 'Transport Layer', 'Application Layer'],
      correctAnswer: 'Transport Layer',
      explanation: 'The Transport layer (TCP/UDP) manages port addressing and flow reliability.',
    },
  ];

  const quizId = `quiz_${Date.now()}`;
  const quiz = {
    id: quizId,
    userId,
    topic,
    questions: defaultQuestions,
    answers: [],
    score: 0,
    createdAt: new Date(),
  };

  memoryStore.quizzes.set(quizId, quiz);
  res.json({ quiz });
}
