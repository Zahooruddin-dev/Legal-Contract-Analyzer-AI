# LegalMind Pro

A modern, AI-powered legal document analysis platform that instantly identifies risks, obligations, and key terms in contracts and legal agreements.

## 🎯 Overview

LegalMind Pro is a full-stack web application that leverages AWS Bedrock AI models to provide intelligent legal document analysis. Users can upload contracts (PDF, DOCX, TXT), receive automated analysis with risk assessment, and engage in real-time conversations with an AI legal assistant for deeper insights.

## ✨ Key Features

- **Document Upload & Processing**: Support for PDF, DOCX, and TXT file formats (up to 10MB)
- **Automated Analysis**: AI-powered extraction of risks, obligations, key terms, parties, and metadata
- **Risk Assessment**: Real-time identification and categorization of contract risks
- **Interactive Chat**: Context-aware AI assistant for specific legal questions about uploaded documents
- **Executive Summary**: Concise overview of document contents and key findings
- **Export Results**: Download analysis data in JSON format
- **Dark Theme UI**: Modern, professional interface with responsive design
- **Document Reference Panel**: Side-by-side view of original document while chatting

## 🏗️ Architecture

### Frontend (React)
- **LegalAnalyzerView.tsx**: Main component orchestrating the UI layout
- **ChatInterface.tsx**: Real-time chat component with message formatting and markdown support
- **Component Structure**: Modular design with sub-components for upload, results, navigation, and stats

### Backend (Cloudflare Worker)
- **Bedrock Integration**: Communicates with AWS Bedrock Nova Lite model
- **API Transformation**: Converts between OpenAI-compatible and Bedrock API formats
- **CORS Support**: Enables cross-origin requests from frontend

### State Management
- React hooks (`useState`, `useRef`, `useEffect`)
- In-memory storage for chat history and analysis results
- File handling via FileReader API

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- AWS Bedrock API credentials
- AWS account with appropriate permissions
- Cloudflare account (for worker deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/legalmind-pro.git
   cd legalmind-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Create a `.env.local` file in the project root:
   ```env
   VITE_ENV_WORKER_URL=https://your-cloudflare-worker-url.com
   ```

4. **Deploy Cloudflare Worker**
   ```bash
   npm run deploy:worker
   ```
   
   Set these environment variables in your Cloudflare Worker settings:
   - `AWS_BEDROCK_API_KEY`: Your AWS Bedrock API key
   - `AWS_REGION`: AWS region (default: us-east-1)

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## 📋 Usage

### Basic Workflow

1. **Upload Document**
   - Click upload area or drag & drop a legal document (PDF, DOCX, TXT)
   - Or paste contract text directly
   - Click "Analyze Now"

2. **Review Analysis**
   - View executive summary
   - Check risk assessment with severity indicators
   - Review identified obligations and key terms
   - See document metadata (jurisdiction, parties, document type)

3. **Chat with AI Assistant**
   - Switch to "AI Assistant" tab
   - Ask specific questions about the document
   - Reference clauses and terms
   - Get clarifications on legal language

### Export Analysis
- Click "Export" button to download analysis as JSON
- Use exported data for external processing or archival

## 🔧 Configuration

### API Models
The application uses AWS Bedrock's Nova Lite model by default:
```javascript
const MODEL_ID = 'amazon.nova-lite-v1:0';
```

To use a different model, update `MODEL_ID` in the worker file.

### Analysis Parameters
Adjust in `LegalAnalyzer.tsx`:
- `max_tokens`: Maximum response length (default: 4000 for analysis, 1500 for chat)
- `temperature`: Response creativity (default: 0.2 for deterministic analysis, 0.3 for chat)

## 📦 Project Structure

```
legalmind-pro/
├── src/
│   ├── components/
│   │   ├── ChatInterface.tsx       # Chat UI component
│   │   ├── LegalAnalyzer.tsx       # Main logic container
│   │   └── LegalAnalyzerView.tsx   # UI layout component
│   ├── utils/
│   │   └── pdfUtils.ts            # PDF extraction utilities
│   └── main.tsx                    # App entry point
├── worker/
│   └── index.js                    # Cloudflare Worker for API proxy
├── .env.local                      # Environment variables
├── vite.config.ts                  # Vite configuration
└── package.json
```

## 🔐 Security Considerations

- **API Keys**: Never commit AWS credentials to version control
- **CORS**: Worker accepts requests from any origin (configure as needed)
- **Data Privacy**: Documents are processed server-side; no persistent storage
- **File Validation**: Implement file size and type restrictions on backend
- **Rate Limiting**: Add rate limiting to Cloudflare Worker for production

## 🛠️ Technical Stack

- **Frontend Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Icons**: Lucide React
- **AI Model**: AWS Bedrock Nova Lite
- **Deployment**: Cloudflare Workers (backend API)
- **PDF Processing**: pdfjs-dist

## 📊 Data Flow

```
User Upload → File Processing → Document Text Extraction
    ↓
AI Analysis (Bedrock) → JSON Parsing → Results Display
    ↓
User Questions → Chat Context Building → AI Response → Display
```

## 🎨 UI Components

- **StatCard**: KPI display with icons and color coding
- **MessageBubble**: Chat message with markdown formatting
- **RiskAssessment**: Risk visualization with severity levels
- **DocumentDetails**: Metadata sidebar
- **LoadingIndicator**: Animated loading state
- **EmptyState**: Placeholder when no messages

## 🐛 Troubleshooting

### Common Issues

**"API Error: 401"**
- Check AWS_BEDROCK_API_KEY is set correctly
- Verify AWS credentials have Bedrock permissions
- Ensure Authorization header format is correct

**"File upload fails"**
- Check file size (max 10MB)
- Verify file format (PDF, DOCX, TXT)
- Check browser console for specific error

**"Chat responses not appearing"**
- Verify document was uploaded first
- Check worker URL is correct in .env
- Review browser network tab for request/response

## 📝 API Reference

### POST /analyze
Endpoint for document analysis via Cloudflare Worker.

**Request:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Analyze this legal document..."
    }
  ],
  "max_tokens": 4000,
  "temperature": 0.2
}
```

**Response:**
```json
{
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "Analysis JSON..."
    }
  }]
}
```

## 🤝 Contributing

Contributions welcome! Please follow these guidelines:
1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## ⚠️ Disclaimer

This tool provides automated legal analysis for informational purposes only. It is not a substitute for professional legal advice. Always consult with qualified legal counsel before making decisions based on document analysis. The AI may make mistakes or miss important legal nuances.

## 🔗 Resources

- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Contact: founder@mizuka.app
---

**Made with ⚖️ for legal professionals and document reviewers**