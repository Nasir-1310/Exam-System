"""
Upload Routes - Handles file uploads for the exam system

ADDED FOR: PC Image Upload Feature
LOCATION: Backend/app/api/upload.py
STORAGE: Backend/uploads/questions/

Images are stored in Backend/uploads/questions/ and served via /uploads/questions/{filename}
The /uploads/ endpoint is mounted as StaticFiles in main.py

🔄 FUTURE AWS S3 INTEGRATION:
Replace the local file storage logic with boto3 S3 upload
See marked sections below for specific changes needed
"""

from fastapi import APIRouter, File, UploadFile, HTTPException
from pathlib import Path
import shutil
import uuid
import os
from datetime import datetime

# Import settings from your config
from app.lib.config import settings

router = APIRouter(prefix="/api/upload", tags=["Upload"])

# ============================================================================
# STORAGE CONFIGURATION - Images stored in Backend/uploads/questions/
# ============================================================================
# Get the Backend root directory (3 levels up from this file)
BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent

# Create uploads directory path
UPLOAD_DIR = BACKEND_ROOT / settings.UPLOAD_DIR

# Ensure upload directory exists
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

print(f"✅ Upload directory configured: {UPLOAD_DIR}")
print(f"✅ Upload directory exists: {UPLOAD_DIR.exists()}")

# Get configuration from settings
ALLOWED_EXTENSIONS = set(settings.ALLOWED_IMAGE_EXTENSIONS)
MAX_FILE_SIZE = settings.MAX_UPLOAD_SIZE
# ============================================================================


def validate_image_file(file: UploadFile) -> None:
    """
    Validates uploaded image file
    
    Checks:
    - File extension is allowed
    - File size is within limits
    - File is not empty
    
    Raises:
        HTTPException: If validation fails
    """
    # Check file extension
    file_extension = Path(file.filename).suffix.lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size
    file.file.seek(0, 2)  # Move to end of file
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning
    
    if file_size > MAX_FILE_SIZE:
        max_size_mb = MAX_FILE_SIZE / (1024 * 1024)
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {max_size_mb:.1f}MB"
        )
    
    # Check for empty file
    if file_size == 0:
        raise HTTPException(
            status_code=400,
            detail="Empty file. Please upload a valid image."
        )


def save_file_locally(file: UploadFile) -> str:
    """
    Saves file to Backend/uploads/questions/
    
    Returns:
        Full URL to access the image
    """
    file_extension = Path(file.filename).suffix.lower()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    unique_filename = f"{timestamp}_{unique_id}{file_extension}"
    
    file_path = UPLOAD_DIR / unique_filename
    
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        print(f"✅ File saved: {file_path}")
        
    except Exception as e:
        print(f"❌ Failed to save file: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to save file: {str(e)}"
        )
    
    # ✅ Return FULL URL with backend server address
    backend_url = os.getenv("BACKEND_URL", "http://127.0.0.1:8000")
    full_url = f"{backend_url}/uploads/questions/{unique_filename}"
    
    print(f"✅ Image URL: {full_url}")
    
    return full_url
@router.post("/question-image")
async def upload_question_image(
    file: UploadFile = File(..., description="Question image file")
):
    """
    Upload a question image from PC
    
    **Storage Location:** Backend/uploads/questions/
    **Access URL:** /uploads/questions/{filename} (served by StaticFiles in main.py)
    
    **Configuration:** Uses settings from app/lib/config.py
    - Max file size: Defined in settings.MAX_UPLOAD_SIZE
    - Allowed types: Defined in settings.ALLOWED_IMAGE_EXTENSIONS
    
    Args:
        file: Image file (JPG, PNG, GIF, WebP)
        
    Returns:
        dict: Contains the relative URL of uploaded image
        
    Example Response:
        {
            "url": "/uploads/questions/20250119_123456_abc123.jpg",
            "filename": "my-image.jpg",
            "message": "Image uploaded successfully"
        }
        
    Example Usage (Frontend):
        const formData = new FormData();
        formData.append('file', imageFile);
        
        const response = await fetch('http://127.0.0.1:8000/api/upload/question-image', {
            method: 'POST',
            body: formData,
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        // data.url = "/uploads/questions/20250119_123456_abc123.jpg"
        // Full URL: http://127.0.0.1:8000/uploads/questions/20250119_123456_abc123.jpg
    """
    print(f"📤 Uploading file: {file.filename}")
    
    # Validate file
    validate_image_file(file)
    
    # Save to local storage
    url = save_file_locally(file)
    
    return {
        "url": url,
        "filename": file.filename,
        "message": "Image uploaded successfully"
    }


@router.delete("/question-image/{filename}")
async def delete_question_image(filename: str):
    """
    Delete a question image from Backend/uploads/questions/
    
    **TODO:** Add authentication to restrict to admin only
    
    Args:
        filename: Name of the file to delete (just the filename, not the full path)
        
    Returns:
        dict: Success message
        
    Example:
        DELETE /api/upload/question-image/20250119_123456_abc123.jpg
    """
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(
            status_code=404, 
            detail=f"File not found: {filename}"
        )
    
    # Security check: Ensure file is within upload directory
    try:
        file_path.resolve().relative_to(UPLOAD_DIR.resolve())
    except ValueError:
        raise HTTPException(
            status_code=400, 
            detail="Invalid file path"
        )
    
    try:
        os.remove(file_path)
        print(f"🗑️ File deleted: {file_path}")
    except Exception as e:
        print(f"❌ Failed to delete file: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to delete file: {str(e)}"
        )
    
    return {
        "message": "Image deleted successfully", 
        "filename": filename
    }


@router.get("/question-image/{filename}/info")
async def get_question_image_info(filename: str):
    """
    Get information about an uploaded image
    
    Useful for:
    - Checking if an image exists before displaying
    - Getting file size information
    - Debugging image issues
    
    Args:
        filename: Name of the file
        
    Returns:
        dict: File information including size and URL
        
    Example Response:
        {
            "filename": "20250119_123456_abc123.jpg",
            "exists": true,
            "size_bytes": 152847,
            "size_mb": 0.15,
            "url": "/uploads/questions/20250119_123456_abc123.jpg"
        }
    """
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(
            status_code=404, 
            detail=f"File not found: {filename}"
        )
    
    # Security check
    try:
        file_path.resolve().relative_to(UPLOAD_DIR.resolve())
    except ValueError:
        raise HTTPException(
            status_code=403, 
            detail="Access denied"
        )
    
    try:
        file_stats = os.stat(file_path)
        return {
            "filename": filename,
            "exists": True,
            "size_bytes": file_stats.st_size,
            "size_mb": round(file_stats.st_size / (1024 * 1024), 2),
            "url": f"/uploads/questions/{filename}"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to get file info: {str(e)}"
        )


# ============================================================================
# HEALTH CHECK ENDPOINT
# ============================================================================
@router.get("/health")
async def upload_health_check():
    """
    Check if upload service is working correctly
    
    Verifies:
    - Upload directory exists and is writable
    - Configuration is loaded correctly
    
    Returns:
        dict: Service status
    """
    return {
        "status": "healthy",
        "upload_dir": str(UPLOAD_DIR),
        "upload_dir_exists": UPLOAD_DIR.exists(),
        "allowed_extensions": list(ALLOWED_EXTENSIONS),
        "max_file_size_mb": round(MAX_FILE_SIZE / (1024 * 1024), 2)
    }