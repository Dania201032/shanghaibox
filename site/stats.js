/* Счётчик Shanghai Box: визиты, откуда пришли и нажатия на кнопки ботов.
   Без cookies, без идентификаторов: на сервер уходят только страница, канал, телефон/компьютер.
   Канал — метка из ссылки (?s=instagram) или сайт, с которого пришли. Кнопки ботов получают
   метку site_<канал>, чтобы бот знал, откуда клиент. */
(function () {
  var EP = 'https://functions.yandexcloud.net/d4ev1tdo31h9qr9i29pr?src=site';
  var ua = navigator.userAgent || '';
  if (navigator.webdriver || /bot|crawl|spider|slurp|preview|headless|lighthouse/i.test(ua)) return;

  var store = null;
  try { store = window.sessionStorage; store.getItem('x'); } catch (e) { store = null; }
  function get(k) { try { return store ? store.getItem(k) : null; } catch (e) { return null; } }
  function put(k, v) { try { if (store) store.setItem(k, v); } catch (e) {} }

  function slug(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 24); }

  var q = new URLSearchParams(location.search);
  var known = get('sb_ch');
  var ch = slug(q.get('s') || q.get('utm_source'));
  if (!ch) {
    var host = '';
    try { host = document.referrer ? new URL(document.referrer).hostname : ''; } catch (e) {}
    if (!host || host === location.hostname) ch = known || 'direct';
    else if (/instagram\.com$/.test(host)) ch = 'instagram';
    else if (/(^|\.)t\.me$|telegram/.test(host)) ch = 'telegram';
    else if (/(^|\.)max\.ru$/.test(host)) ch = 'max';
    else if (/(^|\.)(vk\.com|vk\.ru)$/.test(host)) ch = 'vk';
    else if (/yandex\.|google\.|bing\.|duckduckgo\.|mail\.ru|ya\.ru/.test(host)) ch = 'search';
    else ch = 'other';
  }
  put('sb_ch', ch);

  function send(data) {
    var body = JSON.stringify(data);
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(EP, new Blob([body], { type: 'text/plain' }))) return;
    } catch (e) {}
    try { fetch(EP, { method: 'POST', body: body, mode: 'no-cors', keepalive: true }); } catch (e) {}
  }

  var page = (location.pathname.split('/').pop() || 'index').replace(/\.html$/, '') || 'index';
  send({ e: 'view', p: page, c: ch, d: /Mobi|Android|iPhone|iPad/i.test(ua) ? 'm' : 'd', v: known ? 0 : 1 });

  var links = document.querySelectorAll('a[href*="t.me/shanghaibox_bot"], a[href*="max.ru/id250816664797_bot"]');
  Array.prototype.forEach.call(links, function (a) {
    a.href = a.href.replace(/([?&]start=)site[\w-]*/, '$1site_' + ch);
    a.addEventListener('click', function () {
      send({ e: 'click', p: page, c: ch, t: /max\.ru/.test(a.href) ? 'max' : 'tg' });
    });
  });
})();
