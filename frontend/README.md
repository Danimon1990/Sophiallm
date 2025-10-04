# Bob's Books RAG - Interactive Chat Interface

A React frontend for interacting with Bob's books through an AI-powered chat interface. This application allows users to ask questions about the concepts from Bob's three books and get intelligent responses based on the content.

## Books Available
- **Signals in the Noise**
- **Unified Mind Interior for print** 
- **The Embodied Mind interior for print**

## Features
- 🤖 AI-powered chat interface
- 📚 Access to all three books' content
- 🔍 Intelligent search and retrieval
- 📖 Source citations for answers
- 💬 Real-time conversation flow
- 📱 Responsive design

## Quick Start

### 1. Install Dependencies

```bash
# Install React dependencies
npm install

# Install Python API dependencies
pip install -r requirements.txt
```

### 2. Start the Backend API Server

```bash
# From the frontend directory
python api_server.py
```

The API server will start on `http://localhost:5000`

### 3. Start the React Frontend

```bash
# In a new terminal, from the frontend directory
npm start
```

The React app will start on `http://localhost:3000`

### 4. Test the Application

1. Open your browser to `http://localhost:3000`
2. You should see the chat interface
3. Try asking questions like:
   - "What is consciousness according to Bob?"
   - "How does the embodied mind work?"
   - "What are signals in the noise?"
   - "Explain the unified mind concept"

## How It Works

1. **User asks a question** in the React chat interface
2. **Question is sent** to the Flask API server (`/api/chat`)
3. **API searches** through the processed book chunks using text similarity
4. **Relevant passages** are retrieved and used to generate an answer
5. **Answer and sources** are returned to the React frontend
6. **User sees** the response with source citations

## API Endpoints

- `POST /api/chat` - Send a question and get an AI response
- `GET /api/books` - Get information about available books
- `GET /api/health` - Check if the system is running properly

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ChatInterface.js    # Main chat component
│   │   └── Header.js           # App header with book info
│   ├── App.js                  # Main app component
│   ├── index.js               # React entry point
│   └── index.css              # Tailwind CSS styles
├── public/
│   └── index.html             # HTML template
├── api_server.py              # Flask backend API
├── requirements.txt           # Python dependencies
├── package.json              # Node.js dependencies
└── README.md                 # This file
```

## Troubleshooting

### Backend Issues
- Make sure the embeddings directory exists: `../embeddings/embeddings/`
- Check that `chunks.json` and `metadata.json` are present
- Verify Python dependencies are installed: `pip install -r requirements.txt`

### Frontend Issues
- Ensure Node.js dependencies are installed: `npm install`
- Check that the API server is running on port 5000
- Verify CORS is enabled in the Flask app

### Connection Issues
- Make sure both servers are running simultaneously
- Check browser console for any error messages
- Verify the API endpoint is accessible: `http://localhost:5000/api/health`

## Development

### Adding New Features
- **Chat Interface**: Modify `src/components/ChatInterface.js`
- **Styling**: Update `src/index.css` with Tailwind classes
- **API Logic**: Enhance `api_server.py` with better answer generation
- **Backend Integration**: Connect to more sophisticated LLM models

### Enhancing the RAG System
- Replace simple text similarity with vector embeddings
- Integrate with OpenAI GPT or other LLM APIs
- Add conversation memory/history
- Implement better source ranking

## Next Steps

1. **Integrate with a real LLM** (OpenAI, Anthropic, etc.) for better answer generation
2. **Add conversation history** to maintain context
3. **Implement vector search** for better semantic similarity
4. **Add user authentication** for personalized experiences
5. **Create book-specific filters** to search within specific books

---

**Built with ❤️ for exploring Bob's philosophical insights**



