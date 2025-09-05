# EloquentAI Frontend

A modern React/Next.js frontend for the EloquentAI chatbot with a clean, intuitive UI inspired by ChatGPT.

## Features

### ✅ **Chat Interface**
- **Clean and intuitive UI** similar to ChatGPT
- **Real-time messaging** with the AI assistant
- **Markdown support** for rich text responses
- **Loading states** and error handling
- **Mobile-responsive** design

### ✅ **Chat History Persistence**
- **Local storage** for conversation persistence
- **Conversation management** (create, load, delete)
- **Search conversations** by title
- **Automatic conversation titles** from first message
- **Message timestamps** and conversation metadata

### ✅ **Backend Integration**
- **RESTful API** connection to FastAPI backend
- **File upload** support for document ingestion
- **RAG-enhanced responses** with source citations
- **Error handling** and status indicators
- **Real-time upload feedback**

### ✅ **UI/UX Features**
- **Sidebar navigation** with conversation list
- **Mobile hamburger menu**
- **Dark/light mode** support (follows system preference)
- **Responsive design** for all screen sizes
- **Smooth animations** and transitions
- **Upload status indicators**

## Technology Stack

- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Markdown**: React Markdown
- **State Management**: React Context + useReducer
- **TypeScript**: Full type safety

## Setup and Installation

### 1. Install Dependencies

```bash
cd web
npm install
```

### 2. Environment Configuration

Copy the environment template:
```bash
cp env-frontend-template.txt .env.local
```

Update `.env.local` with your backend API URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 3. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### 4. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
web/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with metadata
│   │   ├── page.tsx            # Main page with ChatProvider
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   ├── ChatInterface.tsx   # Main chat container
│   │   ├── ChatMessage.tsx     # Individual message component
│   │   ├── ChatInput.tsx       # Message input with file upload
│   │   └── ChatSidebar.tsx     # Conversation history sidebar
│   ├── contexts/
│   │   └── ChatContext.tsx     # Global chat state management
│   ├── services/
│   │   └── api.ts              # Backend API integration
│   └── types/
│       └── chat.ts             # TypeScript type definitions
├── public/                     # Static assets
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## Key Components

### ChatInterface
- Main container component
- Manages overall chat state and API calls
- Handles file uploads and error states
- Responsive layout with sidebar toggle

### ChatMessage
- Renders individual messages (user/assistant)
- Markdown support for rich content
- Source citations for RAG responses
- Message timestamps

### ChatInput
- Text input with auto-resize
- File upload functionality
- Send button with loading states
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)

### ChatSidebar
- Conversation list with search
- New chat creation
- Conversation deletion
- Mobile-responsive with overlay

### ChatContext
- Global state management
- Local storage persistence
- Conversation CRUD operations
- Message history management

## API Integration

The frontend connects to the EloquentAI backend through:

### Chat Endpoints
- `POST /api/chat/message` - Send messages
- `GET /api/chat/conversation/{id}` - Get conversation history
- `DELETE /api/chat/conversation/{id}` - Clear conversations

### Document Endpoints
- `POST /api/documents/upload` - Upload text content
- `POST /api/documents/upload-file` - Upload files
- `GET /api/documents/search` - Search documents

## Features in Detail

### Chat History Persistence
- Conversations stored in browser localStorage
- Automatic titles generated from first message
- Search functionality across all conversations
- Conversation metadata (created/updated timestamps)

### File Upload Support
- Drag-and-drop file uploads
- Support for .txt, .pdf, .doc, .docx, .md files
- Upload progress indicators
- Error handling for failed uploads

### Responsive Design
- Mobile-first approach
- Collapsible sidebar on mobile
- Touch-friendly interface
- Optimized for various screen sizes

### RAG Integration
- Source citations displayed with AI responses
- Knowledge base document references
- Enhanced responses with contextual information

## Development

### Adding New Features

1. **New Components**: Add to `src/components/`
2. **API Endpoints**: Update `src/services/api.ts`
3. **Types**: Add to `src/types/chat.ts`
4. **State Management**: Extend `src/contexts/ChatContext.tsx`

### Styling Guidelines

- Use Tailwind CSS classes
- Follow dark mode conventions with `dark:` prefix
- Maintain consistent spacing and colors
- Use semantic color classes (blue-500, gray-400, etc.)

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

### Other Platforms
- **Netlify**: Connect GitHub repository
- **Railway**: Use included `railway.json`
- **Docker**: Build with `npm run build`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | Yes |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS` | Google Analytics ID | No |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking | No |

## Browser Support

- **Modern browsers** (Chrome, Firefox, Safari, Edge)
- **Mobile browsers** (iOS Safari, Chrome Mobile)
- **JavaScript required** (React application)

## Performance

- **Code splitting** with Next.js automatic optimization
- **Image optimization** with Next.js Image component
- **Bundle analysis** with `npm run build`
- **Lazy loading** for optimal performance

## Contributing

1. Follow TypeScript strict mode
2. Use ESLint configuration
3. Maintain component documentation
4. Test on multiple devices/browsers

---

## Quick Start

```bash
# Clone and setup
git clone your-repo
cd eloquentai/web
npm install

# Environment setup
cp env-frontend-template.txt .env.local
# Edit .env.local with your backend URL

# Start development
npm run dev
```

Your EloquentAI frontend will be running at [http://localhost:3000](http://localhost:3000)!