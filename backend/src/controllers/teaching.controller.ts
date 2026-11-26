import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { aiService } from '../services/ai/aiService.js';
import { ttsService } from '../services/speech/ttsService.js';
import { ConversationModel } from '../models/Conversation.js';
import { DocumentModel } from '../models/Document.js';
import { memoryStore } from '../config/memoryStore.js';
import { isMongoConnected } from '../config/database.js';

export async function chatWithTeacher(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { avatarId, question, language = 'en', teachingStyle = 'professional', documentId } = req.body;
  const userId = req.user?.userId || 'guest-teacher-user';

  if (!question || !question.trim()) {
    res.status(400).json({ error: 'Question is required.' });
    return;
  }

  let contextText = '';
  if (documentId) {
    if (isMongoConnected) {
      const doc = await DocumentModel.findById(documentId);
      if (doc?.extractedTextReference) contextText = doc.extractedTextReference;
    } else {
      const doc = memoryStore.documents.get(documentId);
      if (doc?.extractedTextReference) contextText = doc.extractedTextReference;
    }
  }

  // Generate pedagogical response
  const aiResult = await aiService.generateEducationalResponse({
    question,
    language,
    teachingStyle,
    contextText,
  });

  const userMsg = {
    id: `msg_${Date.now()}_u`,
    sender: 'user' as const,
    text: question,
    timestamp: new Date(),
  };

  const teacherMsg = {
    id: `msg_${Date.now()}_t`,
    sender: 'teacher' as const,
    text: aiResult.answer,
    gesture: aiResult.gesture,
    conceptDemo: aiResult.conceptDemo,
    timestamp: new Date(),
  };

  // Save in conversation
  const convKey = `${userId}_${avatarId}`;
  const existingConv = memoryStore.conversations.get(convKey) || {
    userId,
    avatarId,
    messages: [],
    createdAt: new Date(),
  };

  existingConv.messages.push(userMsg, teacherMsg);
  memoryStore.conversations.set(convKey, existingConv);

  if (isMongoConnected) {
    try {
      await ConversationModel.findOneAndUpdate(
        { userId, avatarId },
        { $push: { messages: { $each: [userMsg, teacherMsg] } } },
        { upsert: true }
      );
    } catch (err) {}
  }

  res.json({
    teacherMessage: teacherMsg,
    suggestedFollowUp: aiResult.suggestedFollowUp,
  });
}

export async function synthesizeTeacherSpeech(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { text, voice = 'en-US-JennyNeural', language = 'en' } = req.body;
  const ttsResult = await ttsService.synthesizeSpeech(text, voice, language);
  res.json(ttsResult);
}

export async function getConversationHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { avatarId } = req.params;
  const userId = req.user?.userId || 'guest-teacher-user';

  if (isMongoConnected) {
    try {
      const conv = await ConversationModel.findOne({ userId, avatarId });
      if (conv) {
        res.json({ messages: conv.messages });
        return;
      }
    } catch (err) {}
  }

  const convKey = `${userId}_${avatarId}`;
  const conv = memoryStore.conversations.get(convKey);
  res.json({ messages: conv ? conv.messages : [] });
}

export async function clearConversationHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { avatarId } = req.params;
  const userId = req.user?.userId || 'guest-teacher-user';

  if (isMongoConnected) {
    try {
      await ConversationModel.findOneAndDelete({ userId, avatarId });
    } catch (err) {}
  }

  const convKey = `${userId}_${avatarId}`;
  memoryStore.conversations.delete(convKey);
  res.json({ message: 'Conversation history cleared.' });
}
