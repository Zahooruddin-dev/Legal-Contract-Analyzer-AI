import React, { useState, useRef } from 'react';
import LegalAnalyzerView from './LegalAnalyzerView.js';
import { extractTextFromPDF } from '../utils/pdfUtils.js';
import {
    TabId,
    ChatMessage,
    LegalAnalysis,
    LegalAnalyzerProps,
} from '../types/legalAnlyzerInterface.js';

const LegalAnalyzer: React.FC<LegalAnalyzerProps> = () => {
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState<string>('');
    const [analysis, setAnalysis] = useState<LegalAnalysis | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [activeTab, setActiveTab] = useState<TabId>('upload');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [chatLoading, setChatLoading] = useState<boolean>(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const WORKER_URL = import.meta.env.VITE_ENV_WORKER_URL as string;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
        const uploadedFile = e.target.files?.[0];
        if (!uploadedFile) return;

        setError('');
        setFile(uploadedFile);
        setLoading(true);

        try {
            if (uploadedFile.type === 'application/pdf') {
                const extractedText = await extractTextFromPDF(uploadedFile);
                setText(extractedText);
            } else if (uploadedFile.type === 'text/plain') {
                const reader = new FileReader();
                reader.onload = (event) => {
                    setText((event.target?.result as string) ?? '');
                };
                reader.readAsText(uploadedFile);
            } else {
                setError('Unsupported file format. Please upload PDF or TXT.');
            }
        } catch (err: unknown) {
            setError('Error reading file: ' + (err instanceof Error ? err.message : 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const analyzeContract = async (): Promise<void> => {
        if (!text) { setError('No document content found.'); return; }

        setLoading(true);
        setError('');
        setAnalysis(null);

        try {
            const response = await fetch(WORKER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    max_tokens: 4000,
                    temperature: 0.2,
                    messages: [{
                        role: 'user',
                        content: `Analyze this legal document and return valid JSON (no markdown) with these keys: summary, documentType, parties, keyTerms, obligations, risks, recommendations, expiryDate, jurisdiction.\n\nDocument:\n${text}`,
                    }],
                }),
            });

            if (!response.ok) throw new Error(`API Error: ${response.status}`);

            const data = await response.json();
            const raw: string = data.choices?.[0]?.message?.content ?? '';
            const cleaned = raw.replace(/```json|```/g, '').trim();

            setAnalysis(JSON.parse(cleaned) as LegalAnalysis);
            setActiveTab('results');
        } catch (err: unknown) {
            console.error(err);
            setError('Analysis failed. Please check the console or try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChatSubmit = async (userMessage: string): Promise<void> => {
        if (!text) {
            setChatHistory((prev) => [
                ...prev,
                { role: 'user', content: userMessage },
                { role: 'assistant', content: 'Please upload a legal document first before asking questions.' },
            ]);
            return;
        }

        setChatLoading(true);
        const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', content: userMessage }];
        setChatHistory(newHistory);

        const analysisContext = analysis
            ? `ANALYZED DOCUMENT SUMMARY:
- Document Type: ${analysis.documentType ?? 'Not specified'}
- Parties: ${analysis.parties?.map((p) => p.name ?? p.party ?? '').join(', ') || 'Not identified'}
- Key Terms: ${analysis.keyTerms?.map((t) => `${t.term ?? t.name}: ${t.definition ?? ''}`).join('; ') || 'None'}
- Jurisdiction: ${analysis.jurisdiction ?? 'Not specified'}\n\n`
            : '';

        const systemPrompt = `You are an expert legal assistant. Answer based SPECIFICALLY on the contract text. Use markdown formatting. Cite clauses with [cite:start-end] markers. Be precise and accessible.\n\n${analysisContext}CONTRACT TEXT:\n${text.substring(0, 8000)}${text.length > 8000 ? '...(truncated)' : ''}\n\nAnswer the user's question about this contract:`;

        try {
            const response = await fetch(WORKER_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    max_tokens: 1500,
                    temperature: 0.3,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...newHistory.map(({ role, content }) => ({ role, content })),
                    ],
                }),
            });

            if (!response.ok) throw new Error(`API Error: ${response.status}`);

            const data = await response.json();
            const botReply: string = data.choices?.[0]?.message?.content ?? "I couldn't process that request.";
            setChatHistory((prev) => [...prev, { role: 'assistant', content: botReply }]);
        } catch (err: unknown) {
            console.error('Chat error:', err);
            setChatHistory((prev) => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setChatLoading(false);
        }
    };

    const onRegenerate = async (messageIndex: number): Promise<void> => {
        if (!chatHistory.length || messageIndex < 1 || messageIndex >= chatHistory.length) {
            console.warn('Regenerate failed: invalid index');
            return;
        }

        const previousMessage = chatHistory[messageIndex - 1];
        if (previousMessage?.role !== 'user') {
            console.warn('Regenerate failed: previous message was not a user prompt');
            return;
        }

        const trimmed = [...chatHistory];
        trimmed.splice(messageIndex, 1);
        setChatHistory(trimmed);
        await handleChatSubmit(previousMessage.content);
    };

    const onCitationClick = (start: number, end: number): void => {
        console.log(`Citation clicked: ${start}-${end}`);
    };

    const onHighlightCitation = (start: number, end: number): void => {
        console.log(`Highlighting: ${start}-${end}`);
    };

    const exportAnalysis = (): void => {
        if (!analysis) return;
        const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'legal-analysis.json';
        link.click();
        URL.revokeObjectURL(url);
    };

    const resetAnalysis = (): void => {
        setFile(null);
        setText('');
        setAnalysis(null);
        setChatHistory([]);
        setActiveTab('upload');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <LegalAnalyzerView
            file={file}
            text={text}
            setText={setText}
            analysis={analysis}
            loading={loading}
            error={error}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            fileInputRef={fileInputRef}
            handleFileUpload={handleFileUpload}
            analyzeContract={analyzeContract}
            resetAnalysis={resetAnalysis}
            exportAnalysis={exportAnalysis}
            chatHistory={chatHistory}
            handleChatSubmit={handleChatSubmit}
            chatLoading={chatLoading}
            onRegenerate={onRegenerate}
            onCitationClick={onCitationClick}
            onHighlightCitation={onHighlightCitation}
        />
    );
};

export default LegalAnalyzer;