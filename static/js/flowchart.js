const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('pdfFile');
const loadingIndicator = document.getElementById('loadingIndicator');

// 初始化 PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#2eaadc';
    dropZone.style.backgroundColor = '#f7f7f7';
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#e6e6e6';
    dropZone.style.backgroundColor = '#ffffff';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#e6e6e6';
    dropZone.style.backgroundColor = '#ffffff';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        handleFileUpload(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileUpload(e.target.files[0]);
    }
});

async function analyzeFlowchart() {
    const file = fileInput.files[0];
    
    if (!file) {
        alert('请选择PDF文件');
        return;
    }
    
    const formData = new FormData();
    formData.append('pdf', file);
    
    try {
        // 在上传区域显示加载动画
        const uploadSection = document.querySelector('.upload-section');
        const originalContent = uploadSection.innerHTML;
        uploadSection.innerHTML = `
            <div class="loading-indicator">
                <div class="spinner"></div>
                <p>正在分析中，请稍候...</p>
            </div>
        `;
        
        const response = await fetch('/api/flowchart/analyze', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 恢复上传区域
            uploadSection.innerHTML = originalContent;
            // 显示分析结果
            displayAnalysisResult(result.result);
            // 滚动到分析结果
            document.getElementById('analysisResult').scrollIntoView({ 
                behavior: 'smooth' 
            });
        } else {
            alert('分析失败：' + result.error);
            // 恢复上传区域
            uploadSection.innerHTML = originalContent;
        }
    } catch (error) {
        alert('系统错误：' + error.message);
        // 恢复上传区域
        uploadSection.innerHTML = originalContent;
    }
}

function displayAnalysisResult(result) {
    const resultDiv = document.getElementById('analysisResult');
    
    // 检查结果是否为空
    if (!result) {
        resultDiv.innerHTML = `
            <div class="result-container">
                <div class="result-header">
                    <h3>分析失败</h3>
                    <p>未能获取分析结果，请重试</p>
                </div>
            </div>
        `;
        return;
    }
    
    let formattedHtml = `
        <div class="result-container">
            <div class="result-header">
                <h3>教学流程分析报告</h3>
            </div>
            <div class="analysis-content">
    `;
    
    try {
        const lines = result.split('\n').filter(line => line.trim());
        let totalScore = 0;
        let scores = {
            '教学目标的清晰度': 0,
            '教学步骤的逻辑性': 0,
            '时间分配的合理性': 0,
            '教学方法的创新性': 0
        };
        
        // 解析总分和各项得分
        lines.forEach(line => {
            if (line.startsWith('总体评分：')) {
                totalScore = parseInt(line.split('：')[1]) || 0;
            } else if (line.includes('分）：')) {
                const category = line.split('（')[0].trim();
                const score = parseInt(line.split('：')[1]) || 0;
                if (category.startsWith('-')) {
                    // 处理带有'-'前缀的类别
                    const cleanCategory = category.substring(1).trim();
                    scores[cleanCategory] = score;
                } else {
                    scores[category] = score;
                }
            }
        });
        
        // 添加评分展示部分
        formattedHtml += `
            <div class="score-section">
                <div class="score-circle">
                    <svg viewBox="0 0 100 100">
                        <circle class="background" cx="50" cy="50" r="45" />
                        <circle class="progress" cx="50" cy="50" r="45" 
                                stroke-dasharray="${totalScore * 2.83}, 283" />
                    </svg>
                    <div class="score-value">${totalScore}</div>
                </div>
                <div class="score-details">
                    ${Object.entries(scores)
                        .filter(([category]) => !category.startsWith('-'))  // 过滤掉重复的条目
                        .map(([category, score]) => `
                            <div class="score-item">
                                <span class="score-item-label">${category}</span>
                                <span class="score-item-value">${score}/25</span>
                            </div>
                        `).join('')}
                </div>
            </div>
        `;
        
        let currentSection = '';
        
        lines.forEach(line => {
            line = line.trim();
            
            if (line.startsWith('1.') || line.startsWith('2.') || 
                line.startsWith('3.') || line.startsWith('4.')) {
                // 主要分析点
                formattedHtml += `
                    <div class="analysis-main-section">
                        <h3>${line}</h3>
                    </div>
                `;
            } else if (line.startsWith('现状：')) {
                formattedHtml += `
                    <div class="status-section">
                        <span class="label status-label">现状</span>
                        <p class="analysis-text">${line.replace('现状：', '')}</p>
                    </div>
                `;
            } else if (line.startsWith('建议：')) {
                formattedHtml += `
                    <div class="suggestion-section">
                        <span class="label suggestion-label">建议</span>
                        <p class="analysis-text">${line.replace('建议：', '')}</p>
                    </div>
                `;
            } else if (line.startsWith('5.')) {
                formattedHtml += `
                    <div class="section-divider"></div>
                    <div class="analysis-main-section">
                        <h3>${line}</h3>
                    </div>
                `;
            } else if (line.startsWith('需要修改的步骤：')) {
                formattedHtml += `
                    <div class="modification-card">
                        <div class="modification-step">
                            <span class="modification-step-label">需要修改的步骤</span>
                            <div class="modification-content">
                                ${line.replace('需要修改的步骤：', '')}
                            </div>
                        </div>
                `;
            } else if (line.startsWith('修改建议：')) {
                formattedHtml += `
                    <div class="modification-suggestion">
                        <span class="modification-suggestion-label">修改建议</span>
                        <div class="modification-suggestion-content">
                            ${line.replace('修改建议：', '')}
                        </div>
                    </div>
                `;
            } else if (line.startsWith('修改理由：')) {
                formattedHtml += `
                    <div class="modification-reason">
                        <span class="modification-reason-label">修改理由</span>
                        <div class="modification-reason-content">
                            ${line.replace('修改理由：', '')}
                        </div>
                    </div>
                </div>
                `;
            } else if (line) {
                formattedHtml += `<p class="analysis-text">${line}</p>`;
            }
        });
        
        formattedHtml += '</div></div>';
        
    } catch (error) {
        console.error('Error formatting analysis result:', error);
        formattedHtml = `
            <div class="result-container">
                <div class="result-header">
                    <h3>分析结果</h3>
                </div>
                <div class="analysis-content">
                    <p class="analysis-text">${result}</p>
                </div>
            </div>
        `;
    }
    
    resultDiv.innerHTML = formattedHtml;
}

function generateModificationCards(modifications) {
    return modifications.map(mod => `
        <div class="analysis-card">
            <div class="modification-flow">
                <div class="flow-item flow-original">
                    ${mod.original}
                </div>
                <div class="flow-arrow">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14m-4-4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div class="flow-item flow-modified">
                    ${mod.modified}
                </div>
            </div>
            <div class="reason-box">
                ${mod.reason}
            </div>
        </div>
    `).join('');
}

async function showPdfPreview(file) {
    // 显示PDF预览区域
    const previewSection = document.getElementById('pdfPreviewSection');
    previewSection.classList.remove('hidden');
    
    // 显示PDF内容
    await displayPDF(file);
}

async function displayPDF(file) {
    const canvas = document.getElementById('pdfViewer');
    const ctx = canvas.getContext('2d');
    
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const page = await pdf.getPage(1);
        
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({
            canvasContext: ctx,
            viewport: viewport
        }).promise;
    } catch (error) {
        console.error('Error displaying PDF:', error);
    }
}

async function handleFileUpload(file) {
    if (!file || file.type !== 'application/pdf') {
        alert('请上传PDF文件');
        return;
    }

    const uploadBox = document.getElementById('dropZone');
    const uploadIcon = document.getElementById('uploadIcon');
    const successIcon = document.getElementById('successIcon');
    const progressCircle = document.getElementById('progressCircle');
    const uploadText = document.getElementById('uploadText');
    const analyzeBtn = document.getElementById('analyzeBtn');

    // 确保按钮一开始是隐藏的
    analyzeBtn.classList.add('hidden');
    analyzeBtn.classList.remove('show');

    // 开始上传动画
    uploadIcon.classList.add('hidden');
    progressCircle.classList.remove('hidden');
    uploadBox.classList.add('uploading');
    uploadText.textContent = '正在上传...';

    // 模拟上传进度
    const circle = progressCircle.querySelector('circle');
    circle.style.animation = 'progress 1s linear forwards';

    try {
        // 等待动画完成
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 显示成功图标
        progressCircle.classList.add('hidden');
        successIcon.classList.remove('hidden');
        successIcon.classList.add('show');
        uploadText.textContent = '上传成功';
        
        // 显示预览
        await showPdfPreview(file);
        
        // 显示并启用分析按钮（添加延迟和动画）
        await new Promise(resolve => setTimeout(resolve, 500));
        analyzeBtn.classList.remove('hidden');
        // 强制重绘
        analyzeBtn.offsetHeight;
        analyzeBtn.classList.add('show');
        analyzeBtn.disabled = false;

    } catch (error) {
        console.error('Error handling file:', error);
        alert('文件处理失败，请重试');
        
        // 重置上传区域
        resetUploadArea();
    }
}

function resetUploadArea() {
    const uploadIcon = document.getElementById('uploadIcon');
    const successIcon = document.getElementById('successIcon');
    const progressCircle = document.getElementById('progressCircle');
    const uploadText = document.getElementById('uploadText');
    const uploadBox = document.getElementById('dropZone');
    const analyzeBtn = document.getElementById('analyzeBtn');

    uploadIcon.classList.remove('hidden');
    successIcon.classList.add('hidden');
    successIcon.classList.remove('show');
    progressCircle.classList.add('hidden');
    uploadBox.classList.remove('uploading');
    uploadText.textContent = '拖拽PDF文件到这里或 选择文件';
    
    // 隐藏并禁用分析按钮
    analyzeBtn.classList.add('hidden');
    analyzeBtn.classList.remove('show');
    analyzeBtn.disabled = true;

    const circle = progressCircle.querySelector('circle');
    circle.style.animation = 'none';
} 