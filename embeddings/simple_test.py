"""
Simple RAG test without interactive input
"""
import json
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import requests
import subprocess
from typing import List, Dict, Any, Tuple

def test_rag():
    """Test RAG with a sample question"""
    print("Loading Bob's books embeddings...")
    
    # Load chunks and embeddings
    with open('embeddings/chunks.json', 'r', encoding='utf-8') as f:
        chunks = json.load(f)
    
    embeddings = np.load('embeddings/embeddings.npy')
    
    # Load metadata
    with open('embeddings/metadata.json', 'r', encoding='utf-8') as f:
        metadata = json.load(f)
    
    print(f"✅ Loaded {len(chunks)} chunks from {len(metadata['books_processed'])} books")
    print(f"📚 Books: {', '.join(metadata['books_processed'])}")
    print(f"📊 Total words: {metadata['total_words']:,}")
    
    # Test question
    test_question = "What does Bob say about consciousness?"
    print(f"\n🤔 Test question: {test_question}")
    
    try:
        # Get access token
        print("🔑 Getting Google Cloud access token...")
        result = subprocess.run(
            ["gcloud", "auth", "print-access-token"],
            capture_output=True,
            text=True,
            check=True
        )
        access_token = result.stdout.strip()
        print("✅ Access token obtained")
        
        # Get query embedding
        print("🔄 Getting query embedding...")
        url = "https://us-central1-aiplatform.googleapis.com/v1/projects/robert-472917/locations/us-central1/publishers/google/models/textembedding-gecko@003:predict"
        
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        data = {
            "instances": [{"content": test_question}]
        }
        
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        
        result = response.json()
        query_embedding = result["predictions"][0]["embeddings"]["values"]
        print("✅ Query embedding obtained")
        
        # Search for similar chunks
        print("🔍 Searching for similar chunks...")
        similarities = cosine_similarity([query_embedding], embeddings)[0]
        top_indices = np.argsort(similarities)[-5:][::-1]
        
        print("\n" + "="*60)
        print("🔍 SEARCH RESULTS")
        print("="*60)
        
        for i, idx in enumerate(top_indices, 1):
            chunk = chunks[idx]
            similarity = similarities[idx]
            
            print(f"\n{i}. Similarity: {similarity:.3f}")
            print(f"📖 Book: {chunk['book_title']}")
            print(f"📑 Chapter: {chunk['chapter']}")
            print(f"📝 Text: {chunk['text'][:200]}...")
            print(f"📊 Words: {chunk['word_count']}")
            print("-" * 40)
        
        print("\n✅ RAG test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    test_rag()







