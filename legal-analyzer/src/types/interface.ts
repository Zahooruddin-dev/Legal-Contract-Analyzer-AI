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
	setInput: (index: number) => void;
	onSend: (index: number) => void;
	loading: (index: number) => void;
}
interface MessageBubbleProps {
	message: {
		role: 'user' | 'assistant';
		content: string;
	};
	onRegenerate: (index: number) => void;
	index: number;
}
export type {
	SuggestedQueryTypes,
	ChatHeaderProps,
	MessageBubbleProps,
	ChatInput,
};
