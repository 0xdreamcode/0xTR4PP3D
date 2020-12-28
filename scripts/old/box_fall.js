module.exports = function() {
  var c = xtrap.scene.getObjectByName('InsaneCube')

  c.animate = !c.animate;

  var d = 1000000 - xtrap.player.gecs;
  if (d > 0) {
  //  xtrap.setDialog( `You still need ${d} gecs to exit.`)
  this.engine.loadGLTFScene('scenes/hall 2.glb')
  .then(() => {
    x.resize()
  })
  }
  //xtrap.setDialog( this.userData['text'] )
  if (c.animate) {
    xtrap.scene.getObjectByName('Player').gecs += 1;
    document.getElementById('gecsStat').style.animation="idle 0.1s ease infinite"
    document.getElementById('gecsStat').style.animation="plusStat 1s ease";
    setTimeout(() => {
      document.getElementById('gecsStat').style.animation="idle 0s ease infinite"
    }, 1000)
  }
}
