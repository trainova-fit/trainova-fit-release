/* Latest release from GitHub. Moved from the previous page; behaviour kept:
   - release found: buttons download releases/latest/download/trainova-fit.apk, version, size and notes shown
   - 404, draft, pre-release or no trainova-fit.apk asset: "Coming soon", buttons inert
   - API error, rate limit, offline or 8 s timeout: buttons still download, details hidden
   - a found result is cached for 10 minutes in sessionStorage
   Added: release date, SHA-256 from the notes, and a short release history. */

/* ===== SET ONCE. NOTHING TO EDIT PER RELEASE ===== */
var CONFIG = {
  owner: 'trainova-fit',
  repo: 'trainova-fit-release',
  apkName: 'trainova-fit.apk',
  minAndroid: '10'
};
/* =================================================== */

(function () {
  var base = 'https://github.com/' + CONFIG.owner + '/' + CONFIG.repo;
  var links = { apk: base + '/releases/latest/download/' + CONFIG.apkName, releases: base + '/releases', repo: base };
  var api = 'https://api.github.com/repos/' + CONFIG.owner + '/' + CONFIG.repo;
  var cacheKey = 'trainova-fit-release-v2';
  var buttons = [].slice.call(document.querySelectorAll('[data-apk]'));

  [].forEach.call(document.querySelectorAll('[data-href]'), function (a) {
    var k = a.getAttribute('data-href');
    if (links[k]) a.href = links[k];
  });

  function setSpec(key, value) {
    [].forEach.call(document.querySelectorAll('[data-k="' + key + '"]'), function (el) {
      el.textContent = value || '';
      var wrap = el.closest('[data-spec]') || el.parentElement;
      if (wrap) wrap.hidden = !value;
    });
  }

  function setButtons(state) {
    buttons.forEach(function (a) {
      var label = a.querySelector('[data-label]') || a.querySelector('span');
      a.removeAttribute('aria-disabled');
      if (state === 'open' || state === 'checking') {
        a.setAttribute('href', links.apk);
        if (label) label.textContent = 'Download APK';
      } else {
        a.removeAttribute('href');
        a.setAttribute('aria-disabled', 'true');
        if (label) label.textContent = state === 'soon' ? 'Coming soon' : 'Download APK';
      }
    });
  }

  /* First bullets above the first line that is exactly "---", as plain text */
  function summarize(body) {
    if (typeof body !== 'string') return '';
    var lines = body.replace(/\r/g, '').split('\n'), out = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (line === '---') break;
      var clean = line.replace(/^#{1,6}\s*/, '').replace(/^[-*•]\s+/, '').replace(/^\d+[.)]\s+/, '')
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_`>]/g, '').trim();
      if (clean) out.push(clean);
      if (out.length === 2) break;
    }
    var text = out.join(' · ');
    if (text.length > 170) text = text.slice(0, 170).replace(/\s+\S*$/, '') + '…';
    return text;
  }
  function sha(body) {
    var m = typeof body === 'string' && body.match(/SHA-?256[^0-9a-f]*([0-9a-f]{64})/i);
    return m ? m[1].toLowerCase() : '';
  }
  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso); if (isNaN(d)) return '';
    return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function showInfo(info) {
    setSpec('version', info && info.version);
    setSpec('size', info && info.size);
    setSpec('date', info && info.date);
    setSpec('notes', info && info.notes);
    setSpec('sha', info && info.sha);
  }
  function render(state, info) {
    if (state === 'none') { setButtons('soon'); showInfo(null); return; }
    setButtons('open');
    showInfo(state === 'found' ? info : null);
    if (state === 'found') history();
  }

  function readCache() {
    try {
      var c = JSON.parse(sessionStorage.getItem(cacheKey) || 'null');
      if (c && c.info && Date.now() - c.t < 600000) return c.info;
    } catch (e) {}
    return null;
  }
  function writeCache(info) { try { sessionStorage.setItem(cacheKey, JSON.stringify({ t: Date.now(), info: info })); } catch (e) {} }

  function get(url) {
    var ctl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 8000);
    return fetch(url, { headers: { Accept: 'application/vnd.github+json' }, signal: ctl ? ctl.signal : undefined })
      .then(function (res) { clearTimeout(timer); return res; }, function (err) { clearTimeout(timer); throw err; });
  }

  function readRelease() {
    var cached = readCache();
    if (cached) { render('found', cached); return; }
    setButtons('checking');
    get(api + '/releases/latest').then(function (res) {
      if (res.status === 404) return { state: 'none' };
      if (!res.ok) throw new Error('status ' + res.status);
      return res.json().then(function (rel) {
        if (!rel || rel.draft || rel.prerelease) return { state: 'none' };
        var asset = (rel.assets || []).filter(function (x) { return x && x.name === CONFIG.apkName; })[0];
        if (!asset) return { state: 'none' };
        return { state: 'found', info: {
          version: String(rel.tag_name || '').replace(/^v/i, ''),
          size: asset.size > 0 ? Math.round(asset.size / 1e6) + ' MB' : '',
          date: fmtDate(rel.published_at),
          notes: summarize(rel.body),
          sha: sha(rel.body)
        } };
      });
    }).then(function (r) {
      if (r.state === 'found') writeCache(r.info);
      render(r.state, r.info);
    }).catch(function () { render('error'); });
  }

  /* Release history: published releases only; hidden on any error */
  function history() {
    var box = document.getElementById('history'), ul = box && box.querySelector('ul');
    if (!ul || box.dataset.done) return;
    box.dataset.done = '1';
    get(api + '/releases?per_page=6').then(function (res) {
      if (!res.ok) throw new Error();
      return res.json();
    }).then(function (rels) {
      var pub = (rels || []).filter(function (r) { return r && !r.draft && !r.prerelease; }).slice(1, 6);
      if (!pub.length) return;
      pub.forEach(function (r) {
        var li = document.createElement('li'), a = document.createElement('a'), t = document.createElement('time');
        a.href = r.html_url; a.textContent = 'Version ' + String(r.tag_name || '').replace(/^v/i, '');
        t.textContent = fmtDate(r.published_at); t.dateTime = r.published_at || '';
        li.appendChild(a); li.appendChild(t); ul.appendChild(li);
      });
      box.hidden = false;
    }).catch(function () {});
  }

  /* Copy SHA-256 */
  var copy = document.getElementById('copy-sha');
  if (copy) copy.addEventListener('click', function () {
    var v = (document.querySelector('[data-k="sha"]') || {}).textContent || '';
    var done = function () { copy.textContent = 'Copied'; copy.classList.add('pop'); setTimeout(function () { copy.textContent = 'Copy'; copy.classList.remove('pop'); }, 1600); };
    try { navigator.clipboard.writeText(v).then(done, function () {}); } catch (e) {}
  });

  readRelease();
})();
