window.App = window.App || {};

App.Auth = (() => {
  let _db = null;
  let _uid = null;
  let _saveTimer = null;

  function isReady() {
    return typeof firebase !== 'undefined' && _db !== null;
  }

  function isConfigured() {
    return window.FIREBASE_CONFIG &&
           window.FIREBASE_CONFIG.apiKey !== '여기에_입력';
  }

  function init() {
    if (typeof firebase === 'undefined' || !isConfigured()) return;
    try {
      if (!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
      _db = firebase.firestore();

      // Firebase가 설정된 경우 → 로그인 필수
      showLoginOverlay(true);

      firebase.auth().onAuthStateChanged(async user => {
        if (user) {
          _uid = user.uid;
          updateNavUser(user);
          await loadFromCloud();
          // 클라우드 동기화로 결혼 정보가 채워졌다면 설정 시작 화면을 닫는다
          if (App.Data.get().settings.weddingDate) {
            document.getElementById('setupOverlay').classList.remove('open');
          }
          showLoginOverlay(false);
          App.Home.render();
        } else {
          _uid = null;
          updateNavUser(null);
          showLoginOverlay(true); // 로그아웃 시 앱 가리기
        }
      });

      // 탭이 백그라운드로 전환되거나 닫힐 때 디바운스 없이 즉시 동기화
      const flushSync = () => { clearTimeout(_saveTimer); saveToCloud(); };
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') flushSync();
      });
      window.addEventListener('pagehide', flushSync);
    } catch (e) {
      console.warn('Firebase 초기화 실패:', e);
    }
  }

  function showLoginOverlay(show) {
    const el = document.getElementById('loginRequired');
    if (!el) return;
    if (show) el.classList.add('open');
    else el.classList.remove('open');
  }

  function login() {
    if (!isReady()) {
      alert('Firebase 설정이 필요합니다.\nfirebase-config.js를 확인해주세요.');
      return;
    }
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
      .catch(e => alert('로그인 실패: ' + e.message));
  }

  function logout() {
    if (!isReady()) return;
    if (!confirm('로그아웃하시겠어요?')) return;
    firebase.auth().signOut();
  }

  function updateNavUser(user) {
    const el = document.getElementById('navUser');
    if (!el) return;
    const settingsBtn = `<button class="btn btn-ghost btn-sm" onclick="App.showSettings()" title="설정">⚙️</button>`;
    if (user) {
      el.innerHTML = `
        ${settingsBtn}
        <div class="nav-user">
          <img src="${user.photoURL || ''}" onerror="this.style.display='none'" class="nav-avatar">
          <span class="nav-username">${user.displayName || user.email || '사용자'}</span>
          <button class="btn btn-ghost btn-sm" onclick="App.Auth.logout()">로그아웃</button>
        </div>`;
    } else {
      el.innerHTML = `${settingsBtn}<button class="btn btn-outline btn-sm" onclick="App.Auth.login()">🔑 Google 로그인</button>`;
    }
  }

  async function loadFromCloud() {
    if (!isReady() || !_uid) return;
    try {
      const doc = await _db.doc(`users/${_uid}`).get();
      if (!doc.exists) return;
      const cloudData = doc.data();
      const cloudModified = cloudData.lastModified || 0;
      const localModified = App.Data.getLastModified();
      if (cloudModified > localModified) {
        // 클라우드가 더 최신 → 로컬을 클라우드 데이터로 갱신
        App.Data.importFromCloud(cloudData);
      } else if (localModified > cloudModified) {
        // 로컬이 더 최신 → 클라우드를 덮어쓰지 않고 즉시 동기화
        await saveToCloud();
      }
    } catch (e) { console.warn('클라우드 로드 실패:', e); }
  }

  function scheduleSync() {
    if (!isReady() || !_uid) return;
    clearTimeout(_saveTimer);
    _saveTimer = setTimeout(saveToCloud, 1500);
  }

  async function saveToCloud() {
    if (!isReady() || !_uid) return;
    try {
      await _db.doc(`users/${_uid}`).set(App.Data.exportForCloud(), { merge: true });
    } catch (e) { console.warn('클라우드 저장 실패:', e); }
  }

  return { init, login, logout, scheduleSync, saveToCloud, isLoggedIn: () => !!_uid };
})();
