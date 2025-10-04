"""
Simple Flask API server to connect React frontend to the RAG system
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import numpy as np
from typing import List, Dict, Any, Tuple
import re
import os
import sys
from openai import OpenAI

# Add the embeddings directory to the path
sys.path.append('../embeddings')

# Initialize OpenAI client
# Set your API key as an environment variable: export OPENAI_API_KEY='your-key-here'
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Load the RAG system
def load_rag_system():
    """Load the chunks and embeddings"""
    try:
        # Try multiple possible paths for flexibility
        possible_paths = [
            ('./embeddings/chunks.json', './embeddings/metadata.json'),  # Production
            ('../embeddings/embeddings/chunks.json', '../embeddings/embeddings/metadata.json'),  # Local dev
        ]

        chunks = None
        metadata = None

        for chunks_path, metadata_path in possible_paths:
            try:
                with open(chunks_path, 'r', encoding='utf-8') as f:
                    chunks = json.load(f)

                with open(metadata_path, 'r', encoding='utf-8') as f:
                    metadata = json.load(f)

                print(f"✅ Loaded {len(chunks)} chunks from {len(metadata['books_processed'])} books")
                print(f"📂 Using data from: {chunks_path}")
                return chunks, metadata
            except FileNotFoundError:
                continue

        raise FileNotFoundError("Could not find embeddings data in any expected location")

    except Exception as e:
        print(f"❌ Error loading RAG system: {e}")
        import traceback
        traceback.print_exc()
        return None, None

def simple_text_similarity(query: str, text: str) -> float:
    """Simple text similarity based on word overlap"""
    query_words = set(re.findall(r'\w+', query.lower()))
    text_words = set(re.findall(r'\w+', text.lower()))
    
    if not query_words or not text_words:
        return 0.0
    
    intersection = query_words.intersection(text_words)
    union = query_words.union(text_words)
    
    return len(intersection) / len(union)

def is_quality_chunk(chunk: Dict) -> bool:
    """Filter out low-quality chunks like table of contents, headers, page numbers, author bios"""
    text = chunk['text'].strip()

    # Skip very short chunks
    if len(text) < 80:
        return False

    # Skip chunks that are mostly dots (table of contents)
    dot_count = text.count('.')
    if dot_count > len(text) * 0.3:  # More than 30% dots
        return False

    # Skip chunks that are mostly numbers and page references
    numbers_pattern = r'\d+'
    numbers = re.findall(numbers_pattern, text)
    if len(numbers) > len(text.split()) * 0.5:  # More than 50% numbers
        return False

    # Skip author bios and academic credentials
    author_bio_patterns = [
        r'professor of.*at.*university',
        r'editor-in-chief',
        r'he lives in',
        r'she lives in',
        r'phd.*university',
        r'author of.*books?',
        r'co-director of',
        r'director of.*centre',
        r'visiting professor',
    ]
    text_lower = text.lower()
    for pattern in author_bio_patterns:
        if re.search(pattern, text_lower):
            return False

    # Skip table of contents patterns
    toc_patterns = [
        r'\.{3,}',  # Multiple dots
        r'\d+\s*$',  # Ending with just numbers (page numbers)
        r'^[A-Z\s]+\d+$',  # All caps with numbers at end
        r'chapter\s+\d+[:\s]*$',  # Just chapter headers
        r'page\s+\d+',  # Page references
    ]
    for pattern in toc_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return False

    # Skip incomplete fragments (sentences that don't end properly)
    if text.endswith(('of', 'the', 'and', 'or', 'in', 'at', 'to', 'for', 'with', 'by')):
        return False

    # Skip chunks that are mostly incomplete sentences
    sentences = re.split(r'[.!?]+', text)
    complete_sentences = [s.strip() for s in sentences if len(s.strip()) > 20 and s.strip()[0].isupper()]
    if len(complete_sentences) < 2:
        return False

    # Prefer chunks with more substantial content
    word_count = len(text.split())
    return word_count >= 30

def search_books(question: str, chunks: List[Dict], top_k: int = 3) -> List[Tuple[Dict, float]]:
    """Search Bob's books for relevant passages"""
    # First filter for quality chunks
    quality_chunks = [chunk for chunk in chunks if is_quality_chunk(chunk)]

    similarities = []
    for chunk in quality_chunks:
        similarity = simple_text_similarity(question, chunk['text'])
        # Boost similarity for longer, more substantial chunks
        word_count_boost = min(chunk.get('word_count', 0) / 100, 0.3)
        adjusted_similarity = similarity + word_count_boost
        similarities.append((chunk, adjusted_similarity))

    # Sort by similarity and return top results
    similarities.sort(key=lambda x: x[1], reverse=True)
    return similarities[:top_k]

def generate_answer(question: str, relevant_chunks: List[Tuple[Dict, float]]) -> str:
    """Generate a wise, conversational answer using GPT-4 based on relevant chunks"""
    if not relevant_chunks or relevant_chunks[0][1] == 0:
        return "I don't see that particular thread woven through my writings, friend. Perhaps ask about consciousness, the embodied mind, spiritual practices, or how we might live more unified lives. These are the paths I've spent my years exploring."

    # Extract and clean the text from relevant chunks
    context_pieces = []
    for chunk, similarity in relevant_chunks:
        if similarity > 0.1:
            text = chunk['text']
            # Clean up the text
            text = text.replace('Robert De Filippis', '').replace('\n', ' ').strip()
            text = ' '.join(text.split())  # Normalize whitespace

            # Fix common OCR/PDF extraction issues
            text = text.replace(' - ', ' ').replace('  ', ' ')
            text = text.replace('fo und', 'found').replace('ze ro', 'zero')
            text = text.replace('signific ant', 'significant')

            if len(text) > 50:
                context_pieces.append({
                    'text': text,
                    'book': chunk.get('book_title', 'Unknown'),
                    'chapter': chunk.get('chapter', 'Unknown')
                })

    if not context_pieces:
        return "That's a profound question, though I'm not finding the right words in my writings to address it properly. Try asking about consciousness, spiritual practices, or the unified mind - these are closer to my heart."

    # Build context for the LLM
    context = "\n\n".join([
        f"From '{piece['book']}' (Chapter: {piece['chapter']}):\n{piece['text']}"
        for piece in context_pieces[:3]  # Use top 3 chunks
    ])

    # Create the prompt for GPT-4
    system_prompt = """You are Sophia, a wise and deeply thoughtful AI companion created to help integrate the profound philosophical concepts from Robert De Filippis's books into people's lives. You are intelligent, compassionate, and always available to explore deeper philosophical territory.

Your personality:
- You are warm, patient, and genuinely curious about the user's philosophical journey
- You speak with wisdom and clarity, making complex concepts accessible without oversimplifying
- You're encouraging and supportive, helping users discover insights for themselves
- You have a gentle, thoughtful presence - like a wise friend who's always there to explore ideas
- You're enthusiastic about going deeper into philosophical concepts related to Robert's work
- You balance accessibility with intellectual depth

When answering questions, you:
- Draw from Robert De Filippis's writings (provided as context) to ground your responses
- Synthesize ideas coherently and speak naturally, not just quoting passages
- Help users connect these concepts to their own lives and experiences
- Ask thought-provoking follow-up questions when appropriate
- Acknowledge the complexity and nuance of consciousness, embodiment, and unified thinking
- Are comfortable saying "this is a deep question" or "Robert explores this from multiple angles"
- End with insights that invite further reflection or exploration

You are Sophia - Robert's AI companion for philosophical exploration. Answer thoughtfully based on the excerpts from his books."""

    user_prompt = f"""Question: {question}

Relevant excerpts from my books:

{context}

Please answer this question as Bob De Filippis, synthesizing the insights from these excerpts into a coherent, thoughtful response."""

    try:
        # Call GPT-4 to generate the answer
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Using gpt-4o-mini for cost-effectiveness, can upgrade to "gpt-4" or "gpt-4-turbo"
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )

        answer = response.choices[0].message.content
        return answer

    except Exception as e:
        print(f"❌ Error calling OpenAI API: {e}")
        import traceback
        traceback.print_exc()
        # Fallback to simple template-based response
        return f"I apologize, but I'm having trouble formulating a response right now. The question about {question} touches on important themes in my work. Please try again shortly."

# Load RAG system on startup
chunks, metadata = load_rag_system()

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat requests"""
    try:
        data = request.get_json()
        question = data.get('question', '')
        
        if not question:
            return jsonify({'error': 'No question provided'}), 400
        
        if not chunks:
            return jsonify({'error': 'RAG system not loaded'}), 500
        
        # Search for relevant chunks
        relevant_chunks = search_books(question, chunks, top_k=3)
        
        # Generate answer in conversational style
        answer = generate_answer(question, relevant_chunks)

        return jsonify({
            'answer': answer,
            'question': question
        })
        
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/books', methods=['GET'])
def get_books():
    """Get information about available books"""
    if not metadata:
        return jsonify({'error': 'Metadata not loaded'}), 500
    
    return jsonify({
        'books': metadata['books_processed'],
        'total_chunks': metadata['total_chunks'],
        'total_words': metadata['total_words']
    })

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'chunks_loaded': len(chunks) if chunks else 0,
        'metadata_loaded': metadata is not None
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print("🚀 Starting Bob's Books RAG API Server")
    print("📚 Books available:", metadata['books_processed'] if metadata else "None loaded")
    print(f"🌐 Server will be available at: http://localhost:{port}")
    print(f"🔗 React frontend should connect to: http://localhost:{port}/api/chat")
    app.run(debug=os.environ.get('FLASK_ENV') != 'production', host='0.0.0.0', port=port)



