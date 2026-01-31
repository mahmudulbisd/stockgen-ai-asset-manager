
import React, { useState, useEffect } from 'react';
import { generateStockAssets } from './services/aiService';
import { StockAssetVariation, GeneratorConfig } from './types';
import CopyBlock from './components/CopyBlock';

const App: React.FC = () => {
  const [config, setConfig] = useState<GeneratorConfig>({
    niche: '',
    temperature: 0.8,
    quantity: 1,
    assets: {
      title: true,
      description: true,
      keywords: true,
      prompt: true,
    },
  });

  const [results, setResults] = useState<StockAssetVariation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('stock_gen_openai_v1');
    if (saved) {
      try {
        setResults(JSON.parse(saved));
      } catch (e) {
        console.error("Storage load failed");
      }
    }
  }, []);

  useEffect(() => {
    if (results.length > 0) {
      localStorage.setItem('stock_gen_openai_v1', JSON.stringify(results));
    }
  }, [results]);

  const handleGenerate = async () => {
    if (!config.niche.trim()) {
      setError("Please describe your topic first.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await generateStockAssets(config);
      setResults(data);
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to generate assets. Check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (results.length === 0) return;
    const headers = ["Variation", "Title", "Description", "Keywords", "Prompt"];
    const csvRows = results.map(r => [
      `V${r.variationIndex}`,
      `"${(r.title || '').replace(/"/g, '""')}"`,
      `"${(r.description || '').replace(/"/g, '""')}"`,
      `"${(r.keywords || '').replace(/"/g, '""')}"`,
      `"${(r.imagePrompt || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...csvRows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `stock_metadata_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC] w-full max-w-full overflow-x-hidden">
      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-slate-200 sticky top-0 z-50 w-full shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg flex items-center justify-center text-white shadow-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <span className="font-black text-slate-800 tracking-tighter text-lg uppercase">StockGen<span className="text-indigo-600">Pro</span></span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 active:scale-90 transition-all"
        >
          {isSidebarOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
          )}
        </button>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40 md:hidden animate-in fade-in duration-300" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-white w-72 md:relative md:w-80 md:translate-x-0 transition-all duration-300 ease-in-out border-r border-slate-200
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full p-6 pt-10 overflow-y-auto">
          <div className="hidden md:flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-xl flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h1 className="text-xl font-black tracking-tighter text-slate-800 uppercase">StockGen <span className="text-indigo-600">Pro</span></h1>
          </div>

          <div className="space-y-10">
            <section>
              <div className="flex justify-between items-center mb-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Model Creativity</label>
                <span className="text-xs font-black text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-md">{config.temperature}</span>
              </div>
              <input
                type="range" min="0" max="1.5" step="0.1"
                value={config.temperature}
                onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </section>

            <section>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-3">Total Variations</label>
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                <button onClick={() => setConfig({...config, quantity: Math.max(1, config.quantity - 1)})} className="h-10 flex items-center justify-center rounded-lg bg-white border border-slate-200 active:bg-slate-50 font-bold">-</button>
                <span className="h-10 flex items-center justify-center font-black text-slate-700">{config.quantity}</span>
                <button onClick={() => setConfig({...config, quantity: Math.min(10, config.quantity + 1)})} className="h-10 flex items-center justify-center rounded-lg bg-white border border-slate-200 active:bg-slate-50 font-bold">+</button>
              </div>
            </section>

            <section className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] block mb-3">Metadata Fields</label>
              {Object.entries(config.assets).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-100 cursor-pointer transition-all group">
                  <span className="text-sm font-bold text-slate-600 capitalize group-hover:text-indigo-600">{key === 'prompt' ? 'AI Prompt' : key}</span>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => setConfig({...config, assets: { ...config.assets, [key]: !value }})}
                    className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </label>
              ))}
            </section>
          </div>
          
          <div className="mt-auto pt-10 text-[9px] text-center text-slate-400 font-bold uppercase tracking-[0.3em]">
            Powered by GPT-4o
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden p-4 sm:p-6 md:p-12">
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
          {/* Input Box Card */}
          <div className="bg-white p-5 sm:p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/20 w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Stock Photo Niche / Context</h2>
            <textarea
              placeholder="Describe your subject... e.g., 'Modern architecture, organic textures, sunset glow, 8k resolution'..."
              className="w-full h-40 sm:h-52 p-5 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-400 outline-none transition-all resize-none text-slate-800 placeholder:text-slate-400 text-base sm:text-lg leading-relaxed mb-8"
              value={config.niche}
              onChange={(e) => setConfig({ ...config, niche: e.target.value })}
            />
            
            {/* Dynamic Premium Button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`
                group relative w-full py-5 rounded-2xl overflow-hidden font-black text-lg transition-all duration-300
                ${loading ? 'cursor-not-allowed opacity-80' : 'hover:scale-[1.01] hover:shadow-2xl hover:shadow-indigo-500/20 active:scale-[0.98]'}
              `}
            >
              {/* Animated Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 group-hover:bg-gradient-to-l transition-all duration-700"></div>
              
              {/* Shine Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
              
              <div className="relative flex items-center justify-center gap-3 text-white">
                {loading ? (
                  <>
                    <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>Analysing Concepts...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 transform group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    <span>Generate Metadata</span>
                  </>
                )}
              </div>
            </button>
            
            {error && <div className="mt-6 p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-bold border border-red-100 flex items-center gap-3 animate-in slide-in-from-top duration-300">
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>}
          </div>

          {/* Results Area */}
          <div className="space-y-10 w-full">
            {results.length > 0 && (
              <>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 px-2">
                  <div>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">Curation Hub</h3>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">SEO Engine v4.0 Pro</p>
                  </div>
                  <button
                    onClick={handleDownloadCSV}
                    className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-black text-sm shadow-2xl active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    EXPORT CSV
                  </button>
                </div>

                <div className="grid gap-12 w-full">
                  {results.map((variation) => (
                    <article key={variation.id} className="bg-white p-6 sm:p-10 rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-100/50 w-full relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-6">
                        <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-full font-black text-[10px] tracking-widest uppercase">
                          Set {variation.variationIndex}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-10">
                        <div className="w-1.5 h-10 bg-indigo-600 rounded-full group-hover:scale-y-125 transition-transform"></div>
                        <h4 className="text-xl font-black text-slate-800 tracking-tight">Optimized Assets</h4>
                      </div>

                      <div className="flex flex-col w-full space-y-2">
                        {variation.title && <CopyBlock label="SEO Pro Title" content={variation.title} />}
                        
                        {/* Special 'Copy Prompt Only' section */}
                        {variation.imagePrompt && (
                          <CopyBlock 
                            label="AI Art Prompt" 
                            content={variation.imagePrompt} 
                            buttonLabel="Copy Prompt Only" 
                            isProminent={true}
                          />
                        )}
                        
                        {variation.keywords && <CopyBlock label="40 Viral Keywords" content={variation.keywords} />}
                        {variation.description && <CopyBlock label="Deep Description" content={variation.description} />}
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}

            {results.length === 0 && !loading && (
              <div className="text-center py-24 bg-slate-100/40 rounded-[3.5rem] border-2 border-dashed border-slate-300/60 w-full flex flex-col items-center gap-6 animate-pulse">
                <div className="w-20 h-20 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center text-slate-200">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 00-2 2z" /></svg>
                </div>
                <div className="space-y-2 px-8">
                  <p className="text-slate-800 font-black text-xl tracking-tight">AI Engine Standby</p>
                  <p className="text-slate-400 text-sm max-w-sm mx-auto font-medium leading-relaxed uppercase tracking-widest text-[10px]">Ready to process your niche requirements</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
