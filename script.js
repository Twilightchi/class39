/* ========================================
   乐陵一中2024级39班 - 青春纪念册 共享脚本
   功能：导航注入、页脚注入、数据管理、违禁词
   版本：v5 — 异步预取优先 + localStorage落盘 + 云端同步
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

  // 预取缓存：云端数据异步加载到这里
  _prefetchCache: {},
  // 云端数据是否已就绪
  _cloudDataReady: false,
  // 等待云端数据的回调队列
  _pendingCallbacks: [],
  // 本次加载是否使用了默认数据（用于判断是否需要刷新）
  _usedDefaults: {},

  // --- 注册云端数据就绪回调（页面用） ---
  onCloudReady: function (callback) {
    if (this._cloudDataReady) {
      callback();
    } else {
      this._pendingCallbacks.push(callback);
    }
  },

  // --- 通用读取（localStorage 优先 + 预取缓存 + 默认值兜底） ---
  _read: function (key, defaults) {
    var shortKey = key.replace('class39_', '');

    // 1. 先读 localStorage（最快，本地数据最可靠）
    var localData = null;
    try {
      var raw = localStorage.getItem(key);
      if (raw) localData = JSON.parse(raw);
    } catch (e) { /* ignore */ }

    // 2. 检查预取缓存（异步从云端拉取的结果）
    var pf = this._prefetchCache[shortKey];
    if (pf !== undefined && pf !== null) {
      // 云端数据拿到了：和本地数据合并（数组按 id 去重）
      if (Array.isArray(pf) && Array.isArray(localData) && localData.length > 0) {
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
      // 本地无数据或非数组：直接使用云端数据
      try { localStorage.setItem(key, JSON.stringify(pf)); } catch (e) {}
      console.log('[Data] ' + shortKey + ' ← prefetch(' + (Array.isArray(pf) ? pf.length + '条' : typeof pf) + ')');
      return pf;
    }

    // 3. 有本地数据 → 直接返回（已是最全的，云端同步在 _write 中保证）
    if (localData) {
      console.log('[Data] ' + shortKey + ' ← localStorage(' + (Array.isArray(localData) ? localData.length + '条' : typeof localData) + ')');
      // 标记：本地有数据，但如果预取还没完成，云端可能有更新的
      // 等预取完成后会通过 onCloudReady 触发重渲染
      return localData;
    }

    // 4. 回退：cookie（localStorage 不可用时的备选）
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

    // 5. 最后回退：默认数据
    // 标记为使用了默认数据，等云端数据到达后需要刷新
    this._usedDefaults[shortKey] = true;
    console.log('[Data] ' + shortKey + ' ← defaults(' + (Array.isArray(defaults) ? defaults.length + '条' : typeof defaults) + ')');
    return JSON.parse(JSON.stringify(defaults));
  },

  // --- 通用写入（localStorage 立即落盘 + 云端双通道同步） ---
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

    // 2. 云端同步：同步 XHR（桌面端可靠）+ 异步 fetch（移动端兜底）双通道
    var syncOk = false;
    var self = this;
    var authHeader = (needsAuth !== false) ? '39ban2024' : null;

    // 通道A：同步 XHR（桌面浏览器可靠，确保数据立即到达云端）
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('PUT', '/api/data/' + shortKey, false);  // 同步
      xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
      if (authHeader) {
        xhr.setRequestHeader('X-Admin-Password', authHeader);
      }
      xhr.timeout = 8000;
      xhr.send(str);
      syncOk = (xhr.status === 200);
    } catch (e) {
      console.warn('[Sync] PUT ' + shortKey + ' 同步失败: ' + (e.message || ''));
    }

    // 通道B：异步 fetch（移动端/微信浏览器兼容，keepalive 确保页面关闭时也能发出）
    if (typeof fetch !== 'undefined') {
      var headers = { 'Content-Type': 'application/json; charset=utf-8' };
      if (authHeader) headers['X-Admin-Password'] = authHeader;
      fetch('/api/data/' + shortKey, {
        method: 'PUT',
        headers: headers,
        body: str,
        keepalive: true
      }).then(function (r) {
        if (!r.ok) console.warn('[Sync] PUT ' + shortKey + ' async failed: ' + r.status);
      }).catch(function (e) {
        console.warn('[Sync] PUT ' + shortKey + ' async error: ' + (e.message || ''));
      });
    } else {
      // 无 fetch 的旧浏览器：用异步 XHR
      var xhr2 = new XMLHttpRequest();
      xhr2.open('PUT', '/api/data/' + shortKey, true);
      xhr2.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
      if (authHeader) xhr2.setRequestHeader('X-Admin-Password', authHeader);
      xhr2.send(str);
    }

    if (!syncOk) {
      // 同步失败时提示（异步通道已在上面启动）
      console.warn('[Sync] PUT ' + shortKey + ' 同步通道失败，已启动异步通道重试');
    } else {
      console.log('[Sync] PUT ' + shortKey + ' ← 云端已保存');
    }

    return true;
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

  // --- 首页背景 ---
  getHeroBg: function () {
    return this._read('class39_hero_bg', { type: 'gradient', value: 'default' });
  },
  saveHeroBg: function (bg) {
    return this._write('class39_hero_bg', bg);
  },

  // --- 留言（公开写入，无需管理员密码） ---
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
  },

  // --- 云相册（公开读写，跨设备同步） ---
  _defaultCloudAlbum: [],
  getCloudAlbum: function () {
    return this._read('class39_cloud_album', this._defaultCloudAlbum);
  },
  saveCloudAlbum: function (album) {
    return this._write('class39_cloud_album', album, false);  // false = 无需管理员密码
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
    { key: 'messages', href: '/messages',      label: '留言板' },
    { key: 'cloud-album', href: '/cloud-album', label: '云相册' }
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

// ========== 工具函数：补零 ==========
function padZero(n) {
  return n < 10 ? '0' + n : '' + n;
}

// ========== 异步预取云端数据（核心：实现跨设备数据同步） ==========
(function () {
  var keys = ['notices', 'honors', 'hero_bg', 'messages', 'banned_words', 'cloud_album'];
  var pending = keys.length;
  var hasFetch = (typeof fetch !== 'undefined');

  function checkAllDone() {
    pending--;
    if (pending <= 0) {
      // 所有预取完成（无论成功失败），通知等待的页面
      AppData._cloudDataReady = true;

      // 通知通过 onCloudReady 注册的回调
      var cbs = AppData._pendingCallbacks;
      AppData._pendingCallbacks = [];
      for (var i = 0; i < cbs.length; i++) {
        try { cbs[i](); } catch (e) { console.warn(e); }
      }

      // 派发全局事件，供各页面监听
      try {
        document.dispatchEvent(new CustomEvent('class39DataReady'));
      } catch (e) {
        // 旧浏览器兼容
        try {
          var evt = document.createEvent('Event');
          evt.initEvent('class39DataReady', true, false);
          document.dispatchEvent(evt);
        } catch (e2) {}
      }
      console.log('[Data] 云端预取全部完成，已通知页面刷新');
    }
  }

  if (!hasFetch) {
    // 无 fetch 的旧浏览器：直接用同步 XHR 预取（阻塞但可靠）
    keys.forEach(function (k) {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/data/' + k + '?_t=' + Date.now(), false);
        xhr.timeout = 4000;
        xhr.send();
        if (xhr.status === 200) {
          var data = JSON.parse(xhr.responseText);
          if (data !== null) {
            AppData._prefetchCache[k] = data;
            // 同时写入 localStorage，加速下次加载
            try { localStorage.setItem('class39_' + k, xhr.responseText); } catch (e) {}
          } else {
            AppData._prefetchCache[k] = null;
          }
        }
      } catch (e) {
        AppData._prefetchCache[k] = null;
      }
      checkAllDone();
    });
    return;
  }

  // 现代浏览器：异步预取全部 key
  keys.forEach(function (k) {
    fetch('/api/data/' + k + '?_t=' + Date.now())
      .then(function (r) {
        if (!r.ok) throw new Error('status ' + r.status);
        return r.text();
      })
      .then(function (text) {
        try {
          var data = JSON.parse(text);
          if (data !== null) {
            AppData._prefetchCache[k] = data;
            // 写入 localStorage，下次加载直接使用本地数据
            try { localStorage.setItem('class39_' + k, text); } catch (e) {}
            console.log('[Prefetch] ' + k + ' ← 云端(' + (Array.isArray(data) ? data.length + '条' : typeof data) + ')');
          } else {
            AppData._prefetchCache[k] = null;
          }
        } catch (e) {
          AppData._prefetchCache[k] = null;
        }
        checkAllDone();
      })
      .catch(function (e) {
        console.warn('[Prefetch] ' + k + ' 失败: ' + (e.message || ''));
        AppData._prefetchCache[k] = null;
        checkAllDone();
      });
  });
})();
