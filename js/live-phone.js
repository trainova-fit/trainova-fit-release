  /* Trainova Fit: live phone overlay driver.
   Needs live-glyphs.js (window.TF_GLYPHS) and the inline contents of live-overlay.svg.
   Text is drawn as outlined Urbanist paths, so no web font is loaded and nothing can drift. */
(function () {
  var NS = 'http://www.w3.org/2000/svg';

  function draw(slot, text) {
    if (!slot) return;
    var G = window.TF_GLYPHS[slot.getAttribute('data-weight')];
    var size = +slot.getAttribute('data-size'), s = size / 2000;
    var x = +slot.getAttribute('data-x'), y = +slot.getAttribute('data-y');
    var align = slot.getAttribute('data-align');
    text = String(text);
    var width = 0, i, g;
    for (i = 0; i < text.length; i++) width += (G[text[i]] || G[' '])[0] * s;
    if (align === 'center') x -= width / 2; else if (align === 'right') x -= width;
    while (slot.firstChild) slot.removeChild(slot.firstChild);
    for (i = 0; i < text.length; i++) {
      g = G[text[i]] || G[' '];
      if (g[1]) {
        var p = document.createElementNS(NS, 'path');
        p.setAttribute('d', g[1]);
        p.setAttribute('transform', 'translate(' + x.toFixed(2) + ' ' + y.toFixed(2) + ') scale(' + s + ')');
        slot.appendChild(p);
      }
      x += g[0] * s;
    }
    return x;
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* root = the <svg class="live-overlay"> element */
  window.TFLive = function (root) {
    var $ = function (id) { return root.querySelector('#' + id); };
    var toast = $('toast');
    return {
      reps: function (n) { draw($('reps'), n); },
      mistakes: function (n) { draw($('mistakes'), n); },
      timer: function (sec) { draw($('timer'), pad(Math.floor(sec / 60)) + ':' + pad(sec % 60)); },
      flag: function (on) { root.classList.toggle('is-flag', !!on); },
      toast: function (kind, title, msg) {           /* kind: 'good' | 'flag' | null to hide */
        if (!kind) { toast.classList.add('is-hidden'); return; }
        toast.setAttribute('data-kind', kind);
        var end = Math.max(draw($('toast-title'), title), draw($('toast-msg'), msg));
        /* card keeps the app's 354-unit width and grows for longer copy (31-unit right padding) */
        toast.querySelector('rect').setAttribute('width', Math.max(354, end + 31 - 44.5).toFixed(1));
        toast.classList.remove('is-hidden');
      }
    };
  };
})();
