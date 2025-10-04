"""
Main script to process books and generate embeddings
"""
import os
import json
import argparse
from typing import List, Dict, Any
from pathlib import Path
import pandas as pd

from config import BOOKS_DIR, EMBEDDINGS_DIR, VECTOR_DB_DIR, SUPPORTED_FORMATS
from text_processor import TextProcessor
from vertex_embeddings import VertexEmbeddings

class BookProcessor:
    def __init__(self):
        self.text_processor = TextProcessor()
        self.vertex_embeddings = VertexEmbeddings()
        
        # Create directories if they don't exist
        os.makedirs(BOOKS_DIR, exist_ok=True)
        os.makedirs(EMBEDDINGS_DIR, exist_ok=True)
        os.makedirs(VECTOR_DB_DIR, exist_ok=True)
    
    def find_book_files(self) -> List[str]:
        """Find all book files in the books directory"""
        book_files = []
        books_path = Path(BOOKS_DIR)
        
        for file_path in books_path.rglob("*"):
            if file_path.is_file() and file_path.suffix.lower() in SUPPORTED_FORMATS:
                book_files.append(str(file_path))
        
        return book_files
    
    def process_books(self, book_files: List[str] = None) -> List[Dict[str, Any]]:
        """
        Process all books and generate chunks
        
        Args:
            book_files: Optional list of specific book files to process
            
        Returns:
            List of all chunks from all books
        """
        if book_files is None:
            book_files = self.find_book_files()
        
        if not book_files:
            print(f"No book files found in {BOOKS_DIR}")
            print(f"Supported formats: {SUPPORTED_FORMATS}")
            return []
        
        print(f"Found {len(book_files)} book files:")
        for file_path in book_files:
            print(f"  - {file_path}")
        
        all_chunks = []
        
        for file_path in book_files:
            print(f"\nProcessing: {file_path}")
            try:
                chunks = self.text_processor.process_book_file(file_path)
                chunks = self.text_processor.validate_chunks(chunks)
                
                print(f"  Generated {len(chunks)} chunks")
                all_chunks.extend(chunks)
                
            except Exception as e:
                print(f"  Error processing {file_path}: {e}")
                continue
        
        print(f"\nTotal chunks generated: {len(all_chunks)}")
        return all_chunks
    
    def generate_embeddings(self, chunks: List[Dict[str, Any]], 
                          batch_size: int = 5) -> List[List[float]]:
        """
        Generate embeddings for all chunks
        
        Args:
            chunks: List of chunk dictionaries
            batch_size: Batch size for embedding generation
            
        Returns:
            List of embedding vectors
        """
        print(f"\nGenerating embeddings for {len(chunks)} chunks...")
        
        # Extract texts for embedding
        texts = [chunk['text'] for chunk in chunks]
        
        # Generate embeddings
        embeddings = self.vertex_embeddings.generate_embeddings(texts, batch_size)
        
        print(f"Generated {len(embeddings)} embeddings")
        return embeddings
    
    def save_chunks_and_embeddings(self, chunks: List[Dict[str, Any]], 
                                 embeddings: List[List[float]]):
        """
        Save chunks and embeddings to files
        
        Args:
            chunks: List of chunk dictionaries
            embeddings: List of embedding vectors
        """
        print(f"\nSaving chunks and embeddings...")
        
        # Save chunks as JSON
        chunks_file = os.path.join(EMBEDDINGS_DIR, "chunks.json")
        with open(chunks_file, 'w', encoding='utf-8') as f:
            json.dump(chunks, f, indent=2, ensure_ascii=False)
        
        # Save embeddings as numpy array (for efficient loading)
        import numpy as np
        embeddings_array = np.array(embeddings)
        embeddings_file = os.path.join(EMBEDDINGS_DIR, "embeddings.npy")
        np.save(embeddings_file, embeddings_array)
        
        # Save metadata
        metadata = {
            "total_chunks": len(chunks),
            "embedding_dimensions": len(embeddings[0]) if embeddings else 0,
            "books_processed": list(set(chunk['book_title'] for chunk in chunks)),
            "total_words": sum(chunk['word_count'] for chunk in chunks)
        }
        
        metadata_file = os.path.join(EMBEDDINGS_DIR, "metadata.json")
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"Saved to:")
        print(f"  - Chunks: {chunks_file}")
        print(f"  - Embeddings: {embeddings_file}")
        print(f"  - Metadata: {metadata_file}")
    
    def create_vector_index(self, chunks: List[Dict[str, Any]], 
                          embeddings: List[List[float]]) -> tuple[str, str]:
        """
        Create and deploy vector index
        
        Args:
            chunks: List of chunk dictionaries
            embeddings: List of embedding vectors
            
        Returns:
            Tuple of (index_id, endpoint_id)
        """
        print(f"\nCreating vector index...")
        
        # Create index
        index_id = self.vertex_embeddings.create_vector_index()
        
        # Create endpoint
        endpoint_id = self.vertex_embeddings.create_index_endpoint()
        
        # Deploy index to endpoint
        self.vertex_embeddings.deploy_index_to_endpoint(index_id, endpoint_id)
        
        # Upsert embeddings
        self.vertex_embeddings.upsert_embeddings(index_id, chunks, embeddings)
        
        # Save index configuration
        config = {
            "index_id": index_id,
            "endpoint_id": endpoint_id,
            "dimensions": len(embeddings[0]) if embeddings else 0,
            "total_datapoints": len(chunks)
        }
        
        config_file = os.path.join(VECTOR_DB_DIR, "index_config.json")
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2)
        
        print(f"Vector index created and deployed!")
        print(f"  - Index ID: {index_id}")
        print(f"  - Endpoint ID: {endpoint_id}")
        print(f"  - Config saved to: {config_file}")
        
        return index_id, endpoint_id
    
    def test_search(self, endpoint_id: str, query: str = "What is consciousness?"):
        """
        Test the vector search functionality
        
        Args:
            endpoint_id: ID of the index endpoint
            query: Test query string
        """
        print(f"\nTesting search with query: '{query}'")
        
        # Generate embedding for the query
        query_embeddings = self.vertex_embeddings.generate_embeddings([query])
        query_embedding = query_embeddings[0]
        
        # Search for similar chunks
        results = self.vertex_embeddings.search_similar(
            endpoint_id, query_embedding, top_k=5
        )
        
        print(f"Found {len(results)} similar chunks:")
        for i, result in enumerate(results, 1):
            print(f"\n{i}. Distance: {result['distance']:.4f}")
            print(f"   Book: {result['metadata'].get('book_title', 'Unknown')}")
            print(f"   Chapter: {result['metadata'].get('chapter_index', 'Unknown')}")
            print(f"   Chunk: {result['metadata'].get('chunk_index', 'Unknown')}")
    
    def run_full_pipeline(self, create_index: bool = True, test_search: bool = True):
        """
        Run the complete pipeline: process books, generate embeddings, create index
        
        Args:
            create_index: Whether to create and deploy vector index
            test_search: Whether to test search functionality
        """
        print("Starting Bob's Books Embedding Pipeline")
        print("=" * 50)
        
        # Step 1: Process books
        chunks = self.process_books()
        if not chunks:
            print("No chunks generated. Exiting.")
            return
        
        # Step 2: Generate embeddings
        embeddings = self.generate_embeddings(chunks)
        
        # Step 3: Save chunks and embeddings
        self.save_chunks_and_embeddings(chunks, embeddings)
        
        # Step 4: Create vector index (optional)
        if create_index:
            index_id, endpoint_id = self.create_vector_index(chunks, embeddings)
            
            # Step 5: Test search (optional)
            if test_search:
                self.test_search(endpoint_id)
        
        print("\nPipeline completed successfully!")

def main():
    parser = argparse.ArgumentParser(description="Process Bob's books and generate embeddings")
    parser.add_argument("--no-index", action="store_true", 
                       help="Skip creating vector index")
    parser.add_argument("--no-test", action="store_true", 
                       help="Skip testing search functionality")
    parser.add_argument("--books", nargs="+", 
                       help="Specific book files to process")
    
    args = parser.parse_args()
    
    processor = BookProcessor()
    
    if args.books:
        # Process specific books
        chunks = processor.process_books(args.books)
        if chunks:
            embeddings = processor.generate_embeddings(chunks)
            processor.save_chunks_and_embeddings(chunks, embeddings)
    else:
        # Run full pipeline
        processor.run_full_pipeline(
            create_index=not args.no_index,
            test_search=not args.no_test
        )

if __name__ == "__main__":
    main()







