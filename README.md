# SophiaLLM - AI Book Chat Application

An intelligent chat application that allows users to interact with the philosophical concepts from Robert De Filippis's books using AI-powered RAG (Retrieval-Augmented Generation) technology.

![SophiaLLM](https://img.shields.io/badge/AI-Powered-blue)
![Firebase](https://img.shields.io/badge/Firebase-Auth-orange)
![React](https://img.shields.io/badge/React-18-blue)
![Python](https://img.shields.io/badge/Python-3.11-green)

## 🌟 Features

- **🔐 Firebase Authentication**: Secure email/password authentication
- **💬 AI-Powered Chat**: Ask questions about Robert's philosophical concepts
- **📊 Question Tracking**: 3 free questions per user
- **🎟️ Book Access Codes**: Redeem codes to unlock unlimited access
- **📚 Multi-Book Support**: Integrated knowledge from multiple books
- **🚀 Cloud-Ready**: Deployment scripts for Google Cloud Platform

## 🏗️ Architecture

### Frontend
- **Framework**: React 18
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Hosting
- **State Management**: React Hooks

### Backend
- **Framework**: Flask (Python)
- **AI Model**: OpenAI GPT-4o-mini
- **RAG System**: Custom text similarity + embeddings
- **Hosting**: Google Cloud Run
- **API Server**: Gunicorn

### Data
- **Books Processed**:
  - Signals in the Noise
  - Unified Mind
  - The Embodied Mind
- **Storage**: Embedded JSON chunks and metadata

## 📋 Prerequisites

- Node.js 16+ and npm
- Python 3.11+
- Google Cloud SDK (`gcloud`)
- Firebase CLI
- OpenAI API Key

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/Danimon1990/Sophiallm.git
   cd Sophiallm
   ```

2. **Set up Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```
   Frontend runs at `http://localhost:3000`

3. **Set up Backend**
   ```bash
   # In a new terminal
   cd frontend
   pip install -r requirements.txt
   export OPENAI_API_KEY='your-key-here'
   python api_server.py
   ```
   Backend runs at `http://localhost:5001`

4. **Configure Firebase**
   - Enable Email/Password authentication in Firebase Console
   - Update `src/firebase.js` with your config (already configured for sophiallm project)

## 🌐 Deployment to GCP

Full deployment instructions are in [`frontend/DEPLOYMENT.md`](frontend/DEPLOYMENT.md)

### Quick Deploy

1. **Deploy Backend to Cloud Run**
   ```bash
   cd frontend
   ./deploy-backend.sh
   ```

2. **Update Frontend with Backend URL**
   Update `src/components/ChatInterface.js` with your Cloud Run URL

3. **Deploy Frontend to Firebase**
   ```bash
   ./deploy-frontend.sh
   ```

## 🔑 Environment Variables

### Backend
- `OPENAI_API_KEY`: Your OpenAI API key (stored in GCP Secret Manager)
- `PORT`: Server port (default: 5001 for local, 8080 for Cloud Run)
- `FLASK_ENV`: Environment (development/production)

### Frontend
- Firebase config in `src/firebase.js`

## 📚 Book Access Codes

Demo codes for testing (replace with real codes in production):
- `SIGNALS2024` - Signals in the Noise
- `UNIFIED2024` - Unified Mind
- `EMBODIED2024` - The Embodied Mind

## 🗂️ Project Structure

```
.
├── embeddings/              # RAG system and book processing
│   ├── book_processor.py    # Process books into chunks
│   ├── embeddings/          # Generated embeddings data
│   └── requirements.txt     # Python dependencies
│
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── firebase.js      # Firebase config
│   │   └── App.js          # Main app
│   ├── public/             # Static files
│   ├── api_server.py       # Flask backend
│   ├── Dockerfile          # Container config
│   ├── deploy-backend.sh   # Backend deployment script
│   ├── deploy-frontend.sh  # Frontend deployment script
│   └── DEPLOYMENT.md       # Detailed deployment guide
│
└── README.md               # This file
```

## 🧪 Testing

### Test Authentication
1. Go to signup page
2. Create a test account
3. Login with credentials
4. Verify 3 free questions are available

### Test Chat
1. Ask a philosophical question
2. Verify AI responds with relevant content
3. Check question counter decrements

### Test Code Redemption
1. Enter a book code (e.g., `SIGNALS2024`)
2. Verify unlimited access is granted
3. Check question counter shows "Unlimited"

## 🔒 Security

- API keys stored in GCP Secret Manager
- Firebase Authentication for user management
- CORS configured for frontend domain
- Environment variables never committed to git

## 💰 Cost Estimation

### GCP Free Tier Includes:
- Cloud Run: 2M requests/month
- Firebase Hosting: 10GB storage + 360MB/day
- Firebase Auth: 10K verifications/month

### Ongoing Costs:
- OpenAI API: ~$0.002 per 1K tokens (GPT-4o-mini)
- Cloud Run: ~$0.00002400 per request (after free tier)

## 🛠️ Technologies Used

- **Frontend**: React, Tailwind CSS, Firebase Auth, React Router
- **Backend**: Flask, OpenAI API, NumPy
- **Deployment**: Google Cloud Run, Firebase Hosting
- **AI**: GPT-4o-mini, Custom RAG system
- **Icons**: Heroicons

## 📝 License

This project is private and proprietary.

## 👥 Contributing

This is a private project. For access or contributions, contact the repository owner.

## 📧 Support

For issues or questions, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for exploring Robert De Filippis's philosophical teachings**

🤖 Generated with [Claude Code](https://claude.com/claude-code)
