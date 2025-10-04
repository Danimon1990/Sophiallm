"""
Text processing utilities for chunking and preparing book content
"""
import re
import os
from typing import List, Dict, Any
import tiktoken
import PyPDF2
from config import CHUNK_SIZE, CHUNK_OVERLAP, MAX_CHUNK_SIZE

class TextProcessor:
    def __init__(self):
        # Use tiktoken to count tokens (approximate for text-embedding-gecko)
        self.encoding = tiktoken.get_encoding("cl100k_base")
    
    def count_tokens(self, text: str) -> int:
        """Count approximate tokens in text"""
        return len(self.encoding.encode(text))
    
    def chunk_text(self, text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
        """
        Split text into overlapping chunks
        
        Args:
            text: Input text to chunk
            chunk_size: Target chunk size in characters
            overlap: Overlap between chunks in characters
            
        Returns:
            List of text chunks
        """
        if not text.strip():
            return []
        
        chunks = []
        start = 0
        text_length = len(text)
        
        while start < text_length:
            # Find the end of the chunk
            end = start + chunk_size
            
            # If this isn't the last chunk, try to break at a sentence boundary
            if end < text_length:
                # Look for sentence endings within the last 200 characters
                search_start = max(start + chunk_size - 200, start)
                sentence_endings = ['.', '!', '?', '\n\n']
                
                for i in range(end, search_start, -1):
                    if text[i] in sentence_endings:
                        end = i + 1
                        break
            
            chunk = text[start:end].strip()
            
            # Skip very short chunks
            if len(chunk) > 50:
                chunks.append(chunk)
            
            # Move start position, accounting for overlap
            start = end - overlap
            if start >= text_length:
                break
        
        return chunks
    
    def extract_chapters(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract chapters from text based on common patterns
        
        Args:
            text: Full book text
            
        Returns:
            List of chapter dictionaries with title and content
        """
        chapters = []
        
        # Common chapter patterns
        chapter_patterns = [
            r'^Chapter\s+\d+[:\s]*(.+)$',
            r'^\d+[.\s]*(.+)$',
            r'^#\s*(.+)$',  # Markdown headers
            r'^\*\*(.+)\*\*$',  # Bold headers
        ]
        
        lines = text.split('\n')
        current_chapter = None
        current_content = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Check if this line is a chapter header
            is_chapter_header = False
            for pattern in chapter_patterns:
                match = re.match(pattern, line, re.IGNORECASE)
                if match:
                    # Save previous chapter if exists
                    if current_chapter:
                        chapters.append({
                            'title': current_chapter,
                            'content': '\n'.join(current_content)
                        })
                    
                    # Start new chapter
                    current_chapter = match.group(1).strip()
                    current_content = []
                    is_chapter_header = True
                    break
            
            if not is_chapter_header:
                current_content.append(line)
        
        # Add the last chapter
        if current_chapter:
            chapters.append({
                'title': current_chapter,
                'content': '\n'.join(current_content)
            })
        
        return chapters
    
    def process_book_file(self, file_path: str) -> List[Dict[str, Any]]:
        """
        Process a book file and return structured chunks
        
        Args:
            file_path: Path to the book file
            
        Returns:
            List of chunk dictionaries with metadata
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Book file not found: {file_path}")
        
        # Read the file based on extension
        if file_path.lower().endswith('.pdf'):
            # Extract text from PDF
            content = self.extract_pdf_text(file_path)
        else:
            # Read text files
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        
        book_title = os.path.basename(file_path).replace('.txt', '').replace('.md', '').replace('.pdf', '')
        
        # Extract chapters
        chapters = self.extract_chapters(content)
        
        # If no chapters found, treat entire content as one chapter
        if not chapters:
            chapters = [{'title': 'Full Text', 'content': content}]
        
        # Process each chapter into chunks
        all_chunks = []
        for chapter_idx, chapter in enumerate(chapters):
            chapter_chunks = self.chunk_text(chapter['content'])
            
            for chunk_idx, chunk in enumerate(chapter_chunks):
                # Skip chunks that are too large for the embedding model
                if self.count_tokens(chunk) > MAX_CHUNK_SIZE:
                    # Further split large chunks
                    sub_chunks = self.chunk_text(chunk, chunk_size=CHUNK_SIZE//2)
                    for sub_idx, sub_chunk in enumerate(sub_chunks):
                        all_chunks.append({
                            'book_title': book_title,
                            'chapter': chapter['title'],
                            'chapter_index': chapter_idx,
                            'chunk_index': f"{chunk_idx}_{sub_idx}",
                            'text': sub_chunk,
                            'word_count': len(sub_chunk.split()),
                            'token_count': self.count_tokens(sub_chunk)
                        })
                else:
                    all_chunks.append({
                        'book_title': book_title,
                        'chapter': chapter['title'],
                        'chapter_index': chapter_idx,
                        'chunk_index': chunk_idx,
                        'text': chunk,
                        'word_count': len(chunk.split()),
                        'token_count': self.count_tokens(chunk)
                    })
        
        return all_chunks
    
    def validate_chunks(self, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Validate and filter chunks
        
        Args:
            chunks: List of chunk dictionaries
            
        Returns:
            Filtered list of valid chunks
        """
        valid_chunks = []
        
        for chunk in chunks:
            # Skip chunks that are too short
            if chunk['word_count'] < 10:
                continue
            
            # Skip chunks that are too long
            if chunk['token_count'] > MAX_CHUNK_SIZE:
                continue
            
            # Ensure required fields exist
            required_fields = ['book_title', 'chapter', 'text']
            if all(field in chunk for field in required_fields):
                valid_chunks.append(chunk)
        
        return valid_chunks
    
    def extract_pdf_text(self, file_path: str) -> str:
        """
        Extract text from a PDF file
        
        Args:
            file_path: Path to the PDF file
            
        Returns:
            Extracted text content
        """
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                
                for page_num in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_num]
                    text += page.extract_text() + "\n"
                
                return text
        except Exception as e:
            print(f"  Error extracting text from PDF {file_path}: {e}")
            return ""
