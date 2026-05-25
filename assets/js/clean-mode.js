/* =========================================================
   CLEAN MODE BUTTON
   Ховає всі елементи з класом .clean-mode-hide
   ========================================================= */

(function() {
    'use strict';
    
    const CONTAINER_CLASS = '.clean-mode-container';
    const STORAGE_KEY = 'lbToolsCleanMode';
    
    function getCleanModeState() {
        return localStorage.getItem(STORAGE_KEY) === 'true';
    }
    
    function setCleanModeState(enabled) {
        localStorage.setItem(STORAGE_KEY, enabled);
    }
    
    function toggleCleanMode(enabled) {
        // ========== ОСНОВНА ЛОГІКА - ХОВАЄМО ВСЕ З КЛАСОМ .clean-mode-hide ==========
        document.querySelectorAll('.clean-mode-hide').forEach(el => {
            el.style.display = enabled ? 'none' : '';
        });
        
        updateButtonState(enabled);
        
        if (enabled) {
            document.body.classList.add('clean-mode-active');
        } else {
            document.body.classList.remove('clean-mode-active');
        }
    }
    
    function updateButtonState(enabled) {
        const btn = document.getElementById('cleanModeToggle');
        if (!btn) return;
        
        const badge = btn.querySelector('.clean-mode-badge');
        const icon = btn.querySelector('.clean-mode-icon');
        const text = btn.querySelector('.clean-mode-text');
        
        if (enabled) {
            btn.classList.add('active');
            if (badge) { badge.textContent = 'ON'; badge.style.background = '#27ae60'; }
            if (icon) icon.style.stroke = '#27ae60';
            if (text) text.textContent = 'Clean Mode ON';
        } else {
            btn.classList.remove('active');
            if (badge) { badge.textContent = 'OFF'; badge.style.background = '#e74c3c'; }
            if (icon) icon.style.stroke = 'var(--accent-secondary, #3498db)';
            if (text) text.textContent = 'Clean Mode OFF';
        }
    }
    
    function createButton() {
        const btn = document.createElement('button');
        btn.id = 'cleanModeToggle';
        btn.className = 'clean-mode-btn';
        btn.innerHTML = `
            <svg class="clean-mode-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4-3-9s1.34-9 3-9"/>
                <path d="M12 3v18"/>
            </svg>
            <span class="clean-mode-text">Clean Mode OFF</span>
            <span class="clean-mode-badge">OFF</span>
        `;
        return btn;
    }
    
    function findContainerWithRetry(maxAttempts = 20, delay = 200) {
        let attempts = 0;
        
        return new Promise((resolve) => {
            function check() {
                let container = document.querySelector(CONTAINER_CLASS);
                
                if (container) {
                    resolve(container);
                    return;
                }
                
                const headerRight = document.querySelector('.header-right');
                const mainNav = document.querySelector('.main-nav');
                const headerContainer = document.querySelector('.site-header .header-container');
                const siteHeader = document.querySelector('.site-header');
                
                if (headerRight) {
                    resolve(headerRight);
                    return;
                }
                if (mainNav && mainNav.parentNode) {
                    resolve(mainNav.parentNode);
                    return;
                }
                if (headerContainer) {
                    resolve(headerContainer);
                    return;
                }
                if (siteHeader) {
                    resolve(siteHeader);
                    return;
                }
                
                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(check, delay);
                } else {
                    const newContainer = document.createElement('div');
                    newContainer.className = 'clean-mode-container';
                    newContainer.style.cssText = 'position: fixed; top: 80px; right: 20px; z-index: 9999;';
                    document.body.appendChild(newContainer);
                    resolve(newContainer);
                }
            }
            
            check();
        });
    }
    
    function addStyles() {
        if (document.getElementById('clean-mode-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'clean-mode-styles';
        style.textContent = `
            .clean-mode-container {
                display: inline-flex;
                align-items: center;
                margin-left: auto;
            }
            .clean-mode-btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                background: var(--header-bg);
                border: 1px solid var(--bg-tertiary, #dee2e6);
                border-radius: 40px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 0.875rem;
                font-weight: 500;
                color: var(--text-primary, #212529);
                z-index: 100;
            }
            .clean-mode-text {
                font-size: 0.875rem;
                font-weight: 500;
                display: none;
                color: var(--header-text);
            }
            .clean-mode-btn:hover {
                background: var(--bg-tertiary, #e9ecef);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                 .clean-mode-text {
                    display: block;
                }
            }
            .clean-mode-btn.active {
                background: rgba(39, 174, 96, 0.1);
                border-color: #27ae60;
            }
            .clean-mode-icon {
                width: 18px;
                height: 18px;
                stroke: var(--accent-secondary, #3498db);
                stroke-width: 1.8;
                transition: all 0.3s ease;
                fill: none;
            }
           
            .clean-mode-badge {
                font-size: 10px;
                font-weight: 700;
                padding: 4px 8px;
                border-radius: 20px;
                background: #e74c3c;
                color: white;
                transition: all 0.3s ease;
            }
            .clean-mode-btn.active .clean-mode-badge {
                background: #27ae60;
            }
            @media (max-width: 768px) {
                .clean-mode-text { display: none; }
                .clean-mode-btn { padding: 8px 12px; }
                .clean-mode-text { display: block; }
            }
            @media (max-width: 480px) {
                .clean-mode-badge { display: none; }
                .clean-mode-btn { padding: 8px 10px; }
                .clean-mode-icon { width: 16px; height: 16px; }
            }

            
        `;
        document.head.appendChild(style);
    }
    
    async function initCleanMode() {
        addStyles();
        
        if (document.readyState === 'loading') {
            await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const container = await findContainerWithRetry();
        const btn = createButton();
        
        container.appendChild(btn);
        
        const initialState = getCleanModeState();
        toggleCleanMode(initialState);
        
        btn.addEventListener('click', () => {
            const newState = !getCleanModeState();
            setCleanModeState(newState);
            toggleCleanMode(newState);
        });
        
        console.log('✅ Clean Mode кнопка додана в:', container.className || container.tagName);
    }
    
    initCleanMode();
    
})();