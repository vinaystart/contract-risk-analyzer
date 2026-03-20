import os

ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt']
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def validate_file(file):
    ext = os.path.splitext(file.name)[1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        return False, "Only PDF, DOCX, TXT files are allowed"

    if file.size > MAX_FILE_SIZE:
        return False, "File too large (max 10MB)"

    return True, ext