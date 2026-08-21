// 1. Reveal elements as they scroll into view
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target); // only animate once
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => revealObserver.observe(el));


// 1b. Count up the "projects done" stat when it scrolls into view
const statEl = document.querySelector('.stat-number');

if (statEl) {
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.target, 10);
        const duration = 1200; // ms
        const start = performance.now();

        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          entry.target.textContent = Math.round(progress * target);
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statObserver.observe(statEl);
}


// 2. Animate skill bars to their real percentage when visible
const skillFills = document.querySelectorAll('.skill-fill');

const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const percent = entry.target.dataset.percent;
      entry.target.style.width = percent + '%';
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

skillFills.forEach(el => skillObserver.observe(el));


// 3. Project filter buttons
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;

    filterButtons.forEach(b => b.classList.remove('active'));
    button.classList.add('active');

    projectCards.forEach(card => {
      const matches = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('hidden', !matches);
    });
  });
});