"""
Offline RAG test using simple text similarity
"""
import json
import numpy as np
from typing import List, Dict, Any, Tuple
import re

def simple_text_similarity(query: str, text: str) -> float:
    """Simple text similarity based on word overlap"""
    query_words = set(re.findall(r'\w+', query.lower()))
    text_words = set(re.findall(r'\w+', text.lower()))
    
    if not query_words or not text_words:
        return 0.0
    
    intersection = query_words.intersection(text_words)
    union = query_words.union(text_words)
    
    return len(intersection) / len(union)

def test_offline_rag():
    """Test RAG with simple text similarity"""
    print("Loading Bob's books embeddings...")
    
    # Load chunks
    with open('embeddings/chunks.json', 'r', encoding='utf-8') as f:
        chunks = json.load(f)
    
    # Load metadata
    with open('embeddings/metadata.json', 'r', encoding='utf-8') as f:
        metadata = json.load(f)
    
    print(f"✅ Loaded {len(chunks)} chunks from {len(metadata['books_processed'])} books")
    print(f"📚 Books: {', '.join(metadata['books_processed'])}")
    print(f"📊 Total words: {metadata['total_words']:,}")
    
    # Test questions
    test_questions = [
        "What does Bob say about consciousness?",
        "What is meditation?",
        "What does Bob say about the mind?",
        "What is awareness?",
        "What does Bob say about suffering?"
    ]
    
    for question in test_questions:
        print(f"\n{'='*60}")
        print(f"🤔 Question: {question}")
        print("="*60)
        
        # Calculate similarities for all chunks
        similarities = []
        for chunk in chunks:
            similarity = simple_text_similarity(question, chunk['text'])
            similarities.append((chunk, similarity))
        
        # Sort by similarity
        similarities.sort(key=lambda x: x[1], reverse=True)
        
        # Show top 3 results
        print("\n🔍 Top 3 Results:")
        for i, (chunk, similarity) in enumerate(similarities[:3], 1):
            print(f"\n{i}. Similarity: {similarity:.3f}")
            print(f"📖 Book: {chunk['book_title']}")
            print(f"📑 Chapter: {chunk['chapter']}")
            print(f"📝 Text: {chunk['text'][:150]}...")
            print(f"📊 Words: {chunk['word_count']}")
            print("-" * 40)
    
    print("\n✅ Offline RAG test completed!")
    print("\n💡 This demonstrates how RAG works:")
    print("1. Question is processed")
    print("2. Similar chunks are found")
    print("3. Most relevant passages are returned")
    print("4. These can be used to generate grounded answers")

if __name__ == "__main__":
    test_offline_rag()







