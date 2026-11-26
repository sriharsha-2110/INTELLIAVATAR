import { config } from '../../config/env.js';

export interface TTSResult {
  audioUrl?: string;
  useBrowserSynthesis: boolean;
  voice: string;
  language: string;
  visemesSupported: boolean;
}

export class TTSService {
  public async synthesizeSpeech(text: string, voice = 'en-US-JennyNeural', language = 'en'): Promise<TTSResult> {
    // If Azure Speech Key is present, we could invoke Azure REST TTS
    if (config.speech.azureKey) {
      // In production Azure Speech can return audio/wav with viseme metadata
      return {
        useBrowserSynthesis: false,
        voice,
        language,
        visemesSupported: true,
      };
    }

    // Default: instruct client to use high-fidelity Web SpeechSynthesis + Web Audio API viseme synchronization
    return {
      useBrowserSynthesis: true,
      voice,
      language,
      visemesSupported: true,
    };
  }
}

export const ttsService = new TTSService();
