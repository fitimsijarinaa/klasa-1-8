(function () {
  var link = document.getElementById('download-orari');
  if (!link) return;

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
})();
