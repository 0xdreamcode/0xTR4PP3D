module.exports.onInitialize = function() {
  this.mouseSensitivity = 0.7;
  this.angle = 0;

}

module.exports.onUpdate = function(dt) {
  return;

  var cam = this.getObjectByName('fps_camera_Orientation');
  var p = xtrap.scene.getObjectByName('Player')

  if ( Math.abs(xtrap.mouse.dx) < 0.005 || !xtrap.mouse.dx) xtrap.mouse.dx = 0
  if ( Math.abs(xtrap.mouse.dy) < 0.01 || !xtrap.mouse.dy) xtrap.mouse.dy = 0



  cam.rotateOnAxis(new THREE.Vector3(1, 0, 0), -xtrap.mouse.dy * this.mouseSensitivity)
  if (cam.rotation.x < -Math.PI*0.9) cam.rotation.x = -Math.PI*0.9
  if (cam.rotation.x > 0) cam.rotation.x = 0
  //cam.rotateOnAxis(new THREE.Vector3(1, 0, 0), xtrap.mouse.dy)
  //p.rotateOnAxis(new THREE.Vector3(0, 1, 0), -xtrap.mouse.dx * this.mouseSensitivity)

  if (!p.body) return;

  p.body.activate()


  var tr  = new Ammo.btTransform();
  this.body.getMotionState().getWorldTransform(tr);


  tr.setOrigin( new Ammo.btVector3(
    tr.getOrigin().x(),
    tr.getOrigin().y(),
    tr.getOrigin().z()
  ))

  tr.setRotation( new Ammo.btQuaternion(
    0,
    this.quaternion.y,
    0,
    this.quaternion.w,
  ));
  this.body.setWorldTransform(tr);
  /*

    if ( Math.abs(xtrap.mouse.dx) > 0.01 )
    */
}
