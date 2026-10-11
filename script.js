/* =========================================================
   Lizi Shavadze — portfolio behaviour
   ========================================================= */

// Set this to a Formspree endpoint (e.g. 'https://formspree.io/f/xxxxxxx')
// to receive contact messages in an inbox. Left empty, the form falls back
// to opening the visitor's mail client with the message pre-filled.
const FORMSPREE_ENDPOINT = '';

const CONTACT_EMAIL = 'lizishavadzd08@gmail.com';


/* ---------- 0. Preloader ---------- */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('preloader').classList.add('preloader-hidden');
    document.body.classList.add('loaded');
  }, 400);
});


/* ---------- 1. Hero circuit-trace background ---------- */
(function circuitBackground() {
  const canvas = document.getElementById('circuit-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let nodes = [];
  let width, height;

  function size() {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.clientWidth;
    height = canvas.clientHeight;

    // a background tab can report a zero-size canvas — wait for a real one
    if (!width || !height) return false;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // roughly one node per 16k px², capped so phones stay smooth
    const count = Math.min(90, Math.round((width * height) / 16000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.8
    }));

    return true;
  }

  function draw() {
    if (!width || !height) return;
    ctx.clearRect(0, 0, width, height);

    // traces between nearby nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < 140) {
          ctx.strokeStyle = 'rgba(236, 140, 186,' + (0.42 * (1 - dist / 140)) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          // right-angle routing, like a PCB trace
          ctx.lineTo(nodes[j].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // solder pads
    nodes.forEach(n => {
      ctx.fillStyle = 'rgba(255, 198, 224, 0.92)';
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  let running = false;

  function step() {
    if (!running) return;
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
    });
    draw();
    requestAnimationFrame(step);
  }

  function start() {
    if (running || reduceMotion) return;
    running = true;
    requestAnimationFrame(step);
  }

  function resize() {
    // resizing resets the backing store, so always repaint after re-sizing
    if (size()) draw();
  }

  resize();

  // ResizeObserver also catches the case where the hero starts at zero size
  // (loaded in a background tab) and only gets real dimensions later.
  if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);
  else window.addEventListener('resize', resize);

  // Only animate while the hero is actually on screen.
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) start();
    else running = false;
  }).observe(canvas);
})();


/* ---------- 2. Rotating hero subtitle ---------- */
(function textRotator() {
  const items = document.querySelectorAll('#text-rotator .rotate-item');
  if (!items.length) return;

  let index = 0;
  items[0].classList.add('is-active');

  setInterval(() => {
    items[index].classList.remove('is-active');
    index = (index + 1) % items.length;
    items[index].classList.add('is-active');
  }, 2600);
})();


/* ---------- 3. Navbar: solid on scroll, active link, mobile menu ---------- */
(function navbar() {
  const nav = document.getElementById('navbar');
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  const backToTop = document.getElementById('back-to-top');
  const navAnchors = [...document.querySelectorAll('.nav-links a')];
  const sections = navAnchors
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  function onScroll() {
    const y = window.scrollY;

    nav.classList.toggle('scrolled', y > 60);
    backToTop.classList.toggle('show', y > 500);

    // highlight the section currently under the navbar
    let current = sections[0];
    sections.forEach(s => { if (s.offsetTop - 120 <= y) current = s; });
    navAnchors.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current.id);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });

  // close the mobile menu after picking a destination
  navAnchors.forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
})();


/* ---------- 4. Scroll reveal ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


/* ---------- 5. Counters ---------- */
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const el = entry.target;
    const target = parseInt(el.dataset.target, 10);
    const duration = 1200;
    const start = performance.now();

    (function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(progress * target);
      if (progress < 1) requestAnimationFrame(tick);
    })(start);

    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));


/* ---------- 6. Skill bars ---------- */
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.width = entry.target.dataset.width + '%';
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

document.querySelectorAll('.progress-bar').forEach(el => skillObserver.observe(el));


/* ---------- 7. Project filters ---------- */
(function projectFilters() {
  const buttons = document.querySelectorAll('.filter');
  const cards = document.querySelectorAll('.p-card');

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;

      buttons.forEach(b => b.classList.remove('active'));
      button.classList.add('active');

      cards.forEach(card => {
        // a project can sit in several categories, e.g. "embedded instrumentation pcb"
        const categories = card.dataset.category.split(/\s+/);
        const matches = filter === 'all' || categories.includes(filter);
        card.classList.toggle('is-hidden', !matches);
        if (matches) {
          // replay the reveal so filtered-in cards fade back in
          card.classList.remove('visible');
          requestAnimationFrame(() => card.classList.add('visible'));
        }
      });
    });
  });
})();


/* ---------- 8. Project photo sliders + lightbox ----------
   Each card lists its photos optimistically. Any file that isn't there yet is
   dropped, so a card with no photos keeps its gradient icon header and a card
   with one photo shows no slider controls.                                   */
(function projectPhotos() {
  const lightbox = document.getElementById('lightbox');
  const lbImg = lightbox.querySelector('img');
  const lbCaption = lightbox.querySelector('.lb-caption');
  let lbGroup = [];
  let lbIndex = 0;

  function showLightbox(i) {
    lbIndex = (i + lbGroup.length) % lbGroup.length;
    const slide = lbGroup[lbIndex];
    lbImg.src = slide.src;
    lbImg.alt = slide.alt;
    lbCaption.textContent = slide.alt;
    lightbox.querySelectorAll('.lb-nav').forEach(b => {
      b.style.display = lbGroup.length > 1 ? '' : 'none';
    });
  }

  function openLightbox(group, i) {
    lbGroup = group;
    lightbox.hidden = false;
    showLightbox(i);
    void lightbox.offsetWidth;   // flush layout so the fade has a starting point
    lightbox.classList.add('open');
    document.body.classList.add('lb-open');
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.classList.remove('lb-open');
    setTimeout(() => { lightbox.hidden = true; lbImg.src = ''; }, 250);
  }

  lightbox.querySelector('.lb-close').addEventListener('click', closeLightbox);
  lightbox.querySelector('.lb-prev').addEventListener('click', () => showLightbox(lbIndex - 1));
  lightbox.querySelector('.lb-next').addEventListener('click', () => showLightbox(lbIndex + 1));

  // click the backdrop (but not the photo itself) to dismiss
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showLightbox(lbIndex - 1);
    if (e.key === 'ArrowRight') showLightbox(lbIndex + 1);
  });

  document.querySelectorAll('.card-media').forEach(media => {
    const slider = media.querySelector('.slider');
    const candidates = [...slider.querySelectorAll('.slide')];

    // a photo that fails to load is removed rather than left as a broken image
    const settled = candidates.map(img => new Promise(resolve => {
      if (img.complete) return resolve(img.naturalWidth > 0 ? img : null);
      img.addEventListener('load', () => resolve(img), { once: true });
      img.addEventListener('error', () => { img.remove(); resolve(null); }, { once: true });
    }));

    Promise.all(settled).then(results => {
      const slides = results.filter(Boolean);
      if (!slides.length) return;            // keep the icon fallback

      media.classList.add('has-photos');
      if (slides.length === 1) media.classList.add('single');

      let index = 0;
      slides[0].classList.add('is-active');

      slides.forEach((img, i) => {
        img.addEventListener('click', () => openLightbox(slides, i));
      });

      if (slides.length < 2) return;

      const dots = document.createElement('div');
      dots.className = 'slider-dots';

      function go(next) {
        slides[index].classList.remove('is-active');
        dots.children[index].classList.remove('is-active');
        index = (next + slides.length) % slides.length;
        slides[index].classList.add('is-active');
        dots.children[index].classList.add('is-active');
      }

      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'slider-dot' + (i === 0 ? ' is-active' : '');
        dot.setAttribute('aria-label', 'Show photo ' + (i + 1));
        dot.addEventListener('click', () => go(i));
        dots.appendChild(dot);
      });

      const prev = document.createElement('button');
      prev.className = 'slider-arrow prev';
      prev.innerHTML = '&lsaquo;';
      prev.setAttribute('aria-label', 'Previous photo');
      prev.addEventListener('click', () => go(index - 1));

      const next = document.createElement('button');
      next.className = 'slider-arrow next';
      next.innerHTML = '&rsaquo;';
      next.setAttribute('aria-label', 'Next photo');
      next.addEventListener('click', () => go(index + 1));

      media.append(prev, next, dots);
    });
  });
})();


/* ---------- 9. Contact form ---------- */
(function contactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const status = document.getElementById('form-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    let valid = true;
    [['name', name], ['email', email], ['message', message]].forEach(([field, value]) => {
      const ok = field === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) : value.length > 0;
      form[field].classList.toggle('invalid', !ok);
      if (!ok) valid = false;
    });

    if (!valid) {
      status.textContent = 'Please fill in every field with a valid email.';
      return;
    }

    if (FORMSPREE_ENDPOINT) {
      status.textContent = 'Sending…';
      try {
        const res = await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form)
        });
        if (!res.ok) throw new Error('Request failed');
        form.reset();
        status.textContent = 'Thanks! Your message has been sent.';
      } catch {
        status.textContent = 'Something went wrong — please email me directly at ' + CONTACT_EMAIL + '.';
      }
      return;
    }

    // No backend configured: hand the message off to the visitor's mail client.
    const subject = encodeURIComponent('Portfolio enquiry from ' + name);
    const body = encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')');
    window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body;
    status.textContent = 'Opening your mail app…';
  });
})();
