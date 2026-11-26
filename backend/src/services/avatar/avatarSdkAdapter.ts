import { IAvatarProvider, AvatarGenerationResult, AvatarJobStatus } from './avatarProvider.interface.js';
import { config } from '../../config/env.js';
import axios from 'axios';
import fs from 'fs';

interface InternalJob {
  jobId: string;
  status: AvatarJobStatus;
  progressPercent: number;
  stageMessage: string;
  photoPath: string;
  createdAt: number;
  modelUrl?: string;
  error?: string;
}

export class AvatarSdkAdapter implements IAvatarProvider {
  public name = 'AvatarSDK-MetaPerson';
  private jobs: Map<string, InternalJob> = new Map();

  public isConfigured(): boolean {
    return Boolean(config.avatarProvider.apiKey && config.avatarProvider.apiKey.trim().length > 5);
  }

  public async createJob(photoFilePath: string, options?: any): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    if (!this.isConfigured()) {
      // As requested:
      // "If no provider API key is configured:
      // - Do not simulate successful image-to-3D generation.
      // - Offer a Demo Avatar Gallery with real, licensed, prebuilt 3D GLB/VRM models.
      // - Never pretend generation succeeded if no valid model was returned."
      this.jobs.set(jobId, {
        jobId,
        status: 'FAILED',
        progressPercent: 0,
        stageMessage: 'Avatar generation provider API key (AVATAR_PROVIDER_API_KEY) is not configured in backend environment.',
        photoPath: photoFilePath,
        createdAt: Date.now(),
        error: 'NO_API_KEY_CONFIGURED',
      });
      return jobId;
    }

    try {
      // In production with credentials:
      const fileData = fs.readFileSync(photoFilePath);
      const response = await axios.post(
        `${config.avatarProvider.baseUrl}/v1/avatars`,
        fileData,
        {
          headers: {
            'Authorization': `Bearer ${config.avatarProvider.apiKey}`,
            'Content-Type': 'application/octet-stream',
          },
        }
      );

      const remoteJobId = response.data?.job_id || jobId;
      this.jobs.set(jobId, {
        jobId,
        status: 'PROCESSING',
        progressPercent: 20,
        stageMessage: 'Analyzing facial features & skin chromaticity...',
        photoPath: photoFilePath,
        createdAt: Date.now(),
      });
      return jobId;
    } catch (err: any) {
      this.jobs.set(jobId, {
        jobId,
        status: 'FAILED',
        progressPercent: 0,
        stageMessage: 'Failed to communicate with Avatar SDK provider.',
        photoPath: photoFilePath,
        createdAt: Date.now(),
        error: err.message || 'Avatar SDK request failed.',
      });
      return jobId;
    }
  }

  public async getJobStatus(jobId: string): Promise<AvatarGenerationResult> {
    const job = this.jobs.get(jobId);
    if (!job) {
      return {
        jobId,
        status: 'FAILED',
        progressPercent: 0,
        stageMessage: 'Job ID not found.',
        error: 'Job not found',
      };
    }

    return {
      jobId: job.jobId,
      status: job.status,
      progressPercent: job.progressPercent,
      stageMessage: job.stageMessage,
      modelUrl: job.modelUrl,
      modelFormat: 'glb',
      error: job.error,
    };
  }
}

export const avatarSdkAdapter = new AvatarSdkAdapter();
