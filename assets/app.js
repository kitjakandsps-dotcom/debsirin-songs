/* สมุดเพลงเชียร์ เทพศิรินทร์พุแค (หน้าเว็บนักเรียน) */
(function () {
  'use strict';

  var DATA_URL = 'data/songs.json';
  var BASE_TITLE = 'สมุดเพลงเชียร์ เทพศิรินทร์พุแค';
  var KEY = { data: 'songbook:data', fav: 'songbook:fav', fs: 'songbook:fs', show: 'songbook:showmode' };
  var FS = [16, 18, 20, 23, 26, 30];
  var TAB_COLORS = ['#F2C230', '#4FA36B', '#6F88D6', '#E07BA6', '#E8904A'];
  var CHORUS = /สร้อย|ฮุก|รับ|hook|chorus/i;

  var $ = function (s, el) { return (el || document).querySelector(s); };
  var root = document.documentElement;

  var I = {
    search: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.6-3.6"/></svg>',
    note: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>',
    clip: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M10 9l5 3-5 3z" fill="currentColor"/></svg>',
    star: '<svg width="22" height="22" viewBox="0 0 24 24"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"/></svg>',
    back: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
    next: '<svg width="20" height="20" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
    prev: '<svg width="20" height="20" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
    share: '<svg width="21" height="21" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13v6a1 1 0 001 1h14a1 1 0 001-1v-6"/><path d="M12 3v12"/><path d="M7.5 7.5L12 3l4.5 4.5"/></svg>',
    play: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.6v14.8L19.6 12z"/></svg>',
    pause: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4.5" width="4" height="15" rx="1"/><rect x="14" y="4.5" width="4" height="15" rx="1"/></svg>',
    close: '<svg width="20" height="20" viewBox="0 0 24 24" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    qr: '<svg width="21" height="21" viewBox="0 0 24 24" stroke-linejoin="round"><rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1"/><rect x="14" y="3.5" width="6.5" height="6.5" rx="1"/><rect x="3.5" y="14" width="6.5" height="6.5" rx="1"/><path d="M14 14h2.5v2.5H14zM18 18h2.5v2.5H18zM14 19h2M19 14v2" stroke-linecap="round"/></svg>',
    screen: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    full: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    shrink: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>'
  };

  var S = {
    data: null, list: [], byId: {}, cats: [],
    tab: 'all', q: '', fav: [], fs: 2,
    view: null, homeScroll: 0, offline: false, playing: null
  };

  // ===================== เครื่องมือ =====================

  function ls(k, v) {
    try {
      if (v === undefined) return localStorage.getItem(k);
      if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v);
    } catch (e) { /* ใช้งาน storage ไม่ได้ ข้ามไป */ }
    return null;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // ตัดวรรณยุกต์ ไม้ไต่คู้ การันต์ และช่องว่าง เพื่อให้ค้นหาเจอแม้พิมพ์ไม่ครบ
  function norm(s) { return String(s || '').toLowerCase().replace(/[็-๎​\s]/g, ''); }
  function thaiDigits(s) { return String(s).replace(/[๐-๙]/g, function (d) { return '๐๑๒๓๔๕๖๗๘๙'.indexOf(d); }); }
  function fmtTime(t) {
    if (!isFinite(t) || t < 0) t = 0;
    var m = Math.floor(t / 60), s = Math.floor(t % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }
  var toastTimer;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg; t.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('on'); }, 2800);
  }

  // ===================== ค่าที่จำไว้ในเครื่อง =====================

  try { S.fav = JSON.parse(ls(KEY.fav) || '[]'); } catch (e) { S.fav = []; }
  if (!Array.isArray(S.fav)) S.fav = [];
  var savedFs = parseInt(ls(KEY.fs), 10);
  if (!isNaN(savedFs) && savedFs >= 0 && savedFs < FS.length) S.fs = savedFs;
  applyFs();

  function applyFs() { root.style.setProperty('--fs', FS[S.fs] + 'px'); }
  function isFav(id) { return S.fav.indexOf(id) !== -1; }
  function toggleFav(id) {
    if (isFav(id)) S.fav = S.fav.filter(function (x) { return x !== id; });
    else S.fav.push(id);
    ls(KEY.fav, JSON.stringify(S.fav));
    var on = isFav(id);
    document.querySelectorAll('[data-fav="' + CSS.escape(id) + '"]').forEach(function (b) {
      b.setAttribute('aria-pressed', on);
      b.setAttribute('aria-label', on ? 'เอาออกจากเพลงโปรด' : 'เก็บเป็นเพลงโปรด');
    });
    toast(on ? 'เก็บเป็นเพลงโปรดแล้ว' : 'เอาออกจากเพลงโปรดแล้ว');
    if (S.view === 'home') renderTabs();
    if (S.view === 'home' && S.tab === 'fav' && !S.q) renderToc();
  }

  // ===================== ข้อมูลเพลง =====================

  function prepare(data) {
    var cats = (data.categories || []).slice();
    var pos = {};
    cats.forEach(function (c, i) { pos[c.id] = i; c.color = TAB_COLORS[i % TAB_COLORS.length]; });
    var list = (data.songs || []).filter(function (s) { return s.category in pos; })
      .sort(function (a, b) {
        return pos[a.category] - pos[b.category] || (a.order - b.order) || a.title.localeCompare(b.title, 'th');
      });
    var byId = {};
    list.forEach(function (s, i) {
      s.no = i + 1;
      s.cat = cats[pos[s.category]];
      s.lines = [];
      (s.stanzas || []).forEach(function (st) { (st.lines || []).forEach(function (l) { s.lines.push(l); }); });
      s._t = norm(s.title);
      s._l = s.lines.map(norm);
      byId[s.id] = s;
    });
    S.data = data; S.cats = cats; S.list = list; S.byId = byId;
    S.fav = S.fav.filter(function (id) { return byId[id]; });
  }

  function load() {
    var had = false;
    var cached = ls(KEY.data);
    if (cached) {
      try { prepare(JSON.parse(cached)); had = true; route(); } catch (e) { had = false; }
    }
    fetch(DATA_URL, { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then(function (txt) {
        var d = JSON.parse(txt);
        S.offline = false;
        if (had && S.data && S.data.version === d.version) { renderMeta(); return; }
        ls(KEY.data, txt);
        prepare(d);
        route(true);
      })
      .catch(function () {
        S.offline = true;
        if (had) { renderMeta(); return; }
        $('#toc').innerHTML = '<div class="empty"><h2>เปิดสมุดเพลงไม่ได้</h2>' +
          '<p>โหลดรายชื่อเพลงไม่สำเร็จ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่</p><br>' +
          '<button class="btn btn-fill" type="button" id="retry">ลองใหม่</button></div>';
        $('#retry').onclick = function () { $('#toc').innerHTML = '<p class="loading">กำลังเปิดสมุดเพลง...</p>'; load(); };
      });
  }

  // ===================== เส้นทาง (#/...) =====================

  function parseHash() {
    var h = location.hash.replace(/^#\/?/, '');
    var m = h.match(/^show\/([^/?#]+)(?:\/(\d+))?/);
    if (m) return { view: 'show', id: decodeURIComponent(m[1]), slide: m[2] ? parseInt(m[2], 10) : 0 };
    m = h.match(/^qr(?:\/([^/?#]+))?\/?$/);
    if (m) return { view: 'qr', id: m[1] ? decodeURIComponent(m[1]) : null };
    m = h.match(/^song\/([^/?#]+)/);
    if (m) return { view: 'song', id: decodeURIComponent(m[1]) };
    m = h.match(/^c\/([^/?#]+)/);
    if (m) return { view: 'home', tab: decodeURIComponent(m[1]) };
    return { view: 'home', tab: 'all' };
  }

  function route(refresh) {
    if (!S.data) return;
    var r = parseHash();
    // ข้อมูลใหม่มาระหว่างอ่านเพลง/ฉาย/พิมพ์ ไม่รีเฟรชหน้าที่เปิดอยู่
    if (refresh && S.view === r.view && r.view !== 'home') return;
    var from = S.view;
    if (from === 'home' && r.view !== 'home') S.homeScroll = window.scrollY;
    if (from === 'show' && r.view !== 'show') leaveShow();

    if (r.view === 'show') {
      S.view = 'show';
      renderShow(r.id, r.slide);
    } else if (r.view === 'qr') {
      S.view = 'qr';
      renderQrPage(r.id);
      window.scrollTo(0, 0);
    } else if (r.view === 'song') {
      S.view = 'song';
      renderSong(r.id);
      if (!refresh) window.scrollTo(0, 0);
    } else {
      var tab = r.tab;
      if (tab !== 'all' && tab !== 'fav' && !S.cats.some(function (c) { return c.id === tab; })) tab = 'all';
      var tabChanged = S.tab !== tab;
      S.tab = tab;
      S.view = 'home';
      renderHome();
      if (from === 'song') window.scrollTo(0, S.homeScroll);
      else if (tabChanged && window.scrollY > $('.dividers').offsetTop) window.scrollTo(0, $('.dividers').offsetTop);
    }
  }
  window.addEventListener('hashchange', function () { route(); });

  // ===================== หน้าสารบัญ =====================

  function setScreen(name) {
    ['home', 'song', 'show', 'qr'].forEach(function (n) { $('#' + n).hidden = n !== name; });
  }

  function renderHome() {
    setScreen('home');
    document.title = BASE_TITLE;
    renderMeta();
    renderTabs();
    renderToc();
  }

  function renderMeta() {
    if (!S.data) return;
    var parts = ['<span>รวม ' + S.list.length + ' เพลง</span>'];
    var d = new Date(S.data.generatedAt);
    if (!isNaN(d)) {
      parts.push('<span>อัปเดต ' + esc(d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })) + '</span>');
    }
    if (S.offline) parts.push('<span>ออฟไลน์ ใช้ข้อมูลที่เคยโหลดไว้</span>');
    $('#meta').innerHTML = parts.join('');
  }

  function renderTabs() {
    var html = tabHtml('all', 'ทั้งหมด', '', '#/');
    S.cats.forEach(function (c) {
      var n = S.list.filter(function (s) { return s.category === c.id; }).length;
      html += tabHtml(c.id, c.name, c.color, '#/c/' + encodeURIComponent(c.id), n);
    });
    html += tabHtml('fav', 'เพลงโปรด', '#E0A100', '#/c/fav', S.fav.length || '');
    $('#tabs').innerHTML = html;
    var cur = $('#tabs [aria-current=page]');
    if (cur && cur.scrollIntoView) {
      var box = $('#tabs');
      if (cur.offsetLeft < box.scrollLeft || cur.offsetLeft + cur.offsetWidth > box.scrollLeft + box.clientWidth) {
        box.scrollLeft = cur.offsetLeft - 16;
      }
    }
  }
  function tabHtml(id, name, color, href, n) {
    var cur = !S.q && S.tab === id;
    return '<a class="tab" href="' + href + '"' + (cur ? ' aria-current="page"' : '') +
      (color ? ' style="--tc:' + color + '"' : '') + '>' + esc(name) +
      (n !== undefined && n !== '' ? '<span class="n">' + n + '</span>' : '') + '</a>';
  }

  function favBtn(s) {
    var on = isFav(s.id);
    return '<button class="fav" type="button" data-fav="' + esc(s.id) + '" aria-pressed="' + on + '" aria-label="' +
      (on ? 'เอาออกจากเพลงโปรด' : 'เก็บเป็นเพลงโปรด') + '">' + I.star + '</button>';
  }

  function row(s, titleHtml, snip) {
    return '<li><a href="#/song/' + encodeURIComponent(s.id) + '">' +
      '<span class="no">' + s.no + '</span>' +
      '<span class="tt"><span class="t">' + (titleHtml || esc(s.title)) + '</span>' +
      (snip ? '<span class="snip">' + snip + '</span>' : '') + '</span>' +
      (snip ? '<span style="flex:1"></span>' : '<span class="dots" aria-hidden="true"></span>') +
      '<span class="has">' +
      (s.audio ? I.note + '<span class="sr">มีเสียงเพลง</span>' : '') +
      (s.youtubeId ? I.clip + '<span class="sr">มีคลิป</span>' : '') +
      '</span></a>' + favBtn(s) + '</li>';
  }

  function group(title, desc, songs) {
    return '<section class="group"><h2>' + esc(title) + '</h2>' +
      (desc ? '<p class="desc">' + esc(desc) + '</p>' : '') +
      '<ul class="toc">' + songs.map(function (s) { return row(s); }).join('') + '</ul></section>';
  }

  function empty(title, text) {
    return '<div class="empty"><h2>' + esc(title) + '</h2><p>' + esc(text) + '</p></div>';
  }

  function renderToc() {
    var el = $('#toc');
    if (!S.data) return;
    if (S.q) { el.innerHTML = resultsHtml(S.q); return; }

    if (S.tab === 'fav') {
      var favs = S.list.filter(function (s) { return isFav(s.id); });
      el.innerHTML = favs.length
        ? group('เพลงโปรด', 'เก็บไว้ในเครื่องนี้เท่านั้น', favs)
        : empty('ยังไม่มีเพลงโปรด', 'แตะรูปดาวท้ายชื่อเพลง เพื่อเก็บเพลงที่ร้องบ่อยไว้ในหน้านี้');
      return;
    }
    var cats = S.tab === 'all' ? S.cats : S.cats.filter(function (c) { return c.id === S.tab; });
    var html = cats.map(function (c) {
      var songs = S.list.filter(function (s) { return s.category === c.id; });
      return songs.length ? group(c.name, c.description, songs) : '';
    }).join('');
    el.innerHTML = html || empty('ยังไม่มีเพลงในหมวดนี้', 'ผู้ดูแลกำลังเพิ่มเพลง กลับมาดูใหม่อีกครั้ง');
  }

  // ===================== ค้นหา =====================

  function markText(text, q) {
    var t = String(text), lq = q.toLowerCase(), i = t.toLowerCase().indexOf(lq);
    if (!lq || i === -1) return esc(t);
    return esc(t.slice(0, i)) + '<mark>' + esc(t.slice(i, i + lq.length)) + '</mark>' + esc(t.slice(i + lq.length));
  }

  function search(q) {
    var nq = norm(q), num = parseInt(thaiDigits(q.trim()), 10), out = [];
    if (!nq) return out;
    S.list.forEach(function (s) {
      var line = -1, score;
      if (String(num) === thaiDigits(q.trim()) && s.no === num) score = 0;
      else if (s._t.indexOf(nq) !== -1) score = 1;
      else {
        for (var i = 0; i < s._l.length; i++) { if (s._l[i].indexOf(nq) !== -1) { line = i; break; } }
        if (line === -1) return;
        score = 2;
      }
      out.push({ s: s, score: score, line: line });
    });
    return out.sort(function (a, b) { return a.score - b.score || a.s.no - b.s.no; });
  }

  function resultsHtml(q) {
    var res = search(q);
    if (!res.length) {
      return empty('ไม่พบเพลงที่ตรงกับ "' + q + '"', 'ลองพิมพ์ให้สั้นลง หรือค้นด้วยท่อนอื่นของเพลง');
    }
    return '<p class="note">พบ ' + res.length + ' เพลง จากทุกหมวด</p><section class="group" style="padding-top:6px"><ul class="toc">' +
      res.map(function (r) {
        var snip = r.line >= 0 ? markText(r.s.lines[r.line], q) : '';
        return row(r.s, markText(r.s.title, q), snip);
      }).join('') + '</ul></section>';
  }

  var searchTimer;
  $('#searchIc').innerHTML = I.search;
  $('#q').addEventListener('input', function () {
    var v = this.value.trim();
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () { S.q = v; renderTabs(); renderToc(); }, 120);
  });
  $('#searchForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var res = search($('#q').value.trim());
    if (res.length === 1 || (res.length && res[0].score === 0)) location.hash = '#/song/' + encodeURIComponent(res[0].s.id);
    $('#q').blur();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && S.view === 'home' && document.activeElement !== $('#q')) {
      e.preventDefault(); $('#q').focus();
    }
  });

  // ===================== หน้าเพลง =====================

  function songBar(s) {
    return '<header class="songbar"><div class="wrap">' +
      '<a class="back" href="' + (S.tab !== 'all' ? '#/c/' + encodeURIComponent(S.tab) : '#/') + '">' + I.back + 'สารบัญ</a>' +
      (s ? '<button class="ib fs1" type="button" id="fsDown" aria-label="ตัวอักษรเล็กลง">ก</button>' +
        '<button class="ib fs2" type="button" id="fsUp" aria-label="ตัวอักษรใหญ่ขึ้น">ก</button>' +
        '<button class="ib" type="button" data-fav="' + esc(s.id) + '" aria-pressed="' + isFav(s.id) + '" aria-label="' +
        (isFav(s.id) ? 'เอาออกจากเพลงโปรด' : 'เก็บเป็นเพลงโปรด') + '">' + I.star + '</button>' +
        '<button class="ib" type="button" id="qrBtn" aria-label="คิวอาร์โค้ดของเพลงนี้">' + I.qr + '</button>' +
        '<button class="ib" type="button" id="share" aria-label="แชร์เพลงนี้">' + I.share + '</button>' : '') +
      '</div></header>';
  }

  function renderSong(id) {
    var el = $('#song'), s = S.byId[id];
    setScreen('song');

    if (!s) {
      document.title = BASE_TITLE;
      el.innerHTML = songBar(null) + '<article class="sheet"><div class="sheet-head"><h1>ไม่พบเพลงนี้</h1>' +
        '<p class="credit">เพลงอาจถูกนำออกจากสมุดเพลงแล้ว หรือลิงก์ไม่ครบ</p></div>' +
        '<a class="btn btn-fill" href="#/">กลับไปที่สารบัญ</a></article>';
      return;
    }

    document.title = s.title + ' | ' + BASE_TITLE;
    var idx = S.list.indexOf(s), prev = S.list[idx - 1], next = S.list[idx + 1];
    var credit = [];
    if (s.lyricist && s.lyricist !== '-') credit.push('คำร้อง ' + s.lyricist);
    if (s.composer && s.composer !== '-') credit.push('ทำนอง ' + s.composer);

    var lyrics = (s.stanzas || []).length ? s.stanzas.map(function (st) {
      return '<div class="stanza' + (CHORUS.test(st.label || '') ? ' chorus' : '') + '">' +
        (st.label ? '<div class="lab"><span class="label">' + esc(st.label) + '</span></div>' : '') +
        st.lines.map(function (l) { return '<p><span>' + esc(l) + '</span></p>'; }).join('') + '</div>';
    }).join('') : '<p class="none">ยังไม่มีเนื้อเพลง</p><div style="height:var(--lh)"></div>';

    el.innerHTML = songBar(s) +
      '<article class="sheet">' +
      '<div class="sheet-head">' +
      '<p class="no-line"><span>เพลงที่ ' + s.no + '</span>' + esc(s.cat.name) + '</p>' +
      '<h1>' + esc(s.title) + '</h1>' +
      (credit.length ? '<p class="credit">' + esc(credit.join('   ')) + '</p>' : '') +
      '<div class="media">' +
        (s.audio ? '<button class="btn btn-fill" type="button" id="listen"></button>' : '') +
        (s.youtubeId ? '<button class="btn btn-line" type="button" id="clipBtn" aria-expanded="false" aria-controls="clip">' + I.clip + 'ดูคลิป</button>' : '') +
        '<button class="btn btn-line" type="button" id="showBtn">' + I.screen + 'ฉายขึ้นจอ</button>' +
      '</div>' + (s.youtubeId ? '<div class="clip" id="clip" hidden></div>' : '') +
      '</div>' +
      '<div class="lyrics">' + lyrics + '</div>' +
      '<nav class="pager" aria-label="เพลงก่อนหน้าและถัดไป">' +
      (prev ? '<a class="pv" href="#/song/' + encodeURIComponent(prev.id) + '">' + I.prev + '<span><small>เพลงที่ ' + prev.no + '</small><b>' + esc(prev.title) + '</b></span></a>' : '') +
      (next ? '<a class="nx" href="#/song/' + encodeURIComponent(next.id) + '"><span><small>เพลงที่ ' + next.no + '</small><b>' + esc(next.title) + '</b></span>' + I.next + '</a>' : '') +
      '</nav></article>';

    updateFsButtons();
    $('#fsDown').onclick = function () { setFs(-1); };
    $('#fsUp').onclick = function () { setFs(1); };
    $('#share').onclick = function () { shareSong(s); };
    $('#qrBtn').onclick = function () { openQrDialog(s); };
    $('#showBtn').onclick = function () {
      enterFullscreen();   // ต้องเรียกตอนกดปุ่มโดยตรง เบราว์เซอร์จึงยอมให้เต็มจอ
      location.hash = '#/show/' + encodeURIComponent(s.id);
    };
    if (s.audio) { $('#listen').onclick = function () { playSong(s); }; updateListenBtn(); }
    if (s.youtubeId) $('#clipBtn').onclick = function () { toggleClip(s); };
  }

  function setFs(d) {
    S.fs = Math.max(0, Math.min(FS.length - 1, S.fs + d));
    ls(KEY.fs, String(S.fs));
    applyFs();
    updateFsButtons();
  }
  function updateFsButtons() {
    if ($('#fsDown')) $('#fsDown').disabled = S.fs === 0;
    if ($('#fsUp')) $('#fsUp').disabled = S.fs === FS.length - 1;
  }

  function toggleClip(s) {
    var box = $('#clip'), btn = $('#clipBtn'), open = box.hidden;
    if (open) {
      if (!audio.paused) audio.pause();
      box.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(s.youtubeId) +
        '?autoplay=1&rel=0&playsinline=1" title="คลิป ' + esc(s.title) + '" ' +
        'allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
      box.hidden = false;
    } else {
      box.innerHTML = '';
      box.hidden = true;
    }
    btn.setAttribute('aria-expanded', open);
    btn.innerHTML = I.clip + (open ? 'ปิดคลิป' : 'ดูคลิป');
  }

  function shareSong(s) {
    var url = location.href.split('#')[0] + '#/song/' + encodeURIComponent(s.id);
    if (navigator.share) {
      navigator.share({ title: s.title, text: 'เพลงที่ ' + s.no + ' ' + s.title, url: url }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () { toast('คัดลอกลิงก์เพลงแล้ว'); },
        function () { toast('คัดลอกลิงก์ไม่ได้'); });
    } else {
      toast(url);
    }
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-fav]');
    if (b) { e.preventDefault(); toggleFav(b.getAttribute('data-fav')); }
  });

  // ===================== เครื่องเล่นเพลง =====================

  var audio = new Audio();
  audio.preload = 'none';
  var seeking = false;

  $('#pclose').innerHTML = I.close;

  function playSong(s) {
    if (S.playing && S.playing.id === s.id) {
      if (audio.paused) audio.play().catch(function () {}); else audio.pause();
      return;
    }
    S.playing = s;
    audio.src = s.audio;
    audio.play().catch(function () {});
    var clip = $('#clip');
    if (clip && !clip.hidden) toggleClip(s);
    $('#ptitle').textContent = 'เพลงที่ ' + s.no + '  ' + s.title;
    $('#ptitle').href = '#/song/' + encodeURIComponent(s.id);
    $('#pcur').textContent = '0:00'; $('#pdur').textContent = '0:00'; $('#pseek').value = 0;
    $('#player').hidden = false;
    document.body.classList.add('has-player');
    if ('mediaSession' in navigator && window.MediaMetadata) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: s.title, artist: 'เพลงเชียร์ เทพศิรินทร์พุแค', album: s.cat.name,
        artwork: [{ src: 'assets/icon-512.png', sizes: '512x512', type: 'image/png' }]
      });
      navigator.mediaSession.setActionHandler('play', function () { audio.play(); });
      navigator.mediaSession.setActionHandler('pause', function () { audio.pause(); });
    }
    updatePlayUi();
  }

  function updatePlayUi() {
    var on = !audio.paused && !audio.ended;
    $('#pp').innerHTML = on ? I.pause : I.play;
    $('#pp').setAttribute('aria-label', on ? 'หยุดชั่วคราว' : 'เล่น');
    updateListenBtn();
    updateShowPlay();
  }
  function updateListenBtn() {
    var b = $('#listen');
    if (!b) return;
    var mine = S.playing && S.view === 'song' && S.byId[parseHash().id] === S.playing;
    var on = mine && !audio.paused && !audio.ended;
    b.innerHTML = (on ? I.pause : I.play) + (on ? 'หยุดชั่วคราว' : 'ฟังเพลง');
  }
  function updateShowPlay() {
    var b = $('#shPlay');
    if (!b) return;
    var on = SH.song && S.playing === SH.song && !audio.paused && !audio.ended;
    b.innerHTML = on ? I.pause : I.play;
    b.setAttribute('aria-label', on ? 'หยุดเพลงชั่วคราว' : 'เล่นเพลง');
  }

  audio.addEventListener('play', updatePlayUi);
  audio.addEventListener('pause', updatePlayUi);
  audio.addEventListener('ended', function () { audio.currentTime = 0; updatePlayUi(); });
  audio.addEventListener('loadedmetadata', function () { $('#pdur').textContent = fmtTime(audio.duration); });
  audio.addEventListener('timeupdate', function () {
    if (seeking || !audio.duration) return;
    $('#pcur').textContent = fmtTime(audio.currentTime);
    $('#pseek').value = Math.round(audio.currentTime / audio.duration * 1000);
  });
  audio.addEventListener('error', function () {
    if (!audio.getAttribute('src')) return;
    toast('เปิดไฟล์เสียงไม่ได้ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่');
    updatePlayUi();
  });

  $('#pp').onclick = function () { if (S.playing) playSong(S.playing); };
  $('#pseek').addEventListener('input', function () {
    seeking = true;
    if (audio.duration) $('#pcur').textContent = fmtTime(this.value / 1000 * audio.duration);
  });
  $('#pseek').addEventListener('change', function () {
    if (audio.duration) audio.currentTime = this.value / 1000 * audio.duration;
    seeking = false;
  });
  $('#pclose').onclick = function () {
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    S.playing = null;
    $('#player').hidden = true;
    document.body.classList.remove('has-player');
    updateListenBtn();
  };

  // ===================== QR =====================

  function siteBase() { return location.href.split('#')[0].split('?')[0]; }
  function songUrl(s) { return siteBase() + '#/song/' + encodeURIComponent(s.id); }
  function qrSvg(text, label) {
    if (typeof window.qrcode !== 'function') return '';
    var q = window.qrcode(0, 'M');
    q.addData(text);
    q.make();
    return q.createSvgTag({ cellSize: 4, margin: 2, scalable: true, alt: label || text });
  }

  function openQrDialog(s) {
    var url = songUrl(s);
    $('#qrDlgImg').innerHTML = qrSvg(url, 'คิวอาร์โค้ดเพลง ' + s.title);
    $('#qrDlgNo').textContent = 'เพลงที่ ' + s.no;
    $('#qrDlgTitle').textContent = s.title;
    $('#qrDlgUrl').textContent = url;
    $('#qrPoster').href = '#/qr/' + encodeURIComponent(s.id);
    $('#qrCopy').onclick = function () {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(function () { toast('คัดลอกลิงก์เพลงแล้ว'); },
          function () { toast('คัดลอกลิงก์ไม่ได้'); });
      }
    };
    $('#qrDlg').showModal();
  }
  $('#qrClose').onclick = function () { $('#qrDlg').close(); };
  $('#qrPoster').addEventListener('click', function () { $('#qrDlg').close(); });
  $('#qrDlg').addEventListener('click', function (e) { if (e.target === this) this.close(); });

  /** #/qr = QR ทุกเพลงสำหรับพิมพ์ติดบอร์ด, #/qr/S001 = โปสเตอร์เพลงเดียว */
  function renderQrPage(id) {
    setScreen('qr');
    var el = $('#qr'), s = id ? S.byId[id] : null;
    var back = s ? '#/song/' + encodeURIComponent(s.id) : '#/';
    var tools = '<div class="qr-tools"><div class="wrap">' +
      '<a class="back" href="' + back + '">' + I.back + (s ? 'กลับไปที่เพลง' : 'สารบัญ') + '</a>' +
      '<p>' + (s ? 'โปสเตอร์ขนาด A4 สำหรับติดหน้าห้องหรือบอร์ดกิจกรรม'
                  : 'QR ของทุกเพลงสำหรับพิมพ์ติดบอร์ด เรียงตามเลขเพลง') + '</p>' +
      '<button class="btn btn-fill" type="button" id="printBtn">พิมพ์</button></div></div>';

    if (id && !s) {
      el.innerHTML = tools + '<div class="empty"><h2>ไม่พบเพลงนี้</h2><p>เพลงอาจถูกนำออกจากสมุดเพลงแล้ว</p></div>';
    } else if (s) {
      document.title = 'โปสเตอร์ ' + s.title + ' | ' + BASE_TITLE;
      el.innerHTML = tools + '<section class="poster">' +
        '<div class="poster-head"><img src="assets/logo.png" alt="" width="400" height="400"><div><b>สมุดเพลงเชียร์</b><span>โรงเรียนเทพศิรินทร์พุแค สระบุรี</span></div></div>' +
        '<p class="poster-no"><span>เพลงที่ ' + s.no + '</span>' + esc(s.cat.name) + '</p>' +
        '<h1>' + esc(s.title) + '</h1>' +
        '<div class="poster-qr">' + qrSvg(songUrl(s), 'คิวอาร์โค้ดเพลง ' + s.title) + '</div>' +
        '<p class="poster-call">สแกนเพื่อเปิดเนื้อเพลง' + (s.audio ? ' ฟังเพลง' : '') + (s.youtubeId ? ' ดูคลิป' : '') + '</p>' +
        '<p class="poster-url">' + esc(songUrl(s)) + '</p></section>';
    } else {
      document.title = 'QR ทุกเพลง | ' + BASE_TITLE;
      el.innerHTML = tools + '<section class="qr-sheet">' +
        '<div class="qr-card qr-card-main">' + qrSvg(siteBase(), 'คิวอาร์โค้ดสมุดเพลงเชียร์') +
        '<div><b>สมุดเพลงเชียร์</b><span>สารบัญเพลงทั้งหมด</span></div></div>' +
        S.list.map(function (x) {
          return '<div class="qr-card">' + qrSvg(songUrl(x), 'คิวอาร์โค้ดเพลง ' + x.title) +
            '<div><small>เพลงที่ ' + x.no + '</small><b>' + esc(x.title) + '</b></div></div>';
        }).join('') + '</section>';
    }
    $('#printBtn').onclick = function () { window.print(); };
  }

  // ===================== โหมดฉายขึ้นจอ =====================

  var SH = { song: null, slides: [], i: 0, mode: 'stanza', idleTimer: null, lock: null, fitTimer: null };

  function fsSupported() { return !!(document.fullscreenEnabled || document.webkitFullscreenEnabled); }
  function isFullscreen() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
  function enterFullscreen() {
    var d = document.documentElement;
    try {
      if (d.requestFullscreen) d.requestFullscreen().catch(function () {});
      else if (d.webkitRequestFullscreen) d.webkitRequestFullscreen();
    } catch (e) { /* เบราว์เซอร์ไม่รองรับ */ }
  }
  function exitFullscreen() {
    try {
      if (document.exitFullscreen) document.exitFullscreen().catch(function () {});
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    } catch (e) { /* ข้าม */ }
  }

  function wakeLock() {
    if (!('wakeLock' in navigator) || document.visibilityState !== 'visible') return;
    navigator.wakeLock.request('screen').then(function (l) { SH.lock = l; }).catch(function () {});
  }
  document.addEventListener('visibilitychange', function () {
    if (S.view === 'show' && document.visibilityState === 'visible') wakeLock();
  });

  function buildSlides(s) {
    var slides = [{ type: 'title' }];
    (s.stanzas || []).forEach(function (st, n) { slides.push({ type: 'stanza', st: st, n: n + 1 }); });
    slides.push({ type: 'end' });
    return slides;
  }

  function renderShow(id, slide) {
    var s = S.byId[id];
    if (!s) { location.replace('#/song/' + encodeURIComponent(id)); return; }
    setScreen('show');
    document.body.classList.add('showing');
    if ($('#qrDlg').open) $('#qrDlg').close();

    SH.song = s;
    SH.mode = ls(KEY.show) === 'full' ? 'full' : 'stanza';
    SH.slides = buildSlides(s);
    SH.i = Math.max(0, Math.min(SH.slides.length - 1, slide || 0));
    document.title = 'ฉาย ' + s.title + ' | ' + BASE_TITLE;

    $('#show').innerHTML =
      '<div class="show" id="showRoot">' +
      '<div class="show-top"><span class="show-no">เพลงที่ ' + s.no + '</span><span class="show-title">' + esc(s.title) + '</span></div>' +
      '<div class="show-stage" id="stage"></div>' +
      '<div class="show-progress" aria-hidden="true"><span id="shProg"></span></div>' +
      '<div class="show-bar" id="showBar">' +
        '<button class="sb" type="button" id="shClose">' + I.close + '<span>ปิด</span></button>' +
        '<div class="seg" role="group" aria-label="รูปแบบการฉาย">' +
          '<button type="button" data-m="stanza">ทีละท่อน</button><button type="button" data-m="full">ทั้งเพลง</button></div>' +
        '<div class="sh-nav" id="shNav">' +
          '<button class="sb" type="button" id="shPrev" aria-label="ก่อนหน้า">' + I.prev + '</button>' +
          '<span id="shPos" aria-live="polite"></span>' +
          '<button class="sb" type="button" id="shNext" aria-label="ถัดไป">' + I.next + '</button></div>' +
        '<span class="grow"></span>' +
        '<span class="sh-keys">ลูกศรหรือคลิกเกอร์เปลี่ยนท่อน  B จอดำ  Q คิวอาร์โค้ด</span>' +
        (s.audio ? '<button class="sb" type="button" id="shPlay"></button>' : '') +
        '<button class="sb" type="button" id="shQr" aria-label="แสดงคิวอาร์โค้ด">' + I.qr + '</button>' +
        (fsSupported() ? '<button class="sb" type="button" id="shFs"></button>' : '') +
      '</div>' +
      '<div class="show-black" id="shBlack" hidden></div>' +
      '<div class="show-qr" id="shQrBox" hidden></div>' +
      '</div>';

    $('#shClose').onclick = closeShow;
    $('#shPrev').onclick = function () { step(-1); };
    $('#shNext').onclick = function () { step(1); };
    $('#shQr').onclick = toggleShowQr;
    $('.seg').onclick = function (e) { var b = e.target.closest('button'); if (b) setMode(b.dataset.m); };
    if ($('#shPlay')) { $('#shPlay').onclick = function () { playSong(s); }; updateShowPlay(); }
    if ($('#shFs')) { $('#shFs').onclick = function () { if (isFullscreen()) exitFullscreen(); else enterFullscreen(); }; updateFsBtn(); }
    $('#shBlack').onclick = toggleBlack;
    $('#shQrBox').onclick = toggleShowQr;
    bindStage();

    drawShow();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (S.view === 'show') fitShow(); });
    wakeLock();
    poke();
  }

  function leaveShow() {
    document.body.classList.remove('showing');
    clearTimeout(SH.idleTimer);
    if (SH.lock) { SH.lock.release().catch(function () {}); SH.lock = null; }
    if (isFullscreen()) exitFullscreen();
    $('#show').innerHTML = '';
    SH.song = null;
  }
  function closeShow() {
    location.hash = '#/song/' + encodeURIComponent(SH.song.id);
  }

  function setMode(m) {
    if (m !== 'full' && m !== 'stanza') return;
    SH.mode = m;
    ls(KEY.show, m);
    drawShow();
  }

  function stanzaHtml(st, cls) {
    return '<div class="' + cls + (CHORUS.test(st.label || '') ? ' chorus' : '') + '">' +
      (st.label ? '<span class="sh-label">' + esc(st.label) + '</span>' : '') +
      st.lines.map(function (l) { return '<p>' + esc(l) + '</p>'; }).join('') + '</div>';
  }

  function slideHtml(sl) {
    var s = SH.song;
    if (sl.type === 'title') {
      var credit = [];
      if (s.lyricist && s.lyricist !== '-') credit.push('คำร้อง ' + s.lyricist);
      if (s.composer && s.composer !== '-') credit.push('ทำนอง ' + s.composer);
      return '<div class="fit sl-title"><span class="sh-pill">เพลงที่ ' + s.no + '</span>' +
        '<h1>' + esc(s.title) + '</h1>' + (credit.length ? '<p>' + esc(credit.join('   ')) + '</p>' : '') +
        '<div class="sl-scan">' + qrSvg(songUrl(s), 'คิวอาร์โค้ดเพลงนี้') + '<span>สแกนเปิดเนื้อเพลงบนมือถือ</span></div></div>';
    }
    if (sl.type === 'end') {
      var nx = S.list[S.list.indexOf(s) + 1];
      return '<div class="fit sl-end"><h2>จบเพลง</h2>' +
        (nx ? '<p>เพลงถัดไป<br><b>เพลงที่ ' + nx.no + ' ' + esc(nx.title) + '</b></p><small>กดถัดไปเพื่อฉายเพลงนี้</small>'
            : '<p>เพลงสุดท้ายในสมุดเพลง</p>') + '</div>';
    }
    return stanzaHtml(sl.st, 'fit sl-stanza');
  }

  function drawShow() {
    var root = $('#showRoot'), stage = $('#stage');
    if (!root) return;
    root.dataset.mode = SH.mode;
    document.querySelectorAll('.seg button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.m === SH.mode); });

    if (SH.mode === 'full') {
      var st = SH.song.stanzas || [];
      stage.innerHTML = '<div class="fit sl-full">' +
        (st.length ? st.map(function (x) { return stanzaHtml(x, 'fs-stanza'); }).join('') : '<p>ยังไม่มีเนื้อเพลง</p>') + '</div>';
      $('#shPos').textContent = 'ทั้งเพลง';
      $('#shProg').style.width = '100%';
      root.classList.remove('on-title');
    } else {
      var sl = SH.slides[SH.i], n = SH.slides.length - 2;
      stage.innerHTML = slideHtml(sl);
      $('#shPos').textContent = sl.type === 'title' ? 'ชื่อเพลง' : sl.type === 'end' ? 'จบเพลง' : 'ท่อน ' + sl.n + ' จาก ' + n;
      $('#shProg').style.width = (SH.i / (SH.slides.length - 1) * 100) + '%';
      root.classList.toggle('on-title', sl.type === 'title');
      $('#shPrev').disabled = SH.i === 0;
      $('#shNext').disabled = SH.i === SH.slides.length - 1 && !S.list[S.list.indexOf(SH.song) + 1];
      history.replaceState(null, '', '#/show/' + encodeURIComponent(SH.song.id) + (SH.i ? '/' + SH.i : ''));
    }
    fitShow();
  }

  /** หาขนาดตัวอักษรใหญ่ที่สุดที่ยังไม่ล้นจอ */
  function fitTo(el, ok, min, max) {
    var lo = min, hi = max, best = min;
    for (var k = 0; k < 10; k++) {
      var mid = (lo + hi) / 2;
      el.style.fontSize = mid + 'px';
      if (ok()) { best = mid; lo = mid; } else hi = mid;
    }
    el.style.fontSize = Math.floor(best) + 'px';
    return best;
  }

  function fitShow() {
    var stage = $('#stage');
    if (!stage) return;
    var el = stage.querySelector('.fit');
    if (!el) return;
    var H = stage.clientHeight, W = stage.clientWidth;
    var lines = el.querySelectorAll('p');
    // ทุกบรรทัดของเพลงต้องอยู่ครบในบรรทัดเดียว ไม่ถูกตัดกลางวลี
    var linesFit = function () {
      if (!el.classList.contains('nowrap')) return true;
      for (var i = 0; i < lines.length; i++) { if (lines[i].scrollWidth > lines[i].clientWidth + 1) return false; }
      return true;
    };
    var fitsBox = function () { return el.scrollHeight <= H + 1 && el.scrollWidth <= el.clientWidth + 1 && linesFit(); };
    stage.classList.remove('scroll');
    el.classList.add('nowrap');

    if (SH.mode === 'full') {
      el.style.columnCount = ''; el.style.height = '';
      var one = fitTo(el, fitsBox, 14, 120);
      var two = 0;
      if (W / H > 1.25 && (SH.song.stanzas || []).length > 1) {
        el.style.columnCount = 2; el.style.height = H + 'px';
        two = fitTo(el, function () { return el.scrollWidth <= el.clientWidth + 1 && linesFit(); }, 14, 120);
        if (two <= one * 1.08) { el.style.columnCount = ''; el.style.height = ''; el.style.fontSize = Math.floor(one) + 'px'; two = 0; }
      }
      // ตัวเล็กเกินอ่านจากหลังห้อง ให้ตัดบรรทัดได้ ใช้ขนาดที่อ่านได้ แล้วเลื่อนจอแทน
      if (Math.max(one, two) < 30) {
        el.classList.remove('nowrap');
        el.style.columnCount = ''; el.style.height = '';
        el.style.fontSize = Math.min(44, Math.max(30, W / 22)) + 'px';
        stage.classList.add('scroll');
      }
      return;
    }
    var maxFs = el.classList.contains('sl-stanza') ? Math.min(150, H / 3) : Math.min(160, H / 3.2);
    var got = fitTo(el, fitsBox, 16, maxFs);
    // บรรทัดยาวมากจนตัวเล็กเกินไป ยอมให้ตัดบรรทัดเพื่อให้ตัวใหญ่ขึ้น
    // จอใหญ่ (โปรเจกเตอร์) ต้องอ่านได้จากหลังห้อง จอมือถืออยู่ในมือ ตัวเล็กกว่าได้
    if (got < (W < 700 ? 24 : 44) && el.classList.contains('sl-stanza')) {
      el.classList.remove('nowrap');
      fitTo(el, fitsBox, 16, maxFs);
    }
  }

  window.addEventListener('resize', function () {
    if (S.view !== 'show') return;
    clearTimeout(SH.fitTimer);
    SH.fitTimer = setTimeout(fitShow, 80);
  });

  function step(d) {
    if (SH.mode === 'full') {
      var st = $('#stage');
      if (st.classList.contains('scroll')) st.scrollBy({ top: d * st.clientHeight * 0.8, behavior: 'smooth' });
      return;
    }
    var n = SH.i + d;
    if (n >= SH.slides.length) {
      var nx = S.list[S.list.indexOf(SH.song) + 1];
      if (nx) location.hash = '#/show/' + encodeURIComponent(nx.id);
      return;
    }
    if (n < 0) return;
    SH.i = n;
    drawShow();
    var stage = $('#stage');
    stage.classList.remove('flip'); void stage.offsetWidth; stage.classList.add('flip');
  }
  function goTo(i) { if (SH.mode !== 'full') { SH.i = i; drawShow(); } }

  function toggleBlack() { var b = $('#shBlack'); b.hidden = !b.hidden; }
  function toggleShowQr() {
    var box = $('#shQrBox');
    if (box.hidden) {
      box.innerHTML = '<div class="sq-card">' + qrSvg(songUrl(SH.song), 'คิวอาร์โค้ดเพลงนี้') +
        '<b>เพลงที่ ' + SH.song.no + ' ' + esc(SH.song.title) + '</b><span>สแกนเพื่อเปิดเนื้อเพลงบนมือถือ</span></div>';
    }
    box.hidden = !box.hidden;
  }
  function updateFsBtn() {
    var b = $('#shFs');
    if (!b) return;
    var on = isFullscreen();
    b.innerHTML = on ? I.shrink : I.full;
    b.setAttribute('aria-label', on ? 'ออกจากเต็มจอ' : 'เต็มจอ');
  }
  document.addEventListener('fullscreenchange', updateFsBtn);
  document.addEventListener('webkitfullscreenchange', updateFsBtn);

  // ซ่อนแถบควบคุมและเมาส์เมื่อไม่มีการขยับ
  function poke() {
    var r = $('#showRoot');
    if (!r) return;
    r.classList.remove('idle');
    clearTimeout(SH.idleTimer);
    SH.idleTimer = setTimeout(function () {
      var bar = $('#showBar');
      if (bar && !bar.matches(':hover')) $('#showRoot').classList.add('idle');
    }, 2600);
  }

  function bindStage() {
    var stage = $('#stage'), root = $('#showRoot'), sx = 0, sy = 0, down = false;
    root.addEventListener('pointermove', poke);
    stage.addEventListener('pointerdown', function (e) { down = true; sx = e.clientX; sy = e.clientY; });
    stage.addEventListener('pointerup', function (e) {
      if (!down) return;
      down = false;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      poke();
      if (SH.mode === 'full') return;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) { step(dx < 0 ? 1 : -1); return; }
      if (Math.abs(dx) < 12 && Math.abs(dy) < 12) step(e.clientX < stage.clientWidth * 0.3 ? -1 : 1);
    });
  }

  document.addEventListener('keydown', function (e) {
    if (S.view !== 'show' || e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key, black = !$('#shBlack').hidden, qrOpen = !$('#shQrBox').hidden;
    poke();
    if (k === 'b' || k === 'B' || k === '.' || k === 'ิ') { e.preventDefault(); toggleBlack(); return; }
    if (k === 'Escape') {
      if (qrOpen) toggleShowQr(); else if (black) toggleBlack(); else closeShow();
      return;
    }
    if (black) return;
    if (k === 'q' || k === 'Q' || k === 'ๆ') { toggleShowQr(); return; }
    if (qrOpen) return;
    if (e.target.closest && e.target.closest('.show-bar') && (k === ' ' || k === 'Enter')) return; // กดปุ่มบนแถบ
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].indexOf(k) !== -1) { e.preventDefault(); step(1); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].indexOf(k) !== -1) { e.preventDefault(); step(-1); }
    else if (k === 'Home') { e.preventDefault(); goTo(0); }
    else if (k === 'End') { e.preventDefault(); goTo(SH.slides.length - 1); }
    else if (k === 'f' || k === 'F' || k === 'ด') { if (isFullscreen()) exitFullscreen(); else enterFullscreen(); }
    else if (k === 'm' || k === 'M' || k === 'ท') { setMode(SH.mode === 'full' ? 'stanza' : 'full'); }
  });

  // ===================== เริ่มต้น =====================

  load();

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();
