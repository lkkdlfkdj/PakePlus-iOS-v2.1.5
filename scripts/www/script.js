// API配置
const API_BASE_URL = '/api';

// 数据存储
let attendanceData = {
    overtime: [],
    compensatory: [],
    leave: []
};

// 时间段映射
const timeSlotMap = {
    overtime: {
        morning: '上午8:00-12:00',
        afternoon: '下午14:00-18:00',
        evening: '晚上19:00-23:00'
    },
    compensatory: {
        morning: '上午7:00-11:00',
        afternoon: '下午14:30-17:30'
    },
    leave: {
        morning: '上午7:00-11:00',
        afternoon: '下午14:30-17:30'
    }
};

// 班次时间段映射
const shiftTimeMap = {
    'A14': '07:30-11:30',
    'A16': '上午07:00-11:00 下午14:30-17:30',
    'A17': '上午08:30-12:30 下午15:00-18:00',
    'A18': '11:00-19:00',
    'A19': '上午07:00-11:00 下午19:00-22:00',
    'A2': '上午07:30-11:30 下午14:30-17:30',
    'A20': '07:00-11:00',
    'A21': '上午07:00-11:00 下午16:00-19:00',
    'A22': '上午14:30-17:30 下午19:00-23:00',
    'A23': '19:00-23:00',
    'A27': '08:00-12:00',
    'A30': '上午08:30-12:30 下午14:30-17:30',
    'A31': '01:00-07:00',
    'A32': '上午08:30-12:30 下午19:00-22:00',
    'A35': '20:00-次日03:00',
    'A37': '07:00-14:00',
    'A39': '上午08:00-12:00 下午15:00-18:00 晚上19:00-23:00',
    'A40': '上午08:00-12:00 下午14:30-17:30 晚上19:00-23:00',
    'A46': '上午08:00-12:00 下午19:00-22:00',
    'A47': '14:30-17:30',
    'A48': '上午08:00-12:00 下午15:00-18:00',
    'A49': '14:00-18:00',
    'A50': '上午07:30-12:00 下午19:00-23:00',
    'A51': '上午07:00-11:00 下午19:00-23:00',
    'A52': '上午09:00-12:30 下午15:45-19:30',
    'A53': '上午12:15-16:00 下午19:15-22:45',
    'A54': '09:00-16:00',
    'A55': '15:45-22:45',
    'A56': '上午08:00-12:00 下午19:00-23:00',
    'A57': '16:00-23:00',
    'A58': '上午08:30-11:30 下午19:00-23:00',
    'A59': '上午15:00-18:00 下午19:00-23:00',
    'A65': '上午07:00-11:00 下午15:00-18:00',
    'A66': '上午07:30-11:30 下午15:00-18:00',
    'A69': '15:00-18:00',
    'A7': '上午07:00-11:00 下午14:30-17:30',
    'A71': '07:00-12:00',
    'A74': '07:30-12:00',
    'A8': '上午08:00-12:00 下午14:30-17:30'
};

// 队伍和组映射
const teamMap = {
    'law1': '执法一中队',
    'law2': '执法二中队',
    'law3': '执法三中队',
    'law4': '执法四中队'
};

const groupMap = {
    'jiaonan1': '蕉南一组',
    'jiaonan2': '蕉南二组',
    'jiaonan3': '蕉南三组',
    'jiaonan4': '蕉南四组'
};

// 万年历当前显示的年月
let currentCalendarDate = new Date();

// 锁定状态
let lockStates = {
    team: false,
    group: false,
    shift: false
};

// 原因映射
const reasonMap = {
    overtime: {
        saturday: '周六加班',
        weekend: '周末加班',
        city: '创城加班'
    },
    leave: {
        personal: '事假',
        sick: '病假'
    }
};

// API调用辅助函数
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('API调用失败:', error);
        throw error;
    }
}

// 加载数据
async function loadData() {
    try {
        showLoading('正在加载数据...');
        const response = await apiCall('/attendance/all');
        
        if (response.success) {
            attendanceData = response.data;
            console.log('数据加载成功:', attendanceData);
        } else {
            throw new Error(response.error || '加载数据失败');
        }
    } catch (error) {
        console.error('加载数据失败:', error);
        // 如果API调用失败，尝试从localStorage加载
        const saved = localStorage.getItem('attendanceData');
        if (saved) {
            attendanceData = JSON.parse(saved);
            console.log('从本地存储加载数据');
        } else {
            alert('加载数据失败: ' + error.message);
        }
    } finally {
        hideLoading();
    }
}

// 保存数据到后端
async function saveData() {
    // 同时保存到localStorage作为备份
    localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
}

// 显示加载状态
function showLoading(message = '加载中...') {
    let loadingDiv = document.getElementById('loading');
    if (!loadingDiv) {
        loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading';
        loadingDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            color: white;
            font-size: 16px;
        `;
        document.body.appendChild(loadingDiv);
    }
    loadingDiv.textContent = message;
    loadingDiv.style.display = 'flex';
}

// 隐藏加载状态
function hideLoading() {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) {
        loadingDiv.style.display = 'none';
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', async function() {
    // 初始化标签页系统
    initTabSystem();
    
    await loadData();
    updateRelatedOvertimeOptions();
    updateStatistics();
    updateHistoryView();
    checkExpirationWarnings();
    updateExportYearOptions();
    initCalendar();
    updateFieldOptions();
    
    // 绑定表单事件
    document.getElementById('overtimeForm').addEventListener('submit', handleOvertimeSubmit);
    document.getElementById('compensatoryForm').addEventListener('submit', handleCompensatorySubmit);
    document.getElementById('leaveForm').addEventListener('submit', handleLeaveSubmit);
    
    // 绑定自定义原因显示/隐藏
    document.getElementById('overtimeReason').addEventListener('change', toggleCustomReason);
    document.getElementById('leaveReason').addEventListener('change', toggleCustomLeaveReason);
    
    // 绑定自定义时间段显示/隐藏
    document.getElementById('overtimeTimeSlot').addEventListener('change', toggleCustomOvertimeTimeSlot);
    document.getElementById('leaveTimeSlot').addEventListener('change', toggleCustomLeaveTimeSlot);
    
    // 绑定班次选择变化
    document.getElementById('shiftSchedule').addEventListener('change', updateTimeSlotByShift);
    
    // 绑定万年历导航
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderCalendar();
    });
    
    document.getElementById('nextMonth').addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderCalendar();
    });
});

// 初始化标签页系统
function initTabSystem() {
    // 确保默认显示第一个标签页
    const firstTab = document.querySelector('.tab-content');
    if (firstTab) {
        firstTab.classList.add('active');
    }
    
    // 为所有标签按钮添加点击事件监听器（备用方案）
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const tabName = this.getAttribute('data-tab') || getTabNameFromButton(this);
            if (tabName) {
                showTab(tabName, this);
            }
        });
    });
}

// 从按钮获取标签页名称的辅助函数
function getTabNameFromButton(button) {
    const text = button.querySelector('.tab-text').textContent;
    const tabMap = {
        '加班': 'overtime',
        '补休': 'compensatory',
        '请假': 'leave',
        '历史': 'history',
        '导出': 'export'
    };
    return tabMap[text] || null;
}

// 标签页切换
function showTab(tabName, buttonElement) {
    console.log(`尝试切换到标签页: ${tabName}`);
    
    try {
        // 隐藏所有标签页内容
        const tabContents = document.querySelectorAll('.tab-content');
        console.log(`找到 ${tabContents.length} 个标签页内容`);
        tabContents.forEach(content => content.classList.remove('active'));
        
        // 移除所有按钮的活动状态
        const tabButtons = document.querySelectorAll('.tab-button');
        console.log(`找到 ${tabButtons.length} 个标签按钮`);
        tabButtons.forEach(button => button.classList.remove('active'));
        
        // 显示选中的标签页
        const targetTab = document.getElementById(tabName);
        if (targetTab) {
            targetTab.classList.add('active');
            console.log(`成功显示标签页: ${tabName}`);
        } else {
            console.error(`找不到标签页元素: ${tabName}`);
            return;
        }
        
        // 激活点击的按钮
        if (buttonElement) {
            buttonElement.classList.add('active');
            console.log('成功激活按钮');
        } else {
            // 如果没有传入按钮元素，尝试通过事件获取
            try {
                const clickedButton = event ? event.target.closest('.tab-button') : null;
                if (clickedButton) {
                    clickedButton.classList.add('active');
                    console.log('通过事件获取并激活按钮');
                } else {
                    console.warn('无法找到要激活的按钮');
                }
            } catch (e) {
                console.warn('获取事件按钮时出错:', e);
            }
        }
        
        // 延迟执行特定标签页的初始化逻辑，避免阻塞切换
        setTimeout(() => {
            try {
                // 如果切换到历史视图，更新数据
                if (tabName === 'history') {
                    console.log('切换到历史标签页，更新数据');
                    if (typeof updateStatistics === 'function') updateStatistics();
                    if (typeof updateHistoryView === 'function') updateHistoryView();
                    if (typeof checkExpirationWarnings === 'function') checkExpirationWarnings();
                    if (typeof renderCalendar === 'function') renderCalendar();
                }
                
                // 如果切换到补休，更新关联加班选项
                if (tabName === 'compensatory') {
                    console.log('切换到补休标签页，更新选项');
                    if (typeof updateRelatedOvertimeOptions === 'function') updateRelatedOvertimeOptions();
                    if (typeof updateTimeSlotByShift === 'function') updateTimeSlotByShift();
                }
                
                // 如果切换到导出，更新年份选项
                if (tabName === 'export') {
                    console.log('切换到导出标签页，更新选项');
                    if (typeof updateExportYearOptions === 'function') updateExportYearOptions();
                }
            } catch (e) {
                console.error('执行标签页特定逻辑时出错:', e);
            }
        }, 100);
        
    } catch (error) {
        console.error('切换标签页时出错:', error);
    }
}

// 处理加班申请提交
async function handleOvertimeSubmit(e) {
    e.preventDefault();
    
    const date = document.getElementById('overtimeDate').value;
    const timeSlot = document.getElementById('overtimeTimeSlot').value;
    const customTimeSlot = document.getElementById('customOvertimeTimeText').value;
    const reason = document.getElementById('overtimeReason').value;
    const customReason = document.getElementById('customOvertimeText').value;
    
    if (!date || !timeSlot || !reason) {
        alert('请填写完整信息');
        return;
    }
    
    if (reason === 'custom' && !customReason) {
        alert('请填写自定义原因');
        return;
    }
    
    if (timeSlot === 'custom' && !customTimeSlot) {
        alert('请填写自定义时间段');
        return;
    }
    
    // 获取时间段文本
    let timeSlotText;
    if (timeSlot === 'custom') {
        timeSlotText = customTimeSlot;
    } else {
        timeSlotText = timeSlotMap.overtime[timeSlot];
    }
    
    const requestData = {
        date: date,
        timeSlot: timeSlot,
        timeSlotText: timeSlotText,
        reason: reason === 'custom' ? customReason : reasonMap.overtime[reason]
    };
    
    try {
        showLoading('正在提交加班申请...');
        const response = await apiCall('/attendance/overtime', {
            method: 'POST',
            body: JSON.stringify(requestData)
        });
        
        if (response.success) {
            // 更新本地数据
            attendanceData.overtime.push(response.data);
            saveData();
            
            // 重置表单
            document.getElementById('overtimeForm').reset();
            document.getElementById('customOvertimeReason').style.display = 'none';
            document.getElementById('customOvertimeTimeSlot').style.display = 'none';
            
            alert('加班申请提交成功！');
            updateRelatedOvertimeOptions();
        } else {
            throw new Error(response.error || '提交失败');
        }
    } catch (error) {
        console.error('提交加班申请失败:', error);
        alert('提交失败: ' + error.message);
    } finally {
        hideLoading();
    }
}

// 处理补休申请提交
async function handleCompensatorySubmit(e) {
    e.preventDefault();
    
    const date = document.getElementById('compensatoryDate').value;
    const team = document.getElementById('attendanceTeam').value;
    const group = document.getElementById('attendanceGroup').value;
    const shift = document.getElementById('shiftSchedule').value;
    const timeSlot = document.getElementById('compensatoryTimeSlot').value;
    const relatedOvertimeId = document.getElementById('relatedOvertime').value;
    
    if (!date || !team || !group || !shift || !timeSlot || !relatedOvertimeId) {
        alert('请填写完整信息');
        return;
    }
    
    // 找到关联的加班记录
    const relatedOvertime = attendanceData.overtime.find(item => item.id == relatedOvertimeId);
    if (!relatedOvertime) {
        alert('关联的加班记录不存在');
        return;
    }
    
    // 获取时间段文本
    const timeSlotElement = document.getElementById('compensatoryTimeSlot');
    const timeSlotText = timeSlotElement.options[timeSlotElement.selectedIndex].text;
    
    const requestData = {
        date: date,
        team: team,
        teamText: teamMap[team],
        group: group,
        groupText: groupMap[group],
        shift: shift,
        shiftText: shiftTimeMap[shift],
        timeSlot: timeSlot,
        timeSlotText: timeSlotText,
        relatedOvertimeId: parseInt(relatedOvertimeId),
        relatedOvertimeDate: relatedOvertime.date,
        relatedOvertimeTimeSlot: relatedOvertime.timeSlotText,
        relatedOvertimeReason: relatedOvertime.reason
    };
    
    try {
        showLoading('正在提交补休申请...');
        const response = await apiCall('/attendance/compensatory', {
            method: 'POST',
            body: JSON.stringify(requestData)
        });
        
        if (response.success) {
            // 更新本地数据
            attendanceData.compensatory.push(response.data);
            // 标记加班记录为已使用
            const overtimeRecord = attendanceData.overtime.find(item => item.id == relatedOvertimeId);
            if (overtimeRecord) {
                overtimeRecord.isUsed = true;
            }
            saveData();
            
            // 提交后锁定队伍和组，但不锁定班次和时间段
            lockStates.team = true;
            lockStates.group = true;
            lockStates.shift = false;
            updateLockButtons();
            
            // 重置日期、时间段和关联加班记录，但保持班次选择
            document.getElementById('compensatoryDate').value = '';
            document.getElementById('relatedOvertime').value = '';
            updateTimeSlotByShift();
            
            alert('补休申请提交成功！');
            updateRelatedOvertimeOptions();
        } else {
            throw new Error(response.error || '提交失败');
        }
    } catch (error) {
        console.error('提交补休申请失败:', error);
        alert('提交失败: ' + error.message);
    } finally {
        hideLoading();
    }
}

// 处理请假申请提交
async function handleLeaveSubmit(e) {
    e.preventDefault();
    
    const date = document.getElementById('leaveDate').value;
    const timeSlot = document.getElementById('leaveTimeSlot').value;
    const customTimeSlot = document.getElementById('customLeaveTimeText').value;
    const reason = document.getElementById('leaveReason').value;
    const customReason = document.getElementById('customLeaveText').value;
    
    if (!date || !timeSlot || !reason) {
        alert('请填写完整信息');
        return;
    }
    
    if (reason === 'custom' && !customReason) {
        alert('请填写自定义原因');
        return;
    }
    
    if (timeSlot === 'custom' && !customTimeSlot) {
        alert('请填写自定义时间段');
        return;
    }
    
    // 获取时间段文本
    let timeSlotText;
    if (timeSlot === 'custom') {
        timeSlotText = customTimeSlot;
    } else {
        timeSlotText = timeSlotMap.leave[timeSlot];
    }
    
    const requestData = {
        date: date,
        timeSlot: timeSlot,
        timeSlotText: timeSlotText,
        reason: reason === 'custom' ? customReason : reasonMap.leave[reason]
    };
    
    try {
        showLoading('正在提交请假申请...');
        const response = await apiCall('/attendance/leave', {
            method: 'POST',
            body: JSON.stringify(requestData)
        });
        
        if (response.success) {
            // 更新本地数据
            attendanceData.leave.push(response.data);
            saveData();
            
            // 重置表单
            document.getElementById('leaveForm').reset();
            document.getElementById('customLeaveReason').style.display = 'none';
            document.getElementById('customLeaveTimeSlot').style.display = 'none';
            
            alert('请假申请提交成功！');
        } else {
            throw new Error(response.error || '提交失败');
        }
    } catch (error) {
        console.error('提交请假申请失败:', error);
        alert('提交失败: ' + error.message);
    } finally {
        hideLoading();
    }
}
// 切换自定义原因显示
function toggleCustomReason() {
    const reason = document.getElementById('overtimeReason').value;
    const customDiv = document.getElementById('customOvertimeReason');
    customDiv.style.display = reason === 'custom' ? 'block' : 'none';
}

function toggleCustomLeaveReason() {
    const reason = document.getElementById('leaveReason').value;
    const customDiv = document.getElementById('customLeaveReason');
    customDiv.style.display = reason === 'custom' ? 'block' : 'none';
}

// 切换自定义时间段显示
function toggleCustomOvertimeTimeSlot() {
    const timeSlot = document.getElementById('overtimeTimeSlot').value;
    const customDiv = document.getElementById('customOvertimeTimeSlot');
    customDiv.style.display = timeSlot === 'custom' ? 'block' : 'none';
}

function toggleCustomLeaveTimeSlot() {
    const timeSlot = document.getElementById('leaveTimeSlot').value;
    const customDiv = document.getElementById('customLeaveTimeSlot');
    customDiv.style.display = timeSlot === 'custom' ? 'block' : 'none';
}

// 更新关联加班选项
function updateRelatedOvertimeOptions() {
    const select = document.getElementById('relatedOvertime');
    select.innerHTML = '<option value="">请选择关联的加班记录</option>';
    
    // 只显示未使用的加班记录
    const availableOvertime = attendanceData.overtime.filter(item => !item.isUsed);
    
    availableOvertime.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = `${item.date} ${item.timeSlotText} (${item.reason})`;
        select.appendChild(option);
    });
}

// 更新统计信息
function updateStatistics() {
    const totalOvertime = attendanceData.overtime.length;
    const totalCompensatory = attendanceData.compensatory.length;
    const remainingCount = totalOvertime - totalCompensatory;
    
    document.getElementById('totalOvertime').textContent = totalOvertime;
    document.getElementById('totalCompensatory').textContent = totalCompensatory;
    document.getElementById('remainingCount').textContent = remainingCount;
}

// 更新历史视图
function updateHistoryView() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    
    // 合并所有记录并按日期排序
    const allRecords = [
        ...attendanceData.overtime.map(item => ({...item, type: 'overtime'})),
        ...attendanceData.compensatory.map(item => ({...item, type: 'compensatory'})),
        ...attendanceData.leave.map(item => ({...item, type: 'leave'}))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    allRecords.forEach(record => {
        const div = document.createElement('div');
        div.className = `history-item ${record.type}`;
        
        let content = '';
        switch (record.type) {
            case 'overtime':
                content = `
                    <h4>加班记录</h4>
                    <p>日期: ${record.date}</p>
                    <p>时间段: ${record.timeSlotText}</p>
                    <p>原因: ${record.reason}</p>
                    <p>状态: ${record.isUsed ? '已补休' : '未补休'}</p>
                `;
                break;
            case 'compensatory':
                content = `
                    <h4>补休记录</h4>
                    <p>日期: ${record.date}</p>
                    <p>考勤队伍: ${record.teamText}</p>
                    <p>考勤组: ${record.groupText}</p>
                    <p>班次: ${record.shift} (${record.shiftText})</p>
                    <p>时间段: ${record.timeSlotText}</p>
                    <p>关联加班: ${record.relatedOvertimeDate} ${record.relatedOvertimeTimeSlot}</p>
                    <p>加班原因: ${record.relatedOvertimeReason}</p>
                `;
                break;
            case 'leave':
                content = `
                    <h4>请假记录</h4>
                    <p>日期: ${record.date}</p>
                    <p>时间段: ${record.timeSlotText}</p>
                    <p>原因: ${record.reason}</p>
                `;
                break;
        }
        
        div.innerHTML = content;
        historyList.appendChild(div);
    });
}

// 班次选择变化时更新时间段
function updateTimeSlotByShift() {
    const shift = document.getElementById('shiftSchedule').value;
    const timeSlotSelect = document.getElementById('compensatoryTimeSlot');
    
    // 保存当前选择的时间段值
    const currentValue = timeSlotSelect.value;
    
    // 清空时间段选项
    timeSlotSelect.innerHTML = '<option value="">请先选择班次</option>';
    
    if (shift && shiftTimeMap[shift]) {
        const shiftTime = shiftTimeMap[shift];
        
        // 解析班次时间并创建选项
        const timePeriods = parseShiftTime(shiftTime);
        
        timePeriods.forEach((period, index) => {
            const option = document.createElement('option');
            option.value = `period_${index}`;
            option.textContent = period;
            timeSlotSelect.appendChild(option);
        });
        
        // 尝试恢复之前的选择（如果新的选项中存在相同的值）
        if (currentValue && timeSlotSelect.querySelector(`option[value="${currentValue}"]`)) {
            timeSlotSelect.value = currentValue;
        }
    }
}

// 解析班次时间为具体的时间段
function parseShiftTime(timeString) {
    const periods = [];
    
    if (timeString.includes('上午') && timeString.includes('下午')) {
        // 包含上午和下午的班次
        const parts = timeString.split(' ');
        parts.forEach(part => {
            if (part.includes('上午')) {
                const time = part.replace('上午', '');
                periods.push(`上午 ${time}`);
            } else if (part.includes('下午')) {
                const time = part.replace('下午', '');
                periods.push(`下午 ${time}`);
            } else if (part.includes('晚上')) {
                const time = part.replace('晚上', '');
                periods.push(`晚上 ${time}`);
            }
        });
    } else if (timeString.includes('上午')) {
        // 只有上午的班次
        const time = timeString.replace('上午', '');
        periods.push(`上午 ${time}`);
    } else if (timeString.includes('下午')) {
        // 只有下午的班次
        const time = timeString.replace('下午', '');
        periods.push(`下午 ${time}`);
    } else if (timeString.includes('晚上')) {
        // 只有晚上的班次
        const time = timeString.replace('晚上', '');
        periods.push(`晚上 ${time}`);
    } else {
        // 其他格式的时间，直接使用原始时间
        periods.push(timeString);
    }
    
    return periods;
}

// 锁定按钮功能
function toggleTeamLock() {
    lockStates.team = !lockStates.team;
    updateLockButtons();
}

function toggleGroupLock() {
    lockStates.group = !lockStates.group;
    updateLockButtons();
}

function toggleShiftLock() {
    lockStates.shift = !lockStates.shift;
    updateLockButtons();
    updateTimeSlotByShift();
}

// 取消所有锁定的函数
function unlockAll() {
    lockStates.team = false;
    lockStates.group = false;
    lockStates.shift = false;
    updateLockButtons();
    updateTimeSlotByShift();
    alert('已取消所有锁定状态');
}

function updateLockButtons() {
    const teamSelect = document.getElementById('attendanceTeam');
    const groupSelect = document.getElementById('attendanceGroup');
    const shiftSelect = document.getElementById('shiftSchedule');
    const timeSlotSelect = document.getElementById('compensatoryTimeSlot');
    
    const teamModifyBtn = document.getElementById('teamModifyBtn');
    const teamFixBtn = document.getElementById('teamFixBtn');
    const groupModifyBtn = document.getElementById('groupModifyBtn');
    const groupFixBtn = document.getElementById('groupFixBtn');
    const shiftModifyBtn = document.getElementById('shiftModifyBtn');
    const shiftFixBtn = document.getElementById('shiftFixBtn');
    
    // 更新队伍锁定状态
    if (lockStates.team) {
        teamSelect.disabled = true;
        teamModifyBtn.style.display = 'none';
        teamFixBtn.style.display = 'flex';
        teamFixBtn.classList.add('fixed');
    } else {
        teamSelect.disabled = false;
        teamModifyBtn.style.display = 'flex';
        teamFixBtn.style.display = 'none';
        teamFixBtn.classList.remove('fixed');
    }
    
    // 更新组锁定状态
    if (lockStates.group) {
        groupSelect.disabled = true;
        groupModifyBtn.style.display = 'none';
        groupFixBtn.style.display = 'flex';
        groupFixBtn.classList.add('fixed');
    } else {
        groupSelect.disabled = false;
        groupModifyBtn.style.display = 'flex';
        groupFixBtn.style.display = 'none';
        groupFixBtn.classList.remove('fixed');
    }
    
    // 更新班次锁定状态
    if (lockStates.shift) {
        shiftSelect.disabled = true;
        timeSlotSelect.disabled = false;
        shiftModifyBtn.style.display = 'none';
        shiftFixBtn.style.display = 'flex';
        shiftFixBtn.classList.add('fixed');
    } else {
        shiftSelect.disabled = false;
        timeSlotSelect.disabled = false;
        shiftModifyBtn.style.display = 'flex';
        shiftFixBtn.style.display = 'none';
        shiftFixBtn.classList.remove('fixed');
    }
}

// 万年历功能
function initCalendar() {
    currentCalendarDate = new Date();
    renderCalendar();
}

function renderCalendar() {
    const calendar = document.getElementById('calendar');
    const currentMonth = document.getElementById('currentMonth');
    
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    // 更新月份标题
    currentMonth.textContent = `${year}年${month + 1}月`;
    
    // 清空日历
    calendar.innerHTML = '';
    
    // 添加星期标题
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    weekdays.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day calendar-day-header';
        dayHeader.textContent = day;
        calendar.appendChild(dayHeader);
    });
    
    // 获取当月第一天和最后一天
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    // 获取上个月的最后几天
    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    // 添加上个月的日期
    for (let i = firstDayWeek - 1; i >= 0; i--) {
        const dayElement = createCalendarDay(daysInPrevMonth - i, true, new Date(year, month - 1, daysInPrevMonth - i));
        calendar.appendChild(dayElement);
    }
    
    // 添加当月的日期
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = createCalendarDay(day, false, new Date(year, month, day));
        calendar.appendChild(dayElement);
    }
    
    // 添加下个月的日期
    const totalCells = calendar.children.length - 7; // 减去星期标题
    const remainingCells = 42 - totalCells; // 6行 * 7列 - 已有的格子
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createCalendarDay(day, true, new Date(year, month + 1, day));
        calendar.appendChild(dayElement);
    }
}

function createCalendarDay(day, isOtherMonth, date) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = day;
    
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }
    
    // 检查是否是今天
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
        dayElement.classList.add('today');
    }
    
    // 获取当天的事件 - 使用标准化的日期格式
    const dateString = date.getFullYear() + '-' + 
                      String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                      String(date.getDate()).padStart(2, '0');
    const events = getEventsForDate(dateString);
    
    if (events.length > 0) {
        dayElement.classList.add('has-events');
        dayElement.classList.add('clickable');
        
        // 添加点击事件
        dayElement.addEventListener('click', () => {
            showEventModal(dateString, events);
        });
        
        // 添加事件点
        const eventDots = document.createElement('div');
        eventDots.className = 'event-dots';
        
        events.forEach(event => {
            const dot = document.createElement('div');
            dot.className = `event-dot ${event.type}`;
            eventDots.appendChild(dot);
        });
        
        dayElement.appendChild(eventDots);
    }
    
    return dayElement;
}

function getEventsForDate(dateString) {
    const events = [];
    
    // 标准化日期格式，确保日期匹配的准确性
    const normalizeDate = (date) => {
        if (typeof date === 'string') {
            // 处理不同的日期格式
            const d = new Date(date + 'T00:00:00');
            return d.toISOString().split('T')[0];
        }
        return new Date(date).toISOString().split('T')[0];
    };
    
    const targetDate = normalizeDate(dateString);
    
    // 检查加班记录
    attendanceData.overtime.forEach(record => {
        const recordDate = normalizeDate(record.date);
        if (recordDate === targetDate) {
            events.push({ type: 'overtime', data: record });
        }
    });
    
    // 检查补休记录
    attendanceData.compensatory.forEach(record => {
        const recordDate = normalizeDate(record.date);
        if (recordDate === targetDate) {
            events.push({ type: 'compensatory', data: record });
        }
    });
    
    // 检查请假记录
    attendanceData.leave.forEach(record => {
        const recordDate = normalizeDate(record.date);
        if (recordDate === targetDate) {
            events.push({ type: 'leave', data: record });
        }
    });
    
    // 检查是否全部补休（如果某天有加班且已补休）
    const overtimeOnDate = attendanceData.overtime.filter(record => {
        const recordDate = normalizeDate(record.date);
        return recordDate === targetDate && record.isUsed;
    });
    if (overtimeOnDate.length > 0) {
        events.push({ type: 'full-compensatory', data: overtimeOnDate });
    }
    
    return events;
}

// 增强的过期提醒功能
function checkExpirationWarnings() {
    const warningDiv = document.getElementById('expirationWarning');
    const today = new Date();
    const warnings = [];
    
    attendanceData.overtime.forEach(record => {
        if (!record.isUsed) {
            const overtimeDate = new Date(record.date);
            const daysDiff = Math.floor((today - overtimeDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff >= 31) {
                warnings.push(`⚠️ 加班记录 ${record.date} ${record.timeSlotText} (${record.reason}) 已过期 ${daysDiff - 30} 天`);
            } else if (daysDiff >= 27) {
                const remainingDays = 30 - daysDiff;
                warnings.push(`🔔 加班记录 ${record.date} ${record.timeSlotText} (${record.reason}) 将在 ${remainingDays} 天后过期`);
            }
        }
    });
    
    if (warnings.length > 0) {
        warningDiv.innerHTML = warnings.join('<br>');
        warningDiv.style.display = 'block';
    } else {
        warningDiv.style.display = 'none';
    }
}

// 导出功能增强
function updateExportYearOptions() {
    const select = document.getElementById('exportYear');
    const years = new Set();
    
    // 收集所有记录中的年份
    [...attendanceData.overtime, ...attendanceData.compensatory, ...attendanceData.leave]
        .forEach(record => {
            const year = new Date(record.date).getFullYear();
            years.add(year);
        });
    
    // 清空并重新填充选项
    select.innerHTML = '<option value="">全部年份</option>';
    Array.from(years).sort((a, b) => b - a).forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year + '年';
        select.appendChild(option);
    });
}

// 字段选择功能
function updateFieldOptions() {
    const exportType = document.getElementById('exportType').value;
    
    // 隐藏所有字段组
    document.getElementById('overtimeFields').style.display = 'none';
    document.getElementById('compensatoryFields').style.display = 'none';
    document.getElementById('leaveFields').style.display = 'none';
    document.getElementById('allFields').style.display = 'none';
    
    // 显示对应的字段组
    switch (exportType) {
        case 'overtime':
            document.getElementById('overtimeFields').style.display = 'block';
            break;
        case 'compensatory':
            document.getElementById('compensatoryFields').style.display = 'block';
            break;
        case 'leave':
            document.getElementById('leaveFields').style.display = 'block';
            break;
        case 'all':
            document.getElementById('allFields').style.display = 'block';
            break;
    }
}

function selectAllFields() {
    const exportType = document.getElementById('exportType').value;
    const fieldGroup = document.getElementById(exportType + 'Fields');
    const checkboxes = fieldGroup.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = true);
}

function clearAllFields() {
    const exportType = document.getElementById('exportType').value;
    const fieldGroup = document.getElementById(exportType + 'Fields');
    const checkboxes = fieldGroup.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = false);
}

function loadTemplate(templateType) {
    const exportType = document.getElementById('exportType').value;
    const fieldGroup = document.getElementById(exportType + 'Fields');
    const checkboxes = fieldGroup.querySelectorAll('input[type="checkbox"]');
    
    // 先清空所有选择
    checkboxes.forEach(checkbox => checkbox.checked = false);
    
    // 根据模板类型选择字段
    if (templateType === 'basic') {
        // 基础模板：只选择最基本的字段
        const basicFields = {
            'overtime': ['加班日期', '时间段', '加班原因'],
            'compensatory': ['补休日期', '时间段', '关联加班日期'],
            'leave': ['请假日期', '时间段', '请假原因'],
            'all': ['类型', '日期', '详细信息']
        };
        
        const fieldsToSelect = basicFields[exportType] || [];
        checkboxes.forEach(checkbox => {
            if (fieldsToSelect.includes(checkbox.value)) {
                checkbox.checked = true;
            }
        });
    } else if (templateType === 'detailed') {
        // 详细模板：选择所有字段
        checkboxes.forEach(checkbox => checkbox.checked = true);
    }
}

function getSelectedFields() {
    const exportType = document.getElementById('exportType').value;
    const fieldGroup = document.getElementById(exportType + 'Fields');
    const checkboxes = fieldGroup.querySelectorAll('input[type="checkbox"]:checked');
    
    return Array.from(checkboxes).map(checkbox => checkbox.value);
}

// 弹窗功能
let currentEventToDelete = null;

function showEventModal(dateString, events) {
    const modal = document.getElementById('eventModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = `${dateString} 的考勤记录`;
    modalBody.innerHTML = '';
    
    events.forEach((event, index) => {
        if (event.type === 'full-compensatory') return; // 跳过全部补休标记
        
        const eventDiv = document.createElement('div');
        eventDiv.className = 'event-detail';
        eventDiv.style.marginBottom = '20px';
        eventDiv.style.padding = '15px';
        eventDiv.style.border = '1px solid #dee2e6';
        eventDiv.style.borderRadius = '6px';
        eventDiv.style.backgroundColor = '#f8f9fa';
        
        let content = '';
        let deleteData = null;
        
        switch (event.type) {
            case 'overtime':
                content = `
                    <div style="color: #007bff; font-weight: bold; margin-bottom: 10px;">📅 加班记录</div>
                    <div><strong>时间段:</strong> ${event.data.timeSlotText}</div>
                    <div><strong>加班原因:</strong> ${event.data.reason}</div>
                    <div><strong>状态:</strong> ${event.data.isUsed ? '已补休' : '未补休'}</div>
                    <div><strong>创建时间:</strong> ${new Date(event.data.createdAt).toLocaleString()}</div>
                `;
                deleteData = { type: 'overtime', id: event.data.id };
                break;
                
            case 'compensatory':
                content = `
                    <div style="color: #6f42c1; font-weight: bold; margin-bottom: 10px;">🔄 补休记录</div>
                    <div><strong>考勤队伍:</strong> ${event.data.teamText}</div>
                    <div><strong>考勤组:</strong> ${event.data.groupText}</div>
                    <div><strong>班次:</strong> ${event.data.shift} (${event.data.shiftText})</div>
                    <div><strong>时间段:</strong> ${event.data.timeSlotText}</div>
                    <div><strong>关联加班:</strong> ${event.data.relatedOvertimeDate} ${event.data.relatedOvertimeTimeSlot}</div>
                    <div><strong>加班原因:</strong> ${event.data.relatedOvertimeReason}</div>
                    <div><strong>创建时间:</strong> ${new Date(event.data.createdAt).toLocaleString()}</div>
                `;
                deleteData = { type: 'compensatory', id: event.data.id };
                break;
                
            case 'leave':
                content = `
                    <div style="color: #fd7e14; font-weight: bold; margin-bottom: 10px;">🏃 请假记录</div>
                    <div><strong>时间段:</strong> ${event.data.timeSlotText}</div>
                    <div><strong>请假原因:</strong> ${event.data.reason}</div>
                    <div><strong>创建时间:</strong> ${new Date(event.data.createdAt).toLocaleString()}</div>
                `;
                deleteData = { type: 'leave', id: event.data.id };
                break;
        }
        
        eventDiv.innerHTML = content;
        
        // 添加删除按钮
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '删除此记录';
        deleteBtn.className = 'delete-btn';
        deleteBtn.style.marginTop = '10px';
        deleteBtn.onclick = () => {
            currentEventToDelete = deleteData;
            if (confirm('确定要删除这条记录吗？此操作不可撤销。')) {
                deleteEvent();
            }
        };
        
        eventDiv.appendChild(deleteBtn);
        modalBody.appendChild(eventDiv);
    });
    
    modal.style.display = 'flex';
}

function closeEventModal() {
    const modal = document.getElementById('eventModal');
    modal.style.display = 'none';
    currentEventToDelete = null;
}

async function deleteEvent() {
    if (!currentEventToDelete) return;
    
    const { type, id } = currentEventToDelete;
    
    try {
        showLoading('正在删除记录...');
        
        const response = await apiCall(`/attendance/${type}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.success) {
            // 更新本地数据
            switch (type) {
                case 'overtime':
                    const overtimeIndex = attendanceData.overtime.findIndex(item => item.id === id);
                    if (overtimeIndex !== -1) {
                        attendanceData.overtime.splice(overtimeIndex, 1);
                    }
                    break;
                    
                case 'compensatory':
                    const compensatoryIndex = attendanceData.compensatory.findIndex(item => item.id === id);
                    if (compensatoryIndex !== -1) {
                        const compensatoryRecord = attendanceData.compensatory[compensatoryIndex];
                        // 恢复关联加班记录的状态
                        const relatedOvertime = attendanceData.overtime.find(item => item.id == compensatoryRecord.relatedOvertimeId);
                        if (relatedOvertime) {
                            relatedOvertime.isUsed = false;
                        }
                        attendanceData.compensatory.splice(compensatoryIndex, 1);
                    }
                    break;
                    
                case 'leave':
                    const leaveIndex = attendanceData.leave.findIndex(item => item.id === id);
                    if (leaveIndex !== -1) {
                        attendanceData.leave.splice(leaveIndex, 1);
                    }
                    break;
            }
            
            saveData();
            updateStatistics();
            updateHistoryView();
            updateRelatedOvertimeOptions();
            renderCalendar();
            checkExpirationWarnings();
            closeEventModal();
            
            alert('记录已删除');
        } else {
            throw new Error(response.error || '删除失败');
        }
    } catch (error) {
        console.error('删除记录失败:', error);
        alert('删除失败: ' + error.message);
    } finally {
        hideLoading();
    }
}

// 点击弹窗外部关闭弹窗
document.addEventListener('click', function(event) {
    const modal = document.getElementById('eventModal');
    if (event.target === modal) {
        closeEventModal();
    }
});

// 显示导出预览功能
async function showExportPreview() {
    const year = document.getElementById('exportYear').value;
    const month = document.getElementById('exportMonth').value;
    const type = document.getElementById('exportType').value;
    const textArea = document.getElementById('exportTextArea');
    const selectedFields = getSelectedFields();
    
    if (selectedFields.length === 0) {
        textArea.value = '请至少选择一个导出字段';
        return;
    }
    
    try {
        showLoading('正在生成预览...');
        
        const response = await apiCall('/export/data', {
            method: 'POST',
            body: JSON.stringify({
                year: year,
                month: month,
                type: type,
                fields: selectedFields
            })
        });
        
        if (response.success) {
            if (response.data.length === 0) {
                textArea.value = '没有符合条件的数据可显示';
            } else {
                textArea.value = response.csvContent;
            }
        } else {
            throw new Error(response.error || '生成预览失败');
        }
    } catch (error) {
        console.error('生成预览失败:', error);
        textArea.value = '生成预览失败: ' + error.message;
    } finally {
        hideLoading();
    }
}

// 导出数据到记事本
async function exportFilteredData() {
    const year = document.getElementById('exportYear').value;
    const month = document.getElementById('exportMonth').value;
    const type = document.getElementById('exportType').value;
    const textArea = document.getElementById('exportTextArea');
    const selectedFields = getSelectedFields();
    
    if (selectedFields.length === 0) {
        textArea.value = '请至少选择一个导出字段';
        return;
    }
    
    // 先显示结果
    await showExportPreview();
    
    // 如果没有数据，不进行保存
    if (textArea.value === '没有符合条件的数据可显示' || textArea.value === '请至少选择一个导出字段') {
        return;
    }
    
    // 生成标题
    let title = '';
    switch (type) {
        case 'overtime':
            title = `加班记录${year ? '_' + year + '年' : ''}${month ? '_' + month + '月' : ''}`;
            break;
        case 'compensatory':
            title = `补休记录${year ? '_' + year + '年' : ''}${month ? '_' + month + '月' : ''}`;
            break;
        case 'leave':
            title = `请假记录${year ? '_' + year + '年' : ''}${month ? '_' + month + '月' : ''}`;
            break;
        case 'all':
            title = `全部考勤记录${year ? '_' + year + '年' : ''}${month ? '_' + month + '月' : ''}`;
            break;
    }
    
    const content = textArea.value;
    const shareText = `${title}\n\n${content}`;
    
    // 尝试使用Web Share API（适用于移动设备）
    if (navigator.share) {
        navigator.share({
            title: title,
            text: shareText
        }).then(() => {
            alert('数据已分享，您可以选择保存到记事本或其他应用');
        }).catch((error) => {
            console.log('分享失败，尝试复制到剪贴板', error);
            copyToClipboard(shareText, title);
        });
    } else {
        // 如果不支持Web Share API，则复制到剪贴板
        copyToClipboard(shareText, title);
    }
}

// 复制到剪贴板的辅助函数
function copyToClipboard(text, title) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            alert(`${title}已复制到剪贴板，您可以粘贴到记事本中保存`);
        }).catch((error) => {
            console.log('复制失败，使用备用方法', error);
            fallbackCopyToClipboard(text, title);
        });
    } else {
        fallbackCopyToClipboard(text, title);
    }
}

// 备用复制方法
function fallbackCopyToClipboard(text, title) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            alert(`${title}已复制到剪贴板，您可以粘贴到记事本中保存`);
        } else {
            alert('复制失败，请手动选择并复制文本框中的内容');
        }
    } catch (err) {
        alert('复制失败，请手动选择并复制文本框中的内容');
    }
    
    document.body.removeChild(textArea);
}