// 文章管理逻辑
(function () {
  'use strict';
  var editSlug = null; // null=新建，否则=编辑

  function showMsg(text, type) {
    var el = document.getElementById('article-msg');
    el.textContent = text;
    el.className = 'mb-4 rounded-lg px-4 py-3 text-sm ' + (
      type === 'success'
        ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
        : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
    );
    el.classList.remove('hidden');
  }

  function hideMsg() {
    document.getElementById('article-msg').classList.add('hidden');
  }

  function loadArticles() {
    hideMsg();
    fetch(AdminAPI.apiBase + '/api/articles')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        document.getElementById('articles-loading').classList.add('hidden');
        var articles = data.data || [];
        if (articles.length === 0) {
          document.getElementById('articles-empty').classList.remove('hidden');
          return;
        }
        document.getElementById('articles-table').classList.remove('hidden');
        var tbody = document.getElementById('articles-tbody');
        tbody.innerHTML = articles.map(function (a) {
          var tagsHtml = (a.tags || '').split(',').filter(Boolean).map(function (t) {
            return '<span class="inline-block bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 px-1.5 py-0.5 rounded text-xs mr-1">' + t.trim() + '</span>';
          }).join('');
          var date = new Date(a.created_at).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
          return '<tr class="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">' +
            '<td class="px-4 py-3"><span class="font-medium text-neutral-800 dark:text-neutral-200">' + esc(a.title) + '</span><br><span class="text-xs text-neutral-400">/' + esc(a.slug) + '</span></td>' +
            '<td class="px-4 py-3 hidden sm:table-cell">' + tagsHtml + '</td>' +
            '<td class="px-4 py-3 text-neutral-400 hidden md:table-cell">' + date + '</td>' +
            '<td class="px-4 py-3 text-right space-x-3">' +
            '<button onclick="window._editArticle(\'' + esc(a.slug) + '\')" class="text-primary-600 hover:text-primary-800 text-sm">编辑</button>' +
            '<button onclick="window._deleteArticle(\'' + esc(a.slug) + '\')" class="text-red-500 hover:text-red-700 text-sm">删除</button>' +
            '</td></tr>';
        }).join('');
      })
      .catch(function () {
        document.getElementById('articles-loading').innerHTML = '<span class="text-neutral-400">加载失败</span>';
      });
  }

  function loadTags() {
    AdminAPI.authGet('/api/admin/tags').then(function (r) {
      var tags = r.data || [];
      var bar = document.getElementById('tags-bar');
      bar.innerHTML = '<span class="text-sm text-neutral-500 self-center">标签：</span>' +
        tags.map(function (t) {
          return '<span class="bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded text-xs">' + t + '</span>';
        }).join('');
    }).catch(function () {});
  }

  function openEditor(slug) {
    editSlug = slug;
    document.getElementById('editor-title').textContent = slug ? '编辑文章' : '新建文章（Markdown）';
    document.getElementById('article-editor').classList.remove('hidden');
    document.getElementById('btn-save-article').textContent = slug ? '更新文章' : '发布文章';

    if (slug) {
      fetch(AdminAPI.apiBase + '/api/articles/' + slug)
        .then(function (r) { return r.json(); })
        .then(function (r) {
          var a = r.data;
          document.getElementById('art-title').value = a.title || '';
          document.getElementById('art-slug').value = a.slug || '';
          document.getElementById('art-summary').value = a.summary || '';
          document.getElementById('art-tags').value = a.tags || '';
          document.getElementById('art-content').value = a.content || '';
        });
    } else {
      document.getElementById('art-title').value = '';
      document.getElementById('art-slug').value = '';
      document.getElementById('art-summary').value = '';
      document.getElementById('art-tags').value = '';
      document.getElementById('art-content').value = '';
    }
  }

  function closeEditor() {
    document.getElementById('article-editor').classList.add('hidden');
    editSlug = null;
  }

  // 标题自动生成 slug
  document.getElementById('art-title').addEventListener('input', function () {
    if (editSlug) return; // 编辑时不自动改 slug
    var slug = this.value
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fff]+/g, '-')
      .replace(/^-|-$/g, '');
    document.getElementById('art-slug').value = slug;
  });

  // 保存
  document.getElementById('btn-save-article').addEventListener('click', function () {
    var data = {
      title: document.getElementById('art-title').value.trim(),
      slug: document.getElementById('art-slug').value.trim(),
      summary: document.getElementById('art-summary').value.trim(),
      tags: document.getElementById('art-tags').value.trim(),
      content: document.getElementById('art-content').value,
    };
    if (!data.title || !data.slug || !data.content) {
      showMsg('标题、Slug、内容不能为空', 'error');
      return;
    }
    var btn = this;
    btn.disabled = true;
    btn.textContent = '保存中...';

    var promise = editSlug
      ? AdminAPI.authPut('/api/admin/articles/' + editSlug, data)
      : AdminAPI.authPost('/api/admin/articles', data);

    promise.then(function (r) {
      if (r.code !== 0) throw new Error(r.msg);
      showMsg(editSlug ? '更新成功' : '创建成功', 'success');
      closeEditor();
      loadArticles();
      loadTags();
    }).catch(function (e) {
      showMsg(e.message, 'error');
    }).finally(function () {
      btn.disabled = false;
      btn.textContent = editSlug ? '更新文章' : '发布文章';
    });
  });

  document.getElementById('btn-cancel-editor').addEventListener('click', closeEditor);
  document.getElementById('btn-new-article').addEventListener('click', function () { openEditor(null); });

  window._editArticle = function (slug) { openEditor(slug); };
  window._deleteArticle = function (slug) {
    if (!confirm('确定删除这篇文章？相关评论也会被删除。')) return;
    AdminAPI.authDel('/api/admin/articles/' + slug).then(function (r) {
      if (r.code !== 0) throw new Error(r.msg);
      loadArticles();
      loadTags();
      showMsg('删除成功', 'success');
    }).catch(function (e) { showMsg(e.message, 'error'); });
  };

  function esc(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // 初始化
  loadArticles();
  loadTags();

  // URL 参数 ?action=new
  if (window.location.search.indexOf('action=new') !== -1) {
    openEditor(null);
  }
})();
