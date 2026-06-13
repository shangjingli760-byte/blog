// 管理端认证检查（非登录页）
(function () {
  'use strict';
  var token = AdminAPI.getToken();
  var path = window.location.pathname.replace(/\/$/, '');
  if (!token && path !== '/admin/login') {
    window.location.href = '/admin/login/';
    return;
  }
  // 显示退出按钮
  var btn = document.getElementById('btn-logout');
  if (btn) btn.classList.remove('hidden');
})();
