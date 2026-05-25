/*  ======================================================================  */
/*  scrollToTop.js – автогенерація кнопки «Наверх» та повна стилізація     */
/*  ======================================================================  */

(() => {
  /* ---------- 1. Перевірка, що скрипт не підвантажується більше одного разу ------------- */
  if (window._scrollToTopCreated) return;
  window._scrollToTopCreated = true;

  /* ---------- 2. Каркас кнопки (HTML) ------------------------------------------------- */
  const btnId = 'scrollToTopBtn';

  /* Якщо кнопка вже існує (наприклад, вручну в шаблоні), просто використаємо її. */
  let scrollBtn = document.getElementById(btnId);
  if (!scrollBtn) {
    scrollBtn = document.createElement('button');
    scrollBtn.id = btnId;
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.setAttribute('aria-label', 'Наверх');
    scrollBtn.innerText = '↑';
    document.body.appendChild(scrollBtn);
  }

  /* ---------- 4. Подія прокрутки – показ/сховання кнопки ----------------------------- */
  const showBtn = () => {
    if (window.scrollY > 500) {
      scrollBtn.classList.add('show');
    } else {
      scrollBtn.classList.remove('show');
    }
  };

  window.addEventListener('scroll', showBtn);

  /* Швидка прокрутка до початку сторінки по натисканню */
  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* Розрахуємо стан кнопки одразу після підключення скрипта (наприклад, при прямому переході по linkу) */
  showBtn();

  /* ------------------------------------------------------------------------------- */
  /* Конец IIFE – скрипт готовий до роботи                                       */
  /* ------------------------------------------------------------------------------- */
})();
