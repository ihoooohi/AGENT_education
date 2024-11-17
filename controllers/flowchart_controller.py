from flask import Blueprint, request, jsonify
from services.flowchart_service import FlowchartService
from utils.pdf_handler import PDFHandler

flowchart_bp = Blueprint('flowchart', __name__)

@flowchart_bp.route('/analyze', methods=['POST'])
def analyze_flowchart():
    try:
        if 'pdf' not in request.files:
            return jsonify({'error': '请上传PDF文件'}), 400
            
        pdf_file = request.files['pdf']
        pdf_handler = PDFHandler()
        extracted_text = pdf_handler.extract_text(pdf_file)
        
        flowchart_service = FlowchartService()
        analysis_result = flowchart_service.analyze_with_qianwen(extracted_text)
        
        return jsonify({
            'success': True,
            'result': analysis_result
        })
        
    except Exception as e:
        print(f"Error in analyze_flowchart: {str(e)}")
        return jsonify({'error': str(e)}), 500
