import React from 'react';
import { 
  FileText, Upload, AlertTriangle, CheckCircle, 
  XCircle, Brain, Loader2, Download, Trash2, 
  ShieldAlert, Scale, Calendar, Globe 
} from 'lucide-react';

// --- Helper Components for Clean UI ---

const SectionCard = ({ title, icon: Icon, children, className = "" }) => (
  <div className={`bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-6 shadow-lg transition-all hover:shadow-2xl ${className}`}>
    <div className="flex items-center mb-4 border-b border-slate-700/50 pb-3">
      {Icon && <Icon className="w-5 h-5 text-blue-400 mr-2" />}
      <h3 className="text-xl font-semibold text-white tracking-wide">{title}</h3>
    </div>
    <div className="text-slate-300">
      {children}
    </div>
  </div>
);

const ListItem = ({ children, variant = "neutral" }) => {
  const styles = {
    neutral: "bg-slate-900/40 border-slate-700/50 text-blue-100",
    danger: "bg-red-900/10 border-red-500/20 text-red-100",
    success: "bg-green-900/10 border-green-500/20 text-green-100",
    warning: "bg-amber-900/10 border-amber-500/20 text-amber-100"
  };

  const iconColor = {
    neutral: "text-blue-400",
    danger: "text-red-400",
    success: "text-green-400",
    warning: "text-amber-400"
  };

  const Icon = variant === 'danger' ? AlertTriangle : (variant === 'success' ? CheckCircle : (variant === 'warning' ? ShieldAlert : FileText));

  return (
    <div className={`p-4 rounded-lg border flex items-start gap-3 transition-colors ${styles[variant]}`}>
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor[variant]}`} />
      <div className="text-sm md:text-base leading-relaxed w-full">
        {children}
      </div>
    </div>
  );
};

// --- safeRender Helper: Fixes the "Object Not Valid" Error ---
const SafeRender = ({ data }) => {
  if (!data) return null;
  if (typeof data === 'string') return <span>{data}</span>;
  
  // If it's the "Party + Obligation" object structure that caused the crash
  if (typeof data === 'object') {
    return (
      <div className="flex flex-col gap-1">
        {data.party && <span className="text-xs font-bold uppercase tracking-wider opacity-70">{data.party}</span>}
        {data.name && <span className="font-semibold">{data.name}</span>}
        {data.role && <span className="text-xs italic opacity-80">({data.role})</span>}
        
        {/* Recursive handling for nested obligations arrays */}
        {data.obligations && (
          Array.isArray(data.obligations) ? (
            <ul className="list-disc list-inside mt-1 space-y-1">
              {data.obligations.map((obs, i) => <li key={i}>{obs}</li>)}
            </ul>
          ) : (
            <p>{data.obligations}</p>
          )
        )}
      </div>
    );
  }
  return null;
};

// --- Main View Component ---
const LegalAnalyzerView = ({
  file,
  text,
  setText,
  analysis,
  loading,
  error,
  activeTab,
  setActiveTab,
  fileInputRef,
  handleFileUpload,
  analyzeContract,
  resetAnalysis,
  exportAnalysis
}) => {
  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black text-slate-200 font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Header */}
        <header className="text-center mb-10 md:mb-16 space-y-4">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-600/10 ring-1 ring-blue-500/50 mb-4 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
            <Scale className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Legal<span className="text-blue-500">Mind</span> AI
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-light">
            Enterprise-grade contract analysis powered by advanced LLMs.
          </p>
        </header>

        {/* Main Content Area */}
        <main className="w-full mx-auto max-w-5xl">
          
          {/* Navigation Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/80 backdrop-blur rounded-xl border border-slate-800 mb-8">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center justify-center py-3 px-6 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'upload' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Upload className="w-4 h-4 mr-2" />
              Document Source
            </button>
            <button
              onClick={() => setActiveTab('results')}
              disabled={!analysis}
              className={`flex items-center justify-center py-3 px-6 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'results' && analysis
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800'
              }`}
            >
              <Brain className="w-4 h-4 mr-2" />
              Legal Analysis
            </button>
          </div>

          {/* INPUT SECTION */}
          {activeTab === 'upload' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl">
                
                {/* File Drop Area */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Upload Contract (TXT)</label>
                  <div className="relative group">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".txt"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-slate-700 group-hover:border-blue-500/50 group-hover:bg-blue-500/5 rounded-xl p-10 transition-all duration-300 flex flex-col items-center justify-center text-center">
                      <div className="p-4 rounded-full bg-slate-800 group-hover:scale-110 transition-transform duration-300 mb-4">
                        <Upload className="w-8 h-8 text-blue-400" />
                      </div>
                      {file ? (
                        <div className="flex items-center text-green-400 bg-green-900/20 px-4 py-2 rounded-full border border-green-500/20">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                        </div>
                      ) : (
                        <>
                          <p className="text-lg font-medium text-slate-200 mb-1">Drop file here or click to browse</p>
                          <p className="text-sm text-slate-500">Supports .txt files</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center text-slate-600 mb-8">
                  <span className="bg-slate-900 px-3 text-sm uppercase tracking-widest font-semibold">OR</span>
                </div>

                {/* Text Area */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-slate-300 mb-2 ml-1">Paste Contract Text</label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste legal text here..."
                    className="w-full h-64 bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none transition-all font-mono text-sm leading-relaxed"
                  />
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3 text-red-200">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={analyzeContract}
                    disabled={loading || (!text && !file)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg shadow-blue-900/20"
                  >
                    {loading ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing Legal Data...</>
                    ) : (
                      <><Brain className="w-5 h-5 mr-2" /> Analyze Contract</>
                    )}
                  </button>
                  
                  {(file || text || analysis) && (
                    <button
                      onClick={resetAnalysis}
                      className="px-6 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors flex items-center justify-center"
                      title="Reset All"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* RESULTS SECTION */}
          {activeTab === 'results' && analysis && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
              
              {/* Toolbar */}
              <div className="flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  <span className="text-sm font-medium text-slate-400">Analysis Complete</span>
                </div>
                <button
                  onClick={exportAnalysis}
                  className="text-sm bg-slate-800 hover:bg-slate-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center border border-slate-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export JSON
                </button>
              </div>

              {/* Summary Hero */}
              <SectionCard title="Executive Summary" className="border-blue-500/30">
                <p className="text-lg leading-relaxed text-blue-100">{analysis.summary}</p>
              </SectionCard>

              {/* Key Metadata Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SectionCard title="Document Type" icon={FileText} className="md:col-span-1">
                  <div className="font-mono text-xl text-white bg-slate-900/50 p-3 rounded border border-slate-700/50 text-center">
                    {analysis.documentType}
                  </div>
                </SectionCard>

                <SectionCard title="Jurisdiction" icon={Globe} className="md:col-span-1">
                   <div className="font-mono text-lg text-white bg-slate-900/50 p-3 rounded border border-slate-700/50 text-center truncate">
                    {analysis.jurisdiction || "Not Specified"}
                  </div>
                </SectionCard>

                <SectionCard title="Expiry" icon={Calendar} className="md:col-span-1">
                  <div className="font-mono text-lg text-white bg-slate-900/50 p-3 rounded border border-slate-700/50 text-center">
                    {analysis.expiryDate || "N/A"}
                  </div>
                </SectionCard>
              </div>

              {/* Main Content Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Column 1: Parties & Terms */}
                <div className="space-y-6">
                   <SectionCard title="Parties Involved" icon={CheckCircle}>
                    <div className="space-y-2">
                      {analysis.parties?.map((party, i) => (
                        <ListItem key={i} variant="neutral">
                          <SafeRender data={party} />
                        </ListItem>
                      ))}
                    </div>
                  </SectionCard>

                  <SectionCard title="Key Terms" icon={FileText}>
                    <div className="space-y-2">
                      {analysis.keyTerms?.map((term, i) => (
                        <ListItem key={i} variant="neutral">
                          <SafeRender data={term} />
                        </ListItem>
                      ))}
                    </div>
                  </SectionCard>
                </div>

                {/* Column 2: Risks & Obligations */}
                <div className="space-y-6">
                  <SectionCard title="Potential Risks" icon={AlertTriangle}>
                     <div className="space-y-2">
                      {analysis.risks?.map((risk, i) => (
                        <ListItem key={i} variant="danger">
                          <SafeRender data={risk} />
                        </ListItem>
                      ))}
                      {(!analysis.risks || analysis.risks.length === 0) && (
                        <p className="text-slate-500 italic">No significant risks detected.</p>
                      )}
                    </div>
                  </SectionCard>

                  <SectionCard title="Obligations" icon={Scale}>
                    <div className="space-y-2">
                      {analysis.obligations?.map((obs, i) => (
                        <ListItem key={i} variant="warning">
                          <SafeRender data={obs} />
                        </ListItem>
                      ))}
                    </div>
                  </SectionCard>
                </div>
              </div>

              {/* Recommendations */}
              <SectionCard title="Strategic Recommendations" icon={ShieldAlert} className="border-green-500/20 bg-green-900/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.recommendations?.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded bg-slate-900/50 border border-slate-700/50">
                      <div className="mt-1.5 w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                      <span className="text-slate-300"><SafeRender data={rec} /></span>
                    </div>
                  ))}
                </div>
              </SectionCard>
              
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default LegalAnalyzerView;