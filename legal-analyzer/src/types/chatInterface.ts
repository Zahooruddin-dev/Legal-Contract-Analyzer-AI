interface SuggestedQueryTypes {
	text: string;
	onClick: (text: string) => void;
}
interface ChatHeaderProps {
	onRegenerateLast: () => void;
	loading: boolean;
	chatHistory: {
		role: string;
		content: string;
	}[];
}
interface MessageBubbleProps {
	message: {
	role: string;
		content: string;
	};
	onRegenerate: (index: number) => void;
	index: number;
}
interface ChatInput {
	input: string;
	setInput: (input: string) => void;
	onSend: (index: string) => void;
	loading: boolean;
}

interface onSuggestedQueryType {
	onSuggestedQuery: (text: string) => void;
}
interface ChatInterface {
	chatHistory: {
		role: string;
		content: string;
	}[];
	onSendMessage: (message: string) => void;
	loading: boolean;
	onRegenerate: (index: number) => void;
}

// Usage in component:
export type {
	onSuggestedQueryType,
	SuggestedQueryTypes,
	ChatHeaderProps,
	MessageBubbleProps,
	ChatInput,
	ChatInterface,
};
