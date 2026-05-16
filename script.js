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
    { id: 1, title: '本周作业清单', content: '数学：配套练习册第三章全部；语文：文言文翻译两篇；英语：阅读理解专项练习4篇。', tag: '作业', date: '2026-05-15' },
    { id: 2, title: '学习小组成立通知', content: '为备战期末考试，班级将组建6个学习互助小组，每组设组长一人。请同学们自由组合，本周五前报到班长处。', tag: '通知', date: '2026-05-14' },
    { id: 3, title: '班级纪律提醒', content: '近期迟到现象有所增加，请全体同学严格遵守作息时间。早自习7:20前到班，下午2:00前到班。', tag: '重要', date: '2026-05-13' },
    { id: 4, title: '卫生值日表更新', content: '新一轮值日表已张贴在教室公告栏，请各值日小组按新表执行，当天值日生需在放学后完成教室清洁。', tag: '通知', date: '2026-05-12' }
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

  // --- 通用读写 ---
  _read: function (key, defaults) {
    try {
      var raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return JSON.parse(JSON.stringify(defaults));
  },

  _write: function (key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('保存数据失败:', key, e);
      return false;
    }
  },

  // --- 公告 ---
  getNotices: function () {
    return this._read('class39_notices', this._defaultNotices);
  },
  saveNotices: function (notices) {
    this._write('class39_notices', notices);
  },

  // --- 荣誉 ---
  getHonors: function () {
    return this._read('class39_honors', this._defaultHonors);
  },
  saveHonors: function (honors) {
    this._write('class39_honors', honors);
  },

  // --- 相册 ---
  getGallery: function () {
    return this._read('class39_gallery', this._defaultGallery);
  },
  saveGallery: function (items) {
    this._write('class39_gallery', items);
  },

  // --- 首页背景 ---
  getHeroBg: function () {
    return this._read('class39_hero_bg', { type: 'gradient', value: 'default' });
  },
  saveHeroBg: function (bg) {
    this._write('class39_hero_bg', bg);
  },

  // --- 留言 ---
  getMessages: function () {
    return this._read('class39_messages', []);
  },
  saveMessages: function (msgs) {
    this._write('class39_messages', msgs);
  },

  // --- 违禁词 ---
  getBannedWords: function () {
    return this._read('class39_banned_words', []);
  },
  saveBannedWords: function (words) {
    this._write('class39_banned_words', words);
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
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ========== 导航栏注入 ==========
function injectNav(currentPage) {
  var el = document.getElementById('sharedNav');
  if (!el) return;

  var pages = [
    { key: 'index',    href: 'index.html',    label: '首页' },
    { key: 'notices',  href: 'notices.html',  label: '公告' },
    { key: 'members',  href: 'members.html',  label: '班级成员' },
    { key: 'honors',   href: 'honors.html',   label: '荣誉墙' },
    { key: 'gallery',  href: 'gallery.html',  label: '班级相册' },
    { key: 'messages', href: 'messages.html', label: '留言板' }
  ];

  var linksHTML = '';
  for (var i = 0; i < pages.length; i++) {
    var cls = (currentPage === pages[i].key) ? ' class="active"' : '';
    linksHTML += '<li><a href="' + pages[i].href + '"' + cls + '>' + pages[i].label + '</a></li>';
  }

  el.innerHTML =
    '<nav class="navbar" id="navbar">' +
      '<div class="nav-container">' +
        '<a href="index.html" class="nav-logo">2024级39班</a>' +
        '<ul class="nav-links">' + linksHTML + '</ul>' +
        '<button class="menu-toggle" id="menuToggle" aria-label="菜单">&#9776;</button>' +
      '</div>' +
    '</nav>';

  // 手机菜单切换
  var toggle = document.getElementById('menuToggle');
  var links = el.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () { links.classList.toggle('show'); });
  }

  // 滚动效果
  var navbar = document.getElementById('navbar');
  window.addEventListener('scroll', function () {
    if (!navbar) return;
    if (window.scrollY > 50) { navbar.classList.add('scrolled'); }
    else { navbar.classList.remove('scrolled'); }
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

  // 预设渐变主题
  var gradients = {
    'default': 'linear-gradient(135deg, #667eea 0%, #4A90D9 30%, #5CB85C 60%, #F5A623 100%)',
    'purple':  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'orange':  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'cyan':    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'green':   'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'pink':    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  };

  if (bg.type === 'gradient') {
    hero.style.background = gradients[bg.value] || gradients['default'];
    hero.style.backgroundSize = (bg.value === 'default') ? '400% 400%' : '100% 100%';
    hero.style.animation = (bg.value === 'default') ? 'gradientShift 12s ease infinite' : 'none';
    hero.style.backgroundImage = '';
  } else if (bg.type === 'image') {
    hero.style.background = 'url(' + bg.value + ') center/cover no-repeat';
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
      innerHTML += '<img src="' + photo.img + '" alt="' + escapeHTML(photo.title) + '" class="gallery-img">';
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
