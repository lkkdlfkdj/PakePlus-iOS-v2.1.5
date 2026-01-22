// DOM 元素
const locationInput = document.getElementById('location');
const getLocationBtn = document.getElementById('get-location');
const reportForm = document.getElementById('report-form');
const successModal = document.getElementById('success-modal');
const closeModalBtn = document.getElementById('close-modal');
const photoInputs = document.querySelectorAll('.photo-input');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 绑定获取位置按钮事件
    getLocationBtn.addEventListener('click', getLocation);
    
    // 绑定照片上传事件
    photoInputs.forEach(input => {
        input.addEventListener('change', handlePhotoUpload);
    });
    
    // 绑定表单提交事件
    reportForm.addEventListener('submit', handleFormSubmit);
    
    // 绑定关闭模态框事件
    closeModalBtn.addEventListener('click', closeModal);
});

// 获取位置
function getLocation() {
    if (navigator.geolocation) {
        getLocationBtn.textContent = '定位中...';
        getLocationBtn.disabled = true;
        getLocationBtn.classList.add('loading');
        
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                
                // 通过逆地理编码获取地址
                getAddressFromCoords(latitude, longitude);
            },
            function(error) {
                console.error('定位失败:', error);
                locationInput.value = '定位失败，请手动输入';
                getLocationBtn.textContent = '获取位置';
                getLocationBtn.disabled = false;
                getLocationBtn.classList.remove('loading');
            }
        );
    } else {
        locationInput.value = '浏览器不支持定位';
    }
}

// 通过坐标获取地址
function getAddressFromCoords(latitude, longitude) {
    // 使用高德地图 API 进行逆地理编码
    const apiKey = '您的高德地图API密钥'; // 请替换为实际的API密钥
    const url = `https://restapi.amap.com/v3/geocode/regeo?key=${apiKey}&location=${longitude},${latitude}&extensions=base`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.status === '1') {
                locationInput.value = data.regeocode.formatted_address;
            } else {
                locationInput.value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            }
        })
        .catch(error => {
            console.error('获取地址失败:', error);
            locationInput.value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        })
        .finally(() => {
            getLocationBtn.textContent = '获取位置';
            getLocationBtn.disabled = false;
            getLocationBtn.classList.remove('loading');
        });
}

// 处理照片上传
function handlePhotoUpload(e) {
    const input = e.target;
    const previewContainer = input.nextElementSibling;
    const files = input.files;
    
    // 清空预览容器
    previewContainer.innerHTML = '';
    
    // 预览照片
    if (files.length > 0) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = '预览照片';
                    previewContainer.appendChild(img);
                };
                
                reader.readAsDataURL(file);
            }
        });
    }
}

// 处理表单提交
function handleFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = e.submitter;
    const originalText = submitBtn.textContent;
    
    // 添加加载状态
    submitBtn.textContent = '提交中...';
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    
    // 收集表单数据
    const formData = new FormData(reportForm);
    const data = Object.fromEntries(formData.entries());
    
    // 获取照片预览
    const photoPreviews = [];
    document.querySelectorAll('.photo-preview img').forEach(img => {
        photoPreviews.push(img.src);
    });
    
    // 模拟提交到服务器
    console.log('表单数据:', data);
    
    // 模拟网络延迟
    setTimeout(() => {
        // 显示成功提示
        showSuccessModal();
        
        // 导出工作汇报为图片
        exportReportAsImage(data, photoPreviews);
        
        // 重置表单
        reportForm.reset();
        
        // 清空照片预览
        document.querySelectorAll('.photo-preview').forEach(container => {
            container.innerHTML = '';
        });
        
        // 恢复按钮状态
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }, 1000);
}

// 显示成功模态框
function showSuccessModal() {
    successModal.classList.add('show');
}

// 关闭模态框
function closeModal() {
    successModal.classList.remove('show');
}

// 导出工作汇报为图片
function exportReportAsImage(data, photoPreviews) {
    // 创建临时报告容器
    const reportContainer = document.createElement('div');
    reportContainer.style.position = 'fixed';
    reportContainer.style.top = '-9999px';
    reportContainer.style.left = '-9999px';
    reportContainer.style.width = '800px';
    reportContainer.style.backgroundColor = '#fff';
    reportContainer.style.padding = '30px';
    reportContainer.style.borderRadius = '10px';
    reportContainer.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    
    // 生成报告内容
    const now = new Date();
    const reportDate = now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日 ' + 
                      now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
    
    reportContainer.innerHTML = `
        <div class="report-header" style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #3b82f6;">
            <h1 style="color: #3b82f6; font-size: 24px; margin-bottom: 10px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">隐患上报工作汇报</h1>
            <div class="report-info" style="font-size: 14px; color: #666;">
                <p>生成时间：${reportDate}</p>
            </div>
        </div>
        
        <div class="report-section" style="margin-bottom: 25px;">
            <h2 style="font-size: 18px; color: #3b82f6; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">1. 基本信息</h2>
            <div class="report-item" style="margin-bottom: 10px; display: flex;">
                <div class="report-item-label" style="width: 120px; font-weight: 500; color: #555; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">隐患位置：</div>
                <div class="report-item-value" style="flex: 1; color: #333; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">${data.location || '未填写'}</div>
            </div>
            <div class="report-item" style="margin-bottom: 10px; display: flex;">
                <div class="report-item-label" style="width: 120px; font-weight: 500; color: #555; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">权属类别：</div>
                <div class="report-item-value" style="flex: 1; color: #333; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">${data.ownership || '未选择'}</div>
            </div>
            <div class="report-item" style="margin-bottom: 10px; display: flex;">
                <div class="report-item-label" style="width: 120px; font-weight: 500; color: #555; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">隐患类型：</div>
                <div class="report-item-value" style="flex: 1; color: #333; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">${data['hazard-type'] || '未选择'}</div>
            </div>
        </div>
        
        <div class="report-section" style="margin-bottom: 25px;">
            <h2 style="font-size: 18px; color: #3b82f6; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">2. 隐患详情</h2>
            <div class="report-item" style="margin-bottom: 10px; display: flex;">
                <div class="report-item-label" style="width: 120px; font-weight: 500; color: #555; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">具体说明：</div>
                <div class="report-item-value" style="flex: 1; color: #333; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">${data['hazard-description'] || '无'}</div>
            </div>
        </div>
        
        ${photoPreviews.length > 0 ? `
        <div class="report-section" style="margin-bottom: 25px;">
            <h2 style="font-size: 18px; color: #3b82f6; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">3. 现场照片</h2>
            <div class="photos-container" style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 10px;">
                ${photoPreviews.map(photo => `
                    <div class="photo-item" style="max-width: 200px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                        <img src="${photo}" alt="现场照片" style="width: 100%; height: auto; display: block;">
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        <div class="report-footer" style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #666; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <p>本报告由隐患上报系统自动生成</p>
            <p>© 2026 隐患上报系统</p>
        </div>
    `;
    
    // 添加到文档
    document.body.appendChild(reportContainer);
    
    // 使用html2canvas将报告转换为图片
    html2canvas(reportContainer, {
        scale: 2, // 提高图片清晰度
        useCORS: true, // 允许加载跨域图片
        logging: false,
        backgroundColor: '#ffffff'
    }).then(canvas => {
        // 创建下载链接
        const link = document.createElement('a');
        link.download = `隐患上报工作汇报_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        // 清理临时容器
        document.body.removeChild(reportContainer);
        
        // 显示导出成功提示
        setTimeout(() => {
            alert('工作汇报已成功导出为图片！');
        }, 500);
    }).catch(error => {
        console.error('导出失败:', error);
        alert('导出失败，请重试');
        
        // 清理临时容器
        document.body.removeChild(reportContainer);
    });
}