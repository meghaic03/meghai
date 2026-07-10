import os
import sys
import cloudinary
import cloudinary.uploader
import cloudinary.api

def load_env(path=".env"):
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key, value)

load_env()

cloudinary.config(
    cloud_name=os.environ["CLOUDINARY_CLOUD_NAME"],
    api_key=os.environ["CLOUDINARY_API_KEY"],
    api_secret=os.environ["CLOUDINARY_API_SECRET"],
    secure=True,
)

def upload_file(path, public_id):
    resource_type = "video" if path.lower().endswith((".mov", ".mp4")) else "image"
    result = cloudinary.uploader.upload(
        path,
        public_id=public_id,
        resource_type=resource_type,
        overwrite=True,
    )
    print(f"Uploaded {path}")
    print(f"  public_id: {result['public_id']}")
    print(f"  secure_url: {result['secure_url']}")
    print(f"  format: {result.get('format')}  size: {result.get('bytes')} bytes")
    return result

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 upload_to_cloudinary.py <file1> [file2 ...]")
        sys.exit(1)

    for filepath in sys.argv[1:]:
        public_id = os.path.splitext(os.path.basename(filepath))[0]
        upload_file(filepath, public_id)
