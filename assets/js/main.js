/* ============================================================
   GYANENDRA SHARMA, PhD — PORTFOLIO JAVASCRIPT
   Senior HMI & UX Researcher
   ============================================================ */

'use strict';

/* ============================
   1. PARTICLE SYSTEM (Hero Background)
   ============================ */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const PARTICLE_COUNT = 75;
  const CONNECTION_DIST = 130;
  const MOUSE_REPEL_DIST = 100;
  let particles = [];
  let mouse = { x: null, y: null };
  let animId;

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(randomY = false) {
      this.x  = Math.random() * canvas.width;
      this.y  = randomY ? Math.random() * canvas.height : -5;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      this.r  = Math.random() * 1.4 + 0.4;
      this.a  = Math.random() * 0.4 + 0.08;
    }
    update() {
      // Subtle mouse repulsion
      if (mouse.x !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_REPEL_DIST) {
          const force = (MOUSE_REPEL_DIST - dist) / MOUSE_REPEL_DIST * 0.3;
          this.vx += (dx / dist) * force;
          this.vy += (dy / dist) * force;
        }
      }
      // Dampen velocity
      this.vx *= 0.99;
      this.vy *= 0.99;
      // Clamp speed
      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > 1.2) { this.vx = (this.vx / speed) * 1.2; this.vy = (this.vy / speed) * 1.2; }
      this.x += this.vx;
      this.y += this.vy;
      // Bounce off edges
      if (this.x < 0)            { this.x = 0; this.vx *= -1; }
      if (this.x > canvas.width) { this.x = canvas.width; this.vx *= -1; }
      if (this.y < 0)            { this.y = 0; this.vy *= -1; }
      if (this.y > canvas.height){ this.y = canvas.height; this.vy *= -1; }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(79, 126, 240, ${this.a})`;
      ctx.fill();
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const alpha = (1 - dist / CONNECTION_DIST) * 0.14;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(79, 126, 240, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    animId = requestAnimationFrame(animate);
  }

  function init() {
    resize();
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
    if (animId) cancelAnimationFrame(animId);
    animate();
  }

  window.addEventListener('resize', init);
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

  // Only run when hero section is visible
  const heroSection = document.getElementById('hero');
  const heroObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { if (!animId) animate(); }
    else { cancelAnimationFrame(animId); animId = null; }
  }, { threshold: 0 });
  if (heroSection) heroObserver.observe(heroSection);

  init();
})();


/* ============================
   2. SCROLL REVEAL ANIMATIONS
   ============================ */
(function initReveal() {
  const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
})();


/* ============================
   3. COUNTER ANIMATION
   ============================ */
(function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const dur    = 1500;
        const step   = 16;
        const inc    = target / (dur / step);
        let current  = 0;

        const timer = setInterval(() => {
          current += inc;
          if (current >= target) {
            el.textContent = target;
            clearInterval(timer);
          } else {
            el.textContent = Math.floor(current);
          }
        }, step);

        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();


/* ============================
   4. NAVBAR BEHAVIOR
   ============================ */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  // Scroll: toggle .scrolled
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Active nav link highlighting
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('[data-nav]');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => sectionObserver.observe(s));
})();


/* ============================
   5. MOBILE NAV MENU
   ============================ */
(function initMobileNav() {
  const toggle  = document.getElementById('navToggle');
  const mobileNav = document.getElementById('mobileNav');
  const overlay = document.getElementById('navOverlay');
  if (!toggle || !mobileNav) return;

  function openMenu() {
    mobileNav.classList.add('open');
    overlay.classList.add('visible');
    toggle.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    mobileNav.classList.remove('open');
    overlay.classList.remove('visible');
    toggle.classList.remove('open');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    mobileNav.classList.contains('open') ? closeMenu() : openMenu();
  });
  overlay.addEventListener('click', closeMenu);

  // Close on link click
  document.querySelectorAll('[data-mobile-nav]').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
})();


/* ============================
   6. SMOOTH SCROLLING
   ============================ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navH = document.getElementById('navbar')?.offsetHeight || 72;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH - 20;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ============================
   7. PROJECT FILTER
   ============================ */
(function initProjectFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const cat = card.dataset.category;
        const show = filter === 'all' || cat === filter;

        if (show) {
          card.classList.remove('hidden');
          // Re-trigger reveal animation
          card.classList.remove('visible');
          setTimeout(() => card.classList.add('visible'), 50);
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // Mark all visible on init
  cards.forEach(c => c.classList.add('visible'));
})();


/* ============================
   8. PROJECT CONTRIBUTION ACCORDION
   ============================ */
(function initContribAccordion() {
  const toggles = document.querySelectorAll('.proj-contrib-toggle');
  if (!toggles.length) return;

  toggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      const body = toggle.nextElementSibling;
      const isOpen = body.classList.contains('open');

      // Close any other open accordions in the same card (if any)
      toggle.classList.toggle('open', !isOpen);
      body.classList.toggle('open', !isOpen);
      toggle.setAttribute('aria-expanded', !isOpen);

      // Update button label text
      const labelSpan = toggle.querySelector('span:first-child');
      if (labelSpan) {
        labelSpan.textContent = isOpen
          ? '▸ Key Contributions & Skills'
          : '▾ Key Contributions & Skills';
      }
    });
  });
})();


/* ============================
   9. TIMELINE ITEM HOVER EFFECT
   ============================ */
(function initTimelineHover() {
  document.querySelectorAll('.tl-item').forEach(item => {
    const dot = item.querySelector('.tl-dot');
    if (!dot || dot.classList.contains('active')) return;
    item.addEventListener('mouseenter', () => {
      dot.style.borderColor = 'var(--blue)';
      dot.style.background  = 'rgba(79,126,240,0.2)';
    });
    item.addEventListener('mouseleave', () => {
      dot.style.borderColor = '';
      dot.style.background  = '';
    });
  });
})();


/* ============================
   10. SKILL TAG SUBTLE ANIMATION ON HOVER
   ============================ */
(function initSkillTagRipple() {
  document.querySelectorAll('.skill-tag').forEach(tag => {
    tag.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-2px) scale(1.04)';
    });
    tag.addEventListener('mouseleave', function () {
      this.style.transform = '';
    });
  });
})();


/* ============================
   11. CONTACT FORM COPY-TO-CLIPBOARD (Email)
   ============================ */
(function initEmailCopy() {
  const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
  emailLinks.forEach(link => {
    link.addEventListener('dblclick', (e) => {
      e.preventDefault();
      const email = link.getAttribute('href').replace('mailto:', '');
      if (navigator.clipboard) {
        navigator.clipboard.writeText(email).then(() => {
          const orig = link.textContent;
          link.textContent = '✓ Copied!';
          link.style.color = 'var(--green)';
          setTimeout(() => {
            link.textContent = orig;
            link.style.color = '';
          }, 1500);
        });
      }
    });
  });
})();


/* ============================
   12. PAGE LOAD ENTRANCE ANIMATION
   ============================ */
(function initPageLoad() {
  // Fade in body on load
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.4s ease';
  window.addEventListener('load', () => {
    document.body.style.opacity = '1';
  });

  // Stagger hero text elements
  const heroText  = document.querySelector('.hero-text');
  if (!heroText) return;

  const children = heroText.children;
  Array.from(children).forEach((child, i) => {
    child.style.opacity = '0';
    child.style.transform = 'translateY(20px)';
    child.style.transition = `opacity 0.65s ease ${i * 0.12 + 0.3}s, transform 0.65s ease ${i * 0.12 + 0.3}s`;
    setTimeout(() => {
      child.style.opacity = '1';
      child.style.transform = 'none';
    }, 100);
  });
})();


/* ============================
   13. PROGRESS BAR ON SCROLL (Top of Page)
   ============================ */
(function initProgressBar() {
  const bar = document.createElement('div');
  bar.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    height: 2px;
    background: linear-gradient(90deg, #4f7ef0, #22d3ee);
    z-index: 9999;
    width: 0%;
    transition: width 0.1s linear;
    pointer-events: none;
  `;
  document.body.prepend(bar);

  window.addEventListener('scroll', () => {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const pct        = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width  = pct + '%';
  }, { passive: true });
})();


/* ============================
   14. BACK TO TOP (Auto-inject on scroll)
   ============================ */
(function initBackToTop() {
  const btn = document.createElement('button');
  btn.innerHTML = '↑';
  btn.setAttribute('aria-label', 'Back to top');
  btn.style.cssText = `
    position: fixed;
    bottom: 2rem; right: 2rem;
    width: 44px; height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4f7ef0, #22d3ee);
    color: white;
    font-size: 1.1rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 500;
    box-shadow: 0 4px 16px rgba(79,126,240,0.4);
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.3s ease, transform 0.3s ease;
    pointer-events: none;
    border: none;
  `;
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    const show = window.scrollY > 500;
    btn.style.opacity = show ? '1' : '0';
    btn.style.transform = show ? 'translateY(0)' : 'translateY(10px)';
    btn.style.pointerEvents = show ? 'auto' : 'none';
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
