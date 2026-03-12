/* ============================================
   main.js — Shared functionality
   ============================================ */

   (function () {
    'use strict';
  
    /* ── Theme Toggle ── */
    const themeToggle = document.querySelector('.theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon();
  
    themeToggle?.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateThemeIcon();
    });
  
    function updateThemeIcon() {
      if (!themeToggle) return;
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      themeToggle.innerHTML = isDark
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    }
  
    /* ── Navbar scroll ── */
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
      if (!navbar) return;
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  
    /* ── Active nav link ── */
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar__links a, .mobile-menu a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  
    /* ── Mobile menu ── */
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    hamburger?.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu?.classList.toggle('open');
      document.body.style.overflow = mobileMenu?.classList.contains('open') ? 'hidden' : '';
    });
    mobileMenu?.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger?.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

   /* ── Section doodles (site-wide, behind content) ── */
   const doodleTargets = document.querySelectorAll('section:not(.hero), .stats-bar, .footer');
   doodleTargets.forEach((block, idx) => {
     if (block.querySelector(':scope > .section-doodles')) return;
     block.classList.add('doodle-zone');

     const doodles = document.createElement('div');
     doodles.className = `section-doodles ${idx % 2 ? 'section-doodles--alt' : ''}`.trim();
     doodles.setAttribute('aria-hidden', 'true');
     doodles.innerHTML = `
       <span class="section-doodle section-doodle--ring"></span>
       <span class="section-doodle section-doodle--stroke"></span>
       <span class="section-doodle section-doodle--dot"></span>
     `;
     block.appendChild(doodles);
   });
  
   /* ── Scroll reveal (IntersectionObserver) ── */
   const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   if (!prefersReducedMotion) {
     const revealItems = Array.from(document.querySelectorAll('.reveal'));
 
     revealItems.forEach((el) => {
       if (el.dataset.reveal) return;
       if (el.matches('.about-preview__image-wrap')) {
         el.dataset.reveal = 'left';
         return;
       }
       if (el.matches('.section-header, .about-preview__text')) {
         el.dataset.reveal = 'right';
         return;
       }
       if (el.matches('.service-card, .creative-card, .brand-category, .stat-item')) {
         el.dataset.reveal = 'up-soft';
         return;
       }
       el.dataset.reveal = 'up';
     });
 
     const revealObserver = new IntersectionObserver((entries) => {
       entries.forEach((entry) => {
         if (!entry.isIntersecting) return;
         const siblings = entry.target.parentElement?.querySelectorAll('.reveal') || [];
         const idx = Math.max(0, Array.from(siblings).indexOf(entry.target));
         entry.target.style.setProperty('--reveal-delay', `${Math.min(idx * 70, 280)}ms`);
         entry.target.classList.add('revealed');
         revealObserver.unobserve(entry.target);
       });
     }, { threshold: 0.18, rootMargin: '0px 0px -12% 0px' });
 
     revealItems.forEach((el) => revealObserver.observe(el));
   } else {
     document.querySelectorAll('.reveal').forEach((el) => el.classList.add('revealed'));
   }

   /* ── Subtle scroll parallax for hero decor ── */
   if (!prefersReducedMotion) {
     const floatElements = [
       ...document.querySelectorAll('.hero__doodles .doodle'),
       ...document.querySelectorAll('.hero__photo-wrap, .hero__media-badge, .hero__media-doodle'),
       ...document.querySelectorAll('.hero__scroll')
     ];
     floatElements.forEach((el) => el.classList.add('scroll-float'));
 
     let ticking = false;
     const updateScrollFloat = () => {
       const y = window.scrollY || 0;
       floatElements.forEach((el, idx) => {
         const speed = 0.018 + (idx % 4) * 0.008;
         const offset = Math.max(-22, Math.min(22, y * speed));
         const tilt = Math.max(-2.5, Math.min(2.5, (idx % 2 === 0 ? 1 : -1) * y * 0.003));
         el.style.setProperty('--float-y', `${-offset}px`);
         el.style.setProperty('--float-rot', `${tilt}deg`);
       });
       ticking = false;
     };
 
     window.addEventListener('scroll', () => {
       if (ticking) return;
       ticking = true;
       requestAnimationFrame(updateScrollFloat);
     }, { passive: true });
   }
  
    /* ── Skill bars animation ── */
    const skillObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          skillObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll('.skill-card__bar-fill').forEach(el => skillObserver.observe(el));
  
    /* ── Back to top ── */
    const btt = document.querySelector('.back-to-top');
    window.addEventListener('scroll', () => {
      btt?.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    btt?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  
    /* ── Testimonial carousel ── */
    const track = document.querySelector('.testimonial-track');
    const dots = document.querySelectorAll('.carousel-dot');
    const prevBtn = document.querySelector('.carousel-btn--prev');
    const nextBtn = document.querySelector('.carousel-btn--next');
    let currentSlide = 0;
  
    function goToSlide(n) {
      if (!track) return;
      const slides = track.querySelectorAll('.testimonial-card');
      currentSlide = (n + slides.length) % slides.length;
      track.style.transform = `translateX(-${currentSlide * 100}%)`;
      dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
    }
  
    prevBtn?.addEventListener('click', () => goToSlide(currentSlide - 1));
    nextBtn?.addEventListener('click', () => goToSlide(currentSlide + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => goToSlide(i)));
  
    // Auto-advance
    let autoplay = setInterval(() => goToSlide(currentSlide + 1), 5000);
    track?.addEventListener('mouseenter', () => clearInterval(autoplay));
    track?.addEventListener('mouseleave', () => { autoplay = setInterval(() => goToSlide(currentSlide + 1), 5000); });
  
    /* ── FAQ Accordion ── */
    document.querySelectorAll('.faq-item__question').forEach(question => {
      question.addEventListener('click', () => {
        const item = question.parentElement;
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  
    /* ── Project / Blog filter ── */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const filterItems = document.querySelectorAll('[data-category]');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.filter;
        filterItems.forEach(item => {
          const show = cat === 'all' || item.dataset.category?.includes(cat);
          item.style.display = show ? '' : 'none';
          if (show) item.classList.remove('revealed');
          setTimeout(() => show && item.classList.add('revealed'), 10);
        });
      });
    });
  
    /* ── Blog search ── */
    const searchInput = document.querySelector('.blog-search input');
    const blogCards = document.querySelectorAll('.blog-card');
    searchInput?.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase();
      blogCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = text.includes(q) ? '' : 'none';
      });
    });
  
    /* ── Contact form ── */
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.querySelector('.form-success');
    contactForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputs = contactForm.querySelectorAll('input, textarea');
      let valid = true;
      inputs.forEach(input => {
        if (input.required && !input.value.trim()) {
          valid = false;
          input.style.borderColor = '#e74c3c';
          setTimeout(() => input.style.borderColor = '', 3000);
        }
      });
      if (!valid) return;
  
      // Fake submit
      const submitBtn = contactForm.querySelector('[type="submit"]');
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;
      setTimeout(() => {
        contactForm.style.display = 'none';
        if (formSuccess) formSuccess.style.display = 'block';
      }, 1500);
    });
  
    /* ── Reading progress bar ── */
    const readingBar = document.querySelector('.reading-bar');
    if (readingBar) {
      window.addEventListener('scroll', () => {
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        const pct = (window.scrollY / docH) * 100;
        readingBar.style.width = pct + '%';
      }, { passive: true });
    }
  
    /* ── Smooth page transitions (fade) ── */
    const overlay = document.querySelector('.page-transition');
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto') ||
          href.startsWith('tel') || href.startsWith('http') || link.target === '_blank') return;
      link.addEventListener('click', (e) => {
        if (!overlay) return;
        e.preventDefault();
        overlay.classList.add('active');
        setTimeout(() => { window.location.href = href; }, 280);
      });
    });
    window.addEventListener('pageshow', () => overlay?.classList.remove('active'));
  
  })();