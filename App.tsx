
import React, { useState, useEffect } from 'react';
import { generateStockAssets } from './services/geminiService';
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
    const saved = localStorage.getItem('stock_gen_v3');
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
      localStorage.setItem('stock_gen_v3', JSON.stringify(results));
    }
  }, [results]);

  const handleGenerate = async () => {
    if (!config.niche.trim()) {
      setError("Please describe your topic or paste niche keywords.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await generateStockAssets(config);
      setResults(data);
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
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
    link.setAttribute('download', `stock_assets_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC] w-full max-w-full overflow-x-hidden">
      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-slate-200 sticky top-0 z-50 w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <span className="font-extrabold text-slate-800 tracking-tight">StockGen AI</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 active:scale-95 transition-all"
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 bg-white w-72 md:relative md:w-80 md:translate-x-0 transition-transform duration-300 ease-in-out border-r border-slate-200
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full p-6 pt-10 md:pt-10 overflow-y-auto">
          <div className="hidden md:flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-800">StockGen AI</h1>
          </div>

          <div className="space-y-10">
            <section>
              <div className="flex justify-between items-center mb-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Creativity</label>
                <span className="text-xs font-bold text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-md">{config.temperature}</span>
              </div>
              <input
                type="range" min="0.7" max="1.0" step="0.05"
                value={config.temperature}
                onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </section>

            <section>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Variation Count</label>
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                <button onClick={() => setConfig({...config, quantity: Math.max(1, config.quantity - 1)})} className="h-10 flex items-center justify-center rounded-lg bg-white border border-slate-200 active:bg-slate-50 transition-colors">-</button>
                <span className="h-10 flex items-center justify-center font-bold text-slate-700">{config.quantity}</span>
                <button onClick={() => setConfig({...config, quantity: Math.min(10, config.quantity + 1)})} className="h-10 flex items-center justify-center rounded-lg bg-white border border-slate-200 active:bg-slate-50 transition-colors">+</button>
              </div>
            </section>

            <section className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Asset Fields</label>
              {Object.entries(config.assets).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 cursor-pointer transition-all">
                  <span className="text-sm font-semibold text-slate-600 capitalize">{key === 'prompt' ? 'AI Prompt' : key}</span>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => setConfig({...config, assets: { ...config.assets, [key]: !value }})}
                    className="w-5 h-5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </label>
              ))}
            </section>
          </div>
          
          <div className="mt-auto pt-10 text-[10px] text-center text-slate-400 font-bold uppercase tracking-[0.2em]">
            Stock Content Professional
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden p-4 sm:p-6 md:p-12">
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
          {/* Input Box Card */}
          <div className="bg-white p-5 sm:p-8 rounded-[2rem] border border-slate-200 shadow-sm w-full">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Topic & Niche Details</h2>
            <textarea
              placeholder="e.g., 'Modern organic skincare products, flatlay, minimalist bathroom, 8k, natural light'..."
              className="w-full h-36 sm:h-44 p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none text-slate-800 placeholder:text-slate-400 text-base leading-relaxed mb-6"
              value={config.niche}
              onChange={(e) => setConfig({ ...config, niche: e.target.value })}
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-4.5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all active:scale-[0.98] shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-70 text-base sm:text-lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Expertly Crafting...
                </div>
              ) : "Generate Stock Metadata"}
            </button>
            {error && <div className="mt-5 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold border border-red-100 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {error}
            </div>}
          </div>

          {/* Results Area */}
          <div className="space-y-10 w-full">
            {results.length > 0 && (
              <>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 px-1">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Generated Output</h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Ready for agency submission</p>
                  </div>
                  <button
                    onClick={handleDownloadCSV}
                    className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-bold text-sm shadow-xl active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download CSV
                  </button>
                </div>

                <div className="grid gap-10 w-full">
                  {results.map((variation) => (
                    <article key={variation.id} className="bg-white p-5 sm:p-8 rounded-[2rem] border border-slate-200 shadow-sm w-full relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full font-black text-[10px] tracking-tighter">
                          SET #{variation.variationIndex}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
                        <h4 className="text-lg font-bold text-slate-800">Variation Data</h4>
                      </div>

                      <div className="flex flex-col w-full">
                        {variation.title && <CopyBlock label="SEO Title" content={variation.title} />}
                        {variation.imagePrompt && <CopyBlock label="AI Visual Prompt" content={variation.imagePrompt} />}
                        {variation.keywords && <CopyBlock label="Key Tags (Exactly 40)" content={variation.keywords} />}
                        {variation.description && <CopyBlock label="Meta Description" content={variation.description} />}
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}

            {results.length === 0 && !loading && (
              <div className="text-center py-20 bg-slate-100/30 rounded-[3rem] border-2 border-dashed border-slate-200 w-full flex flex-col items-center gap-5">
                <div className="w-16 h-16 bg-white rounded-3xl shadow-sm flex items-center justify-center text-slate-300">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 00-2 2z" /></svg>
                </div>
                <div className="space-y-1.5 px-6">
                  <p className="text-slate-700 font-extrabold text-lg">No assets yet</p>
                  <p className="text-slate-400 text-sm max-w-xs mx-auto font-medium leading-relaxed">Describe your stock content above and we'll generate the metadata needed for sales success.</p>
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
