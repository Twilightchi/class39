/* ========================================
   乐陵一中2024级39班 - 青春纪念册 共享脚本
   功能：导航注入、页脚注入、数据管理、违禁词
   ======================================== */

// ========== 全局数据：班级成员 ==========
var CLASS_DATA = {
  teachers: [
    { name: '李大伟', role: '班主任 / 数学老师', emoji: '👨‍🏫' },
    { name: '原景芳', role: '语文老师', emoji: '👩‍🏫' },
    { name: '夏静',   role: '英语老师', emoji: '👩‍🏫' },
    { name: '刘昕泽', role: '物理老师', emoji: '👨‍🏫' },
    { name: '肖胜杰', role: '化学老师', emoji: '👨‍🏫' },
    { name: '高原',   role: '地理老师', emoji: '👩‍🏫' }
  ],
  students: [
    { name: '朱梓琪', role: '班长' },
    { name: '聊仕豪', role: '' },
    { name: '王文硕', role: '' },
    { name: '鲍佳慧', role: '语文课代表' },
    { name: '刘晨兴', role: '' },
    { name: '许浩宇', role: '物理课代表' },
    { name: '苗紫诺', role: '物理课代表' },
    { name: '李晴晴', role: '数学课代表' },
    { name: '董蕊萍', role: '化学课代表' },
    { name: '刘子豪', role: '' },
    { name: '邱宇卉', role: '' },
    { name: '吕丽莹', role: '' },
    { name: '张梦洋', role: '' },
    { name: '左文博', role: '数学课代表' },
    { name: '李雅慧', role: '英语课代表' },
    { name: '刘爽',   role: '' },
    { name: '邓昌越', role: '' },
    { name: '宋霖锋', role: '' },
    { name: '王世琪', role: '' },
    { name: '燕鹏程', role: '' },
    { name: '田昊儒', role: '化学课代表' },
    { name: '宋晓辉', role: '' },
    { name: '刘少杰', role: '' },
    { name: '姜广浩', role: '' },
    { name: '张明晖', role: '' },
    { name: '郭弋朵', role: '英语课代表' },
    { name: '王皓择', role: '' },
    { name: '李泽瑞', role: '' },
    { name: '穆守震', role: '地理课代表' },
    { name: '王志锋', role: '' },
    { name: '李晓悦', role: '' },
    { name: '赵薇',   role: '' },
    { name: '李雅新', role: '' },
    { name: '李凯乐', role: '语文课代表' },
    { name: '刘玉熙', role: '' },
    { name: '孙小丫', role: '' },
    { name: '李雨彤', role: '地理课代表' },
    { name: '田思彤', role: '' },
    { name: '张一行', role: '' },
    { name: '臧鹏越', role: '' },
    { name: '郑闰曦', role: '' },
    { name: '薛大奥', role: '' },
    { name: '赵雪',   role: '' },
    { name: '苏佳佳', role: '' },
    { name: '王宇豪', role: '班长' },
    { name: '王美亚', role: '' },
    { name: '马佳朕', role: '' },
    { name: '李梦雅', role: '' },
    { name: '王奥杰', role: '' },
    { name: '王晓阳', role: '' },
    { name: '杨兴哲', role: '' },
    { name: '马雪怡', role: '' }
  ]
};

// ========== 数据管理层 ==========
var AppData = {
  // --- 默认数据 ---
  _defaultNotices: [
    { id: 1, title: '本周作业清单', content: '语文：背诵课本4首古诗 数学：周五学案完成 英语：学案改错整理', tag: '作业', date: '2026-05-15' },
    { id: 2, title: '返校通知', content: '5月17号下午3：30之前到班', tag: '通知', date: '2026-05-14' },
    { id: 3, title: '班级纪律提醒', content: '早上6：30之前到班，中午14：05之前到班。晚饭后18：05之前到班', tag: '重要', date: '2026-05-13' },
    { id: 4, title: '卫生值日表更新', content: '期中考试后，擦黑板和倒垃圾的同学打扫卫生区', tag: '通知', date: '2026-05-12' }
  ],

  _defaultHonors: [
    { id: 1, title: '校运动会团体总分第一名', year: '2025年度' },
    { id: 2, title: '年级班级组合第一名', year: '2026年高二下半学期' }
  ],

  _defaultGallery: [
    { id: 1, title: '全班大合影', cat: 'activity', emoji: '📸', img: '' },
    { id: 2, title: '早读时光', cat: 'study', emoji: '📖', img: '' },
    { id: 3, title: '运动会入场式', cat: 'sports', emoji: '🏃', img: '' },
    { id: 4, title: '课堂一景', cat: 'study', emoji: '✍️', img: '' },
    { id: 5, title: '篮球赛瞬间', cat: 'sports', emoji: '🏀', img: '' },
    { id: 6, title: '元旦晚会', cat: 'activity', emoji: '🎉', img: '' },
    { id: 7, title: '自习课上', cat: 'study', emoji: '📝', img: '' },
    { id: 8, title: '课间操比赛', cat: 'sports', emoji: '💃', img: '' },
    { id: 9, title: '春游合影', cat: 'activity', emoji: '🌄', img: '' },
    { id: 10, title: '拔河比赛', cat: 'sports', emoji: '💪', img: '' },
    { id: 11, title: '主题班会', cat: 'activity', emoji: '🎤', img: '' },
    { id: 12, title: '晚自习后', cat: 'study', emoji: '🌙', img: '' }
  ],

  _prefetchCache: {},

  // --- 通用读写（localStorage 优先 + API 云端同步）---
  _read: function (key, defaults) {
    var localData = null;
    var shortKey = key.replace('class39_', '');
    // 0. 先检查预取缓存（异步预取的结果，避免同步 XHR）
    var pf = this._prefetchCache[shortKey];
    if (pf !== undefined && pf !== null) {
      // 云端有数据：与本地合并或直接使用
      if (Array.isArray(pf) && Array.isArray(localData) && localData.length > 0) {
        // merge logic same as below
        var merged2 = {}, item2;
        for (var pi = 0; pi < pf.length; pi++) {
          item2 = pf[pi];
          if (item2 && item2.id != null) merged2[item2.id] = item2;
        }
        for (var pj = 0; pj < localData.length; pj++) {
          item2 = localData[pj];
          if (item2 && item2.id != null) merged2[item2.id] = item2;
        }
        var result2 = [];
        for (var pk in merged2) { if (merged2.hasOwnProperty(pk)) result2.push(merged2[pk]); }
        result2.sort(function (a, b) { return b.id - a.id; });
        var resultStr2 = JSON.stringify(result2);
        try { localStorage.setItem(key, resultStr2); } catch (e) {}
        console.log('[Data] ' + shortKey + ' ← merge(prefetch+' + pf.length + '+local+' + localData.length + ')=' + result2.length);
        return result2;
      }
      try { localStorage.setItem(key, JSON.stringify(pf)); } catch (e) {}
      console.log('[Data] ' + shortKey + ' ← prefetch(' + (Array.isArray(pf) ? pf.length + '条' : typeof pf) + ')');
      return pf;
    }

    // 1. 先读 localStorage（最快，体验优先）
    try {
      var raw = localStorage.getItem(key);
      if (raw) localData = JSON.parse(raw);
    } catch (e) { /* ignore */ }

    // 2. 尝试云端 API（拉取其他设备的更新）
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', '/api/data/' + shortKey + '?_t=' + Date.now(), false);
      xhr.timeout = 5000;
      xhr.send();
      if (xhr.status === 200) {
        var apiData = JSON.parse(xhr.responseText);
        if (apiData !== null) {
          // 如果是数组，与本地数据按 id 合并（防止覆盖其他设备的留言）
          if (Array.isArray(apiData) && Array.isArray(localData) && localData.length > 0) {
            var merged = {}, item;
            for (var ai = 0; ai < apiData.length; ai++) {
              item = apiData[ai];
              if (item && item.id != null) merged[item.id] = item;
            }
            for (var li = 0; li < localData.length; li++) {
              item = localData[li];
              if (item && item.id != null) merged[item.id] = item;
            }
            var result = [];
            for (var mk in merged) { if (merged.hasOwnProperty(mk)) result.push(merged[mk]); }
            result.sort(function (a, b) { return b.id - a.id; });
            var resultStr = JSON.stringify(result);
            try { localStorage.setItem(key, resultStr); } catch (e) {}
            // 把合并结果异步推回云端（保证其他设备能拿到完整数据）
            AppData._syncToCloud(key, resultStr, !(key.indexOf('messages') >= 0));
            console.log('[Data] ' + shortKey + ' ← merge(API+' + apiData.length + '+local+' + localData.length + ')=' + result.length);
            return result;
          }
          // 非数组或本地无数据：云端数据直接覆盖（hero_bg、banned_words 等不可合并类型）
          try { localStorage.setItem(key, xhr.responseText); } catch (e) {}
          console.log('[Data] ' + shortKey + ' ← API(' + (Array.isArray(apiData) ? apiData.length + '条' : typeof apiData) + ')');
          return apiData;
        }
      }
    } catch (e) { console.warn('[Data] ' + shortKey + ' API 失败: ' + (e.message || '')); }

    // 3. 回退：localStorage（已在上面读取）
    if (localData) {
      console.log('[Data] ' + shortKey + ' ← localStorage(' + (Array.isArray(localData) ? localData.length + '条' : typeof localData) + ')');
      return localData;
    }

    // 4. 回退：cookie
    try {
      var cookies = document.cookie.split(/;\s*/);
      for (var i = 0; i < cookies.length; i++) {
        var parts = cookies[i].split('=');
        if (parts[0] === key) {
          console.log('[Data] ' + shortKey + ' ← cookie');
          return JSON.parse(decodeURIComponent(parts.slice(1).join('=')));
        }
      }
    } catch (e) { /* ignore */ }

    console.log('[Data] ' + shortKey + ' ← defaults(' + (Array.isArray(defaults) ? defaults.length + '条' : typeof defaults) + ')');
    return JSON.parse(JSON.stringify(defaults));
  },

  _write: function (key, data, needsAuth) {
    var str = JSON.stringify(data);
    var shortKey = key.replace('class39_', '');

    // 1. 先写 localStorage（主存储，瞬间完成）
    try {
      localStorage.setItem(key, str);
    } catch (e1) {
      try {
        if (str.length > 3500) {
          return '数据过大，请勿上传大图片，用图片URL代替';
        }
        document.cookie = key + '=' + encodeURIComponent(str) + ';path=/;max-age=31536000;SameSite=Lax';
      } catch (e2) {
        return 'Cookie写入失败：' + (e2.message || '未知');
      }
    }

    // 2. 同步写入云端（用同步 XHR 确保数据一定到达 KV）
    var syncOk = false;
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('PUT', '/api/data/' + shortKey, false);  // 同步模式：必须等响应
      xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
      if (needsAuth !== false) {
        xhr.setRequestHeader('X-Admin-Password', '39ban2024');
      }
      xhr.timeout = 8000;
      xhr.send(str);
      syncOk = (xhr.status === 200);
    } catch (e) {
      console.warn('[Sync] PUT ' + shortKey + ' 失败: ' + (e.message || ''));
    }
    if (!syncOk) {
      // 同步失败时，后台再用异步重试一次
      AppData._syncToCloud(key, str, needsAuth !== false);
    }

    return true;
  },

  // 云端同步辅助（异步 fetch，静默执行）
  _syncToCloud: function (key, str, needsAuth) {
    try {
      var apiKey = key.replace('class39_', '');
      var headers = { 'Content-Type': 'application/json; charset=utf-8' };
      if (needsAuth) {
        headers['X-Admin-Password'] = '39ban2024';
      }
      if (typeof fetch !== 'undefined') {
        fetch('/api/data/' + apiKey, {
          method: 'PUT',
          headers: headers,
          body: str,
          keepalive: true
        }).then(function (r) {
          if (!r.ok) console.warn('[Sync] PUT ' + apiKey + ' failed: ' + r.status);
        }).catch(function (e) {
          console.warn('[Sync] PUT ' + apiKey + ' error: ' + (e.message || ''));
        });
      } else {
        var xhr = new XMLHttpRequest();
        xhr.open('PUT', '/api/data/' + apiKey, true);
        xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        if (needsAuth) {
          xhr.setRequestHeader('X-Admin-Password', '39ban2024');
        }
        xhr.send(str);
      }
    } catch (e) { /* 云端不可达，数据已安全存于本地 */ }
  },

  // --- 公告 ---
  getNotices: function () {
    return this._read('class39_notices', this._defaultNotices);
  },
  saveNotices: function (notices) {
    return this._write('class39_notices', notices);
  },

  // --- 荣誉 ---
  getHonors: function () {
    return this._read('class39_honors', this._defaultHonors);
  },
  saveHonors: function (honors) {
    return this._write('class39_honors', honors);
  },

  // --- 相册 ---
  getGallery: function () {
    return this._read('class39_gallery', this._defaultGallery);
  },
  saveGallery: function (items) {
    return this._write('class39_gallery', items);
  },

  // --- 首页背景 ---
  getHeroBg: function () {
    return this._read('class39_hero_bg', { type: 'gradient', value: 'default' });
  },
  saveHeroBg: function (bg) {
    return this._write('class39_hero_bg', bg);
  },

  // --- 留言（公开写入）---
  getMessages: function () {
    return this._read('class39_messages', []);
  },
  saveMessages: function (msgs) {
    return this._write('class39_messages', msgs, false);
  },

  // --- 违禁词 ---
  getBannedWords: function () {
    return this._read('class39_banned_words', []);
  },
  saveBannedWords: function (words) {
    return this._write('class39_banned_words', words);
  }
};

// ========== 违禁词检查 ==========
function checkBannedWords(text) {
  var words = AppData.getBannedWords();
  var lower = text.toLowerCase();
  for (var i = 0; i < words.length; i++) {
    if (words[i] && lower.indexOf(words[i].toLowerCase()) !== -1) {
      return words[i];
    }
  }
  return null;
}

// ========== HTML 转义 ==========
function escapeHTML(str) {
  if (str == null) return '';
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ========== 导航栏注入 ==========
function injectNav(currentPage) {
  var el = document.getElementById('sharedNav');
  if (!el) return;

  var pages = [
    { key: 'index',    href: '/',              label: '首页' },
    { key: 'notices',  href: '/notices',       label: '公告' },
    { key: 'members',  href: '/members',       label: '班级成员' },
    { key: 'honors',   href: '/honors',        label: '荣誉墙' },
    { key: 'gallery',  href: '/gallery',       label: '班级相册' },
    { key: 'messages', href: '/messages',      label: '留言板' }
  ];

  var linksHTML = '';
  for (var i = 0; i < pages.length; i++) {
    var cls = (currentPage === pages[i].key) ? ' class="active"' : '';
    linksHTML += '<li><a href="' + pages[i].href + '"' + cls + '>' + pages[i].label + '</a></li>';
  }

  el.innerHTML =
    '<nav class="navbar" id="navbar">' +
      '<div class="nav-container">' +
        '<a href="/" class="nav-logo">2024级39班</a>' +
        '<ul class="nav-links">' + linksHTML + '</ul>' +
        '<button class="menu-toggle" id="menuToggle" aria-label="菜单">&#9776;</button>' +
      '</div>' +
    '</nav>';

  var toggle = document.getElementById('menuToggle');
  var links = el.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () { links.classList.toggle('show'); });
  }

  var navbar = document.getElementById('navbar');
  var scrollTicking = false;
  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      scrollTicking = true;
      requestAnimationFrame(function () {
        if (!navbar) return;
        if (window.scrollY > 50) { navbar.classList.add('scrolled'); }
        else { navbar.classList.remove('scrolled'); }
        scrollTicking = false;
      });
    }
  });
}

// ========== 页脚注入 ==========
function injectFooter() {
  var el = document.getElementById('sharedFooter');
  if (!el) return;
  el.innerHTML =
    '<footer class="footer">' +
      '<div class="container">' +
        '<p class="footer-text">乐陵一中 2024级39班 · 青春正当时</p>' +
        '<p class="footer-sub">高二，我们一起在路上 &hearts;</p>' +
      '</div>' +
    '</footer>';
}

// ========== 高考倒计时（首页用） ==========
function initCountdown() {
  var el = document.getElementById('countdownDays');
  if (!el) return;
  var examDate = new Date('2027-06-07T09:00:00');
  function update() {
    var diff = examDate - new Date();
    var days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    el.textContent = days;
  }
  update();
  setInterval(update, 1000 * 60 * 60);
}

// ========== 首页动态背景 ==========
function initHeroBg() {
  var hero = document.getElementById('heroSection');
  if (!hero) return;
  var bg = AppData.getHeroBg();

  var gradients = {
    'default': 'linear-gradient(135deg, #667eea 0%, #4A90D9 30%, #5CB85C 60%, #F5A623 100%)',
    'purple':  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'orange':  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'cyan':    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'green':   'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'pink':    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  };

  if (bg.type === 'gradient') {
    hero.classList.remove('has-image');
    hero.style.background = gradients[bg.value] || gradients['default'];
    hero.style.backgroundSize = (bg.value === 'default') ? '400% 400%' : '100% 100%';
    hero.style.animation = (bg.value === 'default') ? 'gradientShift 12s ease infinite' : 'none';
    hero.style.backgroundImage = '';
  } else if (bg.type === 'image') {
    hero.classList.add('has-image');
    hero.style.background = 'url("' + bg.value + '") center/cover no-repeat';
    hero.style.animation = 'none';
  }
}

// ========== 相册渲染（相册页和管理面板共用） ==========
function renderGallery(containerId, items, showDelete) {
  var grid = document.getElementById(containerId);
  if (!grid) return;
  grid.innerHTML = '';

  for (var i = 0; i < items.length; i++) {
    var photo = items[i];
    var item = document.createElement('div');
    item.className = 'gallery-item';
    item.setAttribute('data-cat', photo.cat);

    var innerHTML = '';
    if (photo.img) {
      innerHTML += '<img src="' + escapeHTML(photo.img) + '" alt="' + escapeHTML(photo.title) + '" class="gallery-img">';
    } else {
      innerHTML += '<div class="gallery-placeholder"><span>' + (photo.emoji || '📷') + '</span><span>' + escapeHTML(photo.title) + '</span></div>';
    }
    innerHTML += '<div class="gallery-caption">' + escapeHTML(photo.title) + '</div>';

    if (showDelete) {
      innerHTML += '<button class="gallery-del-btn" data-id="' + photo.id + '" title="删除">&times;</button>';
    }

    item.innerHTML = innerHTML;
    grid.appendChild(item);
  }
}

// ========== 工具函数：补零 ==========
function padZero(n) {
  return n < 10 ? '0' + n : '' + n;
}

// ========== 异步预取云端数据（避免同步 XHR 阻塞）==========
(function () {
  if (typeof fetch === 'undefined') return;
  var keys = ['notices', 'honors', 'gallery', 'hero_bg', 'messages', 'banned_words'];
  var prefix = 'class39_';
  keys.forEach(function (k) {
    fetch('/api/data/' + k)
      .then(function (r) { if (!r.ok) throw new Error('status ' + r.status); return r.text(); })
      .then(function (text) {
        try { AppData._prefetchCache[k] = JSON.parse(text); } catch (e) {}
      })
      .catch(function () { AppData._prefetchCache[k] = null; });
  });
})();
