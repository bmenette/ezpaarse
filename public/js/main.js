// ##EZPAARSE

$(document).on('ready', function () {
  $.get('/feedback/status', function () {
    $.feedback({
      ajaxURL: '/feedback',
      html2canvasURL: '/feedback/html2canvas.min.js',
      initialBox: true,
      postHTML: false,
      initButtonText: 'Feedback'
    });
  });

  $('#cookieWarned').on('click', function () {
    $('#cookie-bar').slideUp();
    setCookie('cookieWarned', 'warned');
  });
  if (!getCookie('cookieWarned')) {
    $('#cookie-bar').show();
  }

  // $.ajax({
  //   url: "/datasets/",
  //   dataType: 'json'
  // }).done(function (datasets) {
  //   var div = $('#local-files');
  //   for (var filename in datasets) {
  //     var content = '<span class="local-file" title="' + datasets[filename].location + '">';
  //     content += filename + '</span>';
  //     content += ' <span>(' + datasets[filename].size + ')</span><br />';
  //     div.append(content);
  //   }
  //   // $('#local-files span.local-file').on("click", localFileChosen);
  // }).error(function () {
  //   $('#local-files').text('Le dossier local n\'a pas pu être parcouru.');
  // });
});