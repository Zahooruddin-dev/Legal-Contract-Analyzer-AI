export type TabId = 'upload' | 'results' | 'chat';
export type RiskSeverity = 'high' | 'medium' | 'low';
export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
    role: MessageRole;
    content: string;
}

export interface KeyTerm {
    term?: string;
    name?: string;
    definition?: string;
    content?: string;
}

export interface Party {
    party?: string;
    name?: string;
    role?: string;
    obligations?: string[];
    content?: string;
}

export interface Risk {
    description?: string;
    severity?: RiskSeverity;
    clause?: string;
    content?: string;
}

export interface Obligation {
    description?: string;
    party?: string;
    content?: string;
}

export interface DocumentMetadata {
    confidence?: number;
    documentType?: string;
    jurisdiction?: string;
    parties?: Party[];
    keyTerms?: KeyTerm[];
}

export interface LegalAnalysis {
    summary?: string;
    documentType?: string;
    parties?: Party[];
    keyTerms?: KeyTerm[];
    obligations?: Obligation[];
    risks?: Risk[];
    recommendations?: string[];
    expiryDate?: string;
    jurisdiction?: string;
    metadata?: DocumentMetadata;
}

export interface userMessageInterface {
    role: MessageRole;
    content: string;
}

// ── COMPONENT PROPS ────────────────────────────────

export interface LegalAnalyzerProps {
    workerUrl?: string;
}

export interface LegalAnalyzerViewProps {
    file: File | null;
    text: string;
    setText: (text: string) => void;
    analysis: LegalAnalysis | null;
    loading: boolean;
    error: string;
    activeTab: TabId;
    setActiveTab: (tab: TabId) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    analyzeContract: () => Promise<void>;
    resetAnalysis: () => void;
    exportAnalysis: () => void;
    chatHistory: ChatMessage[];
    handleChatSubmit: (message: string) => Promise<void>;
    chatLoading: boolean;
    onRegenerate: (index: number) => Promise<void>;
    onCitationClick: (start: number, end: number) => void;
    onHighlightCitation: (start: number, end: number) => void;
}

export interface UploadViewProps {
    file: File | null;
    text: string;
    setText: (text: string) => void;
    error: string;
    loading: boolean;
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    analyzeContract: () => Promise<void>;
}

export interface NavigationProps {
    analysis: LegalAnalysis | null;
    resetAnalysis: () => void;
    exportAnalysis: () => void;
}

export interface NavigationTabsProps {
    activeTab: TabId;
    setActiveTab: (tab: TabId) => void;
    analysis: LegalAnalysis | null;
    loading: boolean;
}

export interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    color?: 'red' | 'amber' | 'blue' | 'green';
}

export interface DocumentContextPanelProps {
    text: string;
}

export interface DocumentDetailsProps {
    analysis: LegalAnalysis;
}

export interface RiskAssessmentProps {
    risks?: Risk[];
}

export interface ResultsViewProps {
    analysis: LegalAnalysis;
}

export interface SafeRenderProps {
    data: string | Party | Risk | Obligation | KeyTerm | null | undefined;
}