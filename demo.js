/* Hero phone sizing and the How it works two-phone stage.
   Desktop: progress follows the scroll position through .track (no timers).
   Mobile: plays the live set once when it comes into view.
   Reduced motion: final states, no movement. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var mobile = matchMedia('(max-width: 767px)');
  var hero = document.getElementById('hero-phone');
  var A = document.getElementById('demo-a'), B = document.getElementById('demo-b');
  var phones = document.querySelector('.phones'), track = document.querySelector('.track');
  if (!A || !B || !track) return;
  var pw = 360;

  function size() {
    var vh = innerHeight, vw = innerWidth;
    var hw = mobile.matches ? Math.min(320, vw - 64) : Math.min(380, (vh - 220) * 940 / 2090);
    if (hero) hero.style.setProperty('--s', Math.max(hw / 940, .2).toFixed(4));
    pw = mobile.matches ? Math.min(340, vw - 48) : Math.min(380, (vh - 150) * 940 / 2090, (phones.clientWidth - 24) / 2);
    [A, B].forEach(function (p) { p.style.setProperty('--s', Math.max(pw / 940, .2).toFixed(4)); });
  }

  var repsEl = A.querySelector('[data-reps]'), misEl = A.querySelector('[data-mistakes]'),
      misLab = A.querySelector('[data-mistake-label]'), timerEl = A.querySelector('[data-timer]'),
      good = A.querySelector('.ph-toast-good'), bad = A.querySelector('.ph-toast-bad');
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }
  function band(p, a, b) { return clamp((p - a) / (b - a), 0, 1); }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }

  /* Live set: p from 0 to 0.5 */
  var last = {};
  function setA(p) {
    var reps = Math.round(clamp((p - .08) / .34, 0, 1) * 10);
    var mistakes = p >= .24 ? 1 : 0, fault = p >= .24 && p < .36, ok = p >= .42;
    if (last.reps !== reps) {
      repsEl.textContent = reps;
      timerEl.textContent = '00:' + String(30 + Math.round(reps * 2.2)).padStart(2, '0');
      last.reps = reps;
    }
    if (last.m !== mistakes) {
      misEl.textContent = mistakes;
      misEl.classList.toggle('hot', mistakes > 0);
      misLab.textContent = mistakes === 1 ? 'MISTAKE' : 'MISTAKES';
      last.m = mistakes;
    }
    A.classList.toggle('is-fault', fault);
    bad.classList.toggle('is-on', fault);
    good.classList.toggle('is-on', ok);
  }

  var steps = [.12, .24, .42, .62, .82];
  var btns = [].slice.call(document.querySelectorAll('.notes button'));
  function setStep(p) {
    var i = 0; while (i < steps.length && p >= steps[i]) i++;
    btns.forEach(function (b, k) { if (k === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
  }
  function clearStep() { btns.forEach(function (b) { b.removeAttribute('aria-current'); }); }

  function setPhones(p) {
    var half = (pw + 24) / 2;
    var t = ease(band(p, .5, .7)), s = ease(band(p, .82, 1));
    A.style.setProperty('--ax', (-half * t).toFixed(1) + 'px');
    A.style.setProperty('--as', (lerp(1, .94, t) + lerp(0, .02, s)).toFixed(3));
    B.style.setProperty('--bo', t.toFixed(3));
    B.style.setProperty('--bx', (half * t).toFixed(1) + 'px');
    B.style.setProperty('--by', lerp(24, 0, t).toFixed(1) + 'px');
    B.style.setProperty('--bs', (lerp(.96, 1, t) - lerp(0, .04, s)).toFixed(3));
  }
  function showB() { B.style.setProperty('--bo', 1); B.style.setProperty('--by', '0px'); B.style.setProperty('--bs', 1); }

  function progress() { var r = track.getBoundingClientRect(), span = r.height - innerHeight; return span > 0 ? clamp(-r.top / span, 0, 1) : 0; }
  var ticking = false;
  function frame() {
    ticking = false;
    if (mobile.matches || reduce.matches) return;
    var p = progress(); setA(p); setStep(p); setPhones(p);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }

  btns.forEach(function (b, k) {
    b.addEventListener('click', function () {
      if (mobile.matches || reduce.matches) return;
      var target = k === 0 ? 0 : steps[k - 1] + .01;
      var r = track.getBoundingClientRect();
      scrollTo({ top: scrollY + r.top + target * (r.height - innerHeight), behavior: 'smooth' });
    });
  });

  var played = false;
  function playOnce() {
    if (played) return; played = true;
    var t0 = null;
    function step(ts) { if (!t0) t0 = ts; var t = clamp((ts - t0) / 2400, 0, 1); setA(t * .5); if (t < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting || !mobile.matches || reduce.matches) return;
        if (e.target === A) playOnce();
        if (e.target === B) showB();
      });
    }, { threshold: .35 });
    io.observe(A); io.observe(B);
  }

  function mode() {
    size();
    if (reduce.matches) {
      setA(.5); clearStep();
      if (mobile.matches) { A.style.removeProperty('--ax'); showB(); } else { setPhones(1); }
      return;
    }
    if (mobile.matches) {
      A.style.removeProperty('--ax'); B.style.removeProperty('--bx');
      setA(played ? .5 : 0); clearStep(); return;
    }
    frame();
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', mode);
  reduce.addEventListener('change', mode);
  mobile.addEventListener('change', mode);
  mode();
})();
