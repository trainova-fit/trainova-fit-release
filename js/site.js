/* Theme, navigation, menu, section reveals and the setup illustration. */
window.__tfReady = true; /* tells the page script loaded, so the no-motion fallback stays off */

(function () {
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var KEY = 'trainova-fit-theme';

  /* Theme: one crossfade for the whole page, saved per browser */
  var tbtns = [].slice.call(document.querySelectorAll('.theme-btn'));
  function labelTheme() {
    var dark = root.getAttribute('data-theme') !== 'light';
    tbtns.forEach(function (b) {
      b.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      b.setAttribute('title', dark ? 'Switch to light theme' : 'Switch to dark theme');
    });
    var meta = document.querySelector('meta[name=theme-color]');
    if (meta) meta.setAttribute('content', dark ? '#06122B' : '#FFFFFF');
  }
  labelTheme();
  tbtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      var apply = function () {
        root.setAttribute('data-theme', next);
        try { localStorage.setItem(KEY, next); } catch (e) {}
        labelTheme();
      };
      if (document.startViewTransition && !reduce.matches) document.startViewTransition(apply);
      else apply();
    });
  });

  /* Mobile menu */
  var menuBtn = document.querySelector('.menu-btn');
  var panel = document.getElementById('menu-panel');
  if (panel) [].forEach.call(panel.querySelectorAll('a'), function (a, i) { a.style.setProperty('--i', i); });
  function setMenu(open) {
    if (!menuBtn || !panel) return;
    panel.classList.toggle('open', open);
    root.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { var f = panel.querySelector('a'); if (f) f.focus({ preventScroll: true }); }
  }
  /* Header gets a hairline once the page scrolls */
  var hdr = document.querySelector('.hdr'), hdrTick = false;
  function hdrState() { hdrTick = false; if (hdr) hdr.classList.toggle('scrolled', window.scrollY > 8); }
  addEventListener('scroll', function () { if (!hdrTick) { hdrTick = true; requestAnimationFrame(hdrState); } }, { passive: true });
  hdrState();

  /* Close the menu when the layout grows past the menu breakpoint */
  matchMedia('(min-width: 900px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });

  if (menuBtn && panel) {
    menuBtn.addEventListener('click', function () { setMenu(!panel.classList.contains('open')); });
    panel.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (!panel.classList.contains('open')) return;
      if (e.key === 'Escape') { setMenu(false); menuBtn.focus({ preventScroll: true }); }
      if (e.key === 'Tab') {
        var items = [menuBtn].concat([].slice.call(panel.querySelectorAll('a')));
        var i = items.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
        else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
      }
    });
  }

  [].forEach.call(document.querySelectorAll('.stagger'), function (g) {
    [].forEach.call(g.children, function (c, i) { c.style.setProperty('--i', Math.min(i, 5)); });
  });

  if (!('IntersectionObserver' in window)) {
    [].forEach.call(document.querySelectorAll('.reveal,.stagger,.setup-svg'), function (el) { el.classList.add('in'); });
    return;
  }

  /* Active section in the nav */
  var navLinks = [].slice.call(document.querySelectorAll('.nav ul a[href^="#"]'));
  var byId = {};
  navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      navLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
      var a = byId[e.target.id];
      if (a) a.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('main > section[id]').forEach(function (s) { spy.observe(s); });

  /* Sections fade up once */
  var rev = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); rev.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal,.stagger,.setup-svg').forEach(function (el) {
    if (el.getBoundingClientRect().bottom < 0) el.classList.add('in'); /* already scrolled past, for example after a reload */
    else rev.observe(el);
  });

  /* Hero phones start their entrance once the image is decoded, so it never pops in after the motion ends */
  var phonesEl = document.querySelector('.hero-phones');
  if (phonesEl) {
    var showPhones = function () { phonesEl.classList.add('ready'); };
    var imgs = [].slice.call(phonesEl.querySelectorAll('img')).filter(function (i) { return i.offsetParent !== null; });
    var decoded = imgs.map(function (i) { return i.decode ? i.decode().catch(function () {}) : Promise.resolve(); });
    Promise.race([Promise.all(decoded), new Promise(function (r) { setTimeout(r, 1500); })]).then(showPhones);
  }

  /* Marquee: the viewer can pause it (hover and keyboard focus also pause it) */
  var mq = document.querySelector('[data-marquee]'), mqBtn = document.querySelector('.marquee-toggle');
  if (mq && mqBtn) {
    mqBtn.addEventListener('click', function () {
      var paused = mq.classList.toggle('paused');
      mqBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
      mqBtn.setAttribute('aria-label', paused ? 'Play the scrolling exercise names' : 'Pause the scrolling exercise names');
    });
  }

  /* Count-up for the few figures that are true counts. The real number is in the HTML first,
     so it reads correctly without scripts, with reduced motion, and to screen readers. */
  var counters = [].slice.call(document.querySelectorAll('[data-count]'));
  function runCount(el) {
    var to = +el.getAttribute('data-count'), out = el.querySelector('[aria-hidden]'), t0 = null, dur = 1100;
    function frame(ts) {
      if (t0 === null) t0 = ts;
      var k = Math.min((ts - t0) / dur, 1), e = 1 - Math.pow(1 - k, 4);
      out.textContent = Math.round(to * e);
      if (k < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if (counters.length && !reduce.matches) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        cio.unobserve(e.target); runCount(e.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) {
      var out = el.querySelector('[aria-hidden]'); if (!out) return;
      if (el.getBoundingClientRect().bottom < 0) return; /* already scrolled past: keep the final number */
      out.textContent = '0'; cio.observe(el);
    });
  }
})();
