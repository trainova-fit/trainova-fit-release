/* Exercises: selector, muscle chips, muscle map and pinned floating tags.
   Data: muscles.js (window.TF_EXERCISES). Placement maths: pin-place.js (window.TFPin).
   The atlas SVGs load when the section comes near the view. */
import { TF_EXERCISES } from './muscles.js';
import { TFPin as Pin } from './pin-place.js';

(function () {
  var data = TF_EXERCISES;
  var list = document.getElementById('ex-list'), panel = document.getElementById('ex-panel');
  if (!list || !panel) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var $ = function (id) { return document.getElementById(id); };
  var nameEl = $('ex-name'), eqEl = $('ex-eq'), faultsEl = $('ex-faults'),
      mainEl = $('ex-main'), supEl = $('ex-support'), live = $('ex-live');
  var sides = {
    front: { box: $('atlas-front'), fig: $('fig-front'), svg: null },
    back: { box: $('atlas-back'), fig: $('fig-back'), svg: null }
  };
  var current = 0, pinned = null, loaded = false;
  var SVGNS = 'http://www.w3.org/2000/svg';

  function group(key) {
    var gs = data[current].muscles;
    for (var i = 0; i < gs.length; i++) if (gs[i].key === key) return gs[i];
    return null;
  }
  function roleText(g) { return g.role === 'primary' ? 'Main muscle' : 'Supporting muscle'; }
  function esc(id) { return window.CSS && CSS.escape ? CSS.escape(id) : id; }

  /* ----- chips ----- */
  function renderChips() {
    var ex = data[current];
    [['primary', mainEl], ['secondary', supEl]].forEach(function (pair) {
      pair[1].innerHTML = '';
      ex.muscles.filter(function (g) { return g.role === pair[0]; }).forEach(function (g) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'chip'; b.dataset.key = g.key; b.setAttribute('aria-pressed', 'false');
        var sw = document.createElement('span');
        sw.className = 'sw ' + (g.ids.length ? (g.role === 'primary' ? 'sw-p' : 'sw-s') : 'sw-n');
        sw.setAttribute('aria-hidden', 'true');
        b.appendChild(sw); b.appendChild(document.createTextNode(g.label));
        var li = document.createElement('li'); li.appendChild(b); pair[1].appendChild(li);
      });
    });
  }

  /* ----- map colours ----- */
  /* Highlighted muscles are drawn as clones on top of the body, so no other shape can cover them. */
  function clearShapes(svg) {
    [].forEach.call(svg.querySelectorAll('.hl,.pin-top'), function (n) { n.parentNode.removeChild(n); });
  }
  function clone(el, cls, key) {
    var c = el.cloneNode(true); c.removeAttribute('id');
    [].forEach.call(c.querySelectorAll('[id]'), function (n) { n.removeAttribute('id'); });
    c.setAttribute('class', cls); if (key) c.setAttribute('data-key', key);
    return c;
  }
  function paint() {
    var ex = data[current];
    ['front', 'back'].forEach(function (side) {
      var svg = sides[side].svg; if (!svg) return;
      clearShapes(svg);
      var hl = document.createElementNS(SVGNS, 'g'); hl.setAttribute('class', 'hl');
      var done = {};
      /* secondary first, primary after, so a shared shape ends up primary */
      ['secondary', 'primary'].forEach(function (role) {
        ex.muscles.forEach(function (g) {
          if (g.role !== role) return;
          g.ids.forEach(function (id) {
            var el = svg.querySelector('#' + esc(id)); if (!el) return;
            if (done[id]) { var old = done[id]; old.parentNode.removeChild(old); }
            var c = clone(el, role === 'primary' ? 'is-p' : 'is-s', g.key);
            hl.appendChild(c); done[id] = c;
          });
        });
      });
      svg.appendChild(hl);
    });
    renderPin();
  }

  /* ----- pinned tag ----- */
  function ensureTag(side) {
    var s = sides[side], box = s.box;
    if (!s.tag) {
      s.tag = document.createElement('div'); s.tag.className = 'pin-tag'; s.tag.setAttribute('aria-hidden', 'true');
      box.appendChild(s.tag);
    }
    return s;
  }
  function hideTags() {
    ['front', 'back'].forEach(function (side) {
      var s = sides[side]; if (s.tag) s.tag.classList.remove('on');
    });
  }
  function shapesOf(svg, g) {
    return [].slice.call(svg.querySelectorAll('.hl [data-key="' + g.key + '"]'));
  }
  function showTag(key, mode) {
    var g = group(key); hideTags(); if (!g || !g.ids.length) return false;
    var any = false;
    ['front', 'back'].forEach(function (side) {
      var s = sides[side]; if (!s.svg || !s.box.offsetWidth) return;
      var els = shapesOf(s.svg, g); if (!els.length) return;
      var vb = s.svg.viewBox.baseVal, vbox = { w: vb.width, h: vb.height };
      var box = { w: s.box.clientWidth, h: s.box.clientHeight };
      var boxes = els.map(function (el) { var b = el.getBBox(); return { x: b.x, y: b.y, w: b.width, h: b.height }; });
      var u = Pin.unionBox(boxes); if (!u) return;
      var p1 = Pin.toPx({ x: u.x, y: u.y }, vbox, box), p2 = Pin.toPx({ x: u.x + u.w, y: u.y + u.h }, vbox, box);
      var avoid = { x: p1.x, y: p1.y, w: p2.x - p1.x, h: p2.y - p1.y };
      var anchor = { x: avoid.x + avoid.w / 2, y: avoid.y + avoid.h / 2 };
      ensureTag(side);
      s.tag.className = 'pin-tag' + (g.role === 'secondary' ? ' sec' : '');
      s.tag.innerHTML = '<b><i class="sw ' + (g.role === 'primary' ? 'sw-p' : 'sw-s') + '"></i></b><span></span>';
      s.tag.firstChild.appendChild(document.createTextNode(g.label)); s.tag.lastChild.textContent = roleText(g).replace(' muscle', '');
      s.tag.style.left = '0px'; s.tag.style.top = '0px';
      var tag = { w: s.tag.offsetWidth, h: s.tag.offsetHeight };
      var pos = Pin.place({ anchor: anchor, box: box, tag: tag, avoid: avoid });
      s.tag.style.left = pos.x + 'px'; s.tag.style.top = pos.y + 'px';
      requestAnimationFrame(function () { s.tag.classList.add('on'); });
      any = true;
    });
    return any;
  }
  function drawOutline(key) {
    ['front', 'back'].forEach(function (side) {
      var svg = sides[side].svg; if (!svg) return;
      var old = svg.querySelector('.pin-top'); if (old) old.parentNode.removeChild(old);
      var g = group(key); if (!key || !g) return;
      var els = shapesOf(svg, g); if (!els.length) return;
      var top = document.createElementNS(SVGNS, 'g'); top.setAttribute('class', 'pin-top');
      els.forEach(function (el) {
        top.appendChild(clone(el, 'pin-clone', null));
      });
      svg.appendChild(top);
    });
  }
  function renderPin() {
    [].forEach.call(document.querySelectorAll('#ex-panel .chip'), function (b) { b.setAttribute('aria-pressed', b.dataset.key === pinned ? 'true' : 'false'); });
    drawOutline(pinned);
    if (!pinned) { hideTags(); live.textContent = ''; return; }
    var g = group(pinned);
    if (!g) { pinned = null; hideTags(); live.textContent = ''; return; }
    if (!g.ids.length) { hideTags(); live.textContent = 'Pinned: ' + g.label + ', ' + roleText(g).toLowerCase() + '. This muscle has no shape on the map.'; return; }
    /* on phones, switch to the side that holds the shapes */
    var onFront = sides.front.svg && shapesOf(sides.front.svg, g).length, onBack = sides.back.svg && shapesOf(sides.back.svg, g).length;
    var tg = document.querySelector('.atlas-toggle');
    if (tg && tg.offsetParent !== null) {
      var visibleFront = sides.front.box.offsetWidth > 0;
      if (visibleFront && !onFront && onBack) setSide('back'); else if (!visibleFront && !onBack && onFront) setSide('front');
    }
    showTag(pinned);
    live.textContent = 'Pinned: ' + g.label + ', ' + roleText(g).toLowerCase() + '.';
  }
  function setPin(key) {
    pinned = pinned === key ? null : key;
    renderPin();
  }

  /* ----- selecting an exercise ----- */
  function show(i, focus) {
    current = i; pinned = null;
    [].forEach.call(list.querySelectorAll('button'), function (b, k) {
      b.setAttribute('aria-selected', k === i ? 'true' : 'false');
      b.tabIndex = k === i ? 0 : -1;
      if (k === i && focus) b.focus();
    });
    var ex = data[i];
    var apply = function () {
      nameEl.textContent = ex.name;
      eqEl.textContent = ex.equipment;
      faultsEl.innerHTML = '';
      ex.faults.forEach(function (f) { var li = document.createElement('li'); li.textContent = f; faultsEl.appendChild(li); });
      renderChips();
      panel.setAttribute('aria-labelledby', 'ex-tab-' + i);
      paint();
    };
    if (reduce.matches || (!focus && i === 0 && !panel.dataset.ready)) { panel.dataset.ready = '1'; apply(); return; }
    panel.classList.add('swap');
    setTimeout(function () { apply(); panel.classList.remove('swap'); }, 150);
  }

  list.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) show(+b.dataset.i); });
  list.addEventListener('keydown', function (e) {
    var n = data.length, k = null;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') k = (current + 1) % n;
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') k = (current - 1 + n) % n;
    if (e.key === 'Home') k = 0;
    if (e.key === 'End') k = n - 1;
    if (k !== null) { e.preventDefault(); show(k, true); }
  });

  /* chips pin and unpin */
  panel.addEventListener('click', function (e) { var b = e.target.closest('.chip'); if (b) setPin(b.dataset.key); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && pinned) { pinned = null; renderPin(); } });

  /* map: tap a coloured muscle to pin, hover to preview, tap empty space to clear */
  function keyOf(target) {
    var el = target.closest && target.closest('.is-p,.is-s'); return el ? el.getAttribute('data-key') : null;
  }
  function onClick(e) {
    var k = keyOf(e.target);
    if (k) setPin(k); else if (pinned) { pinned = null; renderPin(); }
  }
  function onOver(e) {
    if (pinned) return;
    var k = keyOf(e.target); if (k) showTag(k);
  }
  function onOut() { if (!pinned) hideTags(); }

  function setSide(side) {
    [].forEach.call(document.querySelectorAll('.atlas-toggle button'), function (x) { x.setAttribute('aria-pressed', x.dataset.side === side ? 'true' : 'false'); });
    sides.front.fig.hidden = side !== 'front';
    sides.back.fig.hidden = side !== 'back';
    if (pinned) requestAnimationFrame(renderPin);
  }
  [].forEach.call(document.querySelectorAll('.atlas-toggle button'), function (b) {
    b.addEventListener('click', function () { setSide(b.dataset.side); });
  });

  /* Phones and tablets show one view at a time; desktop shows both */
  function syncSide() {
    var tg = document.querySelector('.atlas-toggle');
    if (tg && tg.offsetParent !== null) {
      var pressed = tg.querySelector('[aria-pressed="true"]');
      setSide(pressed ? pressed.dataset.side : 'front');
    } else { sides.front.fig.hidden = false; sides.back.fig.hidden = false; }
  }
  var rz; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { syncSide(); if (pinned) renderPin(); }, 120); });

  /* ----- load the atlas ----- */
  function mount(side, txt) {
    var s = sides[side];
    s.box.insertAdjacentHTML('afterbegin', txt);
    s.svg = s.box.querySelector('svg');
    s.svg.setAttribute('aria-hidden', 'true');
    /* each atlas carries one full-body silhouette path with stray wedge shapes; the muscle shapes read cleaner alone */
    [].forEach.call(s.svg.querySelectorAll('path'), function (p) { if ((p.getAttribute('d') || '').length > 30000) p.setAttribute('class', 'atlas-skip'); });
    s.svg.addEventListener('click', onClick);
    s.svg.addEventListener('mouseover', onOver);
    s.svg.addEventListener('mouseout', onOut);
    paint();
  }
  function load() {
    if (loaded) return; loaded = true;
    ['front', 'back'].forEach(function (side) {
      var inline = window.TF_ATLAS && window.TF_ATLAS[side];
      if (inline) { mount(side, inline); return; }
      fetch('assets/muscle-map/atlas-' + side + '.svg').then(function (r) { if (!r.ok) throw new Error(); return r.text(); })
        .then(function (txt) { mount(side, txt); })
        .catch(function () { sides[side].box.textContent = ''; });
    });
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { load(); io.disconnect(); } }, { rootMargin: '600px 0px' });
    io.observe(panel);
  } else load();
  syncSide();
  show(0);
})();
