import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { AvatarModel } from '../models/Avatar.js';
import { memoryStore } from '../config/memoryStore.js';
import { isMongoConnected } from '../config/database.js';
import { uploadMedia } from '../services/storage/storageService.js';
import { avatarSdkAdapter } from '../services/avatar/avatarSdkAdapter.js';
import { getDemoAvatars, getDemoAvatarById } from '../services/avatar/demoAvatarService.js';
import fs from 'fs';

export async function uploadAvatarPhoto(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json({ error: 'Please upload a valid portrait photograph (JPG, PNG, or WEBP).' });
    return;
  }

  try {
    const uploadResult = await uploadMedia(req.file.path, 'intelliavatar/portraits');
    res.json({
      message: 'Photo uploaded successfully.',
      photoUrl: uploadResult.url,
      fileName: req.file.filename,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to process uploaded photograph.' });
  }
}

export async function generateAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { photoUrl, name, voice, language, teachingStyle, selectedDemoId } = req.body;

  // If user selected a prebuilt licensed demo avatar from the gallery:
  if (selectedDemoId) {
    const demo = getDemoAvatarById(selectedDemoId);
    if (!demo) {
      res.status(404).json({ error: 'Demo avatar not found.' });
      return;
    }

    const avatarId = `av_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newAvatar = {
      id: avatarId,
      _id: avatarId,
      userId: req.user?.userId || 'guest-teacher-user',
      name: name || demo.name,
      photoUrl: photoUrl || demo.photoUrl,
      modelUrl: demo.modelUrl,
      modelFormat: demo.modelFormat,
      generationProvider: 'prebuilt-licensed-demo',
      generationStatus: 'READY' as const,
      voice: voice || demo.defaultVoice,
      language: language || 'en',
      teachingStyle: teachingStyle || demo.teachingStyle,
      createdAt: new Date(),
    };

    if (isMongoConnected) {
      try {
        await AvatarModel.create(newAvatar);
      } catch (err) {
        console.warn('Mongo create error:', err);
      }
    }
    memoryStore.avatars.set(avatarId, newAvatar);

    res.status(201).json({
      message: 'Avatar ready from prebuilt licensed 3D model.',
      avatar: newAvatar,
    });
    return;
  }

  // Real Image-to-3D Provider Integration
  if (!avatarSdkAdapter.isConfigured()) {
    // "If no provider API key is configured:
    // - Do not simulate successful image-to-3D generation.
    // - Offer a Demo Avatar Gallery with real, licensed, prebuilt 3D GLB/VRM models.
    // - Never pretend generation succeeded if no valid model was returned."
    res.status(400).json({
      error: 'NO_API_KEY_CONFIGURED',
      message: 'Image-to-3D provider API key (AVATAR_PROVIDER_API_KEY) is not configured in backend environment.',
      suggestion: 'You can choose from our licensed 3D Demo Avatar Gallery below to experience the genuine 3D rigged character immediately.',
      demoAvatars: getDemoAvatars(),
    });
    return;
  }

  // Start real generation job
  const jobId = await avatarSdkAdapter.createJob(req.body.photoFilePath || '');
  res.json({
    message: 'Avatar generation job submitted.',
    jobId,
    status: 'PROCESSING',
  });
}

export async function getJobStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { jobId } = req.params;
  const result = await avatarSdkAdapter.getJobStatus(jobId);
  res.json(result);
}

export async function getAvatars(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user?.userId || 'guest-teacher-user';

  let userAvatars: any[] = [];
  if (isMongoConnected) {
    try {
      userAvatars = await AvatarModel.find({ userId }).sort({ createdAt: -1 });
    } catch (err) {
      console.warn('Mongo query error:', err);
    }
  }

  if (userAvatars.length === 0) {
    // Read from memoryStore
    userAvatars = Array.from(memoryStore.avatars.values()).filter(
      (a) => a.userId === userId || a.userId === 'system-demo'
    );
  }

  // Ensure demo avatars are always accessible
  const demoAvatars = getDemoAvatars();
  res.json({ avatars: userAvatars, demoAvatars });
}

export async function getAvatarById(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;

  if (isMongoConnected) {
    try {
      const av = await AvatarModel.findById(id);
      if (av) {
        res.json({ avatar: av });
        return;
      }
    } catch (err) {}
  }

  const av = memoryStore.avatars.get(id) || getDemoAvatarById(id);
  if (!av) {
    res.status(404).json({ error: 'Avatar not found.' });
    return;
  }

  res.json({ avatar: av });
}

export async function updateAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;
  const { name, voice, language, teachingStyle } = req.body;

  if (isMongoConnected) {
    try {
      const updated = await AvatarModel.findByIdAndUpdate(
        id,
        { name, voice, language, teachingStyle },
        { new: true }
      );
      if (updated) {
        res.json({ message: 'Avatar updated.', avatar: updated });
        return;
      }
    } catch (err) {}
  }

  const existing = memoryStore.avatars.get(id);
  if (!existing) {
    res.status(404).json({ error: 'Avatar not found.' });
    return;
  }

  const updated = { ...existing, name: name || existing.name, voice: voice || existing.voice, language: language || existing.language, teachingStyle: teachingStyle || existing.teachingStyle };
  memoryStore.avatars.set(id, updated);
  res.json({ message: 'Avatar updated.', avatar: updated });
}

export async function deleteAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;

  if (isMongoConnected) {
    try {
      await AvatarModel.findByIdAndDelete(id);
    } catch (err) {}
  }

  memoryStore.avatars.delete(id);
  res.json({ message: 'Avatar deleted successfully.' });
}

export async function listDemoAvatars(req: AuthenticatedRequest, res: Response): Promise<void> {
  res.json({ demoAvatars: getDemoAvatars() });
}
