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
		role: 'user' | 'assistant';
		content: string;
	};
	onRegenerate: (index: number) => void;
	index: number;
}
interface ChatInput {
	input: string;
	setInput: (index: string) => void;
	onSend: (index: string) => void;
	loading:  boolean;
}
interface MessageBubbleProps {
	message: {
		role: 'user' | 'assistant';
		content: string;
	};
	onRegenerate: (index: number) => void;
	index: number;
}
interface onSuggestedQueryType {
	onSuggestedQuery: () => void;
}
interface ChatInterface {
	chatHistory: string[];
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
  ChatInterface
};
