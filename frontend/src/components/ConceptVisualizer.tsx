import React, { useState, useEffect } from 'react';
import { 
  GitBranch, ArrowRight, Play, RotateCcw, Server, 
  Database, Network, Binary, Layers, CheckCircle 
} from 'lucide-react';

interface ConceptVisualizerProps {
  demo: {
    type: string;
    title: string;
    description: string;
    visualData: any;
  } | null;
}

export default function ConceptVisualizer({ demo }: ConceptVisualizerProps) {
  if (!demo) return null;

  return (
    <div className="w-full bg-slate-900/90 rounded-2xl border border-cyan-500/30 p-5 shadow-2xl backdrop-blur-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            {demo.type === 'java_inheritance' && <GitBranch className="h-4 w-4" />}
            {demo.type === 'bubble_sort' && <Binary className="h-4 w-4" />}
            {demo.type === 'computer_networks' && <Network className="h-4 w-4" />}
            {demo.type === 'mathematics' && <Layers className="h-4 w-4" />}
            {demo.type === 'database_normalization' && <Database className="h-4 w-4" />}
          </div>
          <div>
            <h4 className="font-bold text-sm text-white tracking-tight">{demo.title}</h4>
            <p className="text-[11px] text-neutral-400">{demo.description}</p>
          </div>
        </div>

        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
          Live Pedagogical Demonstration
        </span>
      </div>

      {/* Demonstration Content */}
      <div className="p-4 bg-neutral-950/80 rounded-xl border border-white/5 min-h-[180px] flex items-center justify-center">
        {/* 1. Java Inheritance */}
        {demo.type === 'java_inheritance' && (
          <div className="w-full flex flex-col items-center gap-4 text-xs font-mono">
            {/* Superclass */}
            <div className="w-64 p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/40 shadow-md text-center">
              <span className="text-[10px] text-indigo-400 font-bold uppercase block">«Superclass»</span>
              <span className="text-sm font-bold text-white block">{demo.visualData.parent.name}</span>
              <div className="mt-2 text-[10px] text-left text-neutral-300 space-y-0.5 border-t border-white/10 pt-1.5">
                {demo.visualData.parent.members.map((m: string, i: number) => (
                  <div key={i} className="text-indigo-200">+ {m}</div>
                ))}
                {demo.visualData.parent.methods.map((m: string, i: number) => (
                  <div key={i} className="text-cyan-300">+ {m}</div>
                ))}
              </div>
            </div>

            {/* Extends Arrow */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-cyan-400 font-bold bg-neutral-900 px-2 py-0.5 rounded border border-cyan-500/30">
                extends (Inherits)
              </span>
              <div className="h-4 w-0.5 bg-cyan-400" />
            </div>

            {/* Subclasses */}
            <div className="flex flex-wrap justify-center gap-4">
              {demo.visualData.children.map((child: any, idx: number) => (
                <div key={idx} className="w-56 p-3 rounded-xl bg-purple-950/60 border border-purple-500/40 shadow-md">
                  <span className="text-[10px] text-purple-400 font-bold uppercase block">«Subclass»</span>
                  <span className="text-sm font-bold text-white block">{child.name}</span>
                  <div className="mt-2 text-[10px] text-left text-neutral-300 space-y-0.5 border-t border-white/10 pt-1.5">
                    {child.extraMembers.map((m: string, i: number) => (
                      <div key={i} className="text-purple-200">+ {m}</div>
                    ))}
                    {child.overrides.map((m: string, i: number) => (
                      <div key={i} className="text-emerald-400 font-semibold">@Override {m}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Bubble Sort */}
        {demo.type === 'bubble_sort' && (
          <div className="w-full flex flex-col items-center gap-3">
            <span className="text-[11px] text-neutral-400 font-mono">Array Partition Swapping Passes:</span>
            <div className="flex items-center gap-2">
              {demo.visualData.initialArray.map((val: number, i: number) => (
                <div
                  key={i}
                  className={`w-12 h-14 rounded-xl flex flex-col items-center justify-center font-bold font-mono transition-all ${
                    i === 0 || i === 1
                      ? 'bg-gradient-to-t from-cyan-600 to-indigo-600 text-white border-2 border-cyan-400 scale-105 shadow-lg shadow-cyan-500/20'
                      : 'bg-neutral-900 text-neutral-300 border border-white/10'
                  }`}
                >
                  <span className="text-base">{val}</span>
                  <span className="text-[9px] text-neutral-400 font-normal">[{i}]</span>
                </div>
              ))}
            </div>
            <span className="text-xs text-cyan-300 font-mono bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              Comparing [0]=45 with [1]=12: 45 &gt; 12 → Swapping elements!
            </span>
          </div>
        )}

        {/* 3. Computer Networks */}
        {demo.type === 'computer_networks' && (
          <div className="w-full flex flex-col items-center gap-4">
            <div className="flex items-center justify-between w-full max-w-lg">
              {demo.visualData.nodes.map((node: any, idx: number) => (
                <React.Fragment key={node.id}>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-cyan-300 shadow-md">
                      {node.type === 'host' ? <Server className="h-5 w-5" /> : <Network className="h-5 w-5" />}
                    </div>
                    <span className="text-[10px] text-neutral-300 font-mono mt-1 text-center max-w-[80px]">
                      {node.label}
                    </span>
                  </div>
                  {idx < demo.visualData.nodes.length - 1 && (
                    <div className="flex-grow flex items-center justify-center px-2">
                      <div className="h-0.5 w-full bg-cyan-500/40 relative">
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
            <span className="text-xs text-cyan-300 font-mono bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              Transmitting: {demo.visualData.activePacket.protocol} ({demo.visualData.activePacket.payloadBytes} Bytes)
            </span>
          </div>
        )}

        {/* 4. Mathematics */}
        {demo.type === 'mathematics' && (
          <div className="w-full space-y-2 font-mono text-xs">
            {demo.visualData.steps.map((s: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900 border border-white/5">
                <span className="text-neutral-400 text-[11px] font-sans">{s.label}:</span>
                <span className="text-cyan-300 font-bold">{s.formula}</span>
              </div>
            ))}
          </div>
        )}

        {/* 5. Database Normalization */}
        {demo.type === 'database_normalization' && (
          <div className="w-full space-y-3 font-mono text-xs">
            <span className="text-[11px] text-neutral-400">Decomposed 3NF Normalized Relational Tables:</span>
            <div className="grid grid-cols-2 gap-3">
              {demo.visualData.normalizedTables.map((tbl: any, idx: number) => (
                <div key={idx} className="p-2.5 rounded-lg bg-neutral-900 border border-white/10">
                  <span className="text-xs font-bold text-cyan-300 block mb-1">TABLE {tbl.name}</span>
                  <div className="text-[10px] text-neutral-300 space-y-0.5">
                    <div className="text-amber-300 font-semibold">[PK] {tbl.pKey}</div>
                    {tbl.cols.map((col: string, i: number) => (
                      <div key={i}>+ {col}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
