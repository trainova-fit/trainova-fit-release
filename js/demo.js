/* How it works: the live-set phone (Phone A) and the result phone (Phone B).
   Phone A is a clean base image plus one SVG overlay that TFLive (live-phone.js) draws into.
   Desktop: every state is computed from scroll progress through .track, with no timers, so scrolling
   back shows exactly the state that belongs to that step.
   Mobile: nothing is pinned; the live set plays once when it comes into view.
   Reduced motion: final states, no movement. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var mobile = matchMedia('(max-width: 767px)');
  var A = document.getElementById('demo-a'), B = document.getElementById('demo-b');
  var phones = document.querySelector('.phones'), track = document.querySelector('.track');
  if (!A || !B || !track) return;
  var live = window.TFLive && window.TFLive(document.getElementById('live-ov'));
  var pw = 360;

  function size() {
    var vh = innerHeight, vw = innerWidth;
    pw = mobile.matches ? Math.min(340, vw - 48) : Math.min(380, (vh - 150) * 940 / 2090, (phones.clientWidth - 24) / 2);
    [A, B].forEach(function (p) { p.style.setProperty('--s', Math.max(pw / 940, .2).toFixed(4)); });
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * clamp(t, 0, 1); }
  function band(p, a, b) { return clamp((p - a) / (b - a), 0, 1); }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }

  /* ----- Live set. Progress p runs 0 to 0.5; rep n lands at REP_AT[n - 1].
     Rep 6 is the flagged rep, so its window is wide enough to read while scrolling. */
  var REP_AT = [.08, .10, .12, .14, .16, .18, .30, .33, .36, .39];
  var FLAG_REP = 6;
  var START_SEC = 43;
  /* Placeholder copy until the app's exact strings are supplied */
  var FLAG_TITLE = 'Arm sway', FLAG_MSG = 'Keep your upper arm still';
  var GOOD_TITLE = 'Good', GOOD_MSG = '10 reps — you’re on fire!';

  var last = {};
  function setA(p) {
    if (!live) return;
    var reps = 0;
    while (reps < REP_AT.length && p >= REP_AT[reps]) reps++;
    var mistakes = reps >= FLAG_REP ? 1 : 0;
    var state = reps >= REP_AT.length ? 'good' : reps === FLAG_REP ? 'flag' : 'none';
    if (last.reps !== reps) {
      live.reps(reps);
      live.timer(START_SEC + Math.max(0, reps - 1)); /* 00:43 at the start, 00:52 at rep 10 */
      last.reps = reps;
    }
    if (last.mistakes !== mistakes) { live.mistakes(mistakes); last.mistakes = mistakes; }
    if (last.state !== state) {
      live.flag(state === 'flag');
      if (state === 'flag') live.toast('flag', FLAG_TITLE, FLAG_MSG);
      else if (state === 'good') live.toast('good', GOOD_TITLE, GOOD_MSG);
      else live.toast(null);
      last.state = state;
    }
  }

  /* ----- Step highlight: 0 tracking, 1 reps, 2 mistake and finish, 3 summary, 4 clean reps, 5 RPE */
  var steps = [.07, .18, .5, .7, .85];
  var btns = [].slice.call(document.querySelectorAll('.notes button'));
  function setStep(p) {
    var i = 0; while (i < steps.length && p >= steps[i]) i++;
    btns.forEach(function (b, k) { if (k === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
  }
  function clearStep() { btns.forEach(function (b) { b.removeAttribute('aria-current'); }); }

  /* ----- Slide from the live phone to the result phone */
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

  /* ----- Mobile: play once when the live phone comes into view */
  var played = false;
  function playOnce() {
    if (played) return; played = true;
    var t0 = null;
    function step(ts) { if (!t0) t0 = ts; var t = clamp((ts - t0) / 5200, 0, 1); setA(t * .5); if (t < 1) requestAnimationFrame(step); }
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
