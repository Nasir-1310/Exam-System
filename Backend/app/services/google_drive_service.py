# Backend/app/services/google_drive_service.py
"""
Google Drive Service for Image Upload

PRODUCTION SETUP REQUIRED:
1. Enable Google Drive API in Google Cloud Console
2. Create service account credentials
3. Download credentials JSON file
4. Set GOOGLE_APPLICATION_CREDENTIALS environment variable
5. Install google-api-python-client: pip install google-api-python-client google-auth

This is currently a MOCK implementation for testing.
Replace with actual Google Drive API calls in production.
"""

import uuid
from typing import Optional


class GoogleDriveService:
    """Service for uploading images to Google Drive and getting shareable links"""

    @staticmethod
    async def upload_image(file_data: bytes, filename: str, mime_type: str = "image/jpeg") -> Optional[str]:
        """
        Upload image to Google Drive and return shareable link

        PRODUCTION IMPLEMENTATION:
        ```python
        from googleapiclient.discovery import build
        from googleapiclient.http import MediaIoBaseUpload
        from google.oauth2 import service_account
        import io

        # Initialize credentials and service
        creds = service_account.Credentials.from_service_account_file('credentials.json')
        service = build('drive', 'v3', credentials=creds)

        # Upload file
        file_metadata = {
            'name': filename,
            'parents': ['YOUR_FOLDER_ID']  # Optional: specify folder
        }

        media = MediaIoBaseUpload(io.BytesIO(file_data), mimetype=mime_type)
        file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id'
        ).execute()

        # Set sharing permissions
        permission = {
            'type': 'anyone',
            'role': 'reader'
        }
        service.permissions().create(
            fileId=file['id'],
            body=permission
        ).execute()

        # Return shareable link
        return f"https://drive.google.com/file/d/{file['id']}/view?usp=sharing"
        ```

        For now, this returns a mock Google Drive link
        """
        try:
            # Generate a unique file ID (simulating Google Drive file ID)
            file_id = str(uuid.uuid4())

            # Mock Google Drive shareable link format
            shareable_link = f"https://drive.google.com/file/d/{file_id}/view?usp=sharing"

            print(f"[MOCK] Uploaded {filename} to Google Drive, link: {shareable_link}")
            return shareable_link

        except Exception as e:
            print(f"Error uploading to Google Drive: {e}")
            return None

    @staticmethod
    def get_direct_image_url(shareable_link: str) -> Optional[str]:
        """
        Convert Google Drive shareable link to direct image URL for embedding

        Handles multiple Google Drive URL formats:
        - https://drive.google.com/file/d/{file_id}/view?usp=sharing
        - https://drive.google.com/open?id={file_id}
        - https://drive.google.com/uc?id={file_id}
        """
        if not shareable_link or "drive.google.com" not in shareable_link:
            return shareable_link

        try:
            file_id = None

            # Extract file ID from different Google Drive URL formats
            if "/file/d/" in shareable_link:
                # Format: https://drive.google.com/file/d/{file_id}/view?usp=sharing
                file_id = shareable_link.split("/file/d/")[1].split("/")[0]
            elif "id=" in shareable_link:
                # Format: https://drive.google.com/open?id={file_id} or https://drive.google.com/uc?id={file_id}
                url_params = shareable_link.split("id=")[1]
                file_id = url_params.split("&")[0]  # Remove any additional parameters

            if file_id:
                # Direct image URL format for Google Drive
                return f"https://drive.google.com/uc?export=view&id={file_id}"
            else:
                return shareable_link
        except Exception as e:
            print(f"Error converting Google Drive link: {e}")
            return shareable_link


# Global instance
google_drive_service = GoogleDriveService()