"""
Interactive RAG - Ask questions about Bob's books
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

def search_books(question: str, chunks: List[Dict], top_k: int = 5) -> List[Tuple[Dict, float]]:
    """Search Bob's books for relevant passages"""
    similarities = []
    for chunk in chunks:
        similarity = simple_text_similarity(question, chunk['text'])
        similarities.append((chunk, similarity))
    
    # Sort by similarity and return top results
    similarities.sort(key=lambda x: x[1], reverse=True)
    return similarities[:top_k]

def main():
    """Interactive RAG interface"""
    print("📚 Welcome to Bob's Books RAG System")
    print("=" * 50)
    
    # Load data
    print("Loading Bob's books...")
    with open('embeddings/chunks.json', 'r', encoding='utf-8') as f:
        chunks = json.load(f)
    
    with open('embeddings/metadata.json', 'r', encoding='utf-8') as f:
        metadata = json.load(f)
    
    print(f"✅ Loaded {len(chunks)} chunks from {len(metadata['books_processed'])} books")
    print(f"📚 Books: {', '.join(metadata['books_processed'])}")
    print(f"📊 Total words: {metadata['total_words']:,}")
    
    print("\n" + "=" * 50)
    print("💡 Ask any question about Bob's books!")
    print("💡 Type 'quit' to exit")
    print("=" * 50)
    
    while True:
        try:
            question = input("\n🤔 Your question: ").strip()
            
            if question.lower() in ['quit', 'exit', 'q']:
                print("👋 Goodbye!")
                break
            
            if not question:
                print("❓ Please enter a question")
                continue
            
            print(f"\n🔍 Searching for: '{question}'")
            print("-" * 50)
            
            # Search and display results
            results = search_books(question, chunks, top_k=3)
            
            if not results or results[0][1] == 0:
                print("❌ No relevant passages found. Try rephrasing your question.")
                continue
            
            print(f"📋 Found {len(results)} relevant passages:")
            
            for i, (chunk, similarity) in enumerate(results, 1):
                print(f"\n{i}. Similarity: {similarity:.3f}")
                print(f"📖 Book: {chunk['book_title']}")
                print(f"📑 Chapter: {chunk['chapter']}")
                print(f"📝 Text: {chunk['text'][:200]}...")
                print(f"📊 Words: {chunk['word_count']}")
                print("-" * 30)
            
        except KeyboardInterrupt:
            print("\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()







