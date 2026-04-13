import React, { useState } from 'react';
import axios from 'axios';
import { Search, Bug, AlertTriangle, ShieldCheck, Terminal, Loader2, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = "http://localhost:5000/api";

function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('');

  const analyzeSite = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setStep('Initializing headless browser...');

    try {
      // Simulate steps for UI feel
      setTimeout(() => setStep('Navigating to target URL...'), 2000);
      setTimeout(() => setStep('Capturing visual state and DOM...'), 5000);
      setTimeout(() => setStep('Running AI analysis engine...'), 8000);

      const response = await axios.post(`${API_BASE}/analyze`, { url });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to analyze the website. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-background to-background">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
            <Bug className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">AI Bug <span className="gradient-text">Hunter</span></h1>
        </div>
        <p className="text-zinc-400 max-w-lg mx-auto">
          Autonomous QA agent that hunts for UI/UX, functional, and layout bugs using Playwright and Google Gemini.
        </p>
      </motion.div>

      {/* Input Section */}
      <motion.form 
        onSubmit={analyzeSite}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="group relative">
          <input 
            type="url" 
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="w-full h-16 pl-14 pr-32 glass rounded-2xl border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none text-lg"
          />
          <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-500 group-focus-within:text-primary transition-colors" />
          <button 
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-medium rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Start Hunt'}
          </button>
        </div>
      </motion.form>

      {/* Main Content Area */}
      <div className="w-full max-w-6xl mt-12">
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div 
              key="loader"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-20 glass rounded-3xl"
            >
              <div className="relative mb-8">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <div className="absolute inset-0 blur-2xl bg-primary/20 animate-pulse-slow"></div>
              </div>
              <h3 className="text-xl font-semibold mb-2">{step}</h3>
              <p className="text-zinc-500 animate-pulse">This may take up to a minute...</p>
            </motion.div>
          )}

          {error && (
            <motion.div 
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 border border-error/20 bg-error/5 rounded-2xl flex items-center gap-4 text-error"
            >
              <AlertTriangle className="shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          {result && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {/* Left Column: Report */}
              <div className="space-y-6">
                <div className="glass-card">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">Analysis Report</h2>
                      <p className="text-sm text-zinc-500">{result.url}</p>
                    </div>
                    <div className="px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent font-bold">
                      Score: {result.report.overallScore}/100
                    </div>
                  </div>
                  
                  <blockquote className="italic text-zinc-300 border-l-2 border-primary pl-4 mb-8">
                    {result.report.summary}
                  </blockquote>

                  <h3 className="flex items-center gap-2 font-semibold mb-4 text-zinc-300">
                    <AlertTriangle className="w-4 h-4 text-error" /> Detected Bugs
                  </h3>
                  
                  <div className="space-y-4">
                    {result.report.bugs.map((bug, i) => (
                      <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                            bug.severity === 'high' ? 'bg-error/20 text-error' : 
                            bug.severity === 'medium' ? 'bg-orange-500/20 text-orange-500' : 
                            'bg-blue-500/20 text-blue-500'
                          }`}>
                            {bug.severity}
                          </span>
                          <span className="text-[10px] uppercase font-medium text-zinc-500">{bug.type}</span>
                        </div>
                        <p className="text-zinc-200 mb-2 font-medium">{bug.description}</p>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                          <span className="text-accent font-medium">FIX:</span> {bug.recommendation}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Evidence */}
              <div className="space-y-6">
                <div className="glass-card overflow-hidden !p-0">
                  <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <span className="text-sm font-semibold text-zinc-400">Visual Evidence</span>
                    <ShieldCheck className="w-4 h-4 text-accent" />
                  </div>
                  <div className="relative group overflow-hidden">
                    <img src={result.screenshot} alt="Screenshot" className="w-full h-auto" />
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none mix-blend-overlay"></div>
                  </div>
                </div>

                <div className="glass p-6 rounded-2xl">
                  <div className="flex items-center gap-2 mb-4 text-zinc-400">
                    <Terminal className="w-4 h-4" />
                    <span className="text-xs font-mono">Console Logs</span>
                  </div>
                  <div className="bg-black/50 p-4 rounded-xl font-mono text-[10px] text-zinc-400 overflow-x-auto">
                    {result.report.bugs.some(b => b.type === 'functional') ? (
                      <div className="text-error leading-relaxed">
                        Detected exceptions during runtime. See high-severity reports for details.
                      </div>
                    ) : (
                      <div className="text-accent">No critical console errors detected.</div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px]"></div>
      </div>
    </div>
  );
}

export default App;
