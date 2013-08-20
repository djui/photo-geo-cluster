(function(window) {
  // var fs = require("fs");
  
  // var head = window.document.querySelector("head");
  // var body = window.document.querySelector("body");
  
  var win = require("nw.gui").Window.get();
  if (localStorage.width) {
    win.resizeTo(parseInt(localStorage.width), parseInt(localStorage.height));
    win.moveTo(parseInt(localStorage.x), parseInt(localStorage.y));
  }
  win.show();
  
})(window);
