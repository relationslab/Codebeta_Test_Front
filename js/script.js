
var edit;

function adjust(){
  var w_code = $(window).width() - $('#demo').width();
  var h_contents = $(window).height() - $('#menu').height();

  $('#contents').css("height", h_contents + "px");
  $('#code').css("width", w_code + "px");
  $('#editor').css("width", w_code-32 + "px");

  console.log("w_code: "+w_code);
}

$(window).resize(function(){
  adjust();
});

$(document).ready(function(){
  adjust();

  edit = CodeMirror.fromTextArea(document.getElementById('editor'), {
    mode: 'javascript',
    tabMode: 'indent',
    lineNumbers: true
  });
});
