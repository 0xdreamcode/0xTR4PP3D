var bytenode = require('bytenode')
var AMMO = require(__dirname + '/ammo.wasm.js')

AMMO().then(Ammo => {

  var collisionConfiguration  = new Ammo.btSoftBodyRigidBodyCollisionConfiguration(),
    dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
    overlappingPairCache    = new Ammo.btDbvtBroadphase(),
    solver                  = new Ammo.btSequentialImpulseConstraintSolver();
    self.world           = new Ammo.btSoftRigidDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    self.world.solver = solver;
    self.world.overlappingPairCache = overlappingPairCache;
    self.world.collisionConfiguration = collisionConfiguration;
    self.world.dispatcher = dispatcher;
    self.world.setGravity(new Ammo.btVector3(0, -9.81*2, 0));

    // Load default scene
    /*
    x.fps = 1000 / 30;
    x.updateFPS = 1000 / 60;
    x.drawFPS = 1000 / 60
    x.deltaTime = 0;
    x.clockDraw = new THREE.Clock();
    x.clockUpdate = new THREE.Clock()
    x.clockPhysics = new THREE.Clock()
    x.deltaUpdate = 0 ;
    */
  self.Ammo = Ammo
  self.bodies = []

  self.postMessage({task:"initialized"})


})

self.onmessage = function(e) {
  var data = e.data;
  if (!self.bodies) throw "Bodies not found."
  var b = self.bodies.find(b => b.name == data.name)
  var tr = new Ammo.btTransform();
  if (b) {
    b.activate()

    b.getMotionState().getWorldTransform(tr)
  }




  switch(data.task) {

    case "translate":
        tr.setOrigin(new Ammo.btVector3(
          tr.getOrigin().x() + data.step.x,
          tr.getOrigin().y() + data.step.y,
          tr.getOrigin().z() + data.step.z,
        ))
        b.setWorldTransform(tr)
    break;
    case "setLinearVelocity":
        b.setLinearVelocity(new Ammo.btVector3(
          data.velocity.x,
          data.velocity.y,
          data.velocity.z
        ))
      break;
    case "setRotation":
      b.setWorldTransform(new Ammo.btQuaternion(
        data.quaternion.x,
        data.quaternion.y,
        data.quaternion.z,
        data.quaternion.w,
      ))
      break;
    case "setTransform":
      if (data.position) {
        tr.setOrigin(new Ammo.btVector3(
          data.position.x || tr.getOrigin().x(),
          data.position.y || tr.getOrigin().y(),
          data.position.z || tr.getOrigin().z()
        ))
      }
      if (data.quaternion) {
        tr.setRotation(new Ammo.btQuaternion(
          data.quaternion.x,
          data.quaternion.y,
          data.quaternion.z,
          data.quaternion.w,
        ))
      }
      if (b)
        b.setWorldTransform(tr)

      break;
    case "addTrimesh":
      console.log()

      var mesh = new Ammo.btTriangleMesh(true, true);
      data.meshInfo.forEach(triangle => {

        mesh.addTriangle(
          new Ammo.btVector3(triangle[0].x, triangle[0].y, triangle[0].z),
          new Ammo.btVector3(triangle[1].x, triangle[1].y, triangle[1].z),
          new Ammo.btVector3(triangle[2].x, triangle[2].y, triangle[2].z),
          false
        )
      })

      var shape = new Ammo.btBvhTriangleMeshShape( mesh, true, true );

      var startTransform  = new Ammo.btTransform();
              startTransform.setIdentity();
              var mass          = data.mass || 0


              var isDynamic     = (mass !== 0)
      var localInertia = new Ammo.btVector3(0, 0, 0)

              if (isDynamic)
                shape.calculateLocalInertia(mass,localInertia);

              startTransform.setOrigin(new Ammo.btVector3(
                data.position.x,
                data.position.y,
                data.position.z,
              ));
              startTransform.setRotation(
                new Ammo.btQuaternion(data.quaternion.x, data.quaternion.y, data.quaternion.z, data.quaternion.w));

              var myMotionState = new Ammo.btDefaultMotionState(startTransform),
                  rbInfo        = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, shape, localInertia),
                  body          = new Ammo.btRigidBody(rbInfo);



              body.setFriction( data.friction || 1 )
              body.setRestitution(0.2)
              if (data.collision)
                self.world.addRigidBody(body, {
                  collisionGroup: data.collision.collisionGroup || data.collision[0],
                  collisionFilter: data.collision.collisionFilter || data.collision[1]
                });
              else
                self.world.addRigidBody(body, {
                collisionGroup: 0x0001,
                collisionFilter: 0x0001
              });

              body.activate();

              if (mass != 0) {

              }

              body.name = data.name

              body.sab = new SharedArrayBuffer( 4 * (3+4+3) )

              if (data.angularFactor)
                body.setAngularFactor( new Ammo.btVector3(
                  data.angularFactor[0],
                  data.angularFactor[1],
                  data.angularFactor[2]
                ))


              var sab = new Float32Array(body.sab)
              sab.set([
                data.position.x,
                data.position.y,
                data.position.z,

                data.quaternion.x,
                data.quaternion.y,
                data.quaternion.z,
                data.quaternion.w,

                0,
                0,
                0
              ])

              self.postMessage({
                task: "sab",
                name:  data.name,
                sab: body.sab
              })
              console.log("Sab initialized", data.name)
              body.sab = sab;

              self.bodies.push(body)
      break;
    case "add":
        var colShape        = new Ammo.btBoxShape(new Ammo.btVector3(
          data.sz.x / 2,
          data.sz.y / 2,
          data.sz.z / 2
        ))

        var startTransform  = new Ammo.btTransform();
        startTransform.setIdentity();
        var mass          = data.mass || 0
        var isDynamic     = (mass !== 0)
        var localInertia = new Ammo.btVector3(0, 0, 0)

        if (isDynamic)
          colShape.calculateLocalInertia(mass,localInertia);

        startTransform.setOrigin(new Ammo.btVector3(
          data.position.x,
          data.position.y,
          data.position.z,
        ));
        startTransform.setRotation(
          new Ammo.btQuaternion(data.quaternion.x, data.quaternion.y, data.quaternion.z, data.quaternion.w));

        var myMotionState = new Ammo.btDefaultMotionState(startTransform),
            rbInfo        = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, colShape, localInertia),
            body          = new Ammo.btRigidBody(rbInfo);



        body.setFriction( data.friction || 1 )
        body.setRestitution(0.2)
        if (data.collision)
          self.world.addRigidBody(body, {
            collisionGroup: data.collision.collisionGroup || data.collision[0],
            collisionFilter: data.collision.collisionFilter || data.collision[1]
          });
        else
          self.world.addRigidBody(body, {
          collisionGroup: 0x0001,
          collisionFilter: 0x0001
        });

        body.name = data.name

        body.sab = new SharedArrayBuffer( 4 * (3+4+3) )

        if (data.angularFactor)
          body.setAngularFactor( new Ammo.btVector3(
            data.angularFactor[0],
            data.angularFactor[1],
            data.angularFactor[2]
          ))


        var sab = new Float32Array(body.sab)
        sab.set([
          data.position.x,
          data.position.y,
          data.position.z,

          data.quaternion.x,
          data.quaternion.y,
          data.quaternion.z,
          data.quaternion.w,

          0,
          0,
          0
        ])

        self.postMessage({
          task: "sab",
          name: data.name,
          sab: body.sab
        })
        body.sab = sab;
        body.activate()
        self.bodies.push(body)
  break;
  case "simulate":
    this.simulate()

  break;
  }

}
var last = Date.now();
var now = Date.now()-1;

self.simulate = function() {

        now = Date.now();
        var dt = (now - last)*0.001

        if (dt > 1/300) {
            last = now
          this.world.stepSimulation(dt, Math.ceil(dt / (1 / 300)), 1/300);
        }


        var tr = new Ammo.btTransform();
        self.bodies.forEach(body => {
          var ms = body.getMotionState();

          ms.getWorldTransform(tr);
          body.sab.set([
            tr.getOrigin().x(),
            tr.getOrigin().y(),
            tr.getOrigin().z(),

            tr.getRotation().x(),
            tr.getRotation().y(),
            tr.getRotation().z(),
            tr.getRotation().w(),

            body.getLinearVelocity().x(),
            body.getLinearVelocity().y(),
            body.getLinearVelocity().z(),
          ])
          self.postMessage({
            task: "updateSab",
            name: body.name
          })
        })
    requestAnimationFrame( ()=> {
      self.simulate()
    })
}
