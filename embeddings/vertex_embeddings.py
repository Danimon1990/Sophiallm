"""
Vertex AI embeddings generation and management
"""
import os
import json
import time
from typing import List, Dict, Any, Optional
from google.cloud import aiplatform
from google.cloud.aiplatform import gapic as aip
from google.protobuf import struct_pb2
import pandas as pd
import requests
from config import (
    PROJECT_ID, LOCATION, EMBEDDING_MODEL, 
    INDEX_ENDPOINT_ID, INDEX_ID, DIMENSIONS
)
from text_processor import TextProcessor

class VertexEmbeddings:
    def __init__(self):
        """Initialize Vertex AI client"""
        # Initialize without explicit credentials - will use Application Default Credentials
        aiplatform.init(project=PROJECT_ID, location=LOCATION)
        
        # Initialize the index service client for vector search
        self.index_client = aip.IndexServiceClient(
            client_options={"api_endpoint": f"{LOCATION}-aiplatform.googleapis.com"}
        )
        
        # Initialize the index endpoint service client
        self.index_endpoint_client = aip.IndexEndpointServiceClient(
            client_options={"api_endpoint": f"{LOCATION}-aiplatform.googleapis.com"}
        )
        
        self.text_processor = TextProcessor()
        
        # Get access token for REST API
        self.access_token = self._get_access_token()
    
    def _get_access_token(self) -> str:
        """Get access token for REST API calls"""
        import subprocess
        try:
            result = subprocess.run(
                ["gcloud", "auth", "print-access-token"],
                capture_output=True,
                text=True,
                check=True
            )
            return result.stdout.strip()
        except subprocess.CalledProcessError as e:
            raise Exception(f"Failed to get access token: {e}")
    
    def generate_embeddings(self, texts: List[str], batch_size: int = 5) -> List[List[float]]:
        """
        Generate embeddings for a list of texts using Vertex AI REST API
        
        Args:
            texts: List of texts to embed
            batch_size: Number of texts to process in each batch
            
        Returns:
            List of embedding vectors
        """
        all_embeddings = []
        
        # Process texts in batches to avoid rate limits
        for i in range(0, len(texts), batch_size):
            batch_texts = texts[i:i + batch_size]
            
            try:
                # Prepare the request
                url = f"https://{LOCATION}-aiplatform.googleapis.com/v1/projects/{PROJECT_ID}/locations/{LOCATION}/publishers/google/models/{EMBEDDING_MODEL}:predict"
                
                headers = {
                    "Authorization": f"Bearer {self.access_token}",
                    "Content-Type": "application/json"
                }
                
                # Prepare instances
                instances = []
                for text in batch_texts:
                    instances.append({"content": text})
                
                data = {"instances": instances}
                
                # Make the request
                response = requests.post(url, headers=headers, json=data)
                response.raise_for_status()
                
                # Extract embeddings from response
                result = response.json()
                for prediction in result.get("predictions", []):
                    embedding = prediction.get("embeddings", {}).get("values", [])
                    all_embeddings.append(embedding)
                
                print(f"Generated embeddings for batch {i//batch_size + 1}/{(len(texts) + batch_size - 1)//batch_size}")
                
                # Add delay to respect rate limits
                time.sleep(0.1)
                
            except Exception as e:
                print(f"Error generating embeddings for batch {i//batch_size + 1}: {e}")
                # Add zero vectors for failed batch
                for _ in batch_texts:
                    all_embeddings.append([0.0] * DIMENSIONS)
        
        return all_embeddings
    
    def create_vector_index(self, index_display_name: str = "bobs-books-index") -> str:
        """
        Create a vector index for storing embeddings
        
        Args:
            index_display_name: Display name for the index
            
        Returns:
            Index ID
        """
        # Define the index
        index = aip.Index(
            display_name=index_display_name,
            description="Vector index for Bob's books embeddings",
            metadata=struct_pb2.Value(
                struct_value=struct_pb2.Struct(
                    fields={
                        "config": struct_pb2.Value(
                            struct_value=struct_pb2.Struct(
                                fields={
                                    "dimensions": struct_pb2.Value(number_value=DIMENSIONS),
                                    "approximate_neighbors_count": struct_pb2.Value(number_value=10),
                                    "shard_size": struct_pb2.Value(string_value="SHARD_SIZE_SMALL"),
                                    "distance_measure_type": struct_pb2.Value(string_value="DOT_PRODUCT_DISTANCE"),
                                    "algorithm_config": struct_pb2.Value(
                                        struct_value=struct_pb2.Struct(
                                            fields={
                                                "tree_ah_config": struct_pb2.Value(
                                                    struct_value=struct_pb2.Struct(
                                                        fields={
                                                            "leaf_node_embedding_count": struct_pb2.Value(number_value=500),
                                                            "leaf_nodes_to_search_percent": struct_pb2.Value(number_value=7)
                                                        }
                                                    )
                                                )
                                            }
                                        )
                                    )
                                }
                            )
                        )
                    }
                )
            )
        )
        
        # Create the index
        operation = self.index_client.create_index(
            parent=f"projects/{PROJECT_ID}/locations/{LOCATION}",
            index=index
        )
        
        print(f"Creating index... This may take several minutes.")
        result = operation.result()
        
        index_id = result.name.split('/')[-1]
        print(f"Index created with ID: {index_id}")
        
        return index_id
    
    def create_index_endpoint(self, endpoint_display_name: str = "bobs-books-endpoint") -> str:
        """
        Create an index endpoint for serving the vector index
        
        Args:
            endpoint_display_name: Display name for the endpoint
            
        Returns:
            Endpoint ID
        """
        # Define the endpoint
        endpoint = aip.IndexEndpoint(
            display_name=endpoint_display_name,
            description="Index endpoint for Bob's books vector search"
        )
        
        # Create the endpoint
        operation = self.index_endpoint_client.create_index_endpoint(
            parent=f"projects/{PROJECT_ID}/locations/{LOCATION}",
            index_endpoint=endpoint
        )
        
        print(f"Creating index endpoint... This may take several minutes.")
        result = operation.result()
        
        endpoint_id = result.name.split('/')[-1]
        print(f"Index endpoint created with ID: {endpoint_id}")
        
        return endpoint_id
    
    def deploy_index_to_endpoint(self, index_id: str, endpoint_id: str, 
                                deployed_index_display_name: str = "bobs_books_deployed_index"):
        """
        Deploy an index to an endpoint
        
        Args:
            index_id: ID of the index to deploy
            endpoint_id: ID of the endpoint to deploy to
            deployed_index_display_name: Display name for the deployed index
        """
        # Define the deployed index
        deployed_index = aip.DeployedIndex(
            id=deployed_index_display_name,
            index=f"projects/{PROJECT_ID}/locations/{LOCATION}/indexes/{index_id}",
            display_name=deployed_index_display_name,
            enable_access_logging=True,
            dedicated_resources=aip.DedicatedResources(
                machine_spec=aip.MachineSpec(
                    machine_type="e2-standard-2"
                ),
                min_replica_count=1,
                max_replica_count=1
            )
        )
        
        # Deploy the index
        operation = self.index_endpoint_client.deploy_index(
            index_endpoint=f"projects/{PROJECT_ID}/locations/{LOCATION}/indexEndpoints/{endpoint_id}",
            deployed_index=deployed_index
        )
        
        print(f"Deploying index to endpoint... This may take several minutes.")
        result = operation.result()
        
        print(f"Index deployed successfully!")
        return result
    
    def upsert_embeddings(self, index_id: str, chunks: List[Dict[str, Any]], 
                         embeddings: List[List[float]]):
        """
        Upsert embeddings and metadata to the vector index
        
        Args:
            index_id: ID of the index
            chunks: List of chunk dictionaries with metadata
            embeddings: List of embedding vectors
        """
        if len(chunks) != len(embeddings):
            raise ValueError("Number of chunks must match number of embeddings")
        
        # Prepare data for upsert
        datapoints = []
        for chunk, embedding in zip(chunks, embeddings):
            # Create datapoint with embedding and metadata
            datapoint = aip.IndexDatapoint(
                datapoint_id=f"{chunk['book_title']}_{chunk['chapter_index']}_{chunk['chunk_index']}",
                feature_vector=embedding,
                restricts=[
                    aip.IndexDatapoint.Restriction(
                        namespace="book",
                        allow_list=[chunk['book_title']]
                    )
                ]
            )
            datapoints.append(datapoint)
        
        # Upsert in batches
        batch_size = 100
        for i in range(0, len(datapoints), batch_size):
            batch = datapoints[i:i + batch_size]
            
            operation = self.index_client.upsert_datapoints(
                index=f"projects/{PROJECT_ID}/locations/{LOCATION}/indexes/{index_id}",
                datapoints=batch
            )
            
            print(f"Upserted batch {i//batch_size + 1}/{(len(datapoints) + batch_size - 1)//batch_size}")
            time.sleep(1)  # Rate limiting
        
        print(f"Successfully upserted {len(datapoints)} datapoints to index {index_id}")
    
    def search_similar(self, endpoint_id: str, query_embedding: List[float], 
                      top_k: int = 10, filter_books: Optional[List[str]] = None) -> List[Dict[str, Any]]:
        """
        Search for similar embeddings
        
        Args:
            endpoint_id: ID of the index endpoint
            query_embedding: Query embedding vector
            top_k: Number of results to return
            filter_books: Optional list of book titles to filter by
            
        Returns:
            List of search results with metadata
        """
        # Prepare the search request
        query = aip.FindNeighborsRequest.Query(
            datapoint=aip.IndexDatapoint(
                feature_vector=query_embedding
            ),
            neighbor_count=top_k
        )
        
        # Add filters if specified
        if filter_books:
            query.datapoint.restricts = [
                aip.IndexDatapoint.Restriction(
                    namespace="book",
                    allow_list=filter_books
                )
            ]
        
        request = aip.FindNeighborsRequest(
            index_endpoint=f"projects/{PROJECT_ID}/locations/{LOCATION}/indexEndpoints/{endpoint_id}",
            queries=[query],
            return_full_datapoint=True
        )
        
        # Execute the search
        response = self.index_endpoint_client.find_neighbors(request=request)
        
        # Process results
        results = []
        for neighbor_list in response.nearest_neighbors:
            for neighbor in neighbor_list.neighbors:
                result = {
                    'datapoint_id': neighbor.datapoint.datapoint_id,
                    'distance': neighbor.distance,
                    'metadata': {}
                }
                
                # Extract metadata from datapoint ID
                parts = neighbor.datapoint.datapoint_id.split('_')
                if len(parts) >= 3:
                    result['metadata']['book_title'] = parts[0]
                    result['metadata']['chapter_index'] = int(parts[1])
                    result['metadata']['chunk_index'] = parts[2]
                
                results.append(result)
        
        return results
