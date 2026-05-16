/* ========================================
   管理面板脚本
   ======================================== */

var ADMIN_PASSWORD = '39ban2024';

// ========== 登录 ==========
(function () {
  var loginContainer = document.getElementById('loginContainer');
  var adminWrapper = document.getElementById('adminWrapper');
  var loginForm = document.getElementById('loginForm');
  var loginError = document.getElementById('loginError');

  // 检查是否已登录
  if (sessionStorage.getItem('admin_logged_in') === '1') {
    loginContainer.style.display = 'none';
    adminWrapper.style.display = 'block';
    initAdmin();
    return;
  }

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var pwd = document.getElementById('adminPassword').value;
    if (pwd === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_logged_in', '1');
      loginContainer.style.display = 'none';
      adminWrapper.style.display = 'block';
      initAdmin();
    } else {
      loginError.textContent = '密码错误，请重试';
      document.getElementById('adminPassword').value = '';
    }
  });
})();

// ========== 退出登录 ==========
document.getElementById('btnLogout').addEventListener('click', function () {
  sessionStorage.removeItem('admin_logged_in');
  location.reload();
});

// ========== 标签页切换 ==========
function switchTab(tabName) {
  document.querySelectorAll('.admin-tab').forEach(function (t) { t.classList.remove('active'); });
  document.querySelectorAll('.admin-panel').forEach(function (p) { p.classList.remove('active'); });

  var tabEl = document.querySelector('.admin-tab[data-tab="' + tabName + '"]');
  var panelEl = document.getElementById('panel-' + tabName);
  if (tabEl) tabEl.classList.add('active');
  if (panelEl) panelEl.classList.add('active');
}

document.querySelectorAll('.admin-tab').forEach(function (btn) {
  btn.addEventListener('click', function () {
    switchTab(this.getAttribute('data-tab'));
  });
});

// ========== 初始化管理面板 ==========
function initAdmin() {
  // 先检测 localStorage 是否可用
  try {
    var testKey = '__storage_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
  } catch (e) {
    alert('浏览器存储不可用！\n\n原因：' + (e.message || '未知') + '\n\n请检查：\n1. 是否在无痕/隐私模式下（请用普通模式打开）\n2. 浏览器设置是否阻止了网站数据\n3. iOS Safari 无痕模式下 localStorage 完全禁用\n\n请用普通浏览器模式重新打开。');
  }

  initHeroBgPanel();
  initNoticesPanel();
  initHonorsPanel();
  initGalleryPanel();
  initMessagesPanel();
}

// ========== 1. 首页背景管理 ==========
function initHeroBgPanel() {
  var presets = document.querySelectorAll('.bg-preset');
  var fileInput = document.getElementById('bgFileInput');
  var urlInput = document.getElementById('bgUrlInput');
  var btnSaveUrl = document.getElementById('btnSaveUrl');
  var btnReset = document.getElementById('btnResetBg');
  var preview = document.getElementById('bgPreview');
  var currentBg = AppData.getHeroBg();
  var selectedGradient = 'default';

  // 标记当前选中
  if (currentBg.type === 'gradient') {
    selectedGradient = currentBg.value;
  }
  updatePresetSelection();

  // 初始化预览显示当前已保存的背景
  if (currentBg.type === 'image') {
    preview.style.background = 'url("' + currentBg.value + '") center/cover no-repeat';
    preview.style.backgroundImage = '';
  } else if (currentBg.type === 'gradient') {
    var pEl = document.querySelector('.bg-preset[data-gradient="' + selectedGradient + '"]');
    if (pEl) preview.style.background = getComputedStyle(pEl).background;
  }

  presets.forEach(function (p) {
    p.addEventListener('click', function () {
      selectedGradient = this.getAttribute('data-gradient');
      updatePresetSelection();
      preview.style.backgroundImage = '';
      preview.style.background = getComputedStyle(this).background;
    });
  });

  // 上传图片
  fileInput.addEventListener('change', function () {
    var file = this.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      // 压缩图片
      var img = new Image();
      img.onerror = function () { alert('图片加载失败，请检查文件格式'); };
            img.onload = function () {
        var canvas = document.createElement('canvas');
        var maxW = 800;
        var scale = Math.min(1, maxW / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        var base64 = canvas.toDataURL('image/jpeg', 0.6);
        preview.style.background = 'url(' + base64 + ') center/cover no-repeat';
        preview.setAttribute('data-custom-bg', base64);
        selectedGradient = null;
        updatePresetSelection();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  // URL 保存
  btnSaveUrl.addEventListener('click', function () {
    var url = urlInput.value.trim();
    if (!url) return;
    preview.style.background = 'url("' + url + '") center/cover no-repeat';
    preview.setAttribute('data-custom-bg', url);
    selectedGradient = null;
    updatePresetSelection();
  });

  // 保存
  document.getElementById('btnSaveBg').addEventListener('click', function () {
    var customBg = preview.getAttribute('data-custom-bg');
    if (customBg) {
      AppData.saveHeroBg({ type: 'image', value: customBg });
    } else {
      AppData.saveHeroBg({ type: 'gradient', value: selectedGradient || 'default' });
    }
    alert('首页背景已保存！请打开首页查看效果。');
  });

  // 重置
  btnReset.addEventListener('click', function () {
    selectedGradient = 'default';
    preview.style.background = '';
    preview.style.backgroundImage = '';
    preview.removeAttribute('data-custom-bg');
    updatePresetSelection();
    AppData.saveHeroBg({ type: 'gradient', value: 'default' });
    alert('已恢复默认背景！');
  });

  function updatePresetSelection() {
    presets.forEach(function (p) {
      p.classList.toggle('selected', p.getAttribute('data-gradient') === selectedGradient);
    });
  }
}

// ========== 2. 公告管理 ==========
function initNoticesPanel() {
  var list = document.getElementById('noticesList');
  var form = document.getElementById('noticesForm');
  var editingId = null;

  function render() {
    var notices = AppData.getNotices();
    if (notices.length === 0) {
      list.innerHTML = '<p style="text-align:center;color:#999;padding:16px;">暂无公告，请添加</p>';
      return;
    }
    var tagClasses = { '重要': 'tag-important', '通知': 'tag-notice', '作业': 'tag-homework' };
    list.innerHTML = '';
    for (var i = notices.length - 1; i >= 0; i--) {
      var n = notices[i];
      var item = document.createElement('div');
      item.className = 'admin-list-item';
      item.innerHTML =
        '<div class="item-info">' +
          '<div><span class="tag ' + (tagClasses[n.tag] || '') + '">' + escapeHTML(n.tag) + '</span>' +
          '<span class="item-title">' + escapeHTML(n.title) + '</span></div>' +
          '<div class="item-content">' + escapeHTML(n.content) + '</div>' +
          '<div class="item-meta">' + escapeHTML(n.date) + '</div>' +
        '</div>' +
        '<div class="item-actions">' +
          '<button class="btn btn-primary btn-sm btn-edit" data-id="' + n.id + '">编辑</button>' +
          '<button class="btn btn-danger btn-sm btn-del" data-id="' + n.id + '">删除</button>' +
        '</div>';
      list.appendChild(item);
    }

    // 绑定删除
    list.querySelectorAll('.btn-del').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!confirm('确定删除这条公告吗？')) return;
        var id = Number(this.getAttribute('data-id'));
        var notices = AppData.getNotices();
        AppData.saveNotices(notices.filter(function (x) { return x.id !== id; }));
        render();
      });
    });

    // 绑定编辑
    list.querySelectorAll('.btn-edit').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = Number(this.getAttribute('data-id'));
        var notices = AppData.getNotices();
        var found = null;
        for (var j = 0; j < notices.length; j++) {
          if (notices[j].id === id) { found = notices[j]; break; }
        }
        if (!found) return;
        editingId = id;
        document.getElementById('noticeTitle').value = found.title;
        document.getElementById('noticeContent').value = found.content;
        document.getElementById('noticeTag').value = found.tag;
        document.getElementById('noticeDate').value = found.date;
        document.getElementById('noticeSubmit').textContent = '更新公告';
        document.getElementById('noticeCancel').style.display = 'inline-block';
        document.querySelector('#panel-notices .admin-form').scrollIntoView();
      });
    });
  }

  // 取消编辑
  document.getElementById('noticeCancel').addEventListener('click', function () {
    editingId = null;
    form.reset();
    document.getElementById('noticeSubmit').textContent = '添加公告';
    this.style.display = 'none';
  });

  // 提交
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = {
      title: document.getElementById('noticeTitle').value.trim(),
      content: document.getElementById('noticeContent').value.trim(),
      tag: document.getElementById('noticeTag').value,
      date: document.getElementById('noticeDate').value
    };
    if (!data.title) { alert('请填写公告标题'); return; }
    if (!data.content) { alert('请填写公告内容'); return; }
    if (!data.date) { alert('请选择公告日期'); return; }

    var notices = AppData.getNotices();
    if (editingId) {
      for (var j = 0; j < notices.length; j++) {
        if (notices[j].id === editingId) {
          notices[j].title = data.title;
          notices[j].content = data.content;
          notices[j].tag = data.tag;
          notices[j].date = data.date;
          break;
        }
      }
      editingId = null;
      document.getElementById('noticeSubmit').textContent = '添加公告';
      document.getElementById('noticeCancel').style.display = 'none';
    } else {
      notices.push({
        id: Date.now() + Math.random(),
        title: data.title,
        content: data.content,
        tag: data.tag,
        date: data.date
      });
    }
    var result = AppData.saveNotices(notices);
    if (result === true) {
      alert('公告已保存！');
    } else {
      alert('保存失败：' + (result || '未知错误') + '\n\n请尝试：\n1. 清除浏览器缓存\n2. 检查是否开启了无痕模式\n3. 换个浏览器试试');
    }
    form.reset();
    render();
  });

  render();
}

// ========== 3. 荣誉管理 ==========
function initHonorsPanel() {
  var list = document.getElementById('honorsList');
  var form = document.getElementById('honorsForm');
  var editingId = null;

  function render() {
    var honors = AppData.getHonors();
    if (honors.length === 0) {
      list.innerHTML = '<p style="text-align:center;color:#999;padding:16px;">暂无荣誉记录，请添加</p>';
      return;
    }
    list.innerHTML = '';
    for (var i = honors.length - 1; i >= 0; i--) {
      var h = honors[i];
      var item = document.createElement('div');
      item.className = 'admin-list-item';
      item.innerHTML =
        '<div class="item-info">' +
          '<span class="item-title">' + escapeHTML(h.title) + '</span>' +
          '<span class="item-meta"> — ' + escapeHTML(h.year) + '</span>' +
        '</div>' +
        '<div class="item-actions">' +
          '<button class="btn btn-primary btn-sm btn-edit" data-id="' + h.id + '">编辑</button>' +
          '<button class="btn btn-danger btn-sm btn-del" data-id="' + h.id + '">删除</button>' +
        '</div>';
      list.appendChild(item);
    }

    list.querySelectorAll('.btn-del').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!confirm('确定删除这条荣誉吗？')) return;
        var id = Number(this.getAttribute('data-id'));
        var honors = AppData.getHonors();
        AppData.saveHonors(honors.filter(function (x) { return x.id !== id; }));
        render();
      });
    });

    list.querySelectorAll('.btn-edit').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = Number(this.getAttribute('data-id'));
        var honors = AppData.getHonors();
        var found = null;
        for (var j = 0; j < honors.length; j++) {
          if (honors[j].id === id) { found = honors[j]; break; }
        }
        if (!found) return;
        editingId = id;
        document.getElementById('honorTitle').value = found.title;
        document.getElementById('honorYear').value = found.year;
        document.getElementById('honorSubmit').textContent = '更新荣誉';
        document.getElementById('honorCancel').style.display = 'inline-block';
        document.querySelector('#panel-honors .admin-form').scrollIntoView();
      });
    });
  }

  document.getElementById('honorCancel').addEventListener('click', function () {
    editingId = null;
    form.reset();
    document.getElementById('honorSubmit').textContent = '添加荣誉';
    this.style.display = 'none';
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var data = {
      title: document.getElementById('honorTitle').value.trim(),
      year: document.getElementById('honorYear').value.trim()
    };
    if (!data.title) { alert('请填写荣誉名称'); return; }
    if (!data.year) { alert('请填写获得时间'); return; }

    var honors = AppData.getHonors();
    if (editingId) {
      for (var j = 0; j < honors.length; j++) {
        if (honors[j].id === editingId) {
          honors[j].title = data.title;
          honors[j].year = data.year;
          break;
        }
      }
      editingId = null;
      document.getElementById('honorSubmit').textContent = '添加荣誉';
      document.getElementById('honorCancel').style.display = 'none';
    } else {
      honors.push({ id: Date.now() + Math.random(), title: data.title, year: data.year });
    }
    var result = AppData.saveHonors(honors);
    if (result === true) {
      alert('荣誉已保存！');
    } else {
      alert('保存失败：' + (result || '未知错误') + '\n\n请尝试：\n1. 清除浏览器缓存\n2. 检查是否开启了无痕模式\n3. 换个浏览器试试');
    }
    form.reset();
    render();
  });

  render();
}

// ========== 4. 相册管理 ==========
function initGalleryPanel() {
  var grid = document.getElementById('galleryMiniGrid');
  var form = document.getElementById('galleryForm');

  function render() {
    var items = AppData.getGallery();
    if (items.length === 0) {
      grid.innerHTML = '<p style="text-align:center;color:#999;padding:16px;grid-column:1/-1;">暂无照片，请添加</p>';
      return;
    }
    grid.innerHTML = '';
    for (var i = 0; i < items.length; i++) {
      var photo = items[i];
      var item = document.createElement('div');
      item.className = 'gallery-mini-item';

      var inner = '';
      if (photo.img) {
        inner += '<img src="' + escapeHTML(photo.img) + '" alt="' + escapeHTML(photo.title) + '">';
      } else {
        inner += '<div class="mini-placeholder"><span>' + (photo.emoji || '📷') + '</span><span>' + escapeHTML(photo.title) + '</span></div>';
      }
      inner += '<button class="mini-del" data-id="' + photo.id + '" title="删除">&times;</button>';
      inner += '<div style="position:absolute;bottom:0;left:0;right:0;padding:4px 8px;background:rgba(0,0,0,0.5);color:white;font-size:11px;">' + escapeHTML(photo.title) + '</div>';

      item.innerHTML = inner;
      grid.appendChild(item);
    }

    grid.querySelectorAll('.mini-del').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!confirm('确定删除这张照片吗？')) return;
        var id = Number(this.getAttribute('data-id'));
        var items = AppData.getGallery();
        AppData.saveGallery(items.filter(function (x) { return x.id !== id; }));
        render();
      });
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var title = document.getElementById('galleryTitle').value.trim();
    var cat = document.getElementById('galleryCat').value;
    if (!title) { alert('请填写照片标题'); return; }

    var imgData = '';
    var fileInput = document.getElementById('galleryFile');
    var urlInput = document.getElementById('galleryUrl').value.trim();

    function doAdd(finalImg) {
      var items = AppData.getGallery();
      items.push({
        id: Date.now() + Math.random(),
        title: title,
        cat: cat,
        emoji: '',
        img: finalImg
      });
      var result = AppData.saveGallery(items);
      if (result === true) {
        alert('照片已保存！');
      } else {
        alert('保存失败：' + (result || '未知错误') + '\n\n图片请用URL链接，避免上传大文件。');
      }
      form.reset();
      document.getElementById('galleryFile').value = '';
      document.getElementById('galleryUrl').value = '';
      render();
    }

    if (fileInput.files && fileInput.files[0]) {
      if (urlInput && urlInput.value.trim()) {
        alert('检测到同时选择了文件和URL，将优先使用上传的图片文件');
      }
      var reader = new FileReader();
      reader.onload = function (ev) {
        var img = new Image();
        img.onerror = function () { alert("图片加载失败，请检查文件格式"); };
        img.onload = function () {
          var canvas = document.createElement('canvas');
          var maxW = 400;
          var scale = Math.min(1, maxW / img.width);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          var ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          doAdd(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(fileInput.files[0]);
    } else if (urlInput) {
      doAdd(urlInput);
    } else {
      doAdd('');
    }
  });

  render();
}

// ========== 5. 留言管理 + 违禁词 ==========
function initMessagesPanel() {
  var msgList = document.getElementById('adminMsgList');
  var bannedList = document.getElementById('bannedWordsList');
  var bannedForm = document.getElementById('bannedWordForm');

  function renderMessages() {
    var msgs = AppData.getMessages();
    if (msgs.length === 0) {
      msgList.innerHTML = '<p style="text-align:center;color:#999;padding:16px;">暂无留言</p>';
      return;
    }
    var typeLabels = { real: '实名', nick: '网名', anon: '匿名' };
    var typeClasses = { real: 'tag-real', nick: 'tag-nick', anon: 'tag-anon' };

    msgList.innerHTML = '';
    for (var i = msgs.length - 1; i >= 0; i--) {
      var msg = msgs[i];
      var time = new Date(msg.time);
      var timeStr = time.getFullYear() + '-' + padZero(time.getMonth() + 1) + '-' +
        padZero(time.getDate()) + ' ' + padZero(time.getHours()) + ':' + padZero(time.getMinutes());

      var item = document.createElement('div');
      item.className = 'admin-list-item';
      item.innerHTML =
        '<div class="item-info">' +
          '<div class="msg-meta-row">' +
            '<span class="tag ' + typeClasses[msg.type] + '">' + typeLabels[msg.type] + '</span>' +
            '<span class="item-title">' + escapeHTML(msg.name) + '</span>' +
            '<span class="item-meta">' + timeStr + '</span>' +
          '</div>' +
          (msg.title ? '<div style="font-size:13px;color:#666;">' + escapeHTML(msg.title) + '</div>' : '') +
          '<div class="item-content">' + escapeHTML(msg.content) + '</div>' +
        '</div>' +
        '<div class="item-actions">' +
          '<button class="btn btn-danger btn-sm btn-msg-del" data-id="' + msg.id + '">删除</button>' +
        '</div>';
      msgList.appendChild(item);
    }

    msgList.querySelectorAll('.btn-msg-del').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!confirm('确定删除这条留言吗？')) return;
        var id = Number(this.getAttribute('data-id'));
        var msgs = AppData.getMessages();
        AppData.saveMessages(msgs.filter(function (m) { return m.id !== id; }));
        renderMessages();
      });
    });
  }

  function renderBannedWords() {
    var words = AppData.getBannedWords();
    if (words.length === 0) {
      bannedList.innerHTML = '<span style="color:#999;font-size:13px;">暂无违禁词</span>';
      return;
    }
    bannedList.innerHTML = '';
    for (var i = 0; i < words.length; i++) {
      var tag = document.createElement('span');
      tag.className = 'banned-word-tag';
      tag.innerHTML = escapeHTML(words[i]) + '<button data-word="' + escapeHTML(words[i]) + '">&times;</button>';
      bannedList.appendChild(tag);
    }

    bannedList.querySelectorAll('button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var word = this.getAttribute('data-word');
        var words = AppData.getBannedWords();
        AppData.saveBannedWords(words.filter(function (w) { return w !== word; }));
        renderBannedWords();
      });
    });
  }

  bannedForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var input = document.getElementById('bannedWordInput');
    var word = input.value.trim();
    if (!word) return;
    var words = AppData.getBannedWords();
    if (words.indexOf(word) === -1) {
      words.push(word);
      AppData.saveBannedWords(words);
    }
    input.value = '';
    renderBannedWords();
  });

  renderMessages();
  renderBannedWords();
}
