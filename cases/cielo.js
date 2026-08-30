(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const nav = $('[data-nav]');
  const progress = $('[data-progress]');
  const updatePageState = () => {
    nav?.classList.toggle('is-scrolled', scrollY > 24);
    const maximum = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.width = `${maximum > 0 ? (scrollY / maximum) * 100 : 0}%`;
  };
  addEventListener('scroll', updatePageState, { passive: true });
  updatePageState();

  const revealItems = $$('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(item => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    revealItems.forEach(item => revealObserver.observe(item));
  }

  if (!reducedMotion) {
    const hero = $('[data-hero]');
    const orbit = $('.hero-orbit', hero || document);
    const devices = $('.cielo-hero-devices', hero || document);
    hero?.addEventListener('pointermove', event => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      if (orbit) orbit.style.transform = `translate3d(${x * 22}px,${y * 16}px,0) rotate(${x * 2.4}deg)`;
      if (devices) devices.style.transform = `translate3d(${x * -11}px,${y * -8}px,0)`;
    });
    hero?.addEventListener('pointerleave', () => {
      if (orbit) orbit.style.transform = '';
      if (devices) devices.style.transform = '';
    });
  }

  const swapCopy = (output, copy) => {
    if (!output || !copy || output.textContent === copy) return;
    output.style.opacity = '0';
    output.style.transform = 'translateY(5px)';
    setTimeout(() => {
      output.textContent = copy;
      output.style.opacity = '1';
      output.style.transform = 'none';
    }, reducedMotion ? 0 : 125);
  };

  const bindChoiceGroup = ({ root, buttons, output, copyKey }) => {
    if (!root || !output) return;
    buttons.forEach(button => {
      const activate = () => {
        buttons.forEach(item => item.classList.toggle('is-active', item === button));
        swapCopy(output, button.dataset[copyKey]);
      };
      button.addEventListener('pointerenter', activate);
      button.addEventListener('focus', activate);
      button.addEventListener('click', activate);
    });
  };

  const questionRoot = $('[data-question-strip]');
  const questionButtons = questionRoot ? $$('button[data-target]', questionRoot) : [];
  bindChoiceGroup({ root: questionRoot, buttons: questionButtons, output: $('[data-question-copy]'), copyKey: 'question' });
  questionButtons.forEach(button => {
    button.addEventListener('click', () => {
      const target = document.getElementById(button.dataset.target);
      if (!target) return;
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', `#${button.dataset.target}`);
    });
  });

  const memoryRoot = $('[data-memory-machine]');
  bindChoiceGroup({ root: memoryRoot, buttons: memoryRoot ? $$('button[data-node-copy]', memoryRoot) : [], output: $('[data-memory-copy]', memoryRoot || document), copyKey: 'nodeCopy' });

  const agentRoot = $('[data-agent-stage]');
  bindChoiceGroup({ root: agentRoot, buttons: agentRoot ? $$('button[data-agent-copy]', agentRoot) : [], output: $('[data-agent-copy-output]', agentRoot || document), copyKey: 'agentCopy' });

  const trustRoot = $('[data-trust-stage]');
  bindChoiceGroup({ root: trustRoot, buttons: trustRoot ? $$('button[data-trust-copy]', trustRoot) : [], output: $('[data-trust-output]', trustRoot || document), copyKey: 'trustCopy' });

  const scenes = $$('[data-scene]');
  const sceneLinks = $$('[data-scene-link]');
  const sceneIndex = $('.scene-index');
  const mechanismGroup = $('.mechanisms');
  const updateSceneIndex = () => {
    if (!sceneIndex || !mechanismGroup) return;
    const rect = mechanismGroup.getBoundingClientRect();
    sceneIndex.classList.toggle('is-visible', rect.top < innerHeight * .72 && rect.bottom > innerHeight * .35);
  };
  addEventListener('scroll', updateSceneIndex, { passive: true });
  updateSceneIndex();
  if (scenes.length && 'IntersectionObserver' in window) {
    const sceneObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const key = visible.target.dataset.scene;
      sceneLinks.forEach(link => link.classList.toggle('is-active', link.dataset.sceneLink === key));
    }, { threshold: [.25, .45, .65], rootMargin: '-16% 0px -32% 0px' });
    scenes.forEach(scene => sceneObserver.observe(scene));
  }

  const videoModal = $('[data-video-modal]');
  const demoVideo = $('[data-demo-video]');
  const openVideoButton = $('[data-open-video]');
  const closeVideoButton = $('[data-close-video]');
  let videoPreviousFocus = null;
  const openVideo = () => {
    if (!videoModal || !demoVideo) return;
    videoPreviousFocus = document.activeElement;
    videoModal.classList.add('is-open');
    videoModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-video-open');
    closeVideoButton?.focus();
    demoVideo.play().catch(() => {});
  };
  const closeVideo = () => {
    if (!videoModal || !demoVideo) return;
    demoVideo.pause();
    videoModal.classList.remove('is-open');
    videoModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-video-open');
    videoPreviousFocus?.focus();
  };
  openVideoButton?.addEventListener('click', openVideo);
  closeVideoButton?.addEventListener('click', closeVideo);
  videoModal?.addEventListener('click', event => { if (event.target === videoModal) closeVideo(); });
  addEventListener('keydown', event => { if (event.key === 'Escape' && videoModal?.classList.contains('is-open')) closeVideo(); });
})();
