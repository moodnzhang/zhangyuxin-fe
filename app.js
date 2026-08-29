(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const opening = $('[data-opening]');
  const seenOpening = sessionStorage.getItem('portfolio-opening');
  const finishOpening = () => {
    opening?.classList.add('is-done');
    document.body.classList.add('is-ready');
    sessionStorage.setItem('portfolio-opening', 'seen');
  };
  if (reducedMotion || seenOpening) {
    opening?.remove();
    requestAnimationFrame(() => document.body.classList.add('is-ready'));
  } else {
    setTimeout(finishOpening, 1080);
  }

  const header = $('[data-header]');
  const progress = $('[data-progress]');
  const sectionLinks = $$('.desktop-nav a[href^="#"]');
  const sections = $$('[data-section]');
  const updatePageState = () => {
    const y = scrollY;
    header?.classList.toggle('is-scrolled', y > 24);
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.width = `${max ? (y / max) * 100 : 0}%`;
    let current = 'top';
    sections.forEach(section => {
      if (section.getBoundingClientRect().top <= innerHeight * .42) current = section.id;
    });
    sectionLinks.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === `#${current}`));
  };
  addEventListener('scroll', updatePageState, { passive: true });
  updatePageState();

  const capabilityNote = $('[data-capability-note]');
  const capabilityDefault = capabilityNote?.textContent || '';
  $$('[data-capability-copy]').forEach(item => {
    const showCapability = () => {
      if (!capabilityNote) return;
      capabilityNote.style.opacity = '0'; capabilityNote.style.transform = 'translateY(4px)';
      setTimeout(() => { capabilityNote.textContent = item.dataset.capabilityCopy; capabilityNote.style.opacity = '1'; capabilityNote.style.transform = 'none'; }, 120);
    };
    item.addEventListener('pointerenter', showCapability);
    item.addEventListener('focus', showCapability);
  });
  $('.capability-index')?.addEventListener('pointerleave', () => { if (capabilityNote) capabilityNote.textContent = capabilityDefault; });

  const menuButton = $('[data-menu-button]');
  const mobileNav = $('[data-mobile-nav]');
  const setMenu = open => {
    menuButton?.setAttribute('aria-expanded', String(open));
    mobileNav?.classList.toggle('is-open', open);
    document.body.classList.toggle('is-locked', open);
  };
  menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  $$('a', mobileNav).forEach(link => link.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .13, rootMargin: '0px 0px -5% 0px' });
  $$('.reveal').forEach(element => revealObserver.observe(element));

  const canvas = $('[data-terrain]');
  if (canvas) {
    const context = canvas.getContext('2d');
    let width = 0, height = 0, dpr = 1, frame = 0;
    let pointerX = .7, pointerY = .48, targetX = .7, targetY = .48;
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width; height = rect.height; dpr = Math.min(devicePixelRatio || 1, 1.7);
      canvas.width = Math.floor(width * dpr); canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const drawTerrain = () => {
      pointerX += (targetX - pointerX) * .035; pointerY += (targetY - pointerY) * .035;
      context.clearRect(0, 0, width, height);
      const originX = width * (.72 + (pointerX - .5) * .04);
      const originY = height * (.48 + (pointerY - .5) * .035);
      const rows = width < 720 ? 21 : 33, cols = width < 720 ? 30 : 48;
      for (let row = 0; row < rows; row++) {
        context.beginPath();
        for (let col = 0; col < cols; col++) {
          const nx = (col / (cols - 1) - .5) * 1.5;
          const ny = (row / (rows - 1) - .5) * 1.2;
          const distance = Math.sqrt(nx * nx + ny * ny);
          const wave = Math.sin(distance * 12 - frame * .012) * .045 + Math.cos(nx * 8 + frame * .006) * .025;
          const perspective = 1 + ny * .42;
          const x = originX + nx * width * .46 * perspective;
          const y = originY + ny * height * .54 + wave * height * (1.2 - distance * .35);
          if (col === 0) context.moveTo(x, y); else context.lineTo(x, y);
        }
        const alpha = .025 + (row / rows) * .075;
        context.strokeStyle = `rgba(144,163,176,${alpha})`; context.lineWidth = .7; context.stroke();
      }
      for (let col = 0; col < cols; col += 2) {
        context.beginPath();
        for (let row = 0; row < rows; row++) {
          const nx = (col / (cols - 1) - .5) * 1.5;
          const ny = (row / (rows - 1) - .5) * 1.2;
          const distance = Math.sqrt(nx * nx + ny * ny);
          const wave = Math.sin(distance * 12 - frame * .012) * .045 + Math.cos(nx * 8 + frame * .006) * .025;
          const perspective = 1 + ny * .42;
          const x = originX + nx * width * .46 * perspective;
          const y = originY + ny * height * .54 + wave * height * (1.2 - distance * .35);
          if (row === 0) context.moveTo(x, y); else context.lineTo(x, y);
        }
        context.strokeStyle = 'rgba(123,145,159,.035)'; context.stroke();
      }
      frame++;
      if (!reducedMotion) requestAnimationFrame(drawTerrain);
    };
    canvas.closest('.hero')?.addEventListener('pointermove', event => {
      const rect = canvas.getBoundingClientRect();
      targetX = (event.clientX - rect.left) / rect.width; targetY = (event.clientY - rect.top) / rect.height;
    });
    addEventListener('resize', resizeCanvas); resizeCanvas(); drawTerrain();
  }

  const cieloVisual = $('[data-cielo-visual]');
  const focusCopy = $('[data-focus-copy]');
  if (cieloVisual) {
    const windows = $$('.ui-window', cieloVisual);
    windows.forEach(windowEl => {
      const focus = () => {
        cieloVisual.classList.add('is-focused');
        windows.forEach(item => item.classList.toggle('is-focused', item === windowEl));
        if (focusCopy) {
          focusCopy.style.opacity = '0'; focusCopy.style.transform = 'translateY(5px)';
          setTimeout(() => { focusCopy.textContent = windowEl.dataset.copy; focusCopy.style.opacity = '1'; focusCopy.style.transform = 'none'; }, 150);
        }
      };
      windowEl.addEventListener('pointerenter', focus);
      windowEl.addEventListener('focus', focus);
    });
    cieloVisual.addEventListener('pointerleave', () => {
      cieloVisual.classList.remove('is-focused'); windows.forEach(item => item.classList.remove('is-focused'));
    });
    if (!reducedMotion) cieloVisual.addEventListener('pointermove', event => {
      const rect = cieloVisual.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      $$('.ui-window', cieloVisual).forEach((item, index) => {
        const depth = index === 1 ? 11 : index === 2 ? 7 : 4;
        item.style.marginLeft = `${x * depth}px`; item.style.marginTop = `${y * depth}px`;
      });
    });
    cieloVisual.addEventListener('click', event => { if (!event.target.closest('button')) location.href = 'cases/cielo.html'; });
    cieloVisual.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') location.href = 'cases/cielo.html'; });
  }

  const films = $$('.film');
  films.forEach(film => {
    const activate = () => films.forEach(item => item.classList.toggle('is-active', item === film));
    film.addEventListener('pointerenter', activate); film.addEventListener('focusin', activate);
    film.addEventListener('click', event => { if (!event.target.closest('button')) openCase(film.dataset.project); });
    film.addEventListener('keydown', event => { if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('button')) { event.preventDefault(); openCase(film.dataset.project); } });
  });

  const methodScroll = $('[data-method-scroll]');
  const methodScenes = $$('.method-scene');
  const methodLabels = $$('.method-rail span');
  const methodLine = $('[data-method-line]');
  let methodStep = -1;
  const updateMethod = () => {
    if (!methodScroll || innerWidth <= 720 || reducedMotion) return;
    const rect = methodScroll.getBoundingClientRect();
    const travel = rect.height - innerHeight;
    const progressValue = clamp(-rect.top / travel, 0, .999);
    const nextStep = Math.floor(progressValue * methodScenes.length);
    if (methodLine) methodLine.style.height = `${progressValue * 100}%`;
    if (nextStep !== methodStep) {
      methodStep = nextStep;
      methodScenes.forEach((scene, index) => scene.classList.toggle('is-active', index === nextStep));
      methodLabels.forEach((label, index) => label.classList.toggle('is-active', index <= nextStep));
    }
  };
  addEventListener('scroll', updateMethod, { passive: true }); updateMethod();

  const experienceScenes = $$('[data-experience-scene]');
  const reelCurrent = $('[data-reel-current]');
  if (experienceScenes.length) {
    const experienceObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        experienceScenes.forEach(scene => scene.classList.toggle('is-active', scene === entry.target));
        if (reelCurrent) reelCurrent.textContent = String(Number(entry.target.dataset.experienceScene) + 1).padStart(2, '0');
      });
    }, { threshold: .62 });
    experienceScenes.forEach(scene => {
      experienceObserver.observe(scene);
      const proof = $('[data-experience-proof]', scene);
      $$('[data-evidence]', scene).forEach(keyword => {
        const updateEvidence = () => {
          if (!proof) return;
          proof.style.opacity = '0'; proof.style.transform = 'translateY(4px)';
          setTimeout(() => { proof.textContent = keyword.dataset.evidence; proof.style.opacity = '1'; proof.style.transform = 'none'; }, 110);
        };
        keyword.addEventListener('pointerenter', updateEvidence);
        keyword.addEventListener('focus', updateEvidence);
      });
    });
  }

  const awardProof = $('[data-award-proof]');
  $$('[data-award-note]').forEach(item => {
    const updateAward = () => {
      if (!awardProof) return;
      awardProof.style.opacity = '0'; awardProof.style.transform = 'translateY(4px)';
      setTimeout(() => { awardProof.textContent = item.dataset.awardNote; awardProof.style.opacity = '1'; awardProof.style.transform = 'none'; }, 110);
    };
    item.addEventListener('pointerenter', updateAward);
    item.addEventListener('focus', updateAward);
  });

  const identityCopy = $('[data-identity-copy]');
  $$('[data-identity-note]').forEach(item => {
    const updateIdentity = () => {
      if (!identityCopy) return;
      identityCopy.style.opacity = '0'; identityCopy.style.transform = 'translateY(4px)';
      setTimeout(() => { identityCopy.textContent = item.dataset.identityNote; identityCopy.style.opacity = '1'; identityCopy.style.transform = 'none'; }, 110);
    };
    item.addEventListener('pointerenter', updateIdentity);
    item.addEventListener('focus', updateIdentity);
  });

  const portrait = $('[data-portrait]');
  portrait?.addEventListener('pointermove', event => {
    const rect = portrait.getBoundingClientRect();
    portrait.style.setProperty('--x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    portrait.style.setProperty('--y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  });
  const contact = $('#contact');
  contact?.addEventListener('pointermove', event => {
    const rect = contact.getBoundingClientRect();
    contact.style.setProperty('--contact-x', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    contact.style.setProperty('--contact-y', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  });

  const caseLinks = {
    cielo: 'cases/cielo.html',
    gov: 'cases/government-llm.html',
    saas: 'cases/education-saas.html'
  };
  function openCase(key) {
    if (caseLinks[key]) location.href = caseLinks[key];
  }
  $$('[data-open-case]').forEach(button => button.addEventListener('click', event => { event.stopPropagation(); openCase(button.dataset.openCase); }));

  const toast = $('[data-toast]');
  let toastTimer;
  $('[data-copy-email]')?.addEventListener('click', async () => {
    const email = 'zhangyuxin0313@foxmail.com';
    try { await navigator.clipboard.writeText(email); } catch { location.href = `mailto:${email}`; }
    if (toast) { toast.classList.add('is-visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 1700); }
  });
})();
