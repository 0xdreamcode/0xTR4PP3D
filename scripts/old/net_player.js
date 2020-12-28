module.exports.onInitialize = async function() {
  console.log('aaa')
  this.model = await xtrap.loadGLTFModel('player.glb')

  this.add(this.model.scene)

  
}
