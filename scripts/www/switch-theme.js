// 主题切换脚本
class ThemeSwitcher {
    constructor() {
        this.themes = {
            'original': 'styles.css',
            'modern': 'styles-modern.css',
            'light': 'styles-light.css',
            'gradient': 'styles-gradient.css'
        };
        
        this.currentTheme = localStorage.getItem('selectedTheme') || 'original';
        this.init();
    }

    init() {
        // 应用保存的主题
        this.applyTheme(this.currentTheme);
        
        // 创建主题切换按钮
        this.createThemeSwitcher();
    }

    applyTheme(themeName) {
        const styleLink = document.querySelector('link[rel="stylesheet"]');
        if (styleLink && this.themes[themeName]) {
            styleLink.href = this.themes[themeName];
            this.currentTheme = themeName;
            localStorage.setItem('selectedTheme', themeName);
            
            // 更新主题切换器的状态
            this.updateSwitcherState();
        }
    }

    createThemeSwitcher() {
        // 创建主题切换按钮
        const switcherContainer = document.createElement('div');
        switcherContainer.className = 'theme-switcher';
        switcherContainer.innerHTML = `
            <button class="theme-toggle-btn" onclick="themeSwitcher.toggleSwitcher()">
                🎨
            </button>
            <div class="theme-options" id="themeOptions" style="display: none;">
                <div class="theme-option" data-theme="original">
                    <span class="theme-preview original-preview"></span>
                    <span class="theme-name">原版</span>
                </div>
                <div class="theme-option" data-theme="modern">
                    <span class="theme-preview modern-preview"></span>
                    <span class="theme-name">深色</span>
                </div>
                <div class="theme-option" data-theme="light">
                    <span class="theme-preview light-preview"></span>
                    <span class="theme-name">浅色</span>
                </div>
                <div class="theme-option" data-theme="gradient">
                    <span class="theme-preview gradient-preview"></span>
                    <span class="theme-name">渐变</span>
                </div>
            </div>
        `;

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .theme-switcher {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1001;
            }

            .theme-toggle-btn {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                border: none;
                background: rgba(255, 255, 255, 0.2);
                backdrop-filter: blur(10px);
                color: white;
                font-size: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }

            .theme-toggle-btn:hover {
                transform: scale(1.1);
                background: rgba(255, 255, 255, 0.3);
            }

            .theme-options {
                position: absolute;
                top: 60px;
                right: 0;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(20px);
                border-radius: 12px;
                padding: 12px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
                min-width: 120px;
                animation: slideDown 0.3s ease;
            }

            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .theme-option {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                color: #333;
            }

            .theme-option:hover {
                background: rgba(0, 0, 0, 0.1);
            }

            .theme-option.active {
                background: rgba(102, 126, 234, 0.2);
                color: #667eea;
            }

            .theme-preview {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                border: 2px solid rgba(0, 0, 0, 0.1);
            }

            .original-preview {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }

            .modern-preview {
                background: linear-gradient(135deg, #0f172a 0%, #6366f1 100%);
            }

            .light-preview {
                background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
            }

            .gradient-preview {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%);
            }

            .theme-name {
                font-size: 14px;
                font-weight: 500;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(switcherContainer);

        // 绑定点击事件
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const theme = e.currentTarget.dataset.theme;
                this.applyTheme(theme);
                this.toggleSwitcher();
            });
        });

        // 更新初始状态
        this.updateSwitcherState();
    }

    toggleSwitcher() {
        const options = document.getElementById('themeOptions');
        if (options) {
            options.style.display = options.style.display === 'none' ? 'block' : 'none';
        }
    }

    updateSwitcherState() {
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.theme === this.currentTheme) {
                option.classList.add('active');
            }
        });
    }
}

// 页面加载完成后初始化主题切换器
document.addEventListener('DOMContentLoaded', function() {
    window.themeSwitcher = new ThemeSwitcher();
});

// 点击外部关闭主题选择器
document.addEventListener('click', function(e) {
    if (!e.target.closest('.theme-switcher')) {
        const options = document.getElementById('themeOptions');
        if (options) {
            options.style.display = 'none';
        }
    }
});