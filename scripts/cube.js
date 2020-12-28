
module.exports.onInitialize = function () {
  this.animate = true;



}

module.exports.onUpdate = function (dt) {



  var p = this.engine.scene.getObjectByName('Player')
  if (p) {
    var d = this.position.distanceTo(this.engine.scene.getObjectByName('Player').position)
    var dist = 1 - (1 / d);
    this.engine.scene.getObjectByName('Player').gecsRate += dist;


    if (d < 10) {

      if (this.engine.actionKeyPressed['use']) {


        var t = this.engine.scene.getObjectByName('teleport_0');
        if (t) {
          xtrap.sabWorker.postMessage({
            task: "setTransform",
            name: 'Player',
            position: {
              x: t.position.x,
              y: t.position.y,
              z: t.position.z
            },
          })
        }

      }

      if (!this.engine.dialogTimeout) {
        var c = this;
        this.engine.dialogTimeout = setTimeout(() => {
          clearTimeout(c.engine.dialogTimeout)
          c.engine.dialogTimeout= false;
          c.engine.setDialog("Press [E] to access The Insane Engine©")
        },)
      }



    }
      if (this.animate) {
      this.rotateY(-0.01);
      this.rotateZ(-0.01 )
    }
  }
}
