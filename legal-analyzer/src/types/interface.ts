interface SuggestedQueryTypes {
	question: string;
	relevance: number;
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
