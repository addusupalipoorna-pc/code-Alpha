import { useEffect } from 'react';

export default function GSAPEffects() {
  useEffect(() => {
    let _gsap = null;
    let _ScrollTrigger = null;
    let active = true;

    (async () => {
      try {
        const gsapModule = await import('gsap');
        _gsap = gsapModule.gsap || gsapModule.default || gsapModule;
        const stModule = await import('gsap/ScrollTrigger');
        _ScrollTrigger = stModule.ScrollTrigger || stModule.default || stModule;
        if (_gsap && _ScrollTrigger && active) {
          _gsap.registerPlugin(_ScrollTrigger);



          // Reveal items with .reveal on scroll
          _gsap.utils.toArray('.reveal').forEach((el) => {
            _gsap.fromTo(el, { y: 28, opacity: 0, rotateX: 6 }, {
              y: 0,
              opacity: 1,
              rotateX: 0,
              duration: 0.9,
              ease: 'power3.out',
              transformOrigin: 'center top',
              scrollTrigger: {
                trigger: el,
                start: 'top 82%',
                end: 'bottom 60%',
                toggleActions: 'play none none reverse',
                scroller: window,
              },
            });
          });



          // Feature cards: stronger 3D entrance stagger
          _gsap.fromTo('.feature-card', { y: 36, opacity: 0, rotateX: 8, scale: 0.985 }, {
            y: 0,
            opacity: 1,
            rotateX: 0,
            scale: 1,
            duration: 0.9,
            stagger: 0.08,
            ease: 'power4.out',
            transformOrigin: 'center top',
            scrollTrigger: {
              trigger: '.feature-card',
              start: 'top 85%',
              toggleActions: 'play none none reverse',
              scroller: window,
            },
          });

          // Magnetic hover for elements with data-magnetic
          const magnetElements = document.querySelectorAll('[data-magnetic]');
          const magnetRemovers = [];
          magnetElements.forEach((el) => {
            const strength = parseFloat(el.getAttribute('data-magnetic')) || 32;
            const onMove = (e) => {
              const r = el.getBoundingClientRect();
              const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
              const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
              _gsap.to(el, { x: dx * strength, y: dy * strength, scale: 1.02, duration: 0.28, ease: 'power3.out' });
            };
            const onLeave = () => _gsap.to(el, { x: 0, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' });
            el.addEventListener('pointermove', onMove);
            el.addEventListener('pointerleave', onLeave);
            magnetRemovers.push(() => { el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerleave', onLeave); });
          });

          // Button micro-interactions (hover / press) and icon micro-animations
          const buttons = document.querySelectorAll('.btn');
          const btnRemovers = [];
          buttons.forEach((btn) => {
            const onEnter = () => _gsap.to(btn, { scale: 1.035, boxShadow: '0 18px 46px rgba(99,102,241,0.12)', duration: 0.28, ease: 'power3.out' });
            const onLeave = () => _gsap.to(btn, { scale: 1, boxShadow: '0 8px 28px rgba(99,102,241,0.08)', duration: 0.45, ease: 'elastic.out(1,0.6)' });
            const onDown = () => _gsap.to(btn, { scale: 0.96, duration: 0.12, ease: 'power3.out' });
            const onUp = () => _gsap.to(btn, { scale: 1, duration: 0.12, ease: 'power3.out' });

            btn.addEventListener('pointerenter', onEnter);
            btn.addEventListener('pointerleave', onLeave);
            btn.addEventListener('pointerdown', onDown);
            btn.addEventListener('pointerup', onUp);
            btn.addEventListener('pointercancel', onUp);
            btnRemovers.push(() => {
              btn.removeEventListener('pointerenter', onEnter);
              btn.removeEventListener('pointerleave', onLeave);
              btn.removeEventListener('pointerdown', onDown);
              btn.removeEventListener('pointerup', onUp);
              btn.removeEventListener('pointercancel', onUp);
            });
          });

          // Icon micro-interactions (small lift/rotate on hover)
          const icons = document.querySelectorAll('.icon-micro, .btn .icon');
          const iconRemovers = [];
          icons.forEach((icon) => {
            const onIconEnter = () => _gsap.to(icon, { y: -4, rotation: -6, duration: 0.36, ease: 'power2.out' });
            const onIconLeave = () => _gsap.to(icon, { y: 0, rotation: 0, duration: 0.5, ease: 'elastic.out(1,0.6)' });
            icon.addEventListener('pointerenter', onIconEnter);
            icon.addEventListener('pointerleave', onIconLeave);
            iconRemovers.push(() => { icon.removeEventListener('pointerenter', onIconEnter); icon.removeEventListener('pointerleave', onIconLeave); });
          });

          // store removers for cleanup
          window.__gsapRemovers = { magnetRemovers, btnRemovers, iconRemovers };
        }
      } catch (e) {
        // ignore gracefully if gsap fails to load
        // console.warn('GSAP failed to load', e);
      }
    })();
    // cleanup: remove listeners and kill ScrollTriggers/tweens
    return () => {
      active = false;
      // run stored removers if present
      const rem = window.__gsapRemovers;
      if (rem) {
        rem.magnetRemovers.forEach((fn) => fn());
        rem.btnRemovers.forEach((fn) => fn());
        rem.iconRemovers.forEach((fn) => fn());
      }
      try {
        if (typeof _ScrollTrigger !== 'undefined' && _ScrollTrigger && _ScrollTrigger.getAll) {
          _ScrollTrigger.getAll().forEach((st) => st.kill());
        }
      } catch (e) {}
      try { if (_gsap) {
        _gsap.killTweensOf('.feature-card');
        _gsap.killTweensOf('.btn');
        _gsap.killTweensOf('.icon-micro');
      } } catch (e) {}
    };
  }, []);

  return null;
}
