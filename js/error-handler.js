    (function () {
      var panel = null;
      function getPanel() { return panel || (panel = document.getElementById('errorPanel')); }
      function showErr(title, detail) {
        var p = getPanel();
        if (!p) return;
        p.style.display = 'block';
        var strong = document.createElement('strong');
        strong.textContent = title;
        var br  = document.createElement('br');
        var txt = document.createTextNode(String(detail || ''));
        p.appendChild(strong); p.appendChild(br); p.appendChild(txt);
        p.appendChild(document.createElement('br'));
        p.appendChild(document.createElement('br'));
      }
      window.addEventListener('error', function (e) {
        showErr('JS error: ', (e.error && e.error.stack) || e.message || e.filename + ':' + e.lineno);
      });
      window.addEventListener('unhandledrejection', function (e) {
        var r = e.reason;
        showErr('Unhandled rejection: ', (r && r.stack) || (r && r.message) || String(r));
      });
    })();
