(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const nav = $('[data-nav]');
  const progress = $('[data-progress]');
  const updatePage = () => {
    nav?.classList.toggle('is-scrolled', scrollY > 24);
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.width = `${max > 0 ? scrollY / max * 100 : 0}%`;
  };
  addEventListener('scroll', updatePage, { passive: true });
  updatePage();

  const reveals = $$('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) reveals.forEach(item => item.classList.add('is-visible'));
  else {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }), { threshold: .1, rootMargin: '0px 0px -7% 0px' });
    reveals.forEach(item => observer.observe(item));
  }

  if (!reducedMotion) {
    const hero = $('[data-hero]');
    const lens = $('[data-lens]');
    hero?.addEventListener('pointermove', event => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      if (lens) lens.style.transform = `translate3d(${x * 24}px,${y * 17}px,0) rotate(${x * 2}deg)`;
    });
    hero?.addEventListener('pointerleave', () => { if (lens) lens.style.transform = ''; });
  }

  const swap = (output, copy) => {
    if (!output || !copy || output.textContent === copy) return;
    output.style.opacity = '0';
    output.style.transform = 'translateY(5px)';
    setTimeout(() => {
      output.textContent = copy;
      output.style.opacity = '1';
      output.style.transform = 'none';
    }, reducedMotion ? 0 : 120);
  };

  const bindGroup = (rootSelector, buttonSelector, outputSelector, key, onActivate) => {
    const root = $(rootSelector);
    if (!root) return;
    const buttons = $$(buttonSelector, root);
    const output = $(outputSelector);
    buttons.forEach(button => {
      const activate = () => {
        buttons.forEach(item => item.classList.toggle('is-active', item === button));
        swap(output, button.dataset[key]);
        onActivate?.(button);
      };
      button.addEventListener('pointerenter', activate);
      button.addEventListener('focus', activate);
      button.addEventListener('click', activate);
    });
  };

  bindGroup('[data-track-tabs]', 'button[data-copy]', '[data-track-output]', 'copy');
  bindGroup('[data-eval-steps]', 'button[data-copy]', '[data-eval-output]', 'copy');
  bindGroup('[data-safety-controls]', 'button[data-copy]', '[data-safety-output]', 'copy');
  const stateControls = $('[data-state-controls]');
  if (stateControls) {
    const buttons = $$('button[data-state]', stateControls);
    const panels = $$('[data-state-panel]');
    buttons.forEach(button => {
      const activate = () => {
        buttons.forEach(item => item.classList.toggle('is-active', item === button));
        panels.forEach(panel => panel.classList.toggle('is-active', panel.dataset.statePanel === button.dataset.state));
      };
      button.addEventListener('pointerenter', activate);
      button.addEventListener('focus', activate);
      button.addEventListener('click', activate);
    });
  }
  bindGroup('[data-prototype-reel]', 'article[data-copy]', '[data-reel-output]', 'copy');

  const validationControls = $('[data-validation-controls]');
  if (validationControls) {
    const buttons = $$('button[data-validation]', validationControls);
    const panels = $$('[data-validation-panel]');
    buttons.forEach(button => {
      const activate = () => {
        buttons.forEach(item => item.classList.toggle('is-active', item === button));
        panels.forEach(panel => panel.classList.toggle('is-active', panel.dataset.validationPanel === button.dataset.validation));
      };
      button.addEventListener('pointerenter', activate);
      button.addEventListener('focus', activate);
      button.addEventListener('click', activate);
    });
  }

  const petLensStage = $('[data-pet-lens-stage]');
  if (petLensStage) {
    requestAnimationFrame(() => petLensStage.classList.add('is-in'));
    const controls = $$('[data-pet-lens]', petLensStage);
    const panels = $$('[data-pet-lens-panel]', petLensStage);
    const activate = key => {
      controls.forEach(control => classToggle(control, 'is-active', control.dataset.petLens === key));
      panels.forEach(panel => classToggle(panel, 'is-active', panel.dataset.petLensPanel === key));
    };
    const classToggle = (item, name, state) => item.classList.toggle(name, state);
    controls.forEach(control => {
      control.addEventListener('pointerenter', () => activate(control.dataset.petLens));
      control.addEventListener('focus', () => activate(control.dataset.petLens));
      control.addEventListener('click', () => activate(control.dataset.petLens));
    });
  }

  const petScenes = $('[data-pet-scenes]');
  if (petScenes) {
    const controls = $$('[data-pet-scene]', petScenes);
    const panels = $$('[data-pet-scene-panel]', petScenes);
    const activate = key => {
      controls.forEach(control => {
        const active = control.dataset.petScene === key;
        control.classList.toggle('is-active', active);
        control.setAttribute('aria-selected', String(active));
      });
      panels.forEach(panel => panel.classList.toggle('is-active', panel.dataset.petScenePanel === key));
    };
    controls.forEach(control => {
      control.addEventListener('pointerenter', () => activate(control.dataset.petScene));
      control.addEventListener('focus', () => activate(control.dataset.petScene));
      control.addEventListener('click', () => activate(control.dataset.petScene));
    });
  }

  const petModules = $('[data-pet-modules]');
  if (petModules) {
    const modules = $$('[data-pet-module]', petModules);
    let locked = false;
    const activate = key => {
      modules.forEach(module => {
        const active = module.dataset.petModule === key;
        module.classList.toggle('is-active', active);
        $('button', module)?.setAttribute('aria-expanded', String(active));
      });
    };
    modules.forEach(module => {
      const button = $('button', module);
      module.addEventListener('pointerenter', () => { if (!locked) activate(module.dataset.petModule); });
      button?.addEventListener('focus', () => activate(module.dataset.petModule));
      button?.addEventListener('click', () => {
        if (locked && module.classList.contains('is-active')) locked = false;
        else {
          activate(module.dataset.petModule);
          locked = true;
        }
        petModules.classList.toggle('is-locked', locked);
      });
    });
    const activateHash = () => {
      const target = modules.find(module => `#${module.id}` === location.hash);
      if (target) {
        activate(target.dataset.petModule);
        locked = true;
        petModules.classList.add('is-locked');
      }
    };
    addEventListener('hashchange', activateHash);
    activateHash();
  }

  const petAi = $('[data-pet-ai]');
  if (petAi) {
    const controls = $$('[data-ai-context]', petAi);
    const output = $('[data-ai-output]', petAi);
    const activate = control => {
      controls.forEach(item => item.classList.toggle('is-active', item === control));
      petAi.dataset.aiActive = control.dataset.aiContext;
      swap(output, control.dataset.copy);
    };
    controls.forEach(control => {
      control.addEventListener('pointerenter', () => activate(control));
      control.addEventListener('focus', () => activate(control));
      control.addEventListener('click', () => activate(control));
    });
    petAi.dataset.aiActive = controls[0]?.dataset.aiContext || 'profile';
  }

  const petDelivery = $('[data-pet-delivery]');
  if (petDelivery) {
    const controls = $$('[data-delivery]', petDelivery);
    const panels = $$('[data-delivery-panel]', petDelivery);
    const activate = key => {
      controls.forEach(control => {
        const active = control.dataset.delivery === key;
        control.classList.toggle('is-active', active);
        control.setAttribute('aria-selected', String(active));
      });
      panels.forEach(panel => panel.classList.toggle('is-active', panel.dataset.deliveryPanel === key));
    };
    controls.forEach(control => {
      control.addEventListener('pointerenter', () => activate(control.dataset.delivery));
      control.addEventListener('focus', () => activate(control.dataset.delivery));
      control.addEventListener('click', () => activate(control.dataset.delivery));
    });
  }

})();
