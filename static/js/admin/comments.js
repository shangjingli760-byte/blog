// 评论管理逻辑
(function () {
  'use strict';

  function showMsg(text) {
    var el = document.getElementById('comment-msg');
    el.textContent = text;
    el.className = 'mb-4 rounded-lg px-4 py-3 text-sm ' + (
      text.includes('成功')
        ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
        : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
    );
    el.classList.remove('hidden');
  }

  function loadComments() {
    AdminAPI.authGet('/api/admin/comments').then(function (r) {
      document.getElementById('comments-loading').classList.add('hidden');
      var comments = r.data || [];
      if (comments.length === 0) {
        document.getElementById('comments-empty').classList.remove('hidden');
        return;
      }
      document.getElementById('comments-table').classList.remove('hidden');
      document.getElementById('comments-tbody').innerHTML = comments.map(function (c) {
        var date = new Date(c.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
        return '<tr class="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">' +
          '<td class="px-4 py-3 font-medium text-neutral-800 dark:text-neutral-200">' + esc(c.nickname) + '</td>' +
          '<td class="px-4 py-3 text-neutral-500 text-xs">' + esc(c.email) + '</td>' +
          '<td class="px-4 py-3"><p class="text-neutral-600 dark:text-neutral-400 max-w-xs truncate">' + esc(c.content) + '</p><span class="text-xs text-neutral-400">文章 #' + c.article_id + '</span></td>' +
          '<td class="px-4 py-3 text-neutral-400 hidden md:table-cell">' + date + '</td>' +
          '<td class="px-4 py-3 text-right"><button onclick="window._deleteComment(' + c.id + ')" class="text-red-500 hover:text-red-700 text-sm">删除</button></td>' +
          '</tr>';
      }).join('');
    }).catch(function () {
      document.getElementById('comments-loading').innerHTML = '<span class="text-neutral-400">加载失败</span>';
    });
  }

  window._deleteComment = function (id) {
    if (!confirm('确定删除这条评论？')) return;
    AdminAPI.authDel('/api/admin/comments/' + id).then(function (r) {
      if (r.code !== 0) throw new Error(r.msg);
      showMsg('删除成功');
      // 重新加载
      document.getElementById('comments-loading').classList.remove('hidden');
      document.getElementById('comments-table').classList.add('hidden');
      document.getElementById('comments-empty').classList.add('hidden');
      loadComments();
    }).catch(function (e) { showMsg(e.message); });
  };

  function esc(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  loadComments();
})();
