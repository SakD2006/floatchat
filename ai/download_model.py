# This script is used during the Docker build process to pre-download the embedding model.
# This ensures the model is "baked" into the image and doesn't need to be downloaded at runtime.
from langchain_community.embeddings import HuggingFaceEmbeddings

print("Downloading embedding model 'all-MiniLM-L6-v2'...")
HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
print("Model download complete.")