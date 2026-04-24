document.addEventListener('DOMContentLoaded', function () {

  // ── Open dialog ────────────────────────────────────────────────────────────
  document.querySelectorAll('[data-dialog]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var dialog = document.getElementById(btn.getAttribute('data-dialog'));
      if (dialog) dialog.showModal();
    });
  });

  // ── Close dialog ───────────────────────────────────────────────────────────
  document.querySelectorAll('[data-close-dialog]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var dialog = document.getElementById(btn.getAttribute('data-close-dialog'));
      if (dialog) dialog.close();
    });
  });

  // ── Table row navigation ───────────────────────────────────────────────────
  document.querySelectorAll('tr[data-href]').forEach(function (row) {
    row.addEventListener('click', function (e) {
      if (e.target.closest('a, button, summary, input, select, textarea, label, form')) return;
      window.location = row.getAttribute('data-href');
    });
  });

  // ── Clipboard copy ─────────────────────────────────────────────────────────
  document.querySelectorAll('[data-copy-target]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = document.getElementById(btn.getAttribute('data-copy-target'));
      if (!target) return;
      navigator.clipboard.writeText(target.value)
        .then(function () { btn.textContent = 'Copied!'; })
        .catch(function () { btn.textContent = 'Failed'; });
    });
  });

});
