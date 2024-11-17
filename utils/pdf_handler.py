import PyPDF2
from io import BytesIO

class PDFHandler:
    def extract_text(self, pdf_file):
        pdf_reader = PyPDF2.PdfReader(BytesIO(pdf_file.read()))
        text = ""
        
        for page in pdf_reader.pages:
            text += page.extract_text()
            
        return text 