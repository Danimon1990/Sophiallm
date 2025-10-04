# Deployment Guide for SophiaLLM

This guide walks you through deploying the SophiaLLM application to Google Cloud Platform.

## Prerequisites

1. **Google Cloud SDK (gcloud)**
   ```bash
   # Install gcloud CLI
   # https://cloud.google.com/sdk/docs/install

   # After installation, initialize
   gcloud init
   ```

2. **Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

3. **Environment Setup**
   - GCP Project ID: `sophiallm-474120`
   - Firebase Project: `sophiallm`
   - OpenAI API Key (required for backend)

## Architecture

- **Frontend**: Firebase Hosting (React app)
- **Backend**: Cloud Run (Flask API)
- **Authentication**: Firebase Auth
- **Secrets**: Google Secret Manager
- **Data**: Embedded in container

## Deployment Steps

### 1. Set up OpenAI API Key in Secret Manager

First, store your OpenAI API key securely:

```bash
# Set your project
gcloud config set project sophiallm-474120

# Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com

# Create the secret
echo -n "your-openai-api-key-here" | gcloud secrets create OPENAI_API_KEY \
    --data-file=- \
    --replication-policy="automatic"

# Grant Cloud Run access to the secret
PROJECT_NUMBER=$(gcloud projects describe sophiallm-474120 --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding OPENAI_API_KEY \
    --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

### 2. Deploy Backend to Cloud Run

```bash
# Make the script executable
chmod +x deploy-backend.sh

# Run the deployment
./deploy-backend.sh
```

This will:
- Build a Docker container with your Flask API
- Push it to Google Container Registry
- Deploy to Cloud Run
- Return a public URL for your backend

Expected output:
```
✅ Deployment complete!
🌐 Backend URL: https://sophiallm-backend-xxxxx-uc.a.run.app
```

### 3. Update Frontend Configuration

Update the backend URL in your frontend code:

```javascript
// src/components/ChatInterface.js
// Update the fetch URL to your Cloud Run backend URL
const response = await fetch('https://YOUR-BACKEND-URL/api/chat', {
  // ...
});
```

### 4. Deploy Frontend to Firebase Hosting

```bash
# Make the script executable
chmod +x deploy-frontend.sh

# Run the deployment
./deploy-frontend.sh
```

This will:
- Build your React app for production
- Deploy to Firebase Hosting
- Return your public URL

Expected output:
```
✅ Deployment complete!
🌐 Frontend URL: https://sophiallm.web.app
```

## Testing Your Deployment

1. **Test Backend Health**
   ```bash
   curl https://YOUR-BACKEND-URL/api/health
   ```

2. **Test Authentication**
   - Go to your frontend URL
   - Try signing up with a test account
   - Verify Firebase Auth in console

3. **Test Chat Functionality**
   - Ask a question in the chat interface
   - Check Cloud Run logs for any errors:
     ```bash
     gcloud run logs read sophiallm-backend --region us-central1
     ```

## Updating the Backend URL in Frontend

After deploying the backend, update the frontend:

1. Open `src/components/ChatInterface.js`
2. Replace `http://localhost:5001` with your Cloud Run URL
3. Rebuild and redeploy frontend:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

## Environment Variables

### Backend (Cloud Run)
- `PORT`: Automatically set by Cloud Run (8080)
- `FLASK_ENV`: Set to "production"
- `OPENAI_API_KEY`: From Secret Manager

### Frontend (Firebase)
- Firebase config is in `src/firebase.js`
- No additional env vars needed

## Costs Estimation

With your free credits:

- **Cloud Run**: Free tier includes 2 million requests/month
- **Firebase Hosting**: Free tier includes 10GB storage, 360MB/day transfer
- **Firebase Auth**: Free tier includes 10K phone verifications/month
- **Secret Manager**: First 6 secret versions free

Ongoing costs (after free tier):
- OpenAI API: Pay per token used (~$0.002 per 1K tokens for GPT-4o-mini)
- Cloud Run: ~$0.00002400 per request (after free tier)

## Monitoring

### View Logs

**Backend logs:**
```bash
gcloud run logs read sophiallm-backend --region us-central1 --limit 50
```

**Frontend logs:**
Check Firebase Console → Hosting → Usage

### Metrics

**Cloud Run metrics:**
```bash
# Open in browser
gcloud run services describe sophiallm-backend --region us-central1
```

## Rollback

If you need to rollback:

**Backend:**
```bash
gcloud run services update-traffic sophiallm-backend \
  --to-revisions=PREVIOUS_REVISION=100 \
  --region us-central1
```

**Frontend:**
```bash
firebase hosting:rollback
```

## Troubleshooting

### Backend won't start
- Check logs: `gcloud run logs read sophiallm-backend --region us-central1`
- Verify OpenAI API key is set correctly
- Check that embeddings data is included in the container

### Frontend can't connect to backend
- Verify CORS is enabled in Flask (`Flask-CORS`)
- Check that Cloud Run service allows unauthenticated requests
- Verify the backend URL in ChatInterface.js is correct

### Out of questions not working
- Check localStorage is working in browser
- Verify Firebase Auth is enabled for Email/Password
- Check browser console for errors

## Security Notes

1. **API Keys**: Never commit API keys to git
2. **CORS**: Currently allows all origins - restrict in production
3. **Rate Limiting**: Consider adding rate limiting to prevent abuse
4. **Secret Rotation**: Rotate OpenAI API key periodically

## Support

For issues:
1. Check logs first
2. Verify all APIs are enabled in GCP Console
3. Ensure billing is enabled on GCP project
4. Check Firebase Console for auth issues
