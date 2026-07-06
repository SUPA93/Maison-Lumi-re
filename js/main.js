/* ================================================================
   Marlowe & Co. — main.js
   Vanilla JS, no dependencies. Every feature degrades gracefully:
   the page is fully readable and navigable with JS disabled.
   ================================================================ */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ---- Preloader (page d'accueil uniquement) ---- */
  const preloader = $('#preloader');
  if (preloader) {
    const hidePreloader = () => preloader.classList.add('is-done');
    if (reduceMotion) hidePreloader();
    else {
      window.addEventListener('load', () => setTimeout(hidePreloader, 500));
      setTimeout(hidePreloader, 2200); // plafond dur : ne jamais bloquer l'utilisateur
    }
  }

  /* ---- Hero title: word-by-word reveal ---- */
  const heroTitle = $('#heroTitle');
  if (heroTitle && !reduceMotion) {
    const wrapWords = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
            const w = document.createElement('span');
            w.className = 'w';
            const inner = document.createElement('span');
            inner.textContent = part;
            w.appendChild(inner);
            frag.appendChild(w);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
          wrapWords(child);
        }
      });
    };
    wrapWords(heroTitle);
    $$('.w > span', heroTitle).forEach((s, i) => { s.style.transitionDelay = `${0.15 + i * 0.07}s`; });
    requestAnimationFrame(() => requestAnimationFrame(() => heroTitle.classList.add('is-in')));
  }

  /* ---- Custom cursor (rAF lerp — zero layout work per mousemove) ---- */
  if (finePointer && !reduceMotion) {
    const dot = $('#cursorDot');
    const ring = $('#cursorRing');
    let mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });
    const loop = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    document.addEventListener('mouseover', (e) => {
      ring.classList.toggle('is-hover', !!e.target.closest('a, button, summary, input, select, textarea, label'));
    }, { passive: true });
  }

  /* ---- Scroll: progress bar, nav state, hero parallax (single rAF) ---- */
  const progress = $('#progress');
  const nav = $('#nav');
  const heroMedia = $('#heroMedia');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      nav.classList.toggle('is-scrolled', y > 40);
      if (heroMedia && !reduceMotion && y < window.innerHeight * 1.2) {
        heroMedia.style.transform = `translateY(${y * 0.28}px)`;
      }
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Reveal on scroll ---- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
  $$('.reveal').forEach((el) => io.observe(el));

  /* ---- Animated counters ---- */
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      counterIO.unobserve(en.target);
      const target = +en.target.dataset.count;
      if (reduceMotion) { en.target.textContent = target; return; }
      const t0 = performance.now();
      const dur = 1400;
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        en.target.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  $$('.count').forEach((el) => counterIO.observe(el));

  /* ---- Gallery filters ---- */
  const filterBtns = $$('.filter');
  const tiles = $$('.tile');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      filterBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      tiles.forEach((tile) => {
        const show = f === 'all' || tile.dataset.cat === f;
        tile.classList.toggle('is-hidden', !show);
        if (show) tile.classList.add('is-in');
      });
      resetSpotlight();
    });
  });

  /* ---- Galerie : spotlight auto (met en avant une photo à la fois) ---- */
  const gallery = $('#gallery');
  let spotTimer = null, resetSpotlight = () => {};
  if (gallery && tiles.length && !reduceMotion) {
    let spotIndex = 0;
    const setSpotlight = () => {
      const visible = tiles.filter((t) => !t.classList.contains('is-hidden'));
      if (!visible.length) return;
      tiles.forEach((t) => {
        t.classList.remove('is-spotlight');
        t.style.setProperty('--fly-x', '0px');
        t.style.setProperty('--fly-y', '0px');
        t.style.setProperty('--fly-scale', '1');
      });
      if (visible.length < 2) return;
      spotIndex = ((spotIndex % visible.length) + visible.length) % visible.length;
      const active = visible[spotIndex];
      const rect = active.getBoundingClientRect();
      const dx = window.innerWidth / 2 - (rect.left + rect.width / 2);
      const dy = window.innerHeight / 2 - (rect.top + rect.height / 2);
      active.style.setProperty('--fly-x', `${dx}px`);
      active.style.setProperty('--fly-y', `${dy}px`);
      active.style.setProperty('--fly-scale', '1.2');
      active.classList.add('is-spotlight');
    };
    const startSpotlight = () => {
      clearInterval(spotTimer);
      spotTimer = setInterval(() => { spotIndex += 1; setSpotlight(); }, 4500);
    };
    resetSpotlight = () => { spotIndex = 0; setSpotlight(); startSpotlight(); };
    const galleryIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        galleryIO.unobserve(en.target);
        gallery.classList.add('is-spotlighting');
        setSpotlight();
        startSpotlight();
      });
    }, { threshold: 0.2 });
    galleryIO.observe(gallery);
    gallery.addEventListener('mouseenter', () => clearInterval(spotTimer));
    gallery.addEventListener('mouseleave', startSpotlight);
  }

  /* ---- Lightbox ---- */
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightboxImg');
  if (lightbox && typeof lightbox.showModal === 'function') {
    $$('[data-lightbox]').forEach((btn) => {
      btn.addEventListener('click', () => {
        lightboxImg.src = btn.dataset.lightbox;
        lightboxImg.alt = $('img', btn)?.alt || '';
        lightbox.showModal();
      });
    });
    $('#lightboxClose').addEventListener('click', () => lightbox.close());
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });
  }

  /* ---- Rotateur de témoignages (accueil) ---- */
  const slides = $$('.t-slide');
  if (slides.length) {
    const dots = $$('#tDots button');
    let tIndex = 0, tTimer = null;
    const showSlide = (i) => {
      tIndex = i;
      slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
      dots.forEach((d, k) => d.classList.toggle('is-active', k === i));
    };
    const startRotation = () => {
      if (reduceMotion) return;
      tTimer = setInterval(() => showSlide((tIndex + 1) % slides.length), 5500);
    };
    dots.forEach((d, i) => d.addEventListener('click', () => {
      clearInterval(tTimer);
      showSlide(i);
      startRotation();
    }));
    const stage = $('#tStage');
    if (stage) {
      stage.addEventListener('mouseenter', () => clearInterval(tTimer));
      stage.addEventListener('mouseleave', startRotation);
    }
    startRotation();
  }

  /* ---- Magnetic buttons ---- */
  if (finePointer && !reduceMotion) {
    $$('[data-magnetic]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * 0.18}px, ${dy * 0.3}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---- Mobile nav ---- */
  const navToggle = $('#navToggle');
  const navLinks = $('#navLinks');
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  navLinks.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      navLinks.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  /* ---- Formulaires (réservation + livre d'or) ---- */
  const showSuccess = (form, note, title, body) => {
    // TODO client : brancher un backend (Formspree, Resend, endpoint maison…)
    form.classList.add('is-sent');
    const ok = document.createElement('div');
    ok.className = 'form__success';
    ok.innerHTML = `<div class="tick">✓</div><h3>${title}</h3><p>${body}</p>`;
    form.appendChild(ok);
    note.textContent = '';
  };
  const esc = (s) => s.replace(/[<>&]/g, '');

  const inquiry = $('#inquiryForm');
  if (inquiry) {
    const note = $('#formNote');
    inquiry.addEventListener('submit', (e) => {
      e.preventDefault();
      if (inquiry.company.value) return; // pot de miel : on ignore les bots
      const name = inquiry.name.value.trim();
      const email = inquiry.email.value.trim();
      note.className = 'form__note';
      if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        note.textContent = 'Merci d\'indiquer votre nom et un email valide pour que nous puissions vous répondre.';
        note.classList.add('is-error');
        return;
      }
      showSuccess(inquiry, note, `Merci, ${esc(name)}.`,
        'Votre demande a bien été reçue. Nous revenons vers vous sous 48 heures pour parler de votre date et de nos disponibilités.');
    });
  }

  const guestbook = $('#guestbookForm');
  if (guestbook) {
    const note = $('#gbNote');
    guestbook.addEventListener('submit', (e) => {
      e.preventDefault();
      if (guestbook.company.value) return;
      const name = guestbook.name.value.trim();
      const message = guestbook.message.value.trim();
      note.className = 'form__note';
      if (!name || message.length < 10) {
        note.textContent = 'Merci d\'indiquer votre nom et un petit mot (au moins quelques mots).';
        note.classList.add('is-error');
        return;
      }
      showSuccess(guestbook, note, `Merci, ${esc(name)}.`,
        'Votre message a bien été déposé dans le livre d\'or. Il sera publié après une rapide relecture.');
    });
  }
})();
