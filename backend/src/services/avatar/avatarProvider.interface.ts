export type AvatarJobStatus =
  | 'UPLOADING'
  | 'PROCESSING'
  | 'RIGGING'
  | 'PREPARING'
  | 'READY'
  | 'FAILED';

export interface AvatarGenerationResult {
  jobId: string;
  status: AvatarJobStatus;
  progressPercent: number;
  stageMessage: string;
  modelUrl?: string;
  modelFormat?: 'glb' | 'gltf' | 'vrm';
  error?: string;
}

export interface IAvatarProvider {
  name: string;
  isConfigured(): boolean;
  createJob(photoFilePath: string, options?: any): Promise<string>;
  getJobStatus(jobId: string): Promise<AvatarGenerationResult>;
}
