"""
Configuration for Vertex AI embeddings and vector search
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Google Cloud Configuration
PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT", "your-project-id")
LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
REGION = os.getenv("GOOGLE_CLOUD_REGION", "us-central1")

# Vertex AI Configuration
VERTEX_AI_LOCATION = LOCATION
EMBEDDING_MODEL = "textembedding-gecko@003"  # Latest text embedding model
INDEX_ENDPOINT_ID = os.getenv("INDEX_ENDPOINT_ID", "")  # Will be created if not exists
INDEX_ID = os.getenv("INDEX_ID", "")  # Will be created if not exists

# Text Processing Configuration
CHUNK_SIZE = 1000  # Characters per chunk
CHUNK_OVERLAP = 200  # Overlap between chunks
MAX_CHUNK_SIZE = 8000  # Max tokens per chunk (for embedding model)

# Vector Search Configuration
DIMENSIONS = 768  # textembedding-gecko@003 produces 768-dimensional vectors
SHARD_SIZE = "SHARD_SIZE_SMALL"  # For small to medium datasets
APPROXIMATE_NEIGHBORS_COUNT = 10  # Number of neighbors to return

# Book Configuration
BOOKS_DIR = "books"
EMBEDDINGS_DIR = "embeddings"
VECTOR_DB_DIR = "vector_db"

# Supported book formats
SUPPORTED_FORMATS = [".txt", ".md", ".pdf"]

# Metadata fields to store with each chunk
METADATA_FIELDS = [
    "book_title",
    "chapter",
    "page_number", 
    "chunk_index",
    "source_text",
    "word_count"
]

