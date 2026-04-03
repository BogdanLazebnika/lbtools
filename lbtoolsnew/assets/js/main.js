/*=====================================================================
   0️⃣  УТИЛІТАРИ
   =====================================================================*/

/**
 * Throttle – виконує функцію не частіше, ніж раз за `limit` мс.
 * Потрібно, щоб скрол‑обробник не навантажував браузер.
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
            <use href="assets/img/icons/icons.svg#${icon}"></use>
        </svg>
    `;
}

/*=====================================================================
   1️⃣  ᴅᴀᴛᴀ  (категорії та програми)
   =====================================================================*/
const categories = [
    {
        id: "images",
        name: "Зображення",
        icon: "image-ico",
        apps: [
            { id: "compress-image", name: "Стиснення зображень", url: "/image-apps/compress-image", icon: "image-ico", popular: true },
            { id: "resize-image",   name: "Зміна розміру",        url: "/image-apps/resize-image",   icon: "image-ico" },
            { id: "convert-image", name: "Конвертація формату", url: "/image-apps/convert-image", icon: "image-ico" }
        ]
    },
    {
        id: "video",
        name: "Відео",
        icon: "video-outline-ico",
        apps: [
            { id: "compress-video", name: "Стиснення відео",   url: "/apps/compress-video",   icon: "compress-video-outline-ico", popular: true },
            { id: "convert-video",  name: "Конвертація відео", url: "/apps/convert-video",   icon: "convert-video-outline-ico" }
        ]
    },
    {
        id: "audio",
        name: "Аудіо",
        icon: "audio-outline-ico",
        apps: [
            { id: "convert-audio", name: "Конвертація аудіо", url: "/apps/convert-audio", icon: "convert-audio-outline-ico", popular: true },
            { id: "trim-audio",    name: "Обрізання аудіо",   url: "/apps/trim-audio",    icon: "trim-audio-outline-ico" }
        ]
    }
];

/*=====================================================================
   2️⃣  HEADER – ініціалізація (тема, mobile‑menu, dropdown‑apps)
   =====================================================================*/
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
                `assets/img/icons/icons.svg#${theme === 'dark' ? 'sun-ico' : 'moon-ico'}`
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
       2.2  Мобільне меню (гамбургер)
       ------------------------------------------------- */
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const nav     = document.querySelector('.main-nav');
    if (menuBtn && nav) {
        menuBtn.onclick = () => {
            menuBtn.classList.toggle('active');
            nav.classList.toggle('active');
        };
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
   3️⃣  HEADER – «липке» меню (з тротлінгом)
   =====================================================================*/
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
   4️⃣  FOOTER – автопідключення меню «Apps» (footer‑apps)
   =====================================================================*/
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
   5️⃣  ДИНАМІЧНЕ РЕНДЕРИНГ ЗА ТАБЛИЦЕЮ `data-links`
        (Header‑dropdown, Footer‑dropdown, Category‑lists, etc.)
   =====================================================================*/

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
        const content = trigger.nextElementSibling; // .category-content‑…
        if (!content) return;

        trigger.addEventListener('click', () => {
            const alreadyOpen = content.classList.contains(openCls);

            // 1️⃣ Закрити всі інші у цьому контейнері
            container.querySelectorAll(contentSel).forEach(el => el.classList.remove(openCls));
            container.querySelectorAll(triggerSel).forEach(el => el.classList.remove(activeCls));

            // 2️⃣ Якщо поточний був закритий – відкрити його
            if (!alreadyOpen) {
                content.classList.add(openCls);
                trigger.classList.add(activeCls);
            }
        });

        // Клік всередині контенту не має «прокидатися» до document
        content.addEventListener('click', e => e.stopPropagation());
    });
}

/**
 * Основна функція, яка заповнює всі елементи з атрибутом `data-links`.
 * Після заповнення підключає потрібну логіку (аккордеони, плавний скрол тощо).
 */
function renderDynamicLinks() {
    // -------- 1️⃣ Підготовка «всіх» додатків (для типу “all”, “related” і т.д. ----------
    const allApps = categories.flatMap(cat =>
        cat.apps.map(app => ({
            ...app,
            category: cat.id,
            categoryName: cat.name,
            categoryIcon: cat.icon
        }))
    );

    // -------- 2️⃣ Знаходимо всі блоки, які треба заповнити ----------
    const blocks = document.querySelectorAll('[data-links]');

    blocks.forEach(block => {
        const type      = block.dataset.links;      // header | footer | category | related | all
        const category  = block.dataset.category;   // для type="category"
        const current   = block.dataset.current;    // для type="related"

        let html = '';

        // -------- 3️⃣ Формуємо HTML залежно від типу ----------
        if (type === "header") {
            // ---- Шапка (header‑dropdown) ----
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
        } else if (type === "footer") {
            // ---- Футер (footer‑dropdown) ----
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
        } else if (type === "category") {
            // ---- Список додатків однієї категорії ----
            const list = allApps.filter(a => a.category === category);
            html = list.map(app => `
                <a href="${app.url}" class="app-link">
                    ${getIcon(app.icon, 'app-icon')}
                    <span class="app-name">${app.name}</span>
                </a>
            `).join('');
        } else if (type === "related") {
            // ---- Схожі додатки (ті ж категорії, крім поточного) ----
            const list = allApps.filter(a => a.category === category && a.id !== current);
            html = list.map(app => `
                <a href="${app.url}" class="app-link">
                    ${getIcon(app.icon, 'app-icon')}
                    <span class="app-name">${app.name}</span>
                </a>
            `).join('');
        } else if (type === "all") {
            // ---- Всі додатки, згруповані по категоріях ----
            const grouped = {};
            allApps.forEach(app => {
                if (!grouped[app.category]) grouped[app.category] = [];
                grouped[app.category].push(app);
            });
            html = Object.entries(grouped).map(([catId, apps]) => {
                const catInfo = categories.find(c => c.id === catId);
                return `
                    <div class="category-group">
                        <div class="category-title">
                            ${getIcon(catInfo.icon, 'category-icon')}
                            <h3>${catInfo.name}</h3>
                        </div>
                        <div class="apps-grid">
                            ${apps.map(app => `
                                <a href="${app.url}" class="app-link">
                                    ${getIcon(app.icon, 'app-icon')}
                                    <span class="app-name">${app.name}</span>
                                </a>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('');
        }

        // -------- 4️⃣ Вставляємо HTML у контейнер ----------
        block.innerHTML = html;

        // -------- 5️⃣ Підключаємо «аккордеони» лише для header/footer ----------
        if (type === "header" || type === "footer") {
            setupDropdowns(block, type);
        }
    });
}

/*=====================================================================
   6️⃣  ПЛАВНИЙ СКРОЛ (загальні посилання)
   =====================================================================*/
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
   7️⃣  ЗАВАНТАЖЕННЯ ШАБЛОНІВ (header.html, footer.html)
   =====================================================================*/
document.addEventListener('DOMContentLoaded', () => {
    const headerEl = document.getElementById('header');
    const footerEl = document.getElementById('footer');

    const promises = [];

    // ---- 7.1  Завантажуємо header ----
    if (headerEl) {
        promises.push(
            fetch('templates/header.html')
                .then(r => r.text())
                .then(html => {
                    headerEl.innerHTML = html;
                    initHeader();        // тема, меню, dropdown‑apps у хедері
                    initHeaderScroll();  // «липке» меню
                })
        );
    }

    // ---- 7.2  Завантажуємо footer ----
    if (footerEl) {
        promises.push(
            fetch('templates/footer.html')
                .then(r => r.text())
                .then(html => {
                    footerEl.innerHTML = html;
                })
        );
    }

    // Після того, як обидва шаблони завантажені,
    // 1) заповнюємо динамічні блоки (categories, apps, etc.)
    // 2) підключаємо плавний скрол та інші «загальні» скрипти.
    Promise.all(promises).then(() => {
        renderDynamicLinks();   // <‑‑ ваш «initLinks», назву змінили, бо вже є
        initSmoothScroll();    // плавний скрол по #anchor‑посиланням
    });
});

/*=====================================================================
   8️⃣  ЕКСПОРТ ФУНКЦІЙ ДЛЯ ВИКОРИСТАННЯ ПОЗНІШЕ (наприклад, при
       динамічному підвантаженні нових секцій)
   =====================================================================*/
window.renderDynamicLinks = renderDynamicLinks;   // <‑‑ те саме, що раніше `initLinks`
window.reloadLinks        = renderDynamicLinks;   // сумісність з існуючими викликами

/*=====================================================================
   9️⃣  КОНСОЛЬНЕ ПОВІДОМЛЕННЯ (запевняємо, що скрипти завантажились)
   =====================================================================*/
console.log('💡 main.js – успішно ініціалізовано');
