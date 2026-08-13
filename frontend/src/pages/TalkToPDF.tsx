import { useState } from 'react';
import Navbar from '../components/Navbar';
import { FileText, Upload, Send, MessageSquare, AlertCircle, Bookmark, Compass } from 'lucide-react';

export default function TalkToPDF() {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const [messages, setMessages] = useState<any[]>([
    { role: 'assistant', content: 'Upload a PDF to ground my knowledge. I will only answer questions based on the document content.' }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileUploaded(true);
      setMessages([
        { role: 'assistant', content: `Indexed "${file.name}" successfully (12 pages processed). Go ahead and ask me questions about it!` }
      ]);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = { role: 'user', content: inputValue };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    setTimeout(() => {
      const assistantMsg = {
        role: 'assistant',
        content: `According to page 3 of "${fileName}", the main clause states that all requests must be logged through the internal platform. Here is the direct excerpt: 'Section 3.1: All corporate requests must be logged...'`,
        citation: { doc: fileName, page: 3, excerpt: 'Section 3.1: All corporate requests must be logged...' }
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-dark-950 text-white flex flex-col h-screen">
      <Navbar />

      <div className="flex-grow flex flex-col lg:flex-row overflow-hidden max-w-7xl mx-auto w-full p-4 md:p-6 gap-6">
        {/* Left Panel: Document Viewer / Dropzone (1/2) */}
        <div className="flex-1 bg-neutral-900/60 border border-white/10 rounded-2xl overflow-hidden flex flex-col h-1/2 lg:h-auto">
          <div className="p-4 border-b border-white/5 bg-dark-950/40 flex items-center justify-between">
            <span className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-400" />
              Document Workspace
            </span>
            {fileUploaded && (
              <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full uppercase font-semibold">
                Indexed
              </span>
            )}
          </div>

          <div className="flex-grow flex flex-col items-center justify-center p-6 relative">
            {!fileUploaded ? (
              <div className="text-center space-y-4 max-w-sm">
                <div className="w-16 h-16 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto text-brand-400">
                  <Upload className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="font-semibold text-md">Upload PDF Document</h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    Drag and drop your PDF here, or click to browse. Files are processed locally with text chunk extraction.
                  </p>
                </div>
                <div className="inline-block relative">
                  <button className="px-4 py-2 bg-brand-600 hover:bg-brand-500 font-semibold text-xs rounded-xl transition-all">
                    Choose PDF
                  </button>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col justify-between bg-neutral-950/60 border border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                  <FileText className="h-8 w-8 text-neutral-500" />
                  <div>
                    <h5 className="text-sm font-semibold truncate max-w-xs">{fileName}</h5>
                    <span className="text-[10px] text-neutral-500">12 Pages • 2.4 MB</span>
                  </div>
                </div>
                <div className="flex-grow flex items-center justify-center text-xs text-neutral-500">
                  {/* Mock PDF page rendering */}
                  <div className="w-full max-w-md h-4/5 border border-white/10 bg-neutral-900 rounded-lg p-6 flex flex-col gap-3 text-left">
                    <div className="h-4 w-1/3 bg-white/10 rounded" />
                    <div className="h-3 w-full bg-white/5 rounded" />
                    <div className="h-3 w-5/6 bg-white/5 rounded" />
                    <div className="h-3 w-11/12 bg-white/5 rounded" />
                    <div className="h-3 w-4/5 bg-white/5 rounded" />
                    <div className="mt-4 p-3 border border-brand-500/20 bg-brand-500/5 rounded text-[10px] text-brand-300">
                      <strong>CITED:</strong> "Section 3.1: All corporate requests must be logged through the internal portal."
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Chat Grounded in Document (1/2) */}
        <div className="w-full lg:w-[450px] bg-neutral-900/40 border border-white/5 rounded-2xl flex flex-col overflow-hidden h-1/2 lg:h-auto">
          {/* Header */}
          <div className="p-4 border-b border-white/5 bg-dark-950/40 flex items-center justify-between">
            <span className="text-sm font-semibold flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-purple-400" />
              Grounded AI Avatar
            </span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded text-[9px] text-purple-400 font-semibold uppercase">
              RAG Mode Only
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                <div className={`p-2 rounded-xl text-neutral-400 shrink-0 ${msg.role === 'user' ? 'bg-brand-500/10' : 'bg-white/5'}`}>
                  {msg.role === 'user' ? <MessageSquare className="h-4 w-4" /> : <Compass className="h-4 w-4" />}
                </div>
                <div className="space-y-1">
                  <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white rounded-tr-none'
                      : 'bg-neutral-800 text-neutral-200 rounded-tl-none border border-white/5'
                  }`}>
                    {msg.content}
                  </div>
                  {msg.citation && (
                    <div className="flex items-center gap-1 text-[9px] text-brand-400 font-medium">
                      <Bookmark className="h-3 w-3" />
                      <span>Source: {msg.citation.doc} (Page {msg.citation.page})</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Form Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-dark-950/40">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about document..."
                disabled={!fileUploaded}
                className="flex-grow bg-neutral-900 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 text-sm disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!fileUploaded || !inputValue.trim()}
                className="p-3 bg-brand-600 hover:bg-brand-500 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed rounded-xl text-white transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
