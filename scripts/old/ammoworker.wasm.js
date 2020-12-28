


var Ammo = require(__dirname + '/../ammo.wasm.js')

var worker = self
Ammo().then((Ammo) => {
  worker.postMessage({task: "loaded" })

  Ammo.btVector3.prototype.toThree = function () {
      return new THREE.Vector3(this.x, this.y, this.z);
    }

      worker.ex = {
          toBt: function (v) {
              return new worker.Ammo.btVector3(v.x, v.y, v.z);
          },
          toBtQuat: function (v) {
              var yaw = v.y, pitch = v.x, roll = v.z;
              return new worker.Ammo.btQuaternion(yaw, pitch, roll);
          }
      };

      worker.setLinearVelocity = function(data) {
        var b = this.bodies.find(b => b.meshName == data.meshName)
      }

      worker.setTransform = function(data) {

        var b = worker.bodies.find(b => b.meshName = data.meshName)
        if (!b) throw "Mesh does not exist:" + data.meshName
        if (data.targetName)
          b.targetName = data.targetName

          /*
        var tr  = new Ammo.btTransform();
        b.getMotionState().getWorldTransform(tr);


        if (data.origin) {
          tr.setOrigin( new Ammo.btVector3(
            data.origin.x + data.step.x * data.speed,
            data.origin.y,
            data.origin.z + data.step.z * data.speed
          ))
        }



        if (data.step) {
          tr.setOrigin( new Ammo.btVector3(
            tr.getOrigin().x() + data.step.x * data.speed,
            tr.getOrigin().y() + data.step.y * data.speed,
            tr.getOrigin().z() + data.step.z * data.speed,
          ))
        }


        if (data.rotation) {
          tr.setRotation( new Ammo.btQuaternion(
            data.rotation.x,
            data.rotation.y,
            data.rotation.z,
            data.rotation.w,
          ));
        }

        b.setWorldTransform(tr);
          */
        b.setLinearVelocity(new Ammo.btVector3(
          10,
          0,
          1
        ))
      }


      worker.init = function () {
          var collisionConfiguration = new worker.Ammo.btDefaultCollisionConfiguration(),
          dispatcher = new worker.Ammo.btCollisionDispatcher(collisionConfiguration),
          overlappingPairCache = new worker.Ammo.btDbvtBroadphase(),
          solver = new worker.Ammo.btSequentialImpulseConstraintSolver();

          worker.world = new worker.Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
          worker.world.setGravity(new worker.Ammo.btVector3(0, -20, 0));

          worker.bodies = [];

          /*
          setInterval(() => {
            worker.simulate({ dt: 1/60 })
          }, 1000/60)
          */
      };

      worker.simulate = function (data) {
          //if (data.dt <= 0) return;

            worker.world.stepSimulation(1/60, // time step
                                      Math.ceil(data.dt / (1 / 60)), // max sub steps
                                      1 / 60); // fixed time step


          var toUpdateMeshes = [];
          worker.bodies.forEach(function (body) {

              var transform = new worker.Ammo.btTransform();
              body.getMotionState().getWorldTransform(transform);
              const origin = transform.getOrigin(),
                  rotation = transform.getRotation();



              const mesh = { meshName: body.meshName, targetName: body.targetName,
                pos: {}
                ,quat: {}
               }
               const pos = {
                 x: origin.x(),
                 y: origin.y(),
                 z: origin.z()
               }
               const q = {
                  x:  rotation.x() || 0,
                  y:  rotation.y() || 0,
                  z:  rotation.z() || 0,
                  w:  rotation.w() || 1
                }
              mesh.pos = pos;
              mesh.quat = q;

              toUpdateMeshes.push(mesh);


          });

          worker.postMessage({ task: "syncMesh", meshes: toUpdateMeshes });
      };

      worker.addObjectToSimulationWorld = function (desc) {
          var shape, body, motionState, transform, localInertia, rbInfo;

          desc.mass = desc.mass || 0

          transform = new worker.Ammo.btTransform();
          transform.setIdentity();
          transform.setOrigin(worker.ex.toBt(desc.pos));
          transform.setRotation(worker.ex.toBtQuat(desc.rot));
          motionState = new worker.Ammo.btDefaultMotionState(transform);
          localInertia = new worker.Ammo.btVector3(0, 0, 0);


          switch (desc.shape) {
              case "concave":
                  var compoundShape = new worker.Ammo.btCompoundShape(true);
                  var identityTrasform = new worker.Ammo.btTransform();
                  identityTrasform.setIdentity();

                  desc.info.forEach(function (c, i, arr) {
                      var convex = new worker.Ammo.btConvexHullShape();
                      convex.addPoint(worker.ex.toBt(c[0]));
                      convex.addPoint(worker.ex.toBt(c[1]));
                      convex.addPoint(worker.ex.toBt(c[2]));
                      c[3] && convex.addPoint(worker.ex.toBt(c[3]));

                      compoundShape.addChildShape(identityTrasform, convex);
                  });
                  var mass = desc.mass || 0;
                  compoundShape.calculateLocalInertia(mass, localInertia);
                  rbInfo = new worker.Ammo.btRigidBodyConstructionInfo(mass, motionState, compoundShape, localInertia);
                  rbInfo.set_m_friction(desc.friction || 0.4);
                  rbInfo.set_m_restitution(desc.restitution || 0.2);
                  body = new worker.Ammo.btRigidBody(rbInfo);
                  //body.setWorldTransform(transform)
                  worker.world.addRigidBody(body);
                  break;
              case "box":

                  shape = new worker.Ammo.btBoxShape(desc.box.x/2, desc.box.y/2, desc.box.z/2);
                  var mass = desc.mass || (4 / 3) * Math.PI * (Math.pow(radius, 3));
                  shape.calculateLocalInertia(mass, localInertia);
                  rbInfo = new worker.Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
                  rbInfo.set_m_friction(desc.friction || 0.4);
                  rbInfo.set_m_restitution(desc.restitution || 0.2);
                  body = new worker.Ammo.btRigidBody(rbInfo);

                  worker.world.addRigidBody(body);

                  break;
              case "sphere":
                  break;
                  var radius = desc.radius;
                  shape = new worker.Ammo.btSphereShape(radius);
                  var mass = desc.mass || (4 / 3) * Math.PI * (Math.pow(radius, 3));
                  shape.calculateLocalInertia(mass, localInertia);
                  rbInfo = new worker.Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
                  rbInfo.set_m_friction(desc.friction || 0.4);
                  rbInfo.set_m_restitution(desc.restitution || 0.2);
                  body = new worker.Ammo.btRigidBody(rbInfo);
                  //body.setWorldTransform(transform)
                  worker.world.addRigidBody(body);
                  break;
          }
          if (desc.angularFactor)
            body.setLinearFactor(desc.angularFactor.x, desc.angularFactor.y, desc.angularFactor.z)
          body.meshName = desc.meshName;
          body.mass = desc.mass || 0
          worker.bodies.push(body);
      };

      worker.onmessage = function (evt) {
          switch (evt.data.task) {
              case "init":
                  worker.init();
                  break;
              case "addObjectToSimulationWorld":
                  worker.addObjectToSimulationWorld(evt.data);
                  break;
              case "simulate":
                  worker.simulate(evt.data);
                  break;
              case "setLinearVelocity":
                worker.setLinearVelocity(evt.data)
                  break;
              case "setTransform":
                worker.setTransform(evt.data)
                break;
          }
      };

})
