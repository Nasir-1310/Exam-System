"""
Google Drive URL conversion utilities
"""


def convert_google_drive_url(url: str) -> str:
    """
    Convert Google Drive shareable link to direct image URL
    
    Handles multiple Google Drive URL formats:
    - https://drive.google.com/file/d/{file_id}/view?usp=sharing
    - https://drive.google.com/open?id={file_id}
    - https://drive.google.com/uc?id={file_id}
    
    Args:
        url: The Google Drive URL or any image URL
        
    Returns:
        Direct image URL that can be used in <img> src
    """
    if not url or not isinstance(url, str):
        return url
    
    # If it's not a Google Drive URL, return as-is
    if 'drive.google.com' not in url:
        return url
    
    try:
        file_id = None
        
        # Extract file ID from different Google Drive URL formats
        if '/file/d/' in url:
            # Format: https://drive.google.com/file/d/{file_id}/view?usp=sharing
            parts = url.split('/file/d/')
            if len(parts) > 1:
                file_id = parts[1].split('/')[0].split('?')[0]
        elif 'id=' in url:
            # Format: https://drive.google.com/open?id={file_id} or uc?id={file_id}
            url_params = url.split('id=')
            if len(url_params) > 1:
                file_id = url_params[1].split('&')[0]
        
        # If we successfully extracted file ID, return direct image URL
        if file_id:
            return f"https://drive.google.com/uc?export=view&id={file_id}"
        
        # If we couldn't extract file ID, return original URL
        return url
    except Exception as e:
        print(f"Error converting Google Drive URL: {e}")
        return url


def is_google_drive_url(url: str) -> bool:
    """Check if a URL is a Google Drive URL"""
    if not url or not isinstance(url, str):
        return False
    return 'drive.google.com' in url


def validate_and_convert_image_url(url: str, field_name: str) -> str:
    """
    Validate and convert image URLs, ensuring they're appropriate for the field
    
    Args:
        url: The URL to validate
        field_name: The field name (e.g., 'option_a', 'option_a_image_url')
        
    Returns:
        Converted URL if valid, None if should be cleared
    """
    if not url or not isinstance(url, str):
        return None
    
    url = url.strip()
    if not url:
        return None
    
    # Check if this is an image URL field
    is_image_field = '_image_url' in field_name or field_name == 'image_url'
    
    # Check if URL contains common URL indicators
    has_url_protocol = url.startswith('http://') or url.startswith('https://')
    is_drive_url = 'drive.google.com' in url
    
    if is_image_field:
        # This is an image URL field - convert Google Drive URLs
        if is_drive_url:
            return convert_google_drive_url(url)
        elif has_url_protocol:
            return url
        else:
            # Not a valid URL for image field
            return None
    else:
        # This is a text field - Google Drive URLs are allowed (frontend will convert them to images)
        if has_url_protocol and not is_drive_url:
            print(f"WARNING: Non-Google Drive URL detected in text field '{field_name}': {url}")
            return None  # Clear non-Google Drive URLs from text fields
        # Allow Google Drive URLs in text fields - frontend will handle them
        return url