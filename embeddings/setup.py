"""
Setup script for Bob's Books embeddings
"""
import os
import subprocess
import sys
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n{description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✓ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ {description} failed:")
        print(f"  Error: {e.stderr}")
        return False

def check_requirements():
    """Check if required tools are installed"""
    print("Checking requirements...")
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("✗ Python 3.8+ required")
        return False
    print(f"✓ Python {sys.version_info.major}.{sys.version_info.minor}")
    
    # Check gcloud
    try:
        result = subprocess.run(["gcloud", "--version"], capture_output=True, text=True)
        print("✓ Google Cloud SDK installed")
    except FileNotFoundError:
        print("✗ Google Cloud SDK not found. Please install it:")
        print("  https://cloud.google.com/sdk/docs/install")
        return False
    
    return True

def setup_environment():
    """Set up the environment"""
    print("\nSetting up environment...")
    
    # Create directories
    directories = ["books", "embeddings", "vector_db"]
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"✓ Created directory: {directory}")
    
    # Create .env file if it doesn't exist
    env_file = Path(".env")
    env_example = Path("env_example.txt")
    
    if not env_file.exists() and env_example.exists():
        env_file.write_text(env_example.read_text())
        print("✓ Created .env file from template")
        print("  Please edit .env with your Google Cloud project details")
    
    return True

def install_dependencies():
    """Install Python dependencies"""
    return run_command("pip install -r requirements.txt", "Installing Python dependencies")

def authenticate_gcloud():
    """Set up Google Cloud authentication"""
    print("\nSetting up Google Cloud authentication...")
    
    # Check if already authenticated
    try:
        result = subprocess.run(["gcloud", "auth", "list", "--filter=status:ACTIVE"], 
                              capture_output=True, text=True)
        if "ACTIVE" in result.stdout:
            print("✓ Google Cloud authentication already set up")
            return True
    except:
        pass
    
    print("Please run the following command to authenticate:")
    print("  gcloud auth application-default login")
    
    response = input("Have you completed the authentication? (y/n): ")
    return response.lower() == 'y'

def enable_apis():
    """Enable required Google Cloud APIs"""
    apis = [
        "aiplatform.googleapis.com",
        "storage.googleapis.com"
    ]
    
    print("\nEnabling required Google Cloud APIs...")
    
    for api in apis:
        if not run_command(f"gcloud services enable {api}", f"Enabling {api}"):
            print(f"  Please enable {api} manually in Google Cloud Console")
    
    return True

def main():
    """Main setup function"""
    print("Bob's Books - Vertex AI Embeddings Setup")
    print("=" * 50)
    
    # Check requirements
    if not check_requirements():
        print("\nSetup failed. Please install missing requirements.")
        return False
    
    # Set up environment
    if not setup_environment():
        print("\nSetup failed. Could not create environment.")
        return False
    
    # Install dependencies
    if not install_dependencies():
        print("\nSetup failed. Could not install dependencies.")
        return False
    
    # Authenticate with Google Cloud
    if not authenticate_gcloud():
        print("\nSetup failed. Please complete Google Cloud authentication.")
        return False
    
    # Enable APIs
    if not enable_apis():
        print("\nSetup failed. Please enable required APIs.")
        return False
    
    print("\n" + "=" * 50)
    print("Setup completed successfully!")
    print("\nNext steps:")
    print("1. Edit .env file with your Google Cloud project details")
    print("2. Place your book files in the books/ directory")
    print("3. Run: python book_processor.py")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

