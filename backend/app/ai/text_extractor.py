import io
import re
import pymupdf as fitz
from docx import Document

def clean_text(text: str) -> str:
    text = re.sub(r'[\r\n\t]+', '\n', text)
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)
    text = re.sub(r'\n\s*\n', '\n\n', text)
    return text.strip()

def extract_from_pdf(file_bytes: bytes) -> str:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def extract_from_docx(file_bytes: bytes) -> str:
    doc = Document(io.BytesIO(file_bytes))
    text = "\n".join([para.text for para in doc.paragraphs])
    return text

def extract_from_txt(file_bytes: bytes) -> str:
    return file_bytes.decode('utf-8', errors='ignore')

def extract_text(file_bytes: bytes, file_type: str) -> str:
    file_type = file_type.lower().replace('.', '')
    try:
        if file_type == 'pdf':
            text = extract_from_pdf(file_bytes)
        elif file_type == 'docx':
            text = extract_from_docx(file_bytes)
        elif file_type == 'txt':
            text = extract_from_txt(file_bytes)
        else:
            text = extract_from_txt(file_bytes)
        return clean_text(text)
    except Exception as e:
        return ""
