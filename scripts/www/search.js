// 清空搜索功能
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearBtn');
    
    searchInput.value = '';
    clearBtn.style.display = 'none';
    
    // 手机端不自动聚焦，避免弹出键盘
    if (!isMobile()) {
        searchInput.focus();
    }
    
    displayNoResults('开始搜索法条');
}

// 检测是否为移动设备
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           ('ontouchstart' in window) || 
           (window.innerWidth <= 768);
}

// 搜索功能实现
function searchLaws() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    const searchBtn = document.querySelector('.search-btn');
    
    if (!searchTerm) {
        displayNoResults('请输入搜索关键词');
        // 手机端震动反馈
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
        return;
    }
    
    // 手机端隐藏键盘
    if (isMobile()) {
        document.getElementById('searchInput').blur();
    }
    
    // 显示加载状态
    const originalText = searchBtn.innerHTML;
    searchBtn.innerHTML = '<div class="loading"></div>';
    searchBtn.disabled = true;
    
    // 模拟搜索延迟，提供更好的用户体验
    setTimeout(() => {
        performSearch(searchTerm);
        searchBtn.innerHTML = originalText;
        searchBtn.disabled = false;
        
        // 手机端成功震动反馈
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        // 显示滑动提示
        if (isMobile()) {
            showSwipeHint();
        }
    }, 300);
}



function updateClearButton() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearBtn');
    
    if (searchInput.value.trim()) {
        clearBtn.style.display = 'flex';
    } else {
        clearBtn.style.display = 'none';
    }
}

function performSearch(searchTerm) {
    const results = [];
    const searchTermLower = searchTerm.toLowerCase();
    
    // 搜索匹配的法条
    lawData.forEach(law => {
        let matchScore = 0;
        let matchedKeywords = [];
        
        // 检查标题匹配
        if (law.title.toLowerCase().includes(searchTermLower)) {
            matchScore += 10;
        }
        
        // 检查关键词匹配
        law.keywords.forEach(keyword => {
            if (keyword.toLowerCase().includes(searchTermLower) || 
                searchTermLower.includes(keyword.toLowerCase())) {
                matchScore += 5;
                matchedKeywords.push(keyword);
            }
        });
        
        // 检查违法条文内容匹配
        law.violations.forEach(violation => {
            if (violation.content.toLowerCase().includes(searchTermLower)) {
                matchScore += 3;
            }
        });
        
        // 检查处罚条文内容匹配
        law.penalties.forEach(penalty => {
            if (penalty.content.toLowerCase().includes(searchTermLower)) {
                matchScore += 2;
            }
        });
        
        if (matchScore > 0) {
            results.push({
                ...law,
                matchScore,
                matchedKeywords
            });
        }
    });
    
    // 按匹配分数排序
    results.sort((a, b) => b.matchScore - a.matchScore);
    
    if (results.length === 0) {
        displayNoResults(`未找到与"${searchTerm}"相关的法条`);
    } else {
        displayResults(results, searchTerm);
    }
}

function displayResults(results, searchTerm) {
    const resultsContainer = document.getElementById('searchResults');
    
    let html = `<div class="results-count">
        <strong>找到 ${results.length} 条</strong>相关法条
    </div>`;
    
    results.forEach((result, index) => {
        html += `
            <div class="result-item" style="animation: slideInUp 0.3s ease ${index * 0.1}s both;">
                <div class="result-title">${highlightText(result.title, searchTerm)}</div>
                
                <div class="violation-section">
                    <div class="section-title">违反条款</div>
                    ${result.violations.map((violation, vIndex) => {
                        const isLong = violation.content.length > 150; // 手机端降低折叠阈值
                        const contentId = `violation-${result.id}-${vIndex}`;
                        return `
                            <div class="law-text">
                                <strong>${violation.law}</strong>
                                <div class="law-content ${isLong ? 'collapsed' : ''}" id="${contentId}">
                                    ${highlightText(violation.content, searchTerm)}
                                </div>
                                ${isLong ? `<button class="expand-btn" onclick="toggleContent('${contentId}', this)">展开全文</button>` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="penalty-section">
                    <div class="section-title">处罚依据</div>
                    ${result.penalties.map((penalty, pIndex) => {
                        const isLong = penalty.content.length > 150; // 手机端降低折叠阈值
                        const contentId = `penalty-${result.id}-${pIndex}`;
                        return `
                            <div class="law-text">
                                <strong>${penalty.law}</strong>
                                <div class="law-content ${isLong ? 'collapsed' : ''}" id="${contentId}">
                                    ${highlightText(penalty.content, searchTerm)}
                                </div>
                                ${isLong ? `<button class="expand-btn" onclick="toggleContent('${contentId}', this)">展开全文</button>` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
                
                ${result.matchedKeywords.length > 0 ? `
                    <div class="matched-keywords">
                        <div style="font-size: 13px; color: #6c757d; margin-bottom: 8px;">匹配关键词:</div>
                        ${result.matchedKeywords.map(kw => `<span>${kw}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    resultsContainer.innerHTML = html;
    
    // 滚动到结果区域，手机端优化
    setTimeout(() => {
        const resultsSection = document.querySelector('.results-section');
        if (resultsSection) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const searchHeight = document.querySelector('.search-section').offsetHeight;
            const offset = headerHeight + searchHeight + 10;
            
            window.scrollTo({
                top: offset,
                behavior: 'smooth'
            });
        }
    }, 100);
}

// 展开/收起内容 - 增加手机端优化
function toggleContent(contentId, button) {
    const content = document.getElementById(contentId);
    const isExpanding = content.classList.contains('collapsed');
    
    if (isExpanding) {
        content.classList.remove('collapsed');
        button.innerHTML = '收起';
        
        // 手机端震动反馈
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
        
        // 展开后滚动到按钮位置
        setTimeout(() => {
            button.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }, 100);
    } else {
        content.classList.add('collapsed');
        button.innerHTML = '展开全文';
        
        // 手机端震动反馈
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
    }
}

function displayNoResults(message) {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = `
        <div class="no-results">
            <div style="font-size: 1.2em; margin-bottom: 8px; font-weight: 500;">${message}</div>
            <div style="color: #6c757d;">请输入关键词进行查询</div>
        </div>
    `;
}

function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 返回顶部功能
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 显示/隐藏返回顶部按钮
function toggleBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
}

// 回车键搜索和手机端优化
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    
    // 回车键搜索
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchLaws();
        }
    });
    
    // 自动聚焦搜索框（仅在非触摸设备上）
    if (!isMobile()) {
        searchInput.focus();
    }
    
    // 清空按钮功能
    searchInput.addEventListener('input', function() {
        const value = this.value;
        updateClearButton();
        
        if (value === '') {
            displayNoResults('开始搜索法条');
        }
    });
    
    // 手机端触摸优化
    if (isMobile()) {
        // 搜索按钮触摸反馈
        const searchBtn = document.querySelector('.search-btn');
        searchBtn.addEventListener('touchstart', function(e) {
            this.style.transform = 'scale(0.98)';
        }, { passive: true });
        
        searchBtn.addEventListener('touchend', function(e) {
            setTimeout(() => {
                this.style.transform = '';
            }, 100);
        }, { passive: true });
        
        // 返回顶部按钮触摸反馈
        const backToTopBtn = document.getElementById('backToTop');
        backToTopBtn.addEventListener('touchstart', function(e) {
            this.style.transform = 'scale(0.9)';
        }, { passive: true });
        
        backToTopBtn.addEventListener('touchend', function(e) {
            setTimeout(() => {
                this.style.transform = '';
            }, 100);
        }, { passive: true });
        
        // 防止双击缩放
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // 优化滚动性能
        let ticking = false;
        function updateScrollPosition() {
            toggleBackToTop();
            ticking = false;
        }
        
        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(updateScrollPosition);
                ticking = true;
            }
        }, { passive: true });
    } else {
        // 桌面端滚动监听
        window.addEventListener('scroll', toggleBackToTop);
    }
    
    // 初始化手机端专用功能
    if (isMobile()) {
        initPullRefresh();
        initSwipeGestures();
        initLongPress();
        
        // 显示滑动提示
        setTimeout(() => {
            const results = document.querySelectorAll('.result-item');
            if (results.length > 0) {
                showSwipeHint();
            }
        }, 3000);
    }
    
    // 页面可见性变化时的优化
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // 页面隐藏时暂停动画
            document.querySelectorAll('.result-item').forEach(item => {
                item.style.animationPlayState = 'paused';
            });
        } else {
            // 页面显示时恢复动画
            document.querySelectorAll('.result-item').forEach(item => {
                item.style.animationPlayState = 'running';
            });
        }
    });
});

// 手机端专用功能
let contextMenuTarget = null;
let pullRefreshTriggered = false;
let startY = 0;

// 长按菜单功能
function showContextMenu(e, element) {
    if (!isMobile()) return;
    
    e.preventDefault();
    contextMenuTarget = element;
    
    const contextMenu = document.getElementById('contextMenu');
    const rect = element.getBoundingClientRect();
    
    contextMenu.style.left = Math.min(e.clientX, window.innerWidth - 160) + 'px';
    contextMenu.style.top = Math.min(e.clientY, window.innerHeight - 120) + 'px';
    contextMenu.classList.add('show');
    
    // 震动反馈
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

function hideContextMenu() {
    const contextMenu = document.getElementById('contextMenu');
    contextMenu.classList.remove('show');
    contextMenuTarget = null;
}

function copyText() {
    if (contextMenuTarget) {
        const text = contextMenuTarget.textContent;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                showToast('内容已复制');
            });
        } else {
            // 兼容旧版浏览器
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showToast('内容已复制');
        }
    }
    hideContextMenu();
}

function shareContent() {
    if (contextMenuTarget && navigator.share) {
        const text = contextMenuTarget.textContent;
        navigator.share({
            title: '法条查询结果',
            text: text,
            url: window.location.href
        }).catch(() => {
            copyText(); // 分享失败时复制内容
        });
    } else {
        copyText(); // 不支持分享时复制内容
    }
    hideContextMenu();
}

// 显示提示消息
function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 12px 20px;
        border-radius: 20px;
        font-size: 14px;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.style.opacity = '1', 10);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 2000);
}

// 下拉刷新功能
function initPullRefresh() {
    if (!isMobile()) return;
    
    let startY = 0;
    let currentY = 0;
    let pullDistance = 0;
    const pullRefresh = document.getElementById('pullRefresh');
    
    document.addEventListener('touchstart', function(e) {
        if (window.scrollY === 0) {
            startY = e.touches[0].clientY;
        }
    }, { passive: true });
    
    document.addEventListener('touchmove', function(e) {
        if (window.scrollY === 0 && startY > 0) {
            currentY = e.touches[0].clientY;
            pullDistance = currentY - startY;
            
            if (pullDistance > 0 && pullDistance < 100) {
                pullRefresh.style.transform = `translateY(${pullDistance - 100}%)`;
                pullRefresh.textContent = '下拉刷新';
            } else if (pullDistance >= 100) {
                pullRefresh.style.transform = 'translateY(0)';
                pullRefresh.textContent = '释放刷新';
            }
        }
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
        if (pullDistance >= 100 && !pullRefreshTriggered) {
            pullRefreshTriggered = true;
            pullRefresh.textContent = '刷新中...';
            
            // 模拟刷新
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            pullRefresh.style.transform = 'translateY(-100%)';
        }
        
        startY = 0;
        pullDistance = 0;
    }, { passive: true });
}

// 滑动提示
function showSwipeHint() {
    if (!isMobile()) return;
    
    const swipeHint = document.getElementById('swipeHint');
    const results = document.querySelectorAll('.result-item');
    
    if (results.length > 2) {
        setTimeout(() => {
            swipeHint.classList.add('show');
            setTimeout(() => {
                swipeHint.classList.remove('show');
            }, 3000);
        }, 2000);
    }
}

// 添加滑动手势支持
function initSwipeGestures() {
    if (!isMobile()) return;
    
    let startX = 0;
    let startY = 0;
    let currentElement = null;
    
    document.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        currentElement = e.target.closest('.result-item');
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
        if (!currentElement) return;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        
        // 检测左滑手势
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            if (deltaX < -50) {
                // 左滑显示操作菜单
                showContextMenu(e, currentElement);
            }
        }
        
        currentElement = null;
    }, { passive: true });
}

// 添加长按支持
function initLongPress() {
    if (!isMobile()) return;
    
    let pressTimer = null;
    
    document.addEventListener('touchstart', function(e) {
        const target = e.target.closest('.law-text');
        if (target) {
            pressTimer = setTimeout(() => {
                showContextMenu(e, target);
            }, 500);
        }
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }
    }, { passive: true });
    
    document.addEventListener('touchmove', function(e) {
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }
    }, { passive: true });
}

// 点击外部隐藏菜单
document.addEventListener('click', function(e) {
    const contextMenu = document.getElementById('contextMenu');
    if (contextMenu && !contextMenu.contains(e.target)) {
        hideContextMenu();
    }
});

// 添加滑入动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;
document.head.appendChild(style);

// 监听滚动事件
window.addEventListener('scroll', toggleBackToTop);