/*=====================================================================
   =====================================================================
   ██╗     ██████╗     ████████╗ ██████╗  ██████╗ ██╗     ███████╗
   ██║     ██╔══██╗    ╚══██╔══╝██╔═══██╗██╔═══██╗██║     ██╔════╝
   ██║     ██████╔╝       ██║   ██║   ██║██║   ██║██║     ███████╗
   ██║     ██╔══██╗       ██║   ██║   ██║██║   ██║██║     ╚════██║
   ███████╗██████╔╝       ██║   ╚██████╔╝╚██████╔╝███████╗███████║
   ╚══════╝╚═════╝        ╚═╝    ╚═════╝  ╚═════╝ ╚══════╝╚══════╝
   =====================================================================
   =====================================================================
   
   ██╗      ██████╗     ████████╗ ██████╗  ██████╗ ██╗     ███████╗
   ██║     ██╔══██╗    ╚══██╔══╝██╔═══██╗██╔═══██╗██║     ██╔════╝
   ██║     ██████╔╝       ██║   ██║   ██║██║   ██║██║     ███████╗
   ██║     ██╔══██╗       ██║   ██║   ██║██║   ██║██║     ╚════██║
   ███████╗██████╔╝       ██║   ╚██████╔╝╚██████╔╝███████╗███████║
   ╚══════╝╚═════╝        ╚═╝    ╚═════╝  ╚═════╝ ╚══════╝╚══════╝
   
   ======================== LB TOOLS MAIN.JS ========================
   Версія: 2.0.0
   Опис: Головний скрипт сайту LB Tools
         Відповідає за: теми, меню, рендеринг додатків, анімації
   ===================================================================
   =================================================================*/

/*=====================================================================
   =====================================================================
   0️⃣  УТИЛІТАРИ
   =====================================================================
   =================================================================*/

/**
 * Throttle – виконує функцію не частіше, ніж раз за `limit` мс.
 * Потрібно, щоб скрол‑обробник не навантажував браузер.
 * 
 * @param {Function} func - Функція, яку потрібно обмежити
 * @param {number} limit - Ліміт часу в мілісекундах
 * @returns {Function} - Функція з обмеженням
 */
function throttle(func, limit) {
    let inThrottle = false;
    return (...args) => {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * Повертає SVG‑ікону, підключену через <use>.
 *
 * @param {string} icon       – назва символу у файлі icons.svg
 * @param {string} className – клас(и) для <svg>
 * @returns {string} HTML‑рядок із SVG‑іконою
 */
function getIcon(icon, className = 'icon') {
    return `
        <svg class="${className}">
            <use href="/assets/img/icons/icons.svg#${icon}"></use>
        </svg>
    `;
}

/*=====================================================================
   =====================================================================
   1️⃣  ᴅᴀᴛᴀ  (категорії та програми)
   =====================================================================
   =================================================================*/

/**
 * Масив категорій та додатків
 * Використовується для динамічного рендерингу меню та списків
 */
const categories = [
    {
        id: "images",
        name: "Зображення",
        icon: "image-ico",
        url: "/image-apps",
        apps: [
            { id: "compress-image", name: "Стиснення зображень", url: "/image-apps/compress-image", icon: "optimization-img-ico", popular: true },
            { id: "resize-image",   name: "Зміна розміру зображень",        url: "/image-apps/resize-image",   icon: "resize-img-ico" },
            { id: "convert-image", name: "Конвертація формату", url: "/image-apps/convert-image", icon: "convert-image-ico" }
        ]
    },
    {
        id: "pdf",
        name: "pdf",
        icon: "pdf-tool-ico",
        url: "/pdf-apps",
        apps: [
            { id: "compress-image", name: "Стиснення PDF", url: "/pdf-apps/compress-pdf", icon: "compress-pdf-outline-ico", popular: true },
            { id: "resize-image",   name: "Об'єднання PDF",        url: "/pdf-apps/marge-pdf",   icon: "merge-pdf-ico" },
        ]
    }
];

/*=====================================================================
   =====================================================================
   2️⃣  HEADER – ініціалізація (тема, mobile‑menu, dropdown‑apps)
   =====================================================================
   =================================================================*/

/**
 * Головна функція ініціалізації header
 * Включає: перемикач теми, мобільне меню, dropdown застосунків
 */
function initHeader() {
    /* -------------------------------------------------
       2.1  Перемикач теми (sun/moon)
       ------------------------------------------------- */
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        const iconUse = themeBtn.querySelector('.icon use');

        const setIcon = theme =>
            iconUse?.setAttribute(
                'href',
                `/assets/img/icons/icons.svg#${theme === 'dark' ? 'sun-ico' : 'moon-ico'}`
            );

        themeBtn.onclick = () => {
            const html = document.documentElement;
            const newTheme = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            setIcon(newTheme);
        };

        const savedTheme =
            localStorage.getItem('theme') ||
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

        document.documentElement.setAttribute('data-theme', savedTheme);
        setIcon(savedTheme);
    }

    /* -------------------------------------------------
   2.2  Мобільне меню (гамбургер) з ПОКРАЩЕНОЮ ЛОГІКОЮ
   ------------------------------------------------- */
const menuBtn = document.querySelector('.mobile-menu-btn');
const nav = document.querySelector('.main-nav');

if (menuBtn && nav) {
    // Функція закриття меню
    const closeMenu = () => {
        menuBtn.classList.remove('active');
        nav.classList.remove('active');
        document.body.style.overflow = '';
    };
    
    // Функція відкриття меню
    const openMenu = () => {
        menuBtn.classList.add('active');
        nav.classList.add('active');
        document.body.style.overflow = 'hidden';
    };
    
    // Тогл меню при кліку на кнопку
    menuBtn.onclick = (e) => {
        e.stopPropagation();
        if (nav.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    };
    
    // 1. Закриття при кліку поза меню
    document.addEventListener('click', (e) => {
        const isMenuOpen = nav.classList.contains('active');
        const isClickOnMenu = nav.contains(e.target);
        const isClickOnBtn = menuBtn.contains(e.target);
        
        if (isMenuOpen && !isClickOnMenu && !isClickOnBtn) {
            closeMenu();
        }
    });
    
    // 2. Закриття ТІЛЬКИ при натисканні на ЗВИЧАЙНІ посилання (НЕ на кнопки dropdown)
    nav.querySelectorAll('a').forEach(link => {
        // Перевіряємо, чи це не кнопка випадаючого меню
        const isDropdownToggle = link.id === 'appsToggle' || 
                                 link.classList.contains('dropdown-header-link-btn') ||
                                 link.classList.contains('category-header');
        
        if (!isDropdownToggle) {
            link.addEventListener('click', (e) => {
                // Перевіряємо, чи клік не на елементі випадаючого меню
                const isInsideDropdown = e.target.closest('.dropdown-header-link, .category-header, .category-dropdown-header');
                
                if (!isInsideDropdown) {
                    closeMenu();
                }
            });
        }
    });
    
    // 3. Закриття при свайпі вправо (для мобільних) - ПОКРАЩЕНА ВЕРСІЯ
    let touchStartX = 0;
    let touchStartY = 0;
    
    nav.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    nav.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = Math.abs(touchEndY - touchStartY);
        
        // Свайп вправо спрацьовує ТІЛЬКИ якщо:
        // 1. Рух вправо більше 50px
        // 2. Горизонтальний рух більший за вертикальний (не вертикальний скрол)
        // 3. Меню відкрите
        if (deltaX > 50 && deltaX > deltaY && nav.classList.contains('active')) {
            closeMenu();
        }
    }, { passive: true });
    
    // 4. Закриття при зміні орієнтації екрану
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && nav.classList.contains('active')) {
            closeMenu();
        }
    });
    
    // 5. Закриття при натисканні ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('active')) {
            closeMenu();
        }
    });
}

    /* -------------------------------------------------
       2.3  Dropdown «Застосунки» у шапці
       ------------------------------------------------- */
    const appsToggle   = document.getElementById('appsToggle');
    const appsDropdown = document.getElementById('appsDropdown');

    if (appsToggle && appsDropdown) {
        appsToggle.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();

            appsDropdown.classList.toggle('open');
            const arrow = appsToggle.querySelector('.dropdown-arrow-header-link');
            arrow?.classList.toggle('active');
        });

        // клік поза dropdown – закрити
        document.addEventListener('click', e => {
            const isOpen = appsDropdown.classList.contains('open');
            if (isOpen && !appsDropdown.contains(e.target) && e.target !== appsToggle) {
                appsDropdown.classList.remove('open');
                const arrow = appsToggle.querySelector('.dropdown-arrow-header-link');
                arrow?.classList.remove('active');
            }
        });

        // клік всередині dropdown – не «прокидати» подію далі
        appsDropdown.addEventListener('click', e => e.stopPropagation());
    }
}

/*=====================================================================
   =====================================================================
   3️⃣  HEADER – «липке» меню (з тротлінгом)
   =====================================================================
   =================================================================*/

/**
 * Ініціалізація липкого меню
 * Додає клас 'scrolled' при скролі більше 72px
 */
function initHeaderScroll() {
    const siteHeader = document.querySelector('.site-header');
    if (!siteHeader) return;

    const scrollHandler = throttle(() => {
        siteHeader.classList.toggle('scrolled', window.scrollY > 72);
    }, 16); // ~60fps

    window.addEventListener('scroll', scrollHandler);
    // первісний стан
    siteHeader.classList.toggle('scrolled', window.scrollY > 50);
}

/*=====================================================================
   =====================================================================
   4️⃣  FOOTER – автопідключення меню «Apps» (footer‑apps)
   =====================================================================
   =================================================================*/

/**
 * Автоматичне підключення меню застосунків у футері
 * Працює навіть при динамічному завантаженні
 */
(function footerAppsInit() {
    const BTN_SELECTOR  = '.footer-menu-item:nth-child(2) .footer-menu-link';
    const MENU_SELECTOR = '.footer-apps-section';

    const attachHandler = (button, menu) => {
        if (!button || !menu) return;
        if (button.__footerAppsHandlerAttached) return;
        button.__footerAppsHandlerAttached = true;

        // 1️⃣ клік по документу (capture) – відкриття/закриття меню
        document.addEventListener('click', e => {
            const isBtn   = button === e.target || button.contains(e.target);
            const isOpen  = menu.classList.contains('active');

            if (isBtn) {
                e.preventDefault();
                menu.classList.toggle('active');
                button.classList.toggle('active-button');
            } else if (isOpen && !menu.contains(e.target)) {
                menu.classList.remove('active');
                button.classList.remove('active-button');
            }
        }, true); // capture‑phase

        // 2️⃣ клік всередині меню – не «прокидатися» далі
        menu.addEventListener('click', e => e.stopPropagation());
    };

    const btnNow = document.querySelector(BTN_SELECTOR);
    const menuNow = document.querySelector(MENU_SELECTOR);

    if (btnNow && menuNow) {
        attachHandler(btnNow, menuNow);
        return;
    }

    // Якщо футер підвантажується динамічно – спостерігаємо DOM
    const observer = new MutationObserver(() => {
        const btn = document.querySelector(BTN_SELECTOR);
        const mnu = document.querySelector(MENU_SELECTOR);
        if (btn && mnu) {
            attachHandler(btn, mnu);
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
})();

/*=====================================================================
   =====================================================================
   5️⃣  ДИНАМІЧНЕ РЕНДЕРИНГ ЗА ТАБЛИЦЕЮ `data-links`
        (Header‑dropdown, Footer‑dropdown, Category‑lists, etc.)
   =====================================================================
   =================================================================*/

/**
 * Підключає «аккордеони» (відкриття/закриття) у переданому контейнері.
 *
 * @param {Element} container – елемент, у якому треба шукати .category‑header/.category‑footer
 * @param {string} type      – "header" або "footer"
 */
function setupDropdowns(container, type) {
    const isHeader      = type === "header";
    const triggerSel    = isHeader ? ".category-header"       : ".category-footer";
    const contentSel    = isHeader ? ".category-content-header" : ".category-content-footer";
    const activeCls     = "active";
    const openCls       = "open";

    const triggers = container.querySelectorAll(triggerSel);
    triggers.forEach(trigger => {
        const content = trigger.nextElementSibling;
        if (!content) return;

        trigger.addEventListener('click', () => {
            const alreadyOpen = content.classList.contains(openCls);

            // Закрити всі інші у цьому контейнері
            container.querySelectorAll(contentSel).forEach(el => el.classList.remove(openCls));
            container.querySelectorAll(triggerSel).forEach(el => el.classList.remove(activeCls));

            // Якщо поточний був закритий – відкрити його
            if (!alreadyOpen) {
                content.classList.add(openCls);
                trigger.classList.add(activeCls);
            }
        });

        content.addEventListener('click', e => e.stopPropagation());
    });
}

/**
 * Основна функція, яка заповнює всі елементи з атрибутом `data-links`.
 * Після заповнення підключає потрібну логіку (аккордеони, плавний скрол тощо).
 */
function renderDynamicLinks() {
    // Підготовка «всіх» додатків
    const allApps = categories.flatMap(cat =>
        cat.apps.map(app => ({
            ...app,
            category: cat.id,
            categoryName: cat.name,
            categoryIcon: cat.icon
        }))
    );

    // Знаходимо всі блоки, які треба заповнити
    const blocks = document.querySelectorAll('[data-links]');

    blocks.forEach(block => {
        const type      = block.dataset.links;      // header | footer | category | related | all
        const category  = block.dataset.category;   // для type="category"
        const current   = block.dataset.current;    // для type="related"

        let html = '';

        if (type === "header") {
            // Шапка (header‑dropdown)
            html = categories.map(cat => `
                <div class="category-dropdown-header">
                    <div class="category category-header">
                        ${getIcon(cat.icon, 'category-icon category-icon-header')}
                        <span class="category-name category-name-header">${cat.name}</span>
                        <span class="category-name-arrow category-name-arrow-header">▼</span>
                    </div>
                    <div class="category-content category-content-header">
                        <div class="apps-grid apps-grid-header">
                            ${cat.apps.map(app => `
                                <a href="${app.url}" class="app-link app-link-header">
                                    ${getIcon(app.icon, 'app-icon app-icon-header')}
                                    <span class="app-name app-name-header">${app.name}</span>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `).join('');
        } 
        else if (type === "footer") {
            // Футер (footer‑dropdown)
            html = categories.map(cat => `
                <div class="category-dropdown category-dropdown-footer">
                    <div class="category category-footer">
                        ${getIcon(cat.icon, 'category-icon category-icon-footer')}
                        <span class="category-name category-name-footer">${cat.name}</span>
                        <span class="category-name-arrow category-name-arrow-footer">▼</span>
                    </div>
                    <div class="category-content category-content-footer">
                        <div class="apps-grid apps-grid-footer">
                            ${cat.apps.map(app => `
                                <a href="${app.url}" class="app-link app-link-footer">
                                    ${getIcon(app.icon, 'app-icon app-icon-footer')}
                                    <span class="app-name app-name-footer">${app.name}</span>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `).join('');
        } 
        else if (type === "category") {
            // Список додатків однієї категорії (унікальні класи)
            const list = allApps.filter(a => a.category === category);
            html = `<div class="category-simple-list">` + 
                list.map(app => `
                    <a href="${app.url}" class="app-link-category">
                        ${getIcon(app.icon, 'app-icon-category')}
                        <span class="app-name-category">${app.name}</span>
                        ${app.popular ? '<span class="popular-badge-category">🔥 Популярний</span>' : ''}
                    </a>
                `).join('') + 
                `</div>`;
        } 
        else if (type === "related") {
            // Схожі додатки (унікальні класи)
            const list = allApps.filter(a => a.category === category && a.id !== current);
            html = `<div class="related-simple-list">` + 
                list.map(app => `
                    <a href="${app.url}" class="app-link-related">
                        ${getIcon(app.icon, 'app-icon-related')}
                        <span class="app-name-related">${app.name}</span>
                    </a>
                `).join('') + 
                `</div>`;
        } 
        else if (type === "all") {
            // Всі додатки, згруповані по категоріях (унікальні класи)
            const grouped = {};
            allApps.forEach(app => {
                if (!grouped[app.category]) grouped[app.category] = [];
                grouped[app.category].push(app);
            });
            
            html = `<div class="all-apps-container">` + 
                Object.entries(grouped).map(([catId, apps]) => {
                    const catInfo = categories.find(c => c.id === catId);
                    return `
                        <div class="category-group-all">
                            <a href="${catInfo.url}" class="category-title-all">
                                ${getIcon(catInfo.icon, 'category-icon-all')}
                                <h3 class="category-name-all">${catInfo.name}</h3>
                                <span class="category-count-all">${apps.length} додатків</span>
                            </a>
                            <div class="apps-grid-all">
                                ${apps.map(app => `
                                    <a href="${app.url}" class="app-link-all">
                                        ${getIcon(app.icon, 'app-icon-all')}
                                        <div class="app-info-all">
                                            <span class="app-name-all">${app.name}</span>
                                            ${app.popular ? '<span class="popular-badge-all">Популярний</span>' : ''}
                                        </div>
                                    </a>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }).join('') + 
                `</div>`;
        }

        // Вставляємо HTML у контейнер
        block.innerHTML = html;

        // Підключаємо «аккордеони» лише для header/footer
        if (type === "header" || type === "footer") {
            setupDropdowns(block, type);
        }
    });
}

/*=====================================================================
   =====================================================================
   6️⃣  ПЛАВНИЙ СКРОЛ (загальні посилання)
   =====================================================================
   =================================================================*/

/**
 * Ініціалізація плавного скролу для якірних посилань
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

/*=====================================================================
   =====================================================================
   7️⃣  ЗАВАНТАЖЕННЯ ШАБЛОНІВ (header.html, footer.html)
   =====================================================================
   =================================================================*/

/**
 * Головна ініціалізація при завантаженні DOM
 * Завантажує header та footer, потім рендерить динамічні посилання
 */
document.addEventListener('DOMContentLoaded', () => {
    const headerEl = document.getElementById('header');
    const footerEl = document.getElementById('footer');

    const promises = [];

    if (headerEl) {
        promises.push(
            fetch('/templates/header.html')
                .then(r => r.text())
                .then(html => {
                    headerEl.innerHTML = html;
                    initHeader();
                    initHeaderScroll();
                })
        );
    }

    if (footerEl) {
        promises.push(
            fetch('/templates/footer.html')
                .then(r => r.text())
                .then(html => {
                    footerEl.innerHTML = html;
                })
        );
    }

    Promise.all(promises).then(() => {
        renderDynamicLinks();
        initSmoothScroll();
    });
});

/*=====================================================================
   =====================================================================
   8️⃣  ЕКСПОРТИ ТА ГЛОБАЛЬНІ ФУНКЦІЇ
   =====================================================================
   =================================================================*/

// Експортуємо функції для використання в інших скриптах
window.renderDynamicLinks = renderDynamicLinks;
window.reloadLinks        = renderDynamicLinks;

console.log('💡 main.js – успішно ініціалізовано');

/*=====================================================================
   =====================================================================
   9️⃣  ПІДКЛЮЧЕННЯ ДОДАТКОВИХ МОДУЛІВ
   =====================================================================
   =================================================================*/

// Підключення Clean Mode модуля
const cleanModeScript = document.createElement('script');
cleanModeScript.src = '/assets/js/clean-mode.js';
cleanModeScript.defer = true;
document.head.appendChild(cleanModeScript);

/*=====================================================================
   =====================================================================
   🔟  FAQ АКОРДЕОН ТА АНІМАЦІЇ
   =====================================================================
   =================================================================*/

/**
 * FAQ Акордеон - розкриття/закриття відповідей
 * Підтримує два типи:
 * - .faq-item-tool / .faq-question-tool (для сторінок застосунків)
 * - .faq-item-cat / .faq-question-cat (для категоріальних сторінок)
 */
document.addEventListener('DOMContentLoaded', function() {
    // ========== FAQ ДЛЯ СТОРІНОК ЗАСТОСУНКІВ ==========
    const faqItemsTool = document.querySelectorAll('.faq-item-tool');
    
    faqItemsTool.forEach(item => {
        const question = item.querySelector('.faq-question-tool');
        if (question) {
            // Видаляємо старі обробники, щоб уникнути дублювання
            const newQuestion = question.cloneNode(true);
            question.parentNode.replaceChild(newQuestion, question);
            
            newQuestion.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Закриваємо всі інші
                faqItemsTool.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Відкриваємо/закриваємо поточний
                item.classList.toggle('active');
            });
        }
    });
    
    // ========== FAQ ДЛЯ КАТЕГОРІАЛЬНИХ СТОРІНОК ==========
    const faqItemsCat = document.querySelectorAll('.faq-item-cat');
    
    faqItemsCat.forEach(item => {
        const question = item.querySelector('.faq-question-cat');
        if (question) {
            // Видаляємо старі обробники, щоб уникнути дублювання
            const newQuestion = question.cloneNode(true);
            question.parentNode.replaceChild(newQuestion, question);
            
            newQuestion.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Закриваємо всі інші
                faqItemsCat.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });
                
                // Відкриваємо/закриваємо поточний
                item.classList.toggle('active');
                
                // Оновлюємо стрілку
                const arrow = this.querySelector('span');
                if (arrow) {
                    arrow.textContent = item.classList.contains('active') ? '▲' : '▼';
                }
            });
        }
    });
    
    if (faqItemsTool.length > 0 || faqItemsCat.length > 0) {
        console.log('✅ FAQ акордеон ініціалізовано! Знайдено:', 
                    faqItemsTool.length, 'tool,', faqItemsCat.length, 'cat');
    }
});

/**
 * Анімації при скролі
 * Плавна поява елементів при прокручуванні
 */
const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Анімація для різних типів елементів
document.querySelectorAll('.step, .testimonial-card, .format-badge, .faq-item-tool, .faq-item-cat, .stat-card').forEach(el => {
    if (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    }
});

console.log('✅ Сторінка готова!');

/*=====================================================================
   =====================================================================
   🚀 КІНЕЦЬ ФАЙЛУ MAIN.JS
   =====================================================================
   =================================================================*/