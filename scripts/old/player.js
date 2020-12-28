var VolumetricFire = require(__dirname + '/../lib/VolumetricFire.js')
var fs = require('fs')

function action(name, timeStep) {
  if (this.currentAction == name) return;
  if (!this.actions[name]) return;

  if (this.currentAction)
    this.actions[this.currentAction].stop();



  this.actions[name].play()
  this.actions[name].setEffectiveTimeScale(timeStep || 1)
  this.currentAction = name;
}

module.exports.onMouse = function(e) {
  console.log('s')
}

module.exports.onInitialize = function() {
  xtrap.resize()
  xtrap.lockPointer()

  this.action = action;
  this.thirst = 1;
  this.thirstFactor = 0.000001;


  this.speed = 6.5
  this.jumpSpeed = 6.6;

  this.angularFactor = { x: 0, y: 1, z: 0 }

  this.angle = 0;
  this.mouseSensitivity = 1.2

  this.actions = {}

  this.gecs = 0;
  this.gecsRate = 1;
  document.getElementsByClassName('stats')[0].style.display = 'flex'
      /*
  document.addEventListener('mousedown', (e) => {
    if (!xtrap._pointerLocked) return;

    if (!this.attacking) {

      this.action('slash_0', 2.5)
      this.actions["slash_0"].loop = THREE.LoopOnce
      this.attacking = true
      clearTimeout(this.attackTimeout)
      this.attackTimeout = setTimeout(() => {

        this.attacking = false

        xtrap.sabWorker.postMessage({
          task: "setLinearVelocity",
          name: 'Player',
          velocity: {
            x: 0,
            y: 0,
            z: 0
          },
        })
        if (this.sab)
        this.sab.set([
          this.sab[0],
          this.sab[1],
          this.sab[2],

          this.sab[3],
          this.sab[4],
          this.sab[5],
          this.sab[6],

          0,
          0,
          0
        ])

      }, 700)
    }

  });


  this.mixer = new THREE.AnimationMixer(this);
    */
  var clips = [
    "idle",
    "run",
    "strafe_left",
    "strafe_right",
    "cast",
    "slash_0"
  ]
  /*
  this.actions = {}
  clips.forEach(c => {
    var clip = THREE.AnimationClip.findByName( this.clips, c );
    this.actions[c] = this.mixer.clipAction( clip );
  })

  this.action('run')

  this.model = this.getObjectByName('player.glb')
  this.model.visible = false
  this.model.updateMatrixWorld();
  this.updateMatrixWorld()
  var bbox = new THREE.Box3().setFromObject(this.model)
  .applyMatrix4(this.model.matrixWorld)
  .applyMatrix4(this.matrixWorld)
    */
  //this.model.position.y -= (bbox.max.y - bbox.min.y)/2
  //this.traverse(c => this.shape = c.userData['type'] == 'collision_shape')
//  console.log(this)
  /*
  xtrap.scene.getObjectByName('Player').onSync = function(body) {
        console.log(body.pos, this.position)
        this.position.set(body.pos.x, body.pos.y, body.pos.z)
      }
      */
      //this.model.position.y -= this.sz.y / 2
      /*
      var sword = this.getObjectByName('sword')

      if (sword) {

        var p = this
        xtrap.loadGLTFModel('katana.glb')
        .then(gltf => {

          gltf.scene.name = 'sword'
          //xtrap.loadPhysics(gltf.scene, [0x0004, 0x0002])
          sword.add(gltf.scene)

          gltf.scene.onUpdate = function(dt) {


          }
        })

      }
      */

      var fireWidth  = 2;
        var fireHeight = 4;
        var fireDepth  = 2;
        var sliceSpacing = 0.5;
      VolumetricFire.texturePath = './textures/';

      this.fire = new VolumetricFire(
          2,
          4,
          2,
          0.5,
          this.engine.camera
        );

      this.engine.scene.add(this.fire.mesh)
      this.fire.mesh.position.set(new THREE.Vector3(
        this.position.x,
        2,
        this.position.y
      ))

    }

    module.exports.onUpdate = function(dt) {

      this.thirst -= dt * this.thirstFactor;

      this.fire.update( dt );

      document.getElementById("thirst").innerHTML = this.thirst

      if (this.mixer)
        this.mixer.update( dt );


    //  this.rotateOnAxis(new THREE.Vector3(0, 1, 0), -xtrap.mouse.dx * 0.5)

      /*
      this.body.setAngularVelocity(
        new Ammo.btVector3(
          0,
          -xtrap.mouse.dx * (this.mouseSensitivity*100),
          0
        )
      )
      */
      /*
        if ( Math.abs(xtrap.mouse.dx) > 0.01 )
          this.rotateOnAxis(new THREE.Vector3(0, 1, 0), -xtrap.mouse.dx)
        */

      if (xtrap.actionKeyPressed['flashlight']) {
        var s = this.getObjectByName('Spot_Orientation');
        if (s) {
          if (s.intensity == 500) {
            s.intensity = 0;
          } else {
            s.intensity = 500;
          }
          xtrap.actionKeyPressed['flashlight'] = false;
        }
      }

      //fixture.rotation.y += xtrap.mouse.dx * 0.001;

      this.step = new THREE.Vector3(0, 0, 0)

      if (xtrap._pointerLocked) {

        if (xtrap.actionKeyPressed['save']) {
          fs.writeFileSync('./save.json', JSON.stringify(xtrap.scene.toJSON()) )
        }

      if(xtrap.actionKeyPressed['jump']) {
        if ( this.sab[8] < 0.1 &&
            this.sab[8] >= 0)
            this.jumpVelocity = this.jumpSpeed

            //xtrap.actionKeyPressed['jump'] = false;
      } else {
        this.jumpVelocity = 0
      }

      if (xtrap.actionKeyPressed['forward']) // a
      {
        /*
          this.model.quaternion.set(
            0,
            fixture.quaternion.y,
            0,
            fixture.quaternion.w
          ).normalize()
          */
        this.step.z = -1;
      }
      if (xtrap.actionKeyPressed['back']) // a
      {
        /*
        this.model.quaternion.set(
          0,
          fixture.quaternion.y,
          0,
          fixture.quaternion.w
        ).normalize()
        */
        //this.model.rotateY(Math.PI)

        this.step.z = 1;
      }

      if (xtrap.actionKeyPressed['left']) // a
      {
        /*
        this.model.quaternion.set(
          0,
          fixture.quaternion.y,
          0,
          fixture.quaternion.w
        ).normalize()
        */
        //this.model.rotateY(Math.PI/2)
        this.step.x = -1;
      }
      if (xtrap.actionKeyPressed['right']) // a
      {
        /*
        this.model.quaternion.set(
          0,
          fixture.quaternion.y,
          0,
          fixture.quaternion.w
        ).normalize()
        */
        //this.model.rotateY(3*Math.PI/2)

        this.step.x = 1;
      }

      /*
      if (xtrap.actionKeyPressed['forward'] &&
          xtrap.actionKeyPressed['left']) {
            this.model.quaternion.set(
              0,
              fixture.quaternion.y,
              0,
              fixture.quaternion.w
            ).normalize()
            this.model.rotateY(1*Math.PI/4)
      }
      if (xtrap.actionKeyPressed['forward'] &&
          xtrap.actionKeyPressed['right']) {
            this.model.quaternion.set(
              0,
              fixture.quaternion.y,
              0,
              fixture.quaternion.w
            ).normalize()
            this.model.rotateY(-Math.PI/4)
      }

      if (xtrap.actionKeyPressed['back'] &&
          xtrap.actionKeyPressed['left']) {
            this.model.quaternion.set(
              0,
              fixture.quaternion.y,
              0,
              fixture.quaternion.w
            ).normalize()
            this.model.rotateY(3*Math.PI/4)
      }
      if (xtrap.actionKeyPressed['back'] &&

          xtrap.actionKeyPressed['right']) {
            this.model.quaternion.set(
              0,
              fixture.quaternion.y,
              0,
              fixture.quaternion.w
            ).normalize()

            this.model.rotateY(-3*Math.PI/4)
      }
      */
    }


      if (this.step.z != 0) {
      //  this.action('run')
      }

      else if (this.step.x > 0) {
        //this.action('run')
      }
      else if (this.step.x < 0) {
      //  this.action('run')
      }
      else if (this.step.x == 0 && this.step.z == 0 && !this.attacking) {
      //  this.action('idle', 2)
      }

    /*
        if (xtrap.actionKeyPressed['use'])
        {
          this.action('cast')
          this.actions[this.currentAction].repeat = THREE.LoopOnce;
          this.casting = true;

          this.castTimeout = setTimeout(() => {

            // Set ray
            this.casting = false
            this.action('idle')

            // Find physics body

            // Apply force

          }, 2000)

        }
    */
      //this.step.applyQuaternion(xtrap.camera.quaternion)
      ///this.step.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.angle)


      //print("world pos = " + [trans.getOrigin().x().toFixed(2), trans.getOrigin().y().toFixed(2), trans.getOrigin().z().toFixed(2)]);

    /*
      var q = new THREE.Quaternion();
      q.x = trans.getRotation().x();
      q.y = trans.getRotation().y();
      q.z = trans.getRotation().z();
      q.w = trans.getRotation().w();
    */


      var q = this.getObjectByName('camera_fixture').quaternion
      this.step.applyQuaternion(q)
      this.step.normalize()

      this.step.multiplyScalar(this.speed)
      //this.model.quaternion.copy(this.quaternion)

      //this.position.x += this.step.x
      //this.position.y += this.step.y

      //this.sab[0] += 0.1;


      if (
        Math.abs(this.step.x) > 0 ||
        Math.abs(this.step.z) > 0 ||
        this.jumpVelocity != 0) {
        this.attacking = false;



        xtrap.sabWorker.postMessage({
          task: "setLinearVelocity",
          name: this.name,
          velocity: {
            x: this.step.x,
            y: this.sab[8],
            z: this.step.z
          },
        })

      } else {
        if (this.sab) {
        if (this.sab[3] != 0 ||
            this.sab[5] != 0)

            xtrap.sabWorker.postMessage({
              task: "setLinearVelocity",
              name: this.name,
              velocity: {
                x: 0,
                y: this.sab[8],
                z: 0
              },
            })
          }
      }


      this.gecs += ((1/60 - dt) / (1/60)) * this.gecsRate;
      this.gecsRate *= 1.0000000001


      /* Update UI */
      document.getElementById("gecs").innerHTML = this.gecs.toFixed(3);

      this.gecsRate = 1;
    }
