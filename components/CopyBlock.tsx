
import React, { useState } from 'react';

interface CopyBlockProps {
  label: string;
  content: string;
  buttonLabel?: string;
  isProminent?: boolean;
}

const CopyBlock: React.FC<CopyBlockProps> = ({ label, content, buttonLabel = "COPY", isProminent = false }) => {
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
    <div className={`w-full flex flex-col gap-1.5 mb-6 last:mb-0 overflow-hidden ${isProminent ? 'group/block' : ''}`}>
      <div className="flex justify-between items-center gap-2 px-1">
        <label className={`text-[10px] font-extrabold uppercase tracking-widest truncate ${isProminent ? 'text-indigo-500' : 'text-slate-400'}`}>
          {label}
        </label>
        <button
          onClick={handleCopy}
          className={`flex-shrink-0 flex items-center justify-center min-w-[64px] text-[10px] font-black px-4 py-1.5 rounded-lg transition-all duration-200 border ${
            copied 
              ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-100' 
              : isProminent 
                ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 active:scale-95'
                : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-600 hover:text-white active:scale-95'
          }`}
        >
          {copied ? 'DONE!' : buttonLabel}
        </button>
      </div>
      <div className={`w-full rounded-2xl transition-all duration-300 border ${
        isProminent 
          ? 'bg-indigo-50/30 border-indigo-200 shadow-sm group-hover/block:border-indigo-400 group-hover/block:bg-white' 
          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
      }`}>
        <div className={`p-4 sm:p-5 text-sm font-medium leading-relaxed font-mono break-words whitespace-pre-wrap select-all ${
          isProminent ? 'text-indigo-900' : 'text-slate-700'
        }`}>
          {content}
        </div>
      </div>
    </div>
  );
};

export default CopyBlock;
