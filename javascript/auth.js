
(function () {
  'use strict';

  /* CONFIG*/
  var KEYS = { users: 'alberto_users', session: 'alberto_session' };
  var DEFAULT_REDIRECT = '../index.html';
  var MIN_PASSWORD = 8;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var PAGE_TITLES = { login: 'Sign In', signup: 'Create Account' };
  var STRENGTH_LABELS = [
    'Use 8+ characters with letters, numbers and symbols.',
    'Weak',
    'Fair',
    'Good',
    'Strong'
  ];

  var $ = function (selector, root) { return (root || document).querySelector(selector); };
  var $$ = function (selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); };

  var els = {
    forms: $('#authForms'),
    signedIn: $('#authSignedIn'),
    userName: $('#authUserName'),
    continueLink: $('#authContinue'),
    signOut: $('#authSignOut'),
    caption: $('#authCaption'),
    tabs: $$('.auth-tab'),
    panes: $$('.auth-pane'),
    meter: $('#signupMeter'),
    meterLabel: $('#signupMeterLabel')
  };


  /* STORAGE  */
  function getStore(kind) {
    try { return kind === 'local' ? window.localStorage : window.sessionStorage; }
    catch (err) { return null; }
  }

  function read(kind, key, fallback) {
    try {
      var raw = getStore(kind).getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) { return fallback; }
  }

  function write(kind, key, value) {
    try {
      getStore(kind).setItem(key, JSON.stringify(value));
      return true;
    } catch (err) { return false; }
  }

  function remove(kind, key) {
    try { getStore(kind).removeItem(key); } catch (err) { /* nothing to remove */ }
  }

  function getUsers() {
    var users = read('local', KEYS.users, []);
    return Array.isArray(users) ? users : [];
  }

  function saveUsers(users) {
    return write('local', KEYS.users, users);
  }


  /* SESSION  ("Keep me signed in" = localStorage,*/
  function getSession() {
    return read('session', KEYS.session, null) || read('local', KEYS.session, null);
  }

  function endSession() {
    remove('session', KEYS.session);
    remove('local', KEYS.session);
  }

  function startSession(user, remember) {
    endSession();
    write(remember ? 'local' : 'session', KEYS.session, {
      id: user.id,
      name: user.name,
      email: user.email
    });
  }


  function getRedirectTarget() {
    var target = new URLSearchParams(window.location.search).get('redirect');
    var safe = target && /^[\w./?=&%-]+$/.test(target) && target.indexOf('//') !== 0;
    return safe ? target : DEFAULT_REDIRECT;
  }

  function redirectSoon() {
    window.setTimeout(function () {
      window.location.assign(getRedirectTarget());
    }, 700);
  }


  /* PASSWORD  */
  function randomHex(bytes) {
    var values = window.crypto.getRandomValues(new Uint8Array(bytes));
    return Array.prototype.map.call(values, function (b) {
      return ('0' + b.toString(16)).slice(-2);
    }).join('');
  }

  function fallbackHash(text) {
    var h1 = 0xdeadbeef;
    var h2 = 0x41c6ce57;
    for (var i = 0; i < text.length; i++) {
      var ch = text.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
  }

  function hashPassword(password, salt) {
    var text = salt + ':' + password;
    if (window.crypto && window.crypto.subtle) {
      return window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buffer) {
        return Array.prototype.map.call(new Uint8Array(buffer), function (b) {
          return ('0' + b.toString(16)).slice(-2);
        }).join('');
      });
    }
    return Promise.resolve(fallbackHash(text));
  }

  
  function scorePassword(password) {
    if (!password) return 0;
    var score = 0;
    if (password.length >= MIN_PASSWORD) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password) || password.length >= 14) score++;
    return Math.max(score, 1);
  }

  function updateStrength(password) {
    var level = scorePassword(password);
    els.meter.setAttribute('data-level', level);
    $$('span', els.meter).forEach(function (segment, index) {
      segment.classList.toggle('is-on', index < level);
    });
    els.meterLabel.textContent = STRENGTH_LABELS[level];
  }


  /* UI HELPERS */
  function setFieldError(input, message) {
    var field = input.closest('.auth-field');
    field.classList.toggle('has-error', Boolean(message));
    $('.auth-error', field).textContent = message || '';
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function showMessage(form, text, type) {
    var box = $('.auth-message', form);
    box.textContent = text || '';
    if (type) box.setAttribute('data-type', type);
    else box.removeAttribute('data-type');
  }

  function resetForm(form) {
    $$('.auth-input', form).forEach(function (input) { setFieldError(input, ''); });
    showMessage(form, '');
  }

  function setBusy(form, busy) {
    var button = $('.auth-submit', form);
    button.disabled = busy;
    if (busy) {
      button.dataset.label = button.textContent;
      button.textContent = 'Please wait…';
    } else if (button.dataset.label) {
      button.textContent = button.dataset.label;
    }
  }

  function normalizeEmail(value) {
    return value.trim().toLowerCase();
  }


  /*  MODE SWITCHING  */
  function getInitialMode() {
    var fromUrl = new URLSearchParams(window.location.search).get('mode') ||
                  window.location.hash.slice(1);
    return fromUrl === 'signup' ? 'signup' : 'login';
  }

  function syncUrl(mode) {
    try {
      var url = new URL(window.location.href);
      url.searchParams.set('mode', mode);
      url.hash = '';
      window.history.replaceState(null, '', url);
    } catch (err) { }
  }

  function setMode(mode, options) {
    var opts = options || {};
    var next = mode === 'signup' ? 'signup' : 'login';

    els.tabs.forEach(function (tab) {
      var active = tab.getAttribute('data-mode-switch') === next;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });

    els.panes.forEach(function (pane) {
      var active = pane.getAttribute('data-mode') === next;
      pane.hidden = !active;
      if (active) {
        els.caption.textContent = pane.getAttribute('data-caption');
        if (opts.focus) $('.auth-input', pane).focus();
      }
    });

    document.title = PAGE_TITLES[next] + ' | Alberto Watch Company';
    if (opts.updateUrl !== false) syncUrl(next);
  }

  function showSignedIn(session) {
    els.forms.hidden = true;
    els.signedIn.hidden = false;
    els.userName.textContent = session.name;
    els.continueLink.href = getRedirectTarget();
  }


  /* FORM HANDLERS*/
  function onLogin(event) {
    event.preventDefault();
    var form = event.currentTarget;
    var emailInput = form.elements.email;
    var passwordInput = form.elements.password;
    resetForm(form);

    var email = normalizeEmail(emailInput.value);
    var password = passwordInput.value;
    var valid = true;

    if (!EMAIL_RE.test(email)) {
      setFieldError(emailInput, 'Enter a valid email address.');
      valid = false;
    }
    if (!password) {
      setFieldError(passwordInput, 'Enter your password.');
      valid = false;
    }
    if (!valid) return;

    setBusy(form, true);
    var user = getUsers().filter(function (u) { return u.email === email; })[0];

    (user ? hashPassword(password, user.salt) : Promise.resolve('')).then(function (hash) {
      if (!user || hash !== user.passwordHash) {
        setBusy(form, false);
        showMessage(form, 'Incorrect email or password.', 'error');
        return;
      }
      startSession(user, true);   
      showMessage(form, 'Signed in. Redirecting…', 'success');
      redirectSoon();
    });
  }

  function onSignup(event) {
    event.preventDefault();
    var form = event.currentTarget;
    var nameInput = form.elements.fullName;
    var emailInput = form.elements.email;
    var passwordInput = form.elements.password;
    var confirmInput = form.elements.confirm;
    resetForm(form);

    var name = nameInput.value.trim().replace(/\s+/g, ' ');
    var email = normalizeEmail(emailInput.value);
    var password = passwordInput.value;
    var valid = true;

    if (name.length < 2) {
      setFieldError(nameInput, 'Enter your full name.');
      valid = false;
    }
    if (!EMAIL_RE.test(email)) {
      setFieldError(emailInput, 'Enter a valid email address.');
      valid = false;
    }
    if (password.length < MIN_PASSWORD) {
      setFieldError(passwordInput, 'Use at least ' + MIN_PASSWORD + ' characters.');
      valid = false;
    }
    if (confirmInput.value !== password) {
      setFieldError(confirmInput, 'Passwords do not match.');
      valid = false;
    }
    if (!valid) return;

    var users = getUsers();
    if (users.some(function (u) { return u.email === email; })) {
      setFieldError(emailInput, 'An account with this email already exists. Try signing in.');
      return;
    }

    setBusy(form, true);
    var salt = randomHex(16);

    hashPassword(password, salt).then(function (hash) {
      var user = {
        id: randomHex(8),
        name: name,
        email: email,
        salt: salt,
        passwordHash: hash,
        createdAt: new Date().toISOString()
      };
      users.push(user);

      if (!saveUsers(users)) {
        setBusy(form, false);
        showMessage(form, 'We could not save your account. Please check your browser storage settings.', 'error');
        return;
      }
      startSession(user, true);
      showMessage(form, 'Account created. Redirecting…', 'success');
      redirectSoon();
    });
  }

  function bindEvents() {
    $('#loginForm').addEventListener('submit', onLogin);
    $('#signupForm').addEventListener('submit', onSignup);

    document.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-mode-switch]');
      if (trigger) {
        setMode(trigger.getAttribute('data-mode-switch'), {
          focus: !trigger.classList.contains('auth-tab')
        });
      }

      var toggle = event.target.closest('.auth-toggle');
      if (toggle) {
        var input = document.getElementById(toggle.getAttribute('data-target'));
        var show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        toggle.textContent = show ? 'Hide' : 'Show';
        toggle.setAttribute('aria-pressed', String(show));
      }
    });

    $('.auth-tabs').addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      var other = els.tabs.filter(function (tab) {
        return tab.getAttribute('aria-selected') !== 'true';
      })[0];
      setMode(other.getAttribute('data-mode-switch'));
      other.focus();
    });

    document.addEventListener('input', function (event) {
      var field = event.target.closest('.auth-field');
      if (field && field.classList.contains('has-error')) setFieldError(event.target, '');
    });

    $('#signupPassword').addEventListener('input', function (event) {
      updateStrength(event.target.value);
    });

    els.signOut.addEventListener('click', function () {
      endSession();
      els.signedIn.hidden = true;
      els.forms.hidden = false;
      setMode('login');
    });
  }


  /* INIT + PUBLIC API  (for the navbar: AlbertoAuth.getSession(), .logout()) */
  window.AlbertoAuth = {
    getSession: getSession,
    isLoggedIn: function () { return Boolean(getSession()); },
    logout: endSession
  };

  bindEvents();
  updateStrength('');
  setMode(getInitialMode(), { updateUrl: false });

  var session = getSession();
  if (session) showSignedIn(session);
})();