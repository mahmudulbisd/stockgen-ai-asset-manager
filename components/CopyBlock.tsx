
import React, { useState } from 'react';

interface CopyBlockProps {
  label: string;
  content: string;
}

const CopyBlock: React.FC<CopyBlockProps> = ({ label, content }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="w-full flex flex-col gap-1.5 mb-6 last:mb-0 overflow-hidden">
      <div className="flex justify-between items-center gap-2 px-1">
        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest truncate">
          {label}
        </label>
        <button
          onClick={handleCopy}
          className={`flex-shrink-0 flex items-center justify-center min-w-[64px] text-[10px] font-black px-3 py-1.5 rounded-lg transition-all duration-200 border ${
            copied 
              ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-100' 
              : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-600 hover:text-white active:scale-95'
          }`}
        >
          {copied ? 'DONE' : 'COPY'}
        </button>
      </div>
      <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl transition-colors hover:border-slate-300">
        <div className="p-4 sm:p-5 text-sm font-medium text-slate-700 leading-relaxed font-mono break-words whitespace-pre-wrap select-all">
          {content}
        </div>
      </div>
    </div>
  );
};

export default CopyBlock;
