

module.exports.onInitialize = function () {
  const light = new THREE.AmbientLight( this.userData['color'] || 0x030303 ); // soft white light
  xtrap.scene.add( light );
}
