interface FileUploaderProps {
  setFile: (file: File) => void;
  setText: (text: string) => void;
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
  // onCitationClick: (citation: string) => void; 
}
interface userMessageInterface {
  userMessage:string
}
export type {
  FileUploaderProps,
  userMessageInterface
};