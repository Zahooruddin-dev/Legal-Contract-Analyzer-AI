import React, { useState } from 'react';
import {
  FileText, Upload, AlertTriangle, CheckCircle, XCircle, Brain,
  Loader2, Download, Trash2, ShieldAlert, Scale, Calendar, Globe,
  MessageSquare, Eye, TrendingUp, AlertCircle, Users, Clock,
  ChevronRight, Zap, Shield, DollarSign, FileCheck, Sparkles,
  Search, Filter, Bookmark, Share, RotateCcw, Heart, BookOpen,
  Mic, MicOff, Send, Paperclip, Copy, Gavel
} from 'lucide-react';
import ChatInterface from './ChatInterface';

// --- SUB-COMPONENTS ---

const SafeRender = ({ data }) => {
  if (!data) return null;
  
  if (typeof data === 'string') {
    return <span>{data}</span>;
  }

  if (typeof data === 'object' && !Array.isArray(data)) {
    return (
      <div className='space-y-1'>
        {data.party && <span className='text-xs font-bold text-blue-300 block'>{data.party}</span>}
        {data.name && <span className='font-semibold block'>{data.name}</span>}
        {data.role && <span className='text-xs italic opacity-80 block'>({data.role})</span>}
        {data.obligations && Array.isArray(data.obligations) && (
          <ul className='list-disc list-inside space-y-1 text-slate-300 mt-1'>
            {data.obligations.map((ob, i) => <li key={i}>{ob}</li>)}
          </ul>
        )}
        {data.content && <span>{data.content}</span>}
      </div>
    );
  }
  
  return null;
};

const StatCard = ({ label, value, icon: Icon, color = 'blue' }) => {
  const colorMap = {
    red: { bg: 'bg-red-500/10', text: 'text-red-400' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
    green: { bg: 'bg-green-500/10', text: 'text-green-400' },
  };

  const colors = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex items-center gap-4 hover:border-slate-600 transition-colors">
      <div className={`p-3 ${colors.bg} rounded-lg`}>
        <Icon className={`w-6 h-6 ${colors.text}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{label}</p>
      </div>
    </div>
  );
};

const DocumentContextPanel = ({ text }) => (
  <div className='hidden lg:flex w-[400px] flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl'>
    <div className='p-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between'>
      <div className='flex items-center gap-2'>
        <BookOpen className='w-4 h-4 text-slate-400' />
        <span className='text-sm font-bold text-slate-200'>Document Reference</span>
      </div>
      <div className='flex gap-1'>
        <button className='p-1.5 hover:bg-slate-700 rounded text-slate-400'>
          <Search className='w-4 h-4' />
        </button>
        <button className='p-1.5 hover:bg-slate-700 rounded text-slate-400'>
          <Bookmark className='w-4 h-4' />
        </button>
      </div>
    </div>
    
    <div className='flex-1 overflow-y-auto p-6 bg-slate-900'>
      {text ? (
        <div className='font-serif text-slate-300 whitespace-pre-wrap leading-7 text-justify opacity-90'>
          {text}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-slate-500">
          <FileText className="w-12 h-12 mb-2 opacity-20" />
          <p className="text-sm">No document content available</p>
        </div>
      )}
    </div>
    
    <div className='p-2 bg-slate-800 border-t border-slate-700 text-[10px] text-slate-500 text-center flex justify-between px-4'>
      <span>Ln 1, Col 1</span>
      <span>UTF-8</span>
      <span>{text?.length || 0} chars</span>
    </div>
  </div>
);

const RiskAssessment = ({ risks }) => {
  if (!risks?.length) {
    return (
      <div className='p-4 bg-green-900/20 border border-green-900/50 rounded-xl text-green-200 text-sm'>
        <CheckCircle className="w-4 h-4 inline mr-2" />
        No critical risks detected in the analysis.
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {risks.map((risk, i) => (
        <div
          key={i}
          className='bg-slate-900 border border-red-900/30 rounded-xl p-5 hover:border-red-500/30 transition-colors group'
        >
          <div className='flex items-start gap-4'>
            <div className='mt-1 p-1.5 bg-red-500/10 rounded text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors'>
              <AlertCircle className='w-4 h-4' />
            </div>
            <div className='flex-1'>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-red-300 font-semibold text-sm'>High Severity Risk</span>
                <span className='text-xs text-slate-500 font-mono'>Clause {i + 1}.0</span>
              </div>
              <div className='text-slate-300 text-sm'>
                <SafeRender data={risk} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const DocumentDetails = ({ analysis }) => {
  const metadata = analysis?.metadata || {};
  const keyTerms = analysis?.keyTerms || metadata.keyTerms || [];
  const parties = analysis?.parties || metadata.parties || [];

  return (
    <div className='bg-slate-900 border border-slate-800 rounded-xl p-5 sticky top-24'>
      <h4 className='text-sm font-bold text-slate-400 uppercase tracking-wider mb-4'>Document Details</h4>
      
      <div className='space-y-4 text-sm'>
        <div className='flex justify-between items-center py-2 border-b border-slate-800'>
          <span className='text-slate-500'>Type</span>
          <span className='text-white font-medium'>{metadata.documentType || 'Contract'}</span>
        </div>
        <div className='flex justify-between items-center py-2 border-b border-slate-800'>
          <span className='text-slate-500'>Jurisdiction</span>
          <span className='text-white font-medium'>{metadata.jurisdiction || 'N/A'}</span>
        </div>
        <div className='flex justify-between items-center py-2 border-b border-slate-800'>
          <span className='text-slate-500'>Parties</span>
          <span className='text-white font-medium'>{parties.length} Detected</span>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-800">
        <h4 className='text-sm font-bold text-slate-400 uppercase tracking-wider mb-3'>Key Terms</h4>
        <div className="flex flex-wrap gap-2">
          {keyTerms.slice(0, 6).map((term, i) => (
            <span key={i} className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-blue-300">
              {typeof term === 'string' ? term : term.name || term.content || 'Term'}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const UploadView = ({ file, text, setText, error, loading, fileInputRef, handleFileUpload, analyzeContract }) => (
  <div className='max-w-3xl mx-auto'>
    <div className='bg-slate-900 border border-slate-800 rounded-2xl p-10 shadow-2xl'>
      <div className='text-center mb-10'>
        <div className='inline-flex p-4 bg-slate-800 rounded-2xl mb-6 ring-8 ring-slate-800/50'>
          <FileText className='w-10 h-10 text-blue-500' />
        </div>
        <h2 className='text-3xl font-bold text-white mb-3'>Legal Document Analysis</h2>
        <p className='text-slate-400 max-w-md mx-auto'>
          Upload contracts, agreements, or legal briefs. Our AI identifies risks, obligations, and key terms instantly.
        </p>
      </div>

      <div className='space-y-6'>
        {/* Drag Drop Area */}
        <div className='relative group'>
          <input
            ref={fileInputRef}
            type='file'
            accept='.txt,.pdf,.doc,.docx'
            onChange={handleFileUpload}
            className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
          />
          <div className={`h-40 border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center gap-3 ${
            file 
              ? 'border-green-500/50 bg-green-500/5' 
              : 'border-slate-700 group-hover:border-blue-500 group-hover:bg-slate-800/50 bg-slate-800/20'
          }`}>
            {file ? (
              <>
                <CheckCircle className="w-8 h-8 text-green-500" />
                <span className="text-green-400 font-medium">{file.name}</span>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 text-slate-500 group-hover:text-blue-400 transition-colors" />
                <div className="text-center">
                  <span className="text-slate-300 font-medium">Click to upload</span>
                  <span className="text-slate-500"> or drag and drop</span>
                </div>
                <span className="text-xs text-slate-600">PDF, DOCX, TXT up to 10MB</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-px bg-slate-800 flex-1"></div>
          <span className="text-xs text-slate-500 font-medium uppercase">Or paste text</span>
          <div className="h-px bg-slate-800 flex-1"></div>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Paste contract clauses here...'
          className='w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm text-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600 font-mono h-48 resize-none'
        />

        {error && (
          <div className='p-4 bg-red-900/20 border border-red-900/50 rounded-xl flex items-center gap-3 text-red-200 text-sm'>
            <AlertTriangle className="w-5 h-5 text-red-400" />
            {error}
          </div>
        )}

        <button
          onClick={analyzeContract}
          disabled={loading || (!text && !file)}
          className='w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {loading ? 'Analyzing Document...' : 'Analyze Now'}
        </button>
      </div>
    </div>
  </div>
);

const ResultsView = ({ analysis }) => {
  const metadata = analysis?.metadata || {};
  const confidenceScore = ((metadata.confidence || 0) * 100).toFixed(0);

  return (
    <div className='space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      {/* KPI Dashboard */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <StatCard label="Critical Risks" value={analysis.risks?.length || 0} icon={ShieldAlert} color="red" />
        <StatCard label="Obligations" value={analysis.obligations?.length || 0} icon={CheckCircle} color="amber" />
        <StatCard label="Key Terms" value={analysis.keyTerms?.length || 0} icon={FileCheck} color="blue" />
        <StatCard label="Compliance Score" value={`${confidenceScore}%`} icon={TrendingUp} color="green" />
      </div>

      <div className='grid lg:grid-cols-3 gap-6'>
        {/* Main Column */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Executive Summary */}
          <div className='bg-slate-900 border border-slate-800 rounded-xl p-6'>
            <div className='flex items-center gap-3 mb-4 border-b border-slate-800 pb-4'>
              <Brain className='w-5 h-5 text-blue-400' />
              <h3 className='font-bold text-white'>Executive Summary</h3>
            </div>
            <p className='text-slate-300 leading-relaxed text-sm'>
              {analysis.summary || "No summary available."}
            </p>
          </div>

          {/* Risks */}
          <div className='space-y-4'>
            <h3 className='text-lg font-bold text-white flex items-center gap-2'>
              <ShieldAlert className="w-5 h-5 text-red-400" />
              Risk Assessment
            </h3>
            <RiskAssessment risks={analysis.risks} />
          </div>
        </div>

        {/* Sidebar Column */}
        <div className='space-y-6'>
          <DocumentDetails analysis={analysis} />
        </div>
      </div>
    </div>
  );
};

const NavigationTabs = ({ activeTab, setActiveTab, analysis, loading }) => {
  const tabs = [
    { id: 'upload', label: 'Upload Document', icon: Upload },
    { id: 'results', label: 'Analysis Results', icon: FileCheck, disabled: !analysis || loading },
    { id: 'chat', label: 'AI Assistant', icon: MessageSquare, disabled: !analysis || loading },
  ];

  return (
    <div className='flex items-center justify-center mb-8'>
      <div className='bg-slate-900 p-1.5 rounded-xl border border-slate-800 inline-flex shadow-lg shadow-black/20'>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            disabled={tab.disabled}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-slate-800 text-white shadow-sm ring-1 ring-white/5'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 disabled:opacity-30 disabled:cursor-not-allowed'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-400' : ''}`} />
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const Navigation = ({ analysis, resetAnalysis, exportAnalysis }) => (
  <nav className='sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800'>
    <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
      <div className='flex items-center gap-3'>
        <div className='p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg shadow-blue-900/20'>
          <Scale className='w-5 h-5 text-white' />
        </div>
        <div>
          <span className='text-lg font-bold text-white tracking-tight'>
            Legal<span className='text-blue-400'>Mind</span> Pro
          </span>
        </div>
      </div>

      <div className='flex items-center gap-4'>
        {analysis && (
          <>
            <div className='h-6 w-px bg-slate-700 hidden sm:block'></div>
            <button
              onClick={resetAnalysis}
              className='flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors'
            >
              <Trash2 className='w-3.5 h-3.5' />
              Reset
            </button>
            <button
              onClick={exportAnalysis}
              className='flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors'
            >
              <Download className='w-3.5 h-3.5' />
              Export
            </button>
          </>
        )}
        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
          <span className="text-xs font-bold text-slate-400">JD</span>
        </div>
      </div>
    </div>
  </nav>
);

// --- MAIN PARENT COMPONENT ---

const LegalAnalyzerView = ({
  file,
  text,
  setText,
  analysis,
  loading,
  error,
  activeTab = 'upload',
  setActiveTab,
  fileInputRef,
  handleFileUpload,
  analyzeContract,
  resetAnalysis,
  exportAnalysis,
  chatHistory = [],
  handleChatSubmit,
  chatLoading,
  onRegenerate,
}) => {
  const enhancedAnalysis = analysis || (text ? {
    metadata: { 
      confidence: analysis?.metadata?.confidence || 0,
      documentType: analysis?.metadata?.documentType || 'N/A',
      jurisdiction: analysis?.metadata?.jurisdiction || 'N/A',
      parties: analysis?.metadata?.parties || [],
      keyTerms: analysis?.metadata?.keyTerms || [],
    },
    summary: analysis?.summary || "Analysis pending...",
    risks: analysis?.risks || [],
    obligations: analysis?.obligations || [],
    keyTerms: analysis?.keyTerms || [],
    parties: analysis?.parties || [],
  } : null);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'upload':
        return (
          <UploadView
            file={file}
            text={text}
            setText={setText}
            error={error}
            loading={loading}
            fileInputRef={fileInputRef}
            handleFileUpload={handleFileUpload}
            analyzeContract={analyzeContract}
          />
        );
      
      case 'results':
        return enhancedAnalysis && <ResultsView analysis={enhancedAnalysis} />;
      
      case 'chat':
        return (
          <div className='flex flex-col lg:flex-row gap-6 h-[calc(100vh-180px)]'>
            <div className='flex-1 min-w-0'>
              <ChatInterface
                chatHistory={chatHistory}
                onSendMessage={handleChatSubmit}
                loading={chatLoading}
                onRegenerate={onRegenerate}
              />
            </div>
            <DocumentContextPanel text={text} />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className='min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30'>
      <Navigation 
        analysis={enhancedAnalysis}
        resetAnalysis={resetAnalysis}
        exportAnalysis={exportAnalysis}
      />

      <div className='max-w-7xl mx-auto px-6 py-6'>
        <NavigationTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          analysis={enhancedAnalysis}
          loading={loading}
        />
        
        {renderActiveView()}
      </div>
    </div>
  );
};

export default LegalAnalyzerView;