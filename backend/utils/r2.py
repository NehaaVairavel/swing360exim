import os
import boto3
from botocore.config import Config
from datetime import datetime

def get_r2_client():
    return boto3.client(
        's3',
        endpoint_url=os.getenv("R2_ENDPOINT_URL"),
        aws_access_key_id=os.getenv("R2_ACCESS_KEY"),
        aws_secret_access_key=os.getenv("R2_SECRET_KEY"),
        config=Config(signature_version='s3v4'),
        region_name='auto'
    )

def upload_file_to_r2(file_obj, filename):
    try:
        r2 = get_r2_client()
        bucket = os.getenv("R2_BUCKET")
        
        # Create a unique filename to avoid collisions
        timestamp = int(datetime.utcnow().timestamp())
        unique_filename = f"{timestamp}_{filename.replace(' ', '_')}"
        
        r2.upload_fileobj(
            file_obj,
            bucket,
            unique_filename,
            ExtraArgs={'ContentType': 'image/jpeg'} # Generic or detect from filename
        )
        
        return unique_filename
    except Exception as e:
        print(f"R2 Upload Error: {str(e)}")
        return None
