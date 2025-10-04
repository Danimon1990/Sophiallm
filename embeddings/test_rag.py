"""
Local RAG testing with Bob's books embeddings
"""
import json
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import requests
import subprocess
from typing import List, Dict, Any, Tuple

class LocalRAG:
    def __init__(self):
        """Initialize the local RAG system"""
        print("Loading Bob's books embeddings...")
        
        # Load chunks and embeddings
        with open('embeddings/chunks.json', 'r', encoding='utf-8') as f:
            self.chunks = json.load(f)
        
        self.embeddings = np.load('embeddings/embeddings.npy')
        
        # Load metadata
        with open('embeddings/metadata.json', 'r', encoding='utf-8') as f:
            self.metadata = json.load(f)
        
        print(f"Loaded {len(self.chunks)} chunks from {len(self.metadata['books_processed'])} books")
        print(f"Books: {', '.join(self.metadata['books_processed'])}")
        print(f"Total words: {self.metadata['total_words']:,}")
    
    def get_query_embedding(self, query: str) -> List[float]:
        """Get embedding for a query using Vertex AI"""
        try:
            # Get access token
            result = subprocess.run(
                ["gcloud", "auth", "print-access-token"],
                capture_output=True,
                text=True,
                check=True
            )
            access_token = result.stdout.strip()
            
            # Prepare the request
            url = "https://us-central1-aiplatform.googleapis.com/v1/projects/robert-472917/locations/us-central1/publishers/google/models/textembedding-gecko@003:predict"
            
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            
            data = {
                "instances": [{"content": query}]
            }
            
            # Make the request
            response = requests.post(url, headers=headers, json=data)
            response.raise_for_status()
            
            # Extract embedding
            result = response.json()
            embedding = result["predictions"][0]["embeddings"]["values"]
            
            return embedding
            
        except Exception as e:
            print(f"Error getting query embedding: {e}")
            return None
    
    def search_similar_chunks(self, query_embedding: List[float], top_k: int = 5) -> List[Tuple[Dict[str, Any], float]]:
        """Find most similar chunks to the query"""
        if query_embedding is None:
            return []
        
        # Calculate similarities
        similarities = cosine_similarity([query_embedding], self.embeddings)[0]
        
        # Get top k most similar chunks
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        
        results = []
        for idx in top_indices:
            chunk = self.chunks[idx]
            similarity = similarities[idx]
            results.append((chunk, similarity))
        
        return results
    
    def format_results(self, results: List[Tuple[Dict[str, Any], float]]) -> str:
        """Format search results for display"""
        if not results:
            return "No results found."
        
        formatted = "🔍 **Search Results:**\n\n"
        
        for i, (chunk, similarity) in enumerate(results, 1):
            formatted += f"**{i}. Similarity: {similarity:.3f}**\n"
            formatted += f"📖 **Book:** {chunk['book_title']}\n"
            formatted += f"📑 **Chapter:** {chunk['chapter']}\n"
            formatted += f"📝 **Text:** {chunk['text'][:200]}...\n"
            formatted += f"📊 **Words:** {chunk['word_count']}\n\n"
        
        return formatted
    
    def ask_question(self, question: str, top_k: int = 5) -> str:
        """Ask a question and get relevant chunks from Bob's books"""
        print(f"\n🤔 Question: {question}")
        print("🔄 Getting query embedding...")
        
        # Get query embedding
        query_embedding = self.get_query_embedding(question)
        
        if query_embedding is None:
            return "❌ Error: Could not get query embedding. Please check your Google Cloud authentication."
        
        print("🔍 Searching for similar chunks...")
        
        # Search for similar chunks
        results = self.search_similar_chunks(query_embedding, top_k)
        
        if not results:
            return "❌ No relevant chunks found."
        
        # Format and return results
        return self.format_results(results)
    
    def interactive_chat(self):
        """Start an interactive chat session"""
        print("\n" + "="*60)
        print("🧠 BOB'S BOOKS - LOCAL RAG CHAT")
        print("="*60)
        print("Ask questions about Bob's philosophy, consciousness, meditation, etc.")
        print("Type 'quit' to exit, 'help' for commands")
        print("="*60)
        
        while True:
            try:
                question = input("\n💭 Your question: ").strip()
                
                if question.lower() in ['quit', 'exit', 'q']:
                    print("👋 Goodbye!")
                    break
                
                if question.lower() == 'help':
                    print("\n📚 Available commands:")
                    print("  - Ask any question about Bob's books")
                    print("  - 'quit' or 'exit' to leave")
                    print("  - 'help' to see this message")
                    continue
                
                if not question:
                    continue
                
                # Get answer
                answer = self.ask_question(question)
                print(f"\n{answer}")
                
            except KeyboardInterrupt:
                print("\n👋 Goodbye!")
                break
            except Exception as e:
                print(f"❌ Error: {e}")

def main():
    """Main function to test RAG"""
    try:
        # Initialize RAG system
        rag = LocalRAG()
        
        # Test with a sample question
        print("\n🧪 Testing with sample question...")
        sample_question = "What does Bob say about consciousness?"
        answer = rag.ask_question(sample_question)
        print(f"\n{answer}")
        
        # Start interactive chat
        rag.interactive_chat()
        
    except Exception as e:
        print(f"❌ Error initializing RAG system: {e}")
        print("Make sure you have:")
        print("1. embeddings/chunks.json")
        print("2. embeddings/embeddings.npy") 
        print("3. embeddings/metadata.json")
        print("4. Google Cloud authentication set up")

if __name__ == "__main__":
    main()







