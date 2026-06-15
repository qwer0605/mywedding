window.App = window.App || {};

App.Util = (() => {
  function fmtWon(n) {
    if (!n && n !== 0) return '—';
    if (n >= 100000000) return (n / 100000000).toFixed(n % 100000000 ? 1 : 0) + '억 원';
    if (n >= 10000) return Math.round(n / 10000).toLocaleString() + '만 원';
    return n.toLocaleString() + '원';
  }

  function formatNumberInput(el) {
    const digits = el.value.replace(/[^0-9]/g, '');
    el.value = digits ? Number(digits).toLocaleString('ko-KR') : '';
  }

  function parseNumberInput(id) {
    const el = document.getElementById(id);
    if (!el) return 0;
    return Number(el.value.replace(/[^0-9]/g, '')) || 0;
  }

  function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  return { fmtWon, formatNumberInput, parseNumberInput, esc };
})();
