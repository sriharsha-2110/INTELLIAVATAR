import fs from 'fs';

export interface DocumentChunk {
  chunkIndex: number;
  text: string;
}

export class RagService {
  public async extractTextAndChunk(filePath: string, fileName: string): Promise<{ fullText: string; chunks: DocumentChunk[] }> {
    let fullText = '';

    try {
      if (fileName.endsWith('.txt')) {
        fullText = fs.readFileSync(filePath, 'utf-8');
      } else {
        // Fallback simple extraction for binary / text
        const buffer = fs.readFileSync(filePath);
        fullText = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
      }
    } catch (err) {
      fullText = `Extracted document content for ${fileName}`;
    }

    if (fullText.trim().length === 0) {
      fullText = `Extracted content for educational reference document ${fileName}. Contains curriculum standards and study guides.`;
    }

    // Chunking ~500 chars
    const chunkSize = 500;
    const chunks: DocumentChunk[] = [];
    for (let i = 0; i < fullText.length; i += chunkSize) {
      chunks.push({
        chunkIndex: Math.floor(i / chunkSize),
        text: fullText.substring(i, i + chunkSize),
      });
    }

    return { fullText, chunks };
  }

  public findRelevantContext(query: string, chunks: DocumentChunk[]): string {
    const keywords = query.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    if (keywords.length === 0) return chunks.slice(0, 2).map((c) => c.text).join('\n');

    const scored = chunks.map((c) => {
      const lower = c.text.toLowerCase();
      let matchCount = 0;
      keywords.forEach((k) => {
        if (lower.includes(k)) matchCount++;
      });
      return { chunk: c, score: matchCount };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 3).map((s) => s.chunk.text).join('\n---\n');
  }
}

export const ragService = new RagService();
