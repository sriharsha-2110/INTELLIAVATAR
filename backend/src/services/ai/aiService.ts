import { config } from '../../config/env.js';
import { detectConceptDemonstration, ConceptDemonstration } from './conceptDemonstrations.js';
import axios from 'axios';

export interface TeachingResponse {
  answer: string;
  gesture: 'greeting' | 'explaining' | 'pointing' | 'thinking' | 'nodding' | 'listening' | 'talking' | 'idle';
  conceptDemo: ConceptDemonstration | null;
  detectedMisconceptions?: string[];
  suggestedFollowUp?: string;
}

export class AIService {
  public async generateEducationalResponse(params: {
    question: string;
    language: string;
    teachingStyle: string;
    contextText?: string;
  }): Promise<TeachingResponse> {
    const { question, language, teachingStyle, contextText } = params;

    // Check if external LLM key is configured
    if (config.ai.geminiApiKey) {
      try {
        const prompt = `You are INTELLIAVATAR 2.0, a distinguished 3D AI educator.
Teaching Style: ${teachingStyle}.
Language: ${language} (Note: When responding in regional Indian languages like Kannada, Telugu, Hindi, Tamil, or Malayalam, strictly retain key technical terminology like class, object, RAM, CPU, database, compiler, function, matrix in standard English).
${contextText ? `Source Document Context:\n${contextText}\n` : ''}
Student Question: ${question}

Provide an educational, engaging, step-by-step pedagogical explanation suitable for classroom teaching.`;

        const geminiRes = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.ai.geminiApiKey}`,
          {
            contents: [{ parts: [{ text: prompt }] }],
          }
        );

        const answer = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (answer) {
          const gesture = this.selectGesture(question, answer);
          const conceptDemo = detectConceptDemonstration(question, answer);
          return { answer, gesture, conceptDemo };
        }
      } catch (err) {
        console.warn('Gemini API call failed, using intelligent educational generator fallback:', (err as Error).message);
      }
    }

    // Intelligent built-in educational pedagogical generator
    const answer = this.generatePedagogicalAnswer(question, language, teachingStyle);
    const gesture = this.selectGesture(question, answer);
    const conceptDemo = detectConceptDemonstration(question, answer);

    return {
      answer,
      gesture,
      conceptDemo,
      suggestedFollowUp: 'Would you like to try a quick interactive check or see another practical example?',
    };
  }

  private selectGesture(question: string, answer: string): TeachingResponse['gesture'] {
    const q = question.toLowerCase();
    if (q.includes('hello') || q.includes('hi') || q.includes('welcome') || q.includes('namaste')) return 'greeting';
    if (q.includes('why') || q.includes('how come') || q.includes('difference')) return 'thinking';
    if (q.includes('show') || q.includes('diagram') || q.includes('whiteboard') || q.includes('look')) return 'pointing';
    if (q.includes('correct') || q.includes('right') || q.includes('yes')) return 'nodding';
    return 'explaining';
  }

  private generatePedagogicalAnswer(question: string, language: string, style: string): string {
    const q = question.toLowerCase();

    // Multilingual sample response generator honoring terminology preservation
    if (q.includes('inheritance')) {
      if (language === 'kn') {
        return `Java ನಲ್ಲಿ Inheritance ಎಂಬುದು Object-Oriented Programming ನ ಮುಖ್ಯ ಪರಿಕಲ್ಪನೆಯಾಗಿದೆ. ಇಲ್ಲಿ ಒಂದು Child Class (Subclass) ಮತ್ತೊಂದು Parent Class (Superclass) ನ properties ಮತ್ತು methods ಗಳನ್ನು 'extends' keyword ಮೂಲಕ inherit ಮಾಡಿಕೊಳ್ಳುತ್ತದೆ. ಇದರಿಂದ code reusability ಸಾಧ್ಯವಾಗುತ್ತದೆ ಮತ್ತು method overriding ಮಾಡಲು ಅವಕಾಶ ಸಿಗುತ್ತದೆ.`;
      }
      if (language === 'te') {
        return `Java లో Inheritance అనేది Object-Oriented Programming యొక్క ముఖ్యమైన కాన్సెప్ట్. ఇందులో Child Class అనేది Parent Class యొక్క properties మరియు methods ను 'extends' keyword ద్వారా పొందుతుంది. దీనివల్ల code reusability మరియు method overriding సాధ్యమవుతాయి.`;
      }
      if (language === 'hi') {
        return `Java में Inheritance, Object-Oriented Programming का एक मुख्य आधार है। इसमें एक Child Class (Subclass), 'extends' keyword की मदद से Parent Class (Superclass) की properties और methods को inherit करती है। इससे code reusability प्राप्त होती है।`;
      }
      if (language === 'ta') {
        return `Java-வில் Inheritance என்பது Object-Oriented Programming-ன் முக்கிய கருத்து. இதில் ஒரு Child Class, 'extends' keyword பயன்படுத்தி Parent Class-ன் பண்புகள் மற்றும் methods-ஐ பெறுகிறது. இதனால் code reusability மற்றும் method overriding சாத்தியமாகிறது.`;
      }
      if (language === 'ml') {
        return `Java-യിൽ Inheritance എന്നത് Object-Oriented Programming-ന്റെ ഒരു പ്രധാന ആശയമാണ്. ഇതിൽ ഒരു Child Class, 'extends' keyword ഉപയോഗിച്ച് Parent Class-ന്റെ properties-ഉം methods-ഉം inherit ചെയ്യുന്നു. இது code reusability നൽകുന്നു.`;
      }
      return `In Object-Oriented Programming, Inheritance is a foundational mechanism where a specialized class (child class or subclass) acquires properties and behaviors from a general class (parent class or superclass) using the 'extends' keyword. This promotes code reusability, simplifies maintenance, and forms the basis for polymorphic method overriding.`;
    }

    if (q.includes('bubble sort')) {
      return `Bubble Sort is an elementary comparison-based sorting algorithm. It repeatedly steps through the input list, compares adjacent elements, and swaps them if they are in the wrong order. This pass is repeated until no more swaps are needed, causing larger values to 'bubble up' to the end of the array. Its average and worst-case time complexity is O(n²), making it ideal for pedagogical illustration rather than large-scale production sorting.`;
    }

    if (q.includes('network') || q.includes('tcp') || q.includes('packet')) {
      return `Computer networks rely on packet switching to transmit information between hosts. Data is divided into discrete packets containing payload bytes and header metadata (including source and destination IP addresses). Protocols like TCP ensure reliable, ordered delivery through a three-way handshake (SYN, SYN-ACK, ACK) and flow control.`;
    }

    return `Great question! When analyzing "${question}", we start by examining the core definition and underlying principles. In our pedagogical framework, we break this down into first principles, consider practical edge cases, and observe how each component interacts within the broader system. Notice how each step connects directly to the problem constraints.`;
  }

  public async evaluateTeachBack(params: {
    topic: string;
    studentExplanation: string;
  }): Promise<{
    understandingScore: number;
    conceptCoverage: string;
    missingInformation: string[];
    misconceptionsIdentified: string[];
    suggestedRevision: string;
  }> {
    const { topic, studentExplanation } = params;
    const text = studentExplanation.toLowerCase();

    const missing: string[] = [];
    const misconceptions: string[] = [];
    let score = 75;

    if (topic.toLowerCase().includes('inheritance')) {
      if (!text.includes('extends')) missing.push("Did not mention the 'extends' keyword");
      if (!text.includes('reuse') && !text.includes('reusability')) missing.push('Did not mention code reusability');
      if (text.includes('overload') && text.includes('override')) {
        misconceptions.push('Possible confusion between method overloading (same class) and overriding (subclass)');
        score -= 15;
      }
    }

    return {
      understandingScore: score,
      conceptCoverage: `${score}% concept alignment with curriculum standards`,
      missingInformation: missing,
      misconceptionsIdentified: misconceptions,
      suggestedRevision: missing.length > 0 ? `Review: ${missing.join(', ')}` : 'Solid foundational grasp demonstrated.',
    };
  }
}

export const aiService = new AIService();
