import React from 'react';
import { 
  BookOpen, Code, ChevronRight, ChevronLeft, 
  Sparkles, CheckCircle, Terminal, HelpCircle, ArrowRight
} from 'lucide-react';

export interface LessonStep {
  title: string;
  bulletPoints: string[];
  codeSnippet?: string;
  formula?: string;
  diagramTitle?: string;
  diagramDetails?: string;
  teacherPrompt: string;
  gesture: 'idle' | 'speaking' | 'explain_one_hand' | 'explain_two_hands' | 'point_left' | 'point_right' | 'thinking' | 'nodding' | 'greeting' | 'celebrating';
}

interface DigitalWhiteboardProps {
  lessonTitle: string;
  topicCategory: string;
  steps: LessonStep[];
  currentStepIndex: number;
  onSelectStep: (index: number) => void;
  isTeachingSpeaking: boolean;
}

export default function DigitalWhiteboard({
  lessonTitle,
  topicCategory,
  steps,
  currentStepIndex,
  onSelectStep,
  isTeachingSpeaking,
}: DigitalWhiteboardProps) {
  const currentStep = steps[currentStepIndex] || steps[0];

  return (
    <div className="w-full h-full flex flex-col bg-neutral-900/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl select-none">
      
      {/* Top Whiteboard Frame Header */}
      <div className="px-5 py-3.5 border-b border-white/10 bg-dark-950/70 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                {topicCategory}
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
            </div>
            <h3 className="font-display font-bold text-sm text-white truncate max-w-md">
              {lessonTitle}
            </h3>
          </div>
        </div>

        {/* Step Navigation Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectStep(Math.max(0, currentStepIndex - 1))}
            disabled={currentStepIndex === 0}
            className="p-1.5 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Previous Concept Step"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-mono text-cyan-300 font-semibold px-2">
            {currentStepIndex + 1}/{steps.length}
          </span>
          <button
            type="button"
            onClick={() => onSelectStep(Math.min(steps.length - 1, currentStepIndex + 1))}
            disabled={currentStepIndex === steps.length - 1}
            className="p-1.5 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Next Concept Step"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Whiteboard Board Canvas */}
      <div className="flex-grow p-6 space-y-5 overflow-y-auto bg-gradient-to-br from-neutral-900/60 to-dark-950/80">
        
        {/* Step Title & Teacher Pointing Target Indicator */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h4 className="font-display font-extrabold text-lg text-white">
              {currentStep.title}
            </h4>
          </div>
          {currentStep.gesture === 'point_left' && (
            <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[10px] text-cyan-300 font-mono animate-pulse flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              Teacher Pointing Focus
            </span>
          )}
        </div>

        {/* Bullet Points */}
        <div className="space-y-2.5">
          {currentStep.bulletPoints.map((point, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-200 leading-relaxed">
              <span className="p-1 rounded-md bg-cyan-500/10 text-cyan-400 shrink-0 mt-0.5">
                <CheckCircle className="h-3 w-3" />
              </span>
              <span>{point}</span>
            </div>
          ))}
        </div>

        {/* Mathematical Formula Display if present */}
        {currentStep.formula && (
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 block font-semibold">
              Mathematical Formulation / Equation
            </span>
            <div className="font-mono text-sm text-cyan-200 tracking-wide bg-black/40 p-2.5 rounded-lg border border-cyan-500/20 text-center">
              {currentStep.formula}
            </div>
          </div>
        )}

        {/* Code Snippet if present */}
        {currentStep.codeSnippet && (
          <div className="rounded-xl border border-white/10 bg-black/60 overflow-hidden space-y-1">
            <div className="px-3 py-1.5 bg-white/5 border-b border-white/5 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <Terminal className="h-3.5 w-3.5" /> Python / PyTorch Code
              </span>
              <span>Syntax Highlighted</span>
            </div>
            <pre className="p-3 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
              <code>{currentStep.codeSnippet}</code>
            </pre>
          </div>
        )}

        {/* Step-by-Step Architecture Diagram Visual */}
        {currentStep.diagramTitle && (
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                {currentStep.diagramTitle}
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">Visual Schematic</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {currentStep.diagramDetails}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Step Timeline Thumbnails */}
      <div className="px-4 py-3 border-t border-white/10 bg-dark-950/90 flex items-center gap-2 overflow-x-auto">
        {steps.map((st, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelectStep(i)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all whitespace-nowrap flex items-center gap-1.5 ${
              currentStepIndex === i
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>{i + 1}.</span>
            <span className="truncate max-w-[120px]">{st.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
