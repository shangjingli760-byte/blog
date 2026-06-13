// 博客评论系统 - 接入 Go 后端 API
(function () {
  'use strict';

  // 从当前页面路径提取文章 slug
  var path = window.location.pathname.replace(/\/$/, '');
  var parts = path.split('/');
  var slug = parts[parts.length - 1] || parts[parts.length - 2];
  // 如果 slug 为空或为 posts/articles，尝试从路径中取
  if (!slug || slug === 'posts' || slug === 'articles') {
    // 可能是列表页，不加载评论
    var commentEl = document.getElementById('blog-comments');
    if (commentEl) commentEl.innerHTML = '';
    return;
  }

  var API_BASE = 'http://localhost:8080';
  var listEl = document.getElementById('comments-list');
  var countEl = document.getElementById('comments-count');
  var loadingEl = document.getElementById('comments-loading');
  var msgEl = document.getElementById('comment-message');

  // 加载评论列表
  function loadComments() {
    fetchMini(API_BASE + '/api/articles/' + encodeURIComponent(slug) + '/comments')
      .then(function (data) {
        loadingEl.style.display = 'none';
        if (!data || data.code !== 0 || !data.data) {
          showEmpty();
          return;
        }
        var comments = data.data;
        countEl.textContent = '(' + comments.length + ')';
        if (comments.length === 0) {
          listEl.innerHTML = '<p class="text-neutral-400 text-sm">暂无留言，来说两句吧。</p>';
          return;
        }
        listEl.innerHTML = comments
          .map(function (c) {
            var date = new Date(c.created_at).toLocaleDateString('zh-CN', {
              year: 'numeric', month: 'long', day: 'numeric'
            });
            return (
              '<div class="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">' +
              '<div class="mb-2 flex items-center justify-between">' +
              '<span class="font-semibold text-neutral-800 dark:text-neutral-200">' +
              escapeHtml(c.nickname) +
              '</span>' +
              '<time class="text-xs text-neutral-400">' + date + '</time>' +
              '</div>' +
              '<p class="whitespace-pre-wrap text-sm text-neutral-600 dark:text-neutral-400">' +
              escapeHtml(c.content) +
              '</p>' +
              '</div>'
            );
          })
          .join('');
      })
      .catch(function () {
        loadingEl.innerHTML = '<span class="text-neutral-400">评论加载失败</span>';
      });
  }

  function showEmpty() {
    listEl.innerHTML = '<p class="text-neutral-400 text-sm">暂无留言，来说两句吧。</p>';
  }

  // 简易 fetch 封装
  function fetchMini(url, opts) {
    opts = opts || {};
    return fetch(url, opts).then(function (r) {
      return r.json();
    });
  }

  // 提交评论
  document.getElementById('comment-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var nickname = document.getElementById('comment-nickname').value.trim();
    var email = document.getElementById('comment-email').value.trim();
    var content = document.getElementById('comment-content').value.trim();
    var btn = document.getElementById('comment-submit');

    if (!nickname || !email || !content) {
      showMsg('请填写所有字段', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showMsg('邮箱格式不正确', 'error');
      return;
    }

    btn.disabled = true;
    btn.textContent = '提交中...';
    showMsg('', '');

    fetchMini(API_BASE + '/api/articles/' + encodeURIComponent(slug) + '/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: nickname, email: email, content: content }),
    })
      .then(function (data) {
        btn.disabled = false;
        btn.textContent = '发布留言';
        if (data.code !== 0) {
          showMsg(data.msg || '提交失败', 'error');
          return;
        }
        // 清空表单
        document.getElementById('comment-nickname').value = '';
        document.getElementById('comment-email').value = '';
        document.getElementById('comment-content').value = '';
        showMsg('留言成功！', 'success');
        loadComments();
      })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = '发布留言';
        showMsg('网络错误，请稍后重试', 'error');
      });
  });

  function showMsg(text, type) {
    if (!msgEl) return;
    msgEl.innerHTML = text
      ? '<p class="text-sm ' +
        (type === 'success'
          ? 'text-green-600 dark:text-green-400'
          : 'text-red-500 dark:text-red-400') +
        '">' +
        text +
        '</p>'
      : '';
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // 初始化加载
  loadComments();
})();
