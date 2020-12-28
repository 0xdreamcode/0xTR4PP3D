var StoryScreen = require(__dirname + '/../StoryScreen.js')

module.exports.onInitialize = function() {

  var s = new StoryScreen();
  document.body.appendChild(s.html)

  s.show("Hello.")

}
