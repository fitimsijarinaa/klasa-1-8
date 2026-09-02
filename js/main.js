(function () {
  var link = document.getElementById('download-orari');
  if (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      var href = link.getAttribute('href');
      var filename = link.getAttribute('download') || 'orari-klasa-1-8.png';

      fetch(href)
        .then(function (response) {
          if (!response.ok) throw new Error('Download failed');
          return response.blob();
        })
        .then(function (blob) {
          var url = URL.createObjectURL(blob);
          var temp = document.createElement('a');
          temp.href = url;
          temp.download = filename;
          document.body.appendChild(temp);
          temp.click();
          temp.remove();
          URL.revokeObjectURL(url);
        })
        .catch(function () {
          window.location.href = href;
        });
    });
  }

  var table = document.getElementById('orari-table');
  if (!table) return;

  // JS getDay(): 0=Sun … 6=Sat; schedule columns are Mon–Fri (1–5)
  var today = new Date().getDay();
  if (today < 1 || today > 5) return;

  var header = table.querySelector('thead th[data-day="' + today + '"]');
  if (!header) return;

  var colIndex = Array.prototype.indexOf.call(header.parentNode.children, header);
  header.classList.add('is-today');
  header.setAttribute('aria-current', 'date');

  var label = document.createElement('span');
  label.className = 'today-label';
  label.textContent = 'Sot';
  header.appendChild(label);

  var rows = table.querySelectorAll('tbody tr');
  for (var i = 0; i < rows.length; i++) {
    var cell = rows[i].children[colIndex];
    if (cell) cell.classList.add('is-today');
  }
})();
