import dashscope
from config import QIANWEN_API_KEY

class FlowchartService:
    def __init__(self):
        self.api_key = QIANWEN_API_KEY
        
    def analyze_with_qianwen(self, text):
        messages = [{
            'role': 'user',
            'content': f'''
            请分析以下教学流程图的内容，并给出评分和优化建议。请不要使用markdown格式。

            教学流程图内容：
            {text}
            
            请按照以下格式进行分析和评分：

            总体评分：[0-100分]
            评分说明：
            - 教学目标的清晰度（25分）：[得分] 分
            - 教学步骤的逻辑性（25分）：[得分] 分
            - 时间分配的合理性（25分）：[得分] 分
            - 教学方法的创新性（25分）：[得分] 分

            详细分析：

            1. 教学目标的清晰度
            现状：[描述当前状况]
            建议：[给出改进建议]

            2. 教学步骤的逻辑性
            现状：[描述当前状况]
            建议：[给出改进建议]

            3. 时间分配的合理性
            现状：[描述当前状况]
            建议：[给出改进建议]

            4. 教学方法的创新性
            现状：[描述当前状况]
            建议：[给出改进建议]

            5. 具体修改建议：
            需要修改的步骤：[具体步骤]
            修改建议：[具体修改内容]
            修改理由：[修改的原因]

            需要修改的步骤：[具体步骤]
            修改建议：[具体修改内容]
            修改理由：[修改的原因]
            '''
        }]
        
        try:
            print("正在调用通义千问API...")
            
            response = dashscope.Generation.call(
                model='qwen-max',
                messages=messages,
                api_key=self.api_key
            )
            
            # 检查响应是否成功
            if response is None:
                return "分析失败：API返回为空"
                
            # 如果响应是字典格式
            if isinstance(response, dict):
                if 'output' in response and 'text' in response['output']:
                    result = response['output']['text']
                    result = result.replace('**', '')
                    result = result.replace('###', '')
                    result = result.replace('####', '')
                    return result
                    
            # 如果响应是对象格式
            if hasattr(response, 'output'):
                if hasattr(response.output, 'text'):
                    result = response.output.text
                    result = result.replace('**', '')
                    result = result.replace('###', '')
                    result = result.replace('####', '')
                    return result
                    
            return "分析失败：无法解析API响应"
            
        except Exception as e:
            print(f"API调用出错: {str(e)}")
            return f"分析失败：{str(e)}"
