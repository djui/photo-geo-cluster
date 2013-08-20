// Initialization for content
function init () {
  App.initMap();
}

window.onload = init;

// Initialization for frame/chrome/window
var gui = require("nw.gui");
var win = gui.Window.get();

win.on("loaded", function() {
  if (localStorage.width) {
    win.resizeTo(parseInt(localStorage.width), parseInt(localStorage.height));
    win.moveTo(parseInt(localStorage.x), parseInt(localStorage.y));
  }
  win.show();
});
