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

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateRelatedOvertimeOptions();
    updateStatistics();
    updateHistoryView();
    checkExpirationWarnings();
    updateExportYearOptions();
    initCalendar();
    updateFieldOptions(); // 初始化字段选项
    
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

// 标签页切换
function showTab(tabName) {
    // 隐藏所有标签页内容
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // 移除所有按钮的活动状态
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => button.classList.remove('active'));
    
    // 显示选中的标签页
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    
    // 如果切换到历史视图，更新数据
    if (tabName === 'history') {
        updateStatistics();
        updateHistoryView();
        checkExpirationWarnings();
        renderCalendar();
    }
    
    // 如果切换到补休，更新关联加班选项
    if (tabName === 'compensatory') {
        updateRelatedOvertimeOptions();
        // 初始化班次时间显示
        updateTimeSlotByShift();
    }
    
    // 如果切换到导出，更新年份选项
    if (tabName === 'export') {
        updateExportYearOptions();
    }
}

// 处理加班申请提交
function handleOvertimeSubmit(e) {
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
    
    const overtimeRecord = {
        id: Date.now(),
        date: date,
        timeSlot: timeSlot,
        timeSlotText: timeSlotText,
        reason: reason === 'custom' ? customReason : reasonMap.overtime[reason],
        isUsed: false,
        createdAt: new Date().toISOString()
    };
    
    attendanceData.overtime.push(overtimeRecord);
    saveData();
    
    // 重置表单
    document.getElementById('overtimeForm').reset();
    document.getElementById('customOvertimeReason').style.display = 'none';
    document.getElementById('customOvertimeTimeSlot').style.display = 'none';
    
    alert('加班申请提交成功！');
    updateRelatedOvertimeOptions();
}

// 处理补休申请提交
function handleCompensatorySubmit(e) {
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
    
    // 标记加班记录为已使用
    relatedOvertime.isUsed = true;
    
    // 获取时间段文本
    const timeSlotElement = document.getElementById('compensatoryTimeSlot');
    const timeSlotText = timeSlotElement.options[timeSlotElement.selectedIndex].text;
    
    const compensatoryRecord = {
        id: Date.now(),
        date: date,
        team: team,
        teamText: teamMap[team],
        group: group,
        groupText: groupMap[group],
        shift: shift,
        shiftText: shiftTimeMap[shift],
        timeSlot: timeSlot,
        timeSlotText: timeSlotText,
        relatedOvertimeId: relatedOvertimeId,
        relatedOvertimeDate: relatedOvertime.date,
        relatedOvertimeTimeSlot: relatedOvertime.timeSlotText,
        relatedOvertimeReason: relatedOvertime.reason,
        createdAt: new Date().toISOString()
    };
    
    attendanceData.compensatory.push(compensatoryRecord);
    saveData();
    
    // 提交后锁定已选择的内容
    lockStates.team = true;
    lockStates.group = true;
    lockStates.shift = true;
    updateLockButtons();
    
    // 只重置日期、时间段和关联加班记录
    document.getElementById('compensatoryDate').value = '';
    document.getElementById('compensatoryTimeSlot').innerHTML = '<option value="">请先选择班次</option>';
    document.getElementById('relatedOvertime').value = '';
    
    alert('补休申请提交成功！');
    updateRelatedOvertimeOptions();
}

// 处理请假申请提交
function handleLeaveSubmit(e) {
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
    
    const leaveRecord = {
        id: Date.now(),
        date: date,
        timeSlot: timeSlot,
        timeSlotText: timeSlotText,
        reason: reason === 'custom' ? customReason : reasonMap.leave[reason],
        createdAt: new Date().toISOString()
    };
    
    attendanceData.leave.push(leaveRecord);
    saveData();
    
    // 重置表单
    document.getElementById('leaveForm').reset();
    document.getElementById('customLeaveReason').style.display = 'none';
    document.getElementById('customLeaveTimeSlot').style.display = 'none';
    
    alert('请假申请提交成功！');
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

// 格式化班次时间显示
function formatShiftTime(shiftCode, timeString) {
    const periods = [];
    
    // 解析不同的时间格式
    if (timeString.includes('上午') && timeString.includes('下午')) {
        // 包含上午和下午的班次
        const parts = timeString.split(' ');
        parts.forEach(part => {
            if (part.includes('上午')) {
                const time = part.replace('上午', '');
                periods.push(`<div class="time-period morning">🌅 上午: ${time}</div>`);
            } else if (part.includes('下午')) {
                const time = part.replace('下午', '');
                periods.push(`<div class="time-period afternoon">🌞 下午: ${time}</div>`);
            } else if (part.includes('晚上')) {
                const time = part.replace('晚上', '');
                periods.push(`<div class="time-period evening">🌙 晚上: ${time}</div>`);
            }
        });
    } else if (timeString.includes('上午')) {
        // 只有上午的班次
        const time = timeString.replace('上午', '');
        periods.push(`<div class="time-period morning">🌅 上午: ${time}</div>`);
    } else if (timeString.includes('下午')) {
        // 只有下午的班次
        const time = timeString.replace('下午', '');
        periods.push(`<div class="time-period afternoon">🌞 下午: ${time}</div>`);
    } else if (timeString.includes('晚上')) {
        // 只有晚上的班次
        const time = timeString.replace('晚上', '');
        periods.push(`<div class="time-period evening">🌙 晚上: ${time}</div>`);
    } else if (timeString.includes('次日')) {
        // 跨日班次
        periods.push(`<div class="time-period night">🌃 夜班: ${timeString}</div>`);
    } else {
        // 其他格式的时间
        if (timeString.includes('19:') || timeString.includes('20:') || timeString.includes('21:') || timeString.includes('22:') || timeString.includes('23:')) {
            periods.push(`<div class="time-period evening">🌙 ${timeString}</div>`);
        } else if (timeString.includes('01:') || timeString.includes('02:') || timeString.includes('03:') || timeString.includes('04:') || timeString.includes('05:') || timeString.includes('06:')) {
            periods.push(`<div class="time-period night">🌃 ${timeString}</div>`);
        } else if (timeString.includes('07:') || timeString.includes('08:') || timeString.includes('09:') || timeString.includes('10:') || timeString.includes('11:')) {
            periods.push(`<div class="time-period morning">🌅 ${timeString}</div>`);
        } else {
            periods.push(`<div class="time-period afternoon">🌞 ${timeString}</div>`);
        }
    }
    
    return `
        <div style="text-align: center; margin-bottom: 12px; font-weight: 700; color: #667eea;">
            ${shiftCode} 班次时间
        </div>
        <div class="time-periods">
            ${periods.join('')}
        </div>
    `;
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
}

function updateLockButtons() {
    const teamSelect = document.getElementById('attendanceTeam');
    const groupSelect = document.getElementById('attendanceGroup');
    const shiftSelect = document.getElementById('shiftSchedule');
    
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
        shiftModifyBtn.style.display = 'none';
        shiftFixBtn.style.display = 'flex';
        shiftFixBtn.classList.add('fixed');
    } else {
        shiftSelect.disabled = false;
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
    
    // 获取当天的事件
    const dateString = date.toISOString().split('T')[0];
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
    
    // 检查加班记录
    attendanceData.overtime.forEach(record => {
        if (record.date === dateString) {
            events.push({ type: 'overtime', data: record });
        }
    });
    
    // 检查补休记录
    attendanceData.compensatory.forEach(record => {
        if (record.date === dateString) {
            events.push({ type: 'compensatory', data: record });
        }
    });
    
    // 检查请假记录
    attendanceData.leave.forEach(record => {
        if (record.date === dateString) {
            events.push({ type: 'leave', data: record });
        }
    });
    
    // 检查是否全部补休（如果某天有加班且已补休）
    const overtimeOnDate = attendanceData.overtime.filter(record => 
        record.date === dateString && record.isUsed
    );
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

function exportFilteredData() {
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
    showExportPreview();
    
    // 如果没有数据，不进行下载
    if (textArea.value === '没有符合条件的数据可显示' || textArea.value === '请至少选择一个导出字段') {
        return;
    }
    
    // 生成文件名
    let filename = '';
    switch (type) {
        case 'overtime':
            filename = `加班记录${year ? '_' + year + '年' : ''}${month ? '_' + month + '月' : ''}.csv`;
            break;
        case 'compensatory':
            filename = `补休记录${year ? '_' + year + '年' : ''}${month ? '_' + month + '月' : ''}.csv`;
            break;
        case 'leave':
            filename = `请假记录${year ? '_' + year + '年' : ''}${month ? '_' + month + '月' : ''}.csv`;
            break;
        case 'all':
            filename = `全部考勤记录${year ? '_' + year + '年' : ''}${month ? '_' + month + '月' : ''}.csv`;
            break;
    }
    
    // 创建下载链接
    const csvContent = textArea.value;
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 数据持久化
function saveData() {
    localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
}

function loadData() {
    const saved = localStorage.getItem('attendanceData');
    if (saved) {
        attendanceData = JSON.parse(saved);
    }
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

function deleteEvent() {
    if (!currentEventToDelete) return;
    
    const { type, id } = currentEventToDelete;
    
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
}

// 点击弹窗外部关闭弹窗
document.addEventListener('click', function(event) {
    const modal = document.getElementById('eventModal');
    if (event.target === modal) {
        closeEventModal();
    }
});
// 显示导出预览功能
function showExportPreview() {
    const year = document.getElementById('exportYear').value;
    const month = document.getElementById('exportMonth').value;
    const type = document.getElementById('exportType').value;
    const textArea = document.getElementById('exportTextArea');
    const selectedFields = getSelectedFields();
    
    if (selectedFields.length === 0) {
        textArea.value = '请至少选择一个导出字段';
        return;
    }
    
    let data = [];
    
    // 过滤数据
    function filterByDate(records) {
        return records.filter(record => {
            const recordDate = new Date(record.date);
            const recordYear = recordDate.getFullYear().toString();
            const recordMonth = (recordDate.getMonth() + 1).toString().padStart(2, '0');
            
            if (year && recordYear !== year) return false;
            if (month && recordMonth !== month) return false;
            
            return true;
        });
    }
    
    switch (type) {
        case 'overtime':
            const filteredOvertime = filterByDate(attendanceData.overtime);
            data = filteredOvertime.map(item => {
                const record = {};
                selectedFields.forEach(field => {
                    switch (field) {
                        case '加班日期':
                            record[field] = item.date;
                            break;
                        case '时间段':
                            record[field] = item.timeSlotText;
                            break;
                        case '加班原因':
                            record[field] = item.reason;
                            break;
                        case '状态':
                            record[field] = item.isUsed ? '已补休' : '未补休';
                            break;
                        case '创建时间':
                            record[field] = new Date(item.createdAt).toLocaleString();
                            break;
                    }
                });
                return record;
            });
            break;
            
        case 'compensatory':
            const filteredCompensatory = filterByDate(attendanceData.compensatory);
            data = filteredCompensatory.map(item => {
                const record = {};
                selectedFields.forEach(field => {
                    switch (field) {
                        case '补休日期':
                            record[field] = item.date;
                            break;
                        case '考勤队伍':
                            record[field] = item.teamText || '';
                            break;
                        case '考勤组':
                            record[field] = item.groupText || '';
                            break;
                        case '班次':
                            record[field] = item.shift || '';
                            break;
                        case '班次时间':
                            record[field] = item.shiftText || '';
                            break;
                        case '时间段':
                            record[field] = item.timeSlotText;
                            break;
                        case '关联加班日期':
                            record[field] = item.relatedOvertimeDate;
                            break;
                        case '关联加班时间段':
                            record[field] = item.relatedOvertimeTimeSlot;
                            break;
                        case '加班原因':
                            record[field] = item.relatedOvertimeReason;
                            break;
                        case '创建时间':
                            record[field] = new Date(item.createdAt).toLocaleString();
                            break;
                    }
                });
                return record;
            });
            break;
            
        case 'leave':
            const filteredLeave = filterByDate(attendanceData.leave);
            data = filteredLeave.map(item => {
                const record = {};
                selectedFields.forEach(field => {
                    switch (field) {
                        case '请假日期':
                            record[field] = item.date;
                            break;
                        case '时间段':
                            record[field] = item.timeSlotText;
                            break;
                        case '请假原因':
                            record[field] = item.reason;
                            break;
                        case '创建时间':
                            record[field] = new Date(item.createdAt).toLocaleString();
                            break;
                    }
                });
                return record;
            });
            break;
            
        case 'all':
            const allOvertime = filterByDate(attendanceData.overtime);
            const allCompensatory = filterByDate(attendanceData.compensatory);
            const allLeave = filterByDate(attendanceData.leave);
            
            const allData = [
                ...allOvertime.map(item => {
                    const record = {};
                    selectedFields.forEach(field => {
                        switch (field) {
                            case '类型':
                                record[field] = '加班';
                                break;
                            case '日期':
                                record[field] = item.date;
                                break;
                            case '时间段':
                                record[field] = item.timeSlotText;
                                break;
                            case '详细信息':
                                record[field] = item.reason + (item.isUsed ? ' (已补休)' : ' (未补休)');
                                break;
                            case '队伍/组':
                                record[field] = '';
                                break;
                            case '班次':
                                record[field] = '';
                                break;
                            case '创建时间':
                                record[field] = new Date(item.createdAt).toLocaleString();
                                break;
                        }
                    });
                    return record;
                }),
                ...allCompensatory.map(item => {
                    const record = {};
                    selectedFields.forEach(field => {
                        switch (field) {
                            case '类型':
                                record[field] = '补休';
                                break;
                            case '日期':
                                record[field] = item.date;
                                break;
                            case '时间段':
                                record[field] = item.timeSlotText;
                                break;
                            case '详细信息':
                                record[field] = `关联加班: ${item.relatedOvertimeDate} ${item.relatedOvertimeTimeSlot} (${item.relatedOvertimeReason})`;
                                break;
                            case '队伍/组':
                                record[field] = `${item.teamText || ''} - ${item.groupText || ''}`;
                                break;
                            case '班次':
                                record[field] = item.shift || '';
                                break;
                            case '创建时间':
                                record[field] = new Date(item.createdAt).toLocaleString();
                                break;
                        }
                    });
                    return record;
                }),
                ...allLeave.map(item => {
                    const record = {};
                    selectedFields.forEach(field => {
                        switch (field) {
                            case '类型':
                                record[field] = '请假';
                                break;
                            case '日期':
                                record[field] = item.date;
                                break;
                            case '时间段':
                                record[field] = item.timeSlotText;
                                break;
                            case '详细信息':
                                record[field] = item.reason;
                                break;
                            case '队伍/组':
                                record[field] = '';
                                break;
                            case '班次':
                                record[field] = '';
                                break;
                            case '创建时间':
                                record[field] = new Date(item.createdAt).toLocaleString();
                                break;
                        }
                    });
                    return record;
                })
            ];
            data = allData.sort((a, b) => new Date(b.日期) - new Date(a.日期));
            break;
    }
    
    if (data.length === 0) {
        textArea.value = '没有符合条件的数据可显示';
        return;
    }
    
    // 转换为CSV格式并显示在文本框中（仅预览，不下载）
    const headers = selectedFields;
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    // 显示在文本框中
    textArea.value = csvContent;
}