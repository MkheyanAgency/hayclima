/**
 * HayClima.am - Premium Core Application Script
 * Orchestrates Multilingual i18n, Theme Switcher, Mobile Navigation,
 * Interactive HVAC Calculator, Portfolio Filters, FAQ Accordions, and Contact Form.
 */

import { translations } from './translations.js';

class HayClimaApp {
  constructor() {
    this.currentLang = localStorage.getItem('preferredLanguage') || 'hy';
    this.currentTheme = localStorage.getItem('selectedTheme') || 'dark';
    this.init();
  }

  // Guaranteed lifecycle methods on class prototype to prevent any TypeError
  updateCalculatorValues() {
    // Default no-op for pages without calculator; overridden dynamically if calculator exists
  }

  updateChatLanguage(lang) {
    // Default no-op; overridden dynamically when AI assistant widget is initialized
  }

  init() {
    // 1. Initialize Theme
    this.applyTheme(this.currentTheme);
    this.bindThemeSwitchers();

    // 2. Navigation & Mobile Drawer
    this.setupNavigation();

    // 3. Interactive Components
    this.setupCalculator();
    this.setupPortfolioFilter();
    this.setupFaqAccordion();
    this.setupContactForm();
    this.setupLightbox();
    this.setupProductInquiryModal();
    this.setupAiAssistant();

    // 4. Language Engine
    this.applyLanguage(this.currentLang);
    this.bindLanguageSwitchers();
  }

  /* ==========================================================================
     LANGUAGE ENGINE (i18n)
     ========================================================================== */
  applyLanguage(lang) {
    if (!translations[lang]) lang = 'hy';
    this.currentLang = lang;
    localStorage.setItem('preferredLanguage', lang);

    document.documentElement.setAttribute('lang', lang);

    const dict = translations[lang];

    // Translate standard text elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.innerHTML = dict[key];
      }
    });

    // Translate inputs & placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) {
        el.setAttribute('placeholder', dict[key]);
      }
    });

    // Translate accessibility ARIA labels
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      if (dict[key]) {
        el.setAttribute('aria-label', dict[key]);
      }
    });

    // Update active class on all switchers
    document.querySelectorAll('.language-switcher').forEach(switcher => {
      const buttons = switcher.querySelectorAll('.lang-btn');
      buttons.forEach(btn => {
        const btnLang = btn.getAttribute('data-lang');
        if (btnLang === lang) {
          btn.classList.add('active');
          btn.setAttribute('aria-pressed', 'true');
        } else {
          btn.classList.remove('active');
          btn.setAttribute('aria-pressed', 'false');
        }
      });
    });

    // Safely update calculator dynamic outputs if present on current page
    if (typeof this.updateCalculatorValues === 'function') {
      this.updateCalculatorValues();
    }

    // Safely update AI assistant language texts if initialized
    if (typeof this.updateChatLanguage === 'function') {
      this.updateChatLanguage(lang);
    }

    // Refresh theme toggle label according to language
    this.applyTheme(this.currentTheme);
  }

  bindLanguageSwitchers() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('.lang-btn');
      if (target && target.hasAttribute('data-lang')) {
        e.preventDefault();
        const selectedLang = target.getAttribute('data-lang');
        this.applyLanguage(selectedLang);
      }
    });
  }

  /* ==========================================================================
     THEME CONTROLLER (Dark / Light)
     ========================================================================== */
  applyTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('selectedTheme', theme);

    const moonIcon = '<i class="fas fa-moon" aria-hidden="true"></i>';
    const sunIcon = '<i class="fas fa-sun" aria-hidden="true"></i>';

    const lightLabels = {
      hy: 'Լուսավոր Ռեժիմ',
      ru: 'Светлая Тема',
      en: 'Light Mode'
    };
    const darkLabels = {
      hy: 'Մութ Ռեժիմ',
      ru: 'Темная Тема',
      en: 'Dark Mode'
    };

    const currentLang = this.currentLang || 'hy';
    const lightText = lightLabels[currentLang] || 'Light Mode';
    const darkText = darkLabels[currentLang] || 'Dark Mode';

    document.querySelectorAll('.theme-toggle').forEach(btn => {
      const isMobileText = btn.classList.contains('theme-toggle-full');
      if (isMobileText) {
        btn.innerHTML = theme === 'dark' 
          ? `${sunIcon} <span>${lightText}</span>` 
          : `${moonIcon} <span>${darkText}</span>`;
      } else {
        btn.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
      }
      btn.setAttribute('aria-label', theme === 'dark' ? `Switch to ${lightText}` : `Switch to ${darkText}`);
    });
  }

  bindThemeSwitchers() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('.theme-toggle');
      if (target) {
        e.preventDefault();
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
      }
    });
  }

  /* ==========================================================================
     NAVIGATION & ACCESSIBLE MOBILE DRAWER
     ========================================================================== */
  setupNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navOverlay = document.querySelector('.nav-backdrop');

    if (!hamburger || !navLinks) return;

    const toggleMenu = (open) => {
      const isOpen = open !== undefined ? open : !hamburger.classList.contains('active');
      hamburger.classList.toggle('active', isOpen);
      navLinks.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      hamburger.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
      if (navOverlay) navOverlay.classList.toggle('active', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    if (navOverlay) {
      navOverlay.addEventListener('click', () => toggleMenu(false));
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && hamburger.classList.contains('active')) {
        toggleMenu(false);
        hamburger.focus();
      }
    });

    // Close mobile drawer on desktop resize to prevent stuck body overflow
    window.addEventListener('resize', () => {
      if (window.innerWidth > 992 && hamburger.classList.contains('active')) {
        toggleMenu(false);
      }
    }, { passive: true });

    // Set active nav link based on current path with accurate subpage matching
    const rawPath = window.location.pathname.replace(/\/$/, '') || '/';
    const currentPath = rawPath.replace(/\.html$/, '');
    navLinks.querySelectorAll('a').forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      const cleanHref = href.replace(/\/$/, '').replace(/\.html$/, '') || '/';
      link.classList.remove('active');
      if (
        cleanHref === currentPath ||
        (cleanHref === '/' && currentPath === '') ||
        (cleanHref === '/services' && (currentPath.startsWith('/services') || currentPath.startsWith('/service-')))
      ) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    // Close on navigation link click (do not close on language or theme toggles)
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggleMenu(false);
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (hamburger.classList.contains('active') && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
        toggleMenu(false);
      }
    });

    // Navbar elevation on scroll with immediate initial check
    const nav = document.querySelector('nav');
    if (nav) {
      const handleScroll = () => {
        if (window.scrollY > 20) {
          nav.classList.add('nav-scrolled');
        } else {
          nav.classList.remove('nav-scrolled');
        }
      };
      handleScroll();
      window.addEventListener('scroll', handleScroll, { passive: true });
    }
  }

  /* ==========================================================================
     INTERACTIVE HVAC CALCULATOR
     ========================================================================== */
  setupCalculator() {
    const areaInput = document.getElementById('calc-area-range');
    const areaValueDisplay = document.getElementById('calc-area-value');
    const serviceSelect = document.getElementById('calc-service-type');
    const btuResult = document.getElementById('calc-btu-result');
    const estResult = document.getElementById('calc-est-result');
    const orderBtn = document.getElementById('calc-order-whatsapp');

    if (!areaInput || !serviceSelect) return;

    const update = () => {
      const area = parseInt(areaInput.value, 10) || 25;
      const lang = this.currentLang || 'hy';
      const unit = lang === 'en' ? 'm²' : (lang === 'ru' ? 'м²' : 'մ²');
      if (areaValueDisplay) areaValueDisplay.textContent = `${area} ${unit}`;

      // Calculate recommended BTU
      let btu = "9,000 BTU";
      let kw = "2.6 kW";
      if (area > 22 && area <= 35) {
        btu = "12,000 BTU";
        kw = "3.5 kW";
      } else if (area > 35 && area <= 55) {
        btu = "18,000 BTU";
        kw = "5.3 kW";
      } else if (area > 55 && area <= 80) {
        btu = "24,000 BTU";
        kw = "7.0 kW";
      } else if (area > 80) {
        btu = lang === 'en' ? "36,000+ BTU (Multi/Duct)" : (lang === 'ru' ? "36,000+ BTU (Мульти/Канал)" : "36,000+ BTU (Multi/Duct)");
        kw = "10.5+ kW";
      }

      if (btuResult) {
        btuResult.innerHTML = `<strong>${btu}</strong> <span class="calc-kw">(${kw})</span>`;
      }

      // Calculate estimated cost
      const service = serviceSelect.value;
      let estPrice = "15,000 - 20,000 ֏";
      let serviceName = "Մաքրում";

      if (lang === 'en') {
        if (service === 'install') {
          serviceName = "Installation & Mounting";
          estPrice = area > 50 ? "35,000 - 45,000 AMD" : "25,000 - 30,000 AMD";
        } else if (service === 'cleaning') {
          serviceName = "Deep Chemical Cleaning";
          estPrice = "15,000 - 20,000 AMD";
        } else if (service === 'freon') {
          serviceName = "Freon Refilling";
          estPrice = "12,000 - 25,000 AMD";
        } else if (service === 'repair') {
          serviceName = "Diagnostics & Repair";
          estPrice = "From 10,000 AMD";
        }
      } else if (lang === 'ru') {
        if (service === 'install') {
          serviceName = "Монтаж и Установка";
          estPrice = area > 50 ? "35,000 - 45,000 ֏" : "25,000 - 30,000 ֏";
        } else if (service === 'cleaning') {
          serviceName = "Химическая Чистка";
          estPrice = "15,000 - 20,000 ֏";
        } else if (service === 'freon') {
          serviceName = "Заправка Фреоном";
          estPrice = "12,000 - 25,000 ֏";
        } else if (service === 'repair') {
          serviceName = "Диагностика и Ремонт";
          estPrice = "От 10,000 ֏";
        }
      } else {
        if (service === 'install') {
          serviceName = "Տեղադրում";
          estPrice = area > 50 ? "35,000 - 45,000 ֏" : "25,000 - 30,000 ֏";
        } else if (service === 'cleaning') {
          serviceName = "Խորը Քիմիական Մաքրում";
          estPrice = "15,000 - 20,000 ֏";
        } else if (service === 'freon') {
          serviceName = "Ֆրեոնի Լիցքավորում";
          estPrice = "12,000 - 25,000 ֏";
        } else if (service === 'repair') {
          serviceName = "Դիագնոստիկա և Վերանորոգում";
          estPrice = "Սկսած 10,000 ֏";
        }
      }

      if (estResult) {
        estResult.textContent = estPrice;
      }

      // Update WhatsApp Pre-filled link
      if (orderBtn) {
        let textPrompt = `Բարև Ձեզ! Կցանկանայի խորհրդատվություն ստանալ HayClima.am-ից:\nԾառայություն: ${serviceName}\nՏարածքի մակերես: ${area} մ²\nՀզորություն: ${btu}`;
        if (lang === 'ru') {
          textPrompt = `Здравствуйте! Хочу получить консультацию в HayClima.am:\nУслуга: ${serviceName}\nПлощадь: ${area} кв.м\nМощность: ${btu}`;
        } else if (lang === 'en') {
          textPrompt = `Hello! I would like a consultation from HayClima.am:\nService: ${serviceName}\nArea: ${area} sq.m\nCapacity: ${btu}`;
        }
        orderBtn.setAttribute('href', `https://wa.me/37441790679?text=${encodeURIComponent(textPrompt)}`);
      }
    };

    this.updateCalculatorValues = update;
    areaInput.addEventListener('input', update);
    serviceSelect.addEventListener('change', update);
    update();
  }

  /* ==========================================================================
     PORTFOLIO / PROJECTS FILTER
     ========================================================================== */
  setupPortfolioFilter() {
    const filterButtons = document.querySelectorAll('.portfolio-filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (!filterButtons.length || !projectCards.length) return;

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        projectCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = 'flex';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 20);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(15px)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 250);
          }
        });
      });
    });
  }

  /* ==========================================================================
     FAQ ACCORDION
     ========================================================================== */
  setupFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems.length) return;

    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      if (!question) return;

      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');

        // Close other items
        faqItems.forEach(other => {
          if (other !== item) {
            other.classList.remove('active');
            const otherBtn = other.querySelector('.faq-question');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle this item
        item.classList.toggle('active', !isOpen);
        question.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
      });
    });
  }

  /* ==========================================================================
     CONTACT FORM & VALIDATION
     ========================================================================== */
  setupContactForm() {
    const forms = document.querySelectorAll('.ajax-contact-form');

    forms.forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameInput = form.querySelector('input[name="name"]');
        const phoneInput = form.querySelector('input[name="phone"]');
        const serviceInput = form.querySelector('select[name="service"]');
        const messageInput = form.querySelector('textarea[name="message"]');
        const submitBtn = form.querySelector('button[type="submit"]');
        const feedbackEl = form.querySelector('.form-feedback');

        const name = nameInput ? nameInput.value.trim() : '';
        const phone = phoneInput ? phoneInput.value.trim() : '';
        const service = serviceInput ? serviceInput.value : '';
        const message = messageInput ? messageInput.value.trim() : '';

        const dict = translations[this.currentLang] || translations.hy;

        if (!name || !phone) {
          if (feedbackEl) {
            feedbackEl.className = 'form-feedback error';
            feedbackEl.textContent = dict.form_error;
          }
          return;
        }

        const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> ${dict.form_sending}`;
        }

        try {
          const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, service, message, language: this.currentLang })
          });

          const data = await response.json();

          if (feedbackEl) {
            feedbackEl.className = 'form-feedback success';
            feedbackEl.textContent = dict.form_success;
          }

          form.reset();
        } catch (err) {
          // Provide instant fallback WhatsApp link
          if (feedbackEl) {
            feedbackEl.className = 'form-feedback success';
            feedbackEl.innerHTML = `${dict.form_success} <br><a href="https://wa.me/37441790679" target="_blank" class="text-accent underline font-semibold mt-2 inline-block"><i class="fab fa-whatsapp"></i> Բացել WhatsApp-ով</a>`;
          }
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
          }
        }
      });
    });
  }

  /* ==========================================================================
     IMAGE LIGHTBOX PREVIEW
     ========================================================================== */
  setupLightbox() {
    const triggerImages = document.querySelectorAll('.lightbox-trigger');
    if (!triggerImages.length) return;

    let lightboxModal = document.querySelector('.lightbox-modal');
    if (!lightboxModal) {
      lightboxModal = document.createElement('div');
      lightboxModal.className = 'lightbox-modal';
      lightboxModal.innerHTML = `
        <div class="lightbox-overlay"></div>
        <div class="lightbox-content">
          <button class="lightbox-close" aria-label="Close image"><i class="fas fa-times"></i></button>
          <img class="lightbox-img" src="" alt="HayClima Project Preview">
          <p class="lightbox-caption"></p>
        </div>
      `;
      document.body.appendChild(lightboxModal);
    }

    const modalImg = lightboxModal.querySelector('.lightbox-img');
    const modalCaption = lightboxModal.querySelector('.lightbox-caption');
    const closeBtn = lightboxModal.querySelector('.lightbox-close');
    const overlay = lightboxModal.querySelector('.lightbox-overlay');

    const open = (src, caption) => {
      modalImg.src = src;
      modalCaption.textContent = caption || '';
      lightboxModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const close = () => {
      lightboxModal.classList.remove('active');
      document.body.style.overflow = '';
    };

    triggerImages.forEach(img => {
      img.addEventListener('click', () => {
        const fullSrc = img.getAttribute('data-full') || img.getAttribute('src');
        const caption = img.getAttribute('alt');
        open(fullSrc, caption);
      });
    });

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
        close();
      }
    });
  }

  /* ==========================================================================
     EQUIPMENT INQUIRY & ORDER MODAL
     ========================================================================== */
  setupProductInquiryModal() {
    let inquiryModal = document.querySelector('.inquiry-modal');
    if (!inquiryModal) {
      inquiryModal = document.createElement('div');
      inquiryModal.className = 'lightbox-modal inquiry-modal';
      inquiryModal.innerHTML = `
        <div class="lightbox-overlay"></div>
        <div class="contact-form-card" style="position: relative; z-index: 2005; max-width: 520px; width: 92%; max-height: 90vh; overflow-y: auto;">
          <button class="lightbox-close" style="top: 14px; right: 18px; color: var(--text-muted); font-size: 1.4rem;" aria-label="Close modal"><i class="fas fa-times"></i></button>
          <div class="section-kicker" style="margin-bottom: 6px;">HAYCLIMA EQUIPMENT</div>
          <h3 id="inquiry-modal-title" style="margin-bottom: 8px;">Սարքավորման Պատվեր</h3>
          <p style="font-size: 0.9rem; color: var(--text-sub); margin-bottom: 20px;">
            Լրացրեք հայտը սարքավորումը պատվիրելու կամ ինժեների խորհրդատվություն ստանալու համար:
          </p>

          <form id="inquiry-form" class="ajax-contact-form">
            <input type="hidden" id="inquiry-product-name" name="service" value="Equipment Inquiry" />

            <div class="form-group">
              <label class="form-label">Ընտրված Մոդելը</label>
              <input type="text" id="inquiry-product-display" class="form-control" readonly style="background: var(--surface-hover); font-weight: 700; color: var(--primary-light);" />
            </div>

            <div class="form-group" style="display: flex; align-items: center; gap: 10px; margin-bottom: 18px;">
              <input type="checkbox" id="inquiry-with-install" checked style="width: 18px; height: 18px; accent-color: var(--primary); cursor: pointer;" />
              <label for="inquiry-with-install" style="font-size: 0.88rem; font-weight: 600; cursor: pointer;">
                Ներառել պրոֆեսիոնալ տեղադրում (+1 տարի երաշխիք)
              </label>
            </div>

            <div class="form-group">
              <label class="form-label" for="inq-name">Ձեր Անունը *</label>
              <input type="text" id="inq-name" name="name" class="form-control" placeholder="Արմեն" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="inq-phone">Հեռախոսահամար *</label>
              <input type="tel" id="inq-phone" name="phone" class="form-control" placeholder="+374..." required />
            </div>

            <div class="form-group">
              <label class="form-label" for="inq-msg">Հասցե կամ հարցեր</label>
              <textarea id="inq-msg" name="message" class="form-control" placeholder="Երևան, հասցե կամ մանրամասներ..."></textarea>
            </div>

            <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; margin-bottom: 10px;">
              <i class="fas fa-paper-plane"></i> Ուղարկել Պատվերը
            </button>

            <a href="https://wa.me/37441790679" id="inquiry-wa-btn" target="_blank" class="btn-secondary" style="width: 100%; justify-content: center;">
              <i class="fab fa-whatsapp" style="color: #25d366;"></i> Պատվիրել Անմիջապես WhatsApp-ով
            </a>

            <div class="form-feedback" aria-live="polite"></div>
          </form>
        </div>
      `;
      document.body.appendChild(inquiryModal);
    }

    const modalTitle = inquiryModal.querySelector('#inquiry-modal-title');
    const modalDisplay = inquiryModal.querySelector('#inquiry-product-display');
    const modalHidden = inquiryModal.querySelector('#inquiry-product-name');
    const waBtn = inquiryModal.querySelector('#inquiry-wa-btn');
    const closeBtn = inquiryModal.querySelector('.lightbox-close');
    const overlay = inquiryModal.querySelector('.lightbox-overlay');

    const openModal = (productName) => {
      const name = productName || 'Inverter Split System';
      modalDisplay.value = name;
      modalHidden.value = `Equipment Order: ${name}`;
      waBtn.href = `https://wa.me/37441790679?text=${encodeURIComponent(`Բարև Ձեզ! Կցանկանայի պատվիրել սարքավորում: ${name} (ներառյալ տեղադրում)`)}`;
      inquiryModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
      inquiryModal.classList.remove('active');
      document.body.style.overflow = '';
    };

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    document.querySelectorAll('.btn-inquire-product').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const prod = btn.getAttribute('data-product-name') || btn.closest('.product-card')?.querySelector('.product-card-title')?.textContent;
        openModal(prod);
      });
    });
  }

  /* ==========================================================================
     AI CUSTOMER ASSISTANT (CHAT CLIENT)
     Full-featured, responsive, accessible, grounded AI advisor
     ========================================================================== */
  setupAiAssistant() {
    // 1. Inject Floating Trigger Button
    let trigger = document.querySelector('.chat-widget-trigger');
    if (!trigger) {
      trigger = document.createElement('button');
      trigger.className = 'chat-widget-trigger';
      trigger.setAttribute('aria-label', 'Open AI Climate Assistant');
      trigger.innerHTML = `
        <span class="chat-trigger-icon">
          <i class="fas fa-robot"></i>
          <span class="chat-pulse-dot"></span>
        </span>
        <span class="chat-trigger-text" data-i18n="chat_btn_label">AI Խորհրդատու</span>
      `;
      document.body.appendChild(trigger);
    }

    // 2. Inject Floating Chat Window
    let windowEl = document.querySelector('.chat-window');
    if (!windowEl) {
      windowEl = document.createElement('div');
      windowEl.className = 'chat-window';
      windowEl.setAttribute('role', 'dialog');
      windowEl.setAttribute('aria-label', 'HayClima AI Chat');
      windowEl.innerHTML = `
        <div class="chat-header">
          <div class="chat-header-info">
            <div class="chat-avatar"><i class="fas fa-snowflake"></i></div>
            <div>
              <div class="chat-header-title" data-i18n="chat_title">HayClima AI Կլիմայական Օգնական</div>
              <div class="chat-header-status" data-i18n="chat_status">Առցանց · 24/7 Ինժեներական Աջակցություն</div>
            </div>
          </div>
          <div class="chat-header-controls">
            <button type="button" class="chat-control-btn btn-chat-clear" title="Մաքրել" aria-label="Clear chat">
              <i class="fas fa-trash-alt"></i>
            </button>
            <button type="button" class="chat-control-btn btn-chat-close" title="Փակել" aria-label="Close chat">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <div class="chat-messages" id="chat-stream">
          <!-- Initial Welcome Message -->
          <div class="chat-bubble bot">
            <p id="chat-welcome-text" data-i18n="chat_welcome"></p>
            <div class="chat-suggestions-box">
              <div class="chat-suggestions-title" data-i18n="chat_suggested_title">Հաճախ տրվող հարցեր</div>
              <div class="chat-suggestions-list" id="chat-chips-container">
                <button type="button" class="chat-chip" data-q="suggest_1" data-i18n="chat_suggest_1"></button>
                <button type="button" class="chat-chip" data-q="suggest_2" data-i18n="chat_suggest_2"></button>
                <button type="button" class="chat-chip" data-q="suggest_3" data-i18n="chat_suggest_3"></button>
                <button type="button" class="chat-chip" data-q="suggest_4" data-i18n="chat_suggest_4"></button>
              </div>
            </div>
          </div>
        </div>

        <div class="chat-input-bar">
          <form class="chat-form" id="ai-chat-form">
            <input type="text" id="ai-chat-input" class="chat-input" placeholder="Գրեք Ձեր հարցը..." data-i18n-placeholder="chat_input_placeholder" autocomplete="off" />
            <button type="submit" class="chat-submit-btn" aria-label="Send message">
              <i class="fas fa-paper-plane"></i>
            </button>
          </form>
          <div class="chat-disclaimer" data-i18n="chat_disclaimer">
            Պատասխանները հիմնված են HayClima-ի պաշտոնական տվյալների վրա:
          </div>
        </div>
      `;
      document.body.appendChild(windowEl);
    }

    const streamEl = windowEl.querySelector('#chat-stream');
    const inputEl = windowEl.querySelector('#ai-chat-input');
    const formEl = windowEl.querySelector('#ai-chat-form');
    const closeBtn = windowEl.querySelector('.btn-chat-close');
    const clearBtn = windowEl.querySelector('.btn-chat-clear');

    // Conversation history stored in session
    this.chatHistory = [];
    try {
      const saved = sessionStorage.getItem('hayclima_chat_history');
      if (saved) {
        this.chatHistory = JSON.parse(saved);
      }
    } catch (_) {}

    // Toggle Chat Window
    trigger.addEventListener('click', () => {
      const isOpen = windowEl.classList.contains('active');
      windowEl.classList.toggle('active', !isOpen);
      if (!isOpen) {
        setTimeout(() => inputEl.focus(), 150);
      }
    });

    closeBtn.addEventListener('click', () => {
      windowEl.classList.remove('active');
    });

    // Clear Chat
    clearBtn.addEventListener('click', () => {
      this.chatHistory = [];
      sessionStorage.removeItem('hayclima_chat_history');
      const botWelcome = streamEl.querySelector('.chat-bubble.bot');
      streamEl.innerHTML = '';
      if (botWelcome) streamEl.appendChild(botWelcome);
    });

    // Form submission
    const handleSend = async (userText) => {
      const msg = (userText || inputEl.value || '').trim();
      if (!msg) return;

      inputEl.value = '';

      // Append User Bubble
      const userBubble = document.createElement('div');
      userBubble.className = 'chat-bubble user';
      userBubble.textContent = msg;
      streamEl.appendChild(userBubble);

      // Typing Indicator
      const typingEl = document.createElement('div');
      typingEl.className = 'chat-typing-dots';
      typingEl.innerHTML = `
        <span class="chat-typing-dot"></span>
        <span class="chat-typing-dot"></span>
        <span class="chat-typing-dot"></span>
      `;
      streamEl.appendChild(typingEl);
      streamEl.scrollTop = streamEl.scrollHeight;

      // Track history
      this.chatHistory.push({ role: 'user', text: msg });

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: msg,
            language: this.currentLang,
            history: this.chatHistory.slice(-4)
          })
        });

        const data = await response.json();
        typingEl.remove();

        const botReply = (data && data.reply) 
          ? data.reply 
          : "Մեր ինժեներները պատրաստ են Ձեզ օգնել: Խնդրում ենք զանգահարել +374 41 790679:";

        this.chatHistory.push({ role: 'model', text: botReply });
        sessionStorage.setItem('hayclima_chat_history', JSON.stringify(this.chatHistory.slice(-8)));

        // Append Bot Bubble with formatted linebreaks & bold text
        const botBubble = document.createElement('div');
        botBubble.className = 'chat-bubble bot';

        // Format basic markdown (line breaks, bold, bullet points)
        const formattedHtml = botReply
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\n\n/g, '</p><p>')
          .replace(/\n/g, '<br/>');

        botBubble.innerHTML = `
          <p>${formattedHtml}</p>
          <div class="chat-actions-row">
            <a href="tel:+37441790679" class="chat-action-btn primary">
              <i class="fas fa-phone-alt"></i> +374 41 790679
            </a>
            <a href="https://wa.me/37441790679" target="_blank" class="chat-action-btn">
              <i class="fab fa-whatsapp" style="color: #25d366;"></i> WhatsApp
            </a>
          </div>
        `;
        streamEl.appendChild(botBubble);
        streamEl.scrollTop = streamEl.scrollHeight;
      } catch (err) {
        typingEl.remove();
        const errBubble = document.createElement('div');
        errBubble.className = 'chat-bubble bot';
        errBubble.innerHTML = `
          <p>Կապի խնդիր: Կարող եք անմիջապես զանգահարել մեր ինժեներին:</p>
          <div class="chat-actions-row">
            <a href="tel:+37441790679" class="chat-action-btn primary"><i class="fas fa-phone-alt"></i> +374 41 790679</a>
          </div>
        `;
        streamEl.appendChild(errBubble);
        streamEl.scrollTop = streamEl.scrollHeight;
      }
    };

    formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSend();
    });

    // Suggested Question Chips Click
    windowEl.addEventListener('click', (e) => {
      const chip = e.target.closest('.chat-chip');
      if (chip) {
        const questionText = chip.textContent.trim();
        handleSend(questionText);
      }
    });

    // Language Sync method
    this.updateChatLanguage = (lang) => {
      const dict = translations[lang] || translations.hy;
      const welcomeEl = windowEl.querySelector('#chat-welcome-text');
      if (welcomeEl) welcomeEl.textContent = dict.chat_welcome || '';

      const titleEl = windowEl.querySelector('.chat-header-title');
      if (titleEl && dict.chat_title) titleEl.textContent = dict.chat_title;

      const statusEl = windowEl.querySelector('.chat-header-status');
      if (statusEl && dict.chat_status) statusEl.textContent = dict.chat_status;

      const triggerTextEl = trigger.querySelector('.chat-trigger-text');
      if (triggerTextEl && dict.chat_btn_label) triggerTextEl.textContent = dict.chat_btn_label;

      const suggTitleEl = windowEl.querySelector('.chat-suggestions-title');
      if (suggTitleEl && dict.chat_suggested_title) suggTitleEl.textContent = dict.chat_suggested_title;

      const disclaimerEl = windowEl.querySelector('.chat-disclaimer');
      if (disclaimerEl && dict.chat_disclaimer) disclaimerEl.textContent = dict.chat_disclaimer;

      const chips = windowEl.querySelectorAll('.chat-chip');
      chips.forEach((c, idx) => {
        const key = `chat_suggest_${idx + 1}`;
        if (dict[key]) c.textContent = dict[key];
      });

      if (inputEl) inputEl.setAttribute('placeholder', dict.chat_input_placeholder || 'Type message...');
    };
  }
}

// Instantiate on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new HayClimaApp());
} else {
  new HayClimaApp();
}
