// 管理端 API 封装
var AdminAPI = (function () {
  'use strict';
  var base = window.ADMIN_CONFIG ? window.ADMIN_CONFIG.apiBase : 'http://localhost:8080';

  function getToken() {
    return localStorage.getItem('admin_token');
  }

  function setToken(t) {
    localStorage.setItem('admin_token', t);
  }

  function clearToken() {
    localStorage.removeItem('admin_token');
  }

  function authHeaders() {
    var token = getToken();
    return {
      'Content-Type': 'application/json',
      Authorization: token ? 'Bearer ' + token : '',
    };
  }

  // 带认证的 GET
  function authGet(path) {
    return fetch(base + path, { headers: authHeaders() }).then(function (r) {
      return r.json();
    });
  }

  // 带认证的 POST
  function authPost(path, data) {
    return fetch(base + path, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then(function (r) {
      return r.json();
    });
  }

  // 带认证的 PUT
  function authPut(path, data) {
    return fetch(base + path, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(data),
    }).then(function (r) {
      return r.json();
    });
  }

  // 带认证的 DELETE
  function authDel(path) {
    return fetch(base + path, { method: 'DELETE', headers: authHeaders() }).then(function (r) {
      return r.json();
    });
  }

  // 登录
  function login(username, password) {
    return fetch(base + '/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username, password: password }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.code !== 0) throw new Error(data.msg);
        setToken(data.data.token);
        return data.data.token;
      });
  }

  // 退出
  function logout() {
    clearToken();
    window.location.href = '/admin/login/';
  }

  // 暴露到全局
  window.adminLogout = logout;

  return {
    apiBase: base,
    getToken: getToken,
    setToken: setToken,
    clearToken: clearToken,
    login: login,
    logout: logout,
    authGet: authGet,
    authPost: authPost,
    authPut: authPut,
    authDel: authDel,
  };
})();
