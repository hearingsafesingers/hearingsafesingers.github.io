// ===== Hearing Safe Singers — Static site JS =====

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initReveal();
  initHeroCarousel();
  initLessonsFilter();
  initContactForm();
  initCalModal();
  setFooterYear();
});

/* ---------- Navbar ---------- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const toggle = document.querySelector('.nav-toggle');
  const overlay = document.querySelector('.nav-overlay');
  const closeBtn = document.querySelector('.nav-close');
  if (!navbar) return;

  // Only the home page (with a hero) uses a transparent navbar at the top.
  // On inner pages, keep the navbar in its "scrolled" (solid) state always
  // so the menu toggle stays visible against the cream background.
  const hasHero = !!document.querySelector('.hero');
  if (hasHero) {
    const onScroll = () => {
      if (window.scrollY > 40) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  } else {
    navbar.classList.add('scrolled');
  }

  if (toggle && overlay) {
    toggle.addEventListener('click', () => {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }
  const closeOverlay = () => {
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };
  if (closeBtn) closeBtn.addEventListener('click', closeOverlay);
  if (overlay) {
    overlay.querySelectorAll('a').forEach(a => a.addEventListener('click', closeOverlay));
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeOverlay();
  });
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-x-left, .reveal-x-right');
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  els.forEach(el => io.observe(el));
}

/* ---------- Hero carousel ---------- */
function initHeroCarousel() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const slides = hero.querySelectorAll('.hero-bg img');
  const dots = hero.querySelectorAll('.hero-dots button');
  const prev = hero.querySelector('.hero-arrow.prev');
  const next = hero.querySelector('.hero-arrow.next');
  if (!slides.length) return;

  let current = 0;
  let timer;

  const show = (i) => {
    current = (i + slides.length) % slides.length;
    slides.forEach((s, idx) => s.classList.toggle('active', idx === current));
    dots.forEach((d, idx) => d.classList.toggle('active', idx === current));
  };
  const start = () => {
    stop();
    timer = setInterval(() => show(current + 1), 4500);
  };
  const stop = () => { if (timer) clearInterval(timer); };

  dots.forEach((d, i) => d.addEventListener('click', () => { show(i); start(); }));
  if (prev) prev.addEventListener('click', () => { show(current - 1); start(); });
  if (next) next.addEventListener('click', () => { show(current + 1); start(); });

  show(0);
  start();

  // Parallax on scroll
  const bg = hero.querySelector('.hero-bg');
  if (bg) {
    const onScroll = () => {
      const y = window.scrollY;
      const offset = y * 0.3;
      const scale = Math.max(0.85, 1 - y * 0.0002);
      bg.style.transform = `translateY(${offset}px) scale(${1 / scale})`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }
}

/* ---------- Lessons filter ---------- */
function initLessonsFilter() {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.lesson-card');
  if (!buttons.length || !cards.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      buttons.forEach(b => b.classList.toggle('active', b === btn));
      cards.forEach(c => {
        const cat = c.dataset.category;
        const visible = (f === 'All' || cat === f);
        c.style.display = visible ? '' : 'none';
      });
    });
  });
}

/* ---------- Contact form (multi-step) ---------- */
function initContactForm() {
  const form = document.querySelector('#contact-form');
  if (!form) return;

  const stepEls = form.querySelectorAll('.form-step');
  const dots = document.querySelectorAll('.step-dot');
  const counter = document.querySelector('.step-counter');
  const success = document.querySelector('#contact-success');
  let step = 0;
  const total = stepEls.length;

  const render = () => {
    stepEls.forEach((el, i) => el.style.display = i === step ? '' : 'none');
    dots.forEach((d, i) => d.classList.toggle('active', i <= step));
    if (counter) counter.textContent = `Step ${step + 1} of ${total}`;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentStepEl = stepEls[step];
    // Check validity for current step's required inputs
    const inputs = currentStepEl.querySelectorAll('input, select, textarea');
    let valid = true;
    inputs.forEach(inp => {
      if (inp.hasAttribute('required') && !inp.value.trim()) {
        valid = false;
        inp.reportValidity?.();
      }
    });
    if (!valid) return;

    if (step === total - 1) {
      sendContactEnquiry(form, success);
    } else {
      step++;
      render();
    }
  });

  form.querySelectorAll('[data-back]').forEach(b => {
    b.addEventListener('click', (e) => {
      e.preventDefault();
      if (step > 0) { step--; render(); }
    });
  });

  render();
}

/* Submit the enquiry to Web3Forms, which forwards to hello@hearingsafesingers.com. */
function sendContactEnquiry(form, success) {
  const data = new FormData(form);
  const get = (k) => (data.get(k) || '').toString().trim();

  const name = get('name');
  const payload = new FormData();
  payload.append('access_key', '227626d8-d8ad-4c16-bc28-46e5cd113c01');
  payload.append('subject', `New trial lesson enquiry${name ? ` — ${name}` : ''}`);
  payload.append('from_name', 'Hearing Safe Singers website');
  payload.append('name', name);
  payload.append('email', get('email'));
  payload.append('replyto', get('email'));
  payload.append('experience_level', get('level'));
  payload.append('main_goal', get('goal'));
  payload.append('lesson_format', get('format'));
  payload.append('message', get('message'));
  payload.append('botcheck', '');

  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.dataset.label = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';
  }

  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: payload
  })
    .then(res => res.json().catch(() => ({})))
    .then(json => {
      if (json && json.success) {
        form.style.display = 'none';
        if (success) success.style.display = '';
      } else {
        throw new Error((json && json.message) || 'Submission failed');
      }
    })
    .catch(err => {
      console.error('Contact form submission failed:', err);
      alert("Sorry — your message couldn't be sent. Please email hello@hearingsafesingers.com directly.");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.label || 'Send my enquiry';
      }
    });
}

/* ---------- Cal.com modal ---------- */
function initCalModal() {
  const modal = document.querySelector('#cal-modal');
  if (!modal) return;
  const openers = document.querySelectorAll('[data-open-cal]');
  const closeBtn = modal.querySelector('.modal-close');
  const embedHost = modal.querySelector('#cal-embed');
  const backdrop = modal;
  let scriptLoaded = false;
  const renderedNamespaces = new Set();
  let currentNamespace = null;

  const ensureScript = () => new Promise((resolve) => {
    if (scriptLoaded && window.Cal) return resolve();
    if (scriptLoaded) {
      const check = setInterval(() => {
        if (window.Cal) { clearInterval(check); resolve(); }
      }, 30);
      return;
    }
    // Bootstrap Cal exactly like the official embed snippet so namespaces work.
    (function (C, A, L) {
      let p = function (a, ar) { a.q.push(ar); };
      let d = C.document;
      C.Cal = C.Cal || function () {
        let cal = C.Cal; let ar = arguments;
        if (!cal.loaded) {
          cal.ns = {}; cal.q = cal.q || [];
          d.head.appendChild(d.createElement('script')).src = A;
          cal.loaded = true;
        }
        if (ar[0] === L) {
          const api = function () { p(api, arguments); };
          const namespace = ar[1];
          api.q = api.q || [];
          if (typeof namespace === 'string') {
            cal.ns[namespace] = cal.ns[namespace] || api;
            p(cal.ns[namespace], ar);
            p(cal, ['initNamespace', namespace]);
          } else { p(cal, ar); }
          return;
        }
        p(cal, ar);
      };
    })(window, 'https://app.cal.com/embed/embed.js', 'init');
    scriptLoaded = true;
    const check = setInterval(() => {
      if (window.Cal) { clearInterval(check); resolve(); }
    }, 30);
  });

  const renderEmbed = async (calLink, namespace) => {
    await ensureScript();
    if (!window.Cal) return;
    const ns = namespace || 'default';
    const targetId = ns === 'default' ? 'cal-embed-default' : `cal-embed-${ns}`;

    // Create a dedicated container per namespace so Cal can render into it once.
    let target = document.getElementById(targetId);
    if (!target) {
      target = document.createElement('div');
      target.id = targetId;
      target.style.position = 'absolute';
      target.style.inset = '0';
      target.style.width = '100%';
      target.style.height = '100%';
      target.style.overflow = 'auto';
      embedHost.appendChild(target);
    }

    // Show only the active container.
    embedHost.querySelectorAll('[id^="cal-embed-"]').forEach(el => {
      el.style.display = el === target ? '' : 'none';
    });

    // Wait two animation frames so the modal has actually painted and the
    // target has a real bounding rect before Cal measures it. Without this,
    // subsequent opens (when the embed script is already cached) can fire
    // synchronously while the modal is still being laid out, causing Cal to
    // position its iframe at the page origin instead of inside the modal.
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    if (!renderedNamespaces.has(ns)) {
      if (ns === 'default') {
        window.Cal('init', { origin: 'https://cal.com' });
        window.Cal('inline', {
          elementOrSelector: `#${targetId}`,
          calLink,
          config: { layout: 'month_view' }
        });
        window.Cal('ui', { hideEventTypeDetails: false, layout: 'month_view' });
      } else {
        window.Cal('init', ns, { origin: 'https://app.cal.com' });
        window.Cal.ns[ns]('inline', {
          elementOrSelector: `#${targetId}`,
          calLink,
          config: { layout: 'month_view', useSlotsViewOnSmallScreen: 'true' }
        });
        window.Cal.ns[ns]('ui', { hideEventTypeDetails: false, layout: 'month_view' });
      }
      renderedNamespaces.add(ns);
    }
    currentNamespace = ns;
  };

  const open = (btn) => {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    const calLink = btn?.dataset.calLink || 'hearingsafesingers';
    const namespace = btn?.dataset.calNamespace || null;
    renderEmbed(calLink, namespace);
  };
  const close = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  openers.forEach(b => b.addEventListener('click', (e) => { e.preventDefault(); open(b); }));
  if (closeBtn) closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) close();
  });
}

/* ---------- Footer year ---------- */
function setFooterYear() {
  const el = document.querySelector('#footer-year');
  if (el) el.textContent = new Date().getFullYear();
}
