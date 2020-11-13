  // ------------------------------------------------
  // BASIC SETUP
  // ------------------------------------------------
  var EventEmitter = require('events');
  var bytenode = require('bytenode')
  var xSocket = require('./lib/xSocket.js')
  var io = require('socket.io-client')
  window.THREE = require(__dirname + '/three.min.js')
  const chokidar = require("chokidar");
  var GLTFLoader = require(__dirname + '/GLTFLoader.js')
  var Events = require('events')

  var ConvolutionShader = require(__dirname + "/lib/ConvolutionShader.js")

  THREE.CopyShader = require('three-copyshader')
  var fxaa = require('three-shader-fxaa')

  var BokehShader = require('./lib/BokehShader.js')
  var EffectComposer = require(__dirname + "/lib/EffectComposer.js")
  var { RenderPass } = require(__dirname + "/lib/ShaderPass.js")
  var { RenderPass } = require(__dirname + "/lib/RenderPass.js")
  var { BokehPass } = require(__dirname + "/lib/BokehPass.js")
  var { FXAAShader } = require(__dirname + "/lib/FXAAShader.js")
  var BloomPass = require(__dirname + "/lib/BloomPass.js")

  //var DotScreenShader = require('./shaders/dot_shader.js')
  var ejs = require('ejs')
  var fs = require('fs')

  var AMMO_TYPES = {
    BOX: 0,
    SHAPE: 1,
    TRIMESH: 2
  }

  class xTrap extends EventEmitter {
    constructor() {
      super();
      // Create an empty scene
      this.ammoWorker = {} // new Worker('./scripts/ammoworker.wasm.js')


      this.version = "0.9.1";

      this.sabWorker = new Worker(__dirname + '/sabWorker.js')
      var x = this;
      x.sabWorker.onmessage = (e) => {
        var data = e.data;
        switch(data.task) {
          case "initialized":
          console.log('Ammo loaded.')

          x.sabWorker.postMessage({
            task: "simulate"
          })

          x.emit('physics_loaded')

          x.loadGLTFScene(__dirname + './scenes/scene.glb')
          .then(() => {
            x.emit('scene_loaded')
          })
      		// backwards
          /*
          var json = require('./scenes/scene.json')

          x.scene = new THREE.Scene();
          const loader = new THREE.ObjectLoader();
          var o = loader.parse( json.scene );



          x.scene.add(o)
          console.log(json)
          x.scene.traverse(obj => {
            console.log(obj)
          })

          var c = x.scene.getObjectByName('default_camera');
          x.scene.background = new THREE.Color(json.scene.object.background)
          x.camera = c;
          */
          /*
          x.scene.add(new THREE.Object3D(json.scene.object))

          x.scene.background = new THREE.Color(json.scene.object.background);

          console.log(json)

          json.scene.object.children.forEach(ch => {

            //var obj = new THREE.Object3D(ch);
            console.log(ch.type)
            switch(ch.type) {
              case "PointLight":
                var light = new THREE.PointLight(ch);
                x.scene.add(light)
              break;
              case "PerspectiveCamera":

                x.scene.add(THREE.Object3D.copy(ch))
              case "Mesh":
                var geo = json.scene.geometries.find(g => g.uuid == ch.geometry)
                var mat = json.scene.materials.find(m => m.uuid == ch.material)

                ch.geometry = new THREE.BufferGeometry(geo)
                ch.material = new THREE.Material(mat)
                var mesh = new THREE.Mesh().clone(ch);
                x.scene.add(mesh)
                console.log(mesh)
                break;
              default:
                console.log(ch.type)
              break;
            }

          })
          var cam = x.scene.getObjectByName('default_camera')
          console.log(cam)

          */


          //x._physics();
          break;
          case "updateSab":
          var obj = x.scene.getObjectByName(data.name);
          if (!obj) return;
            obj.position.set(obj.sab[0], obj.sab[1], obj.sab[2])
            obj.quaternion.set(obj.sab[3], obj.sab[4], obj.sab[5], obj.sab[6])


          break;
          case "sab":

            var obj = x.scene.getObjectByName(data.name);
            if (!obj) return;

            obj.sab = new Float32Array(data.sab);
            break;
          case "updateBody":
            var obj = x.scene.getObjectByName(data.name)
            if (!obj) return;

            obj.position.set(data.position.x, data.position.y, data.position.z)
            obj.quaternion.set(data.quaternion.x, data.quaternion.y, data.quaternion.z, data.quaternion.w)
          break;
        }
      }

  // xxx
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color( 0x000000 );
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        stencil: true,
        depth: true,
        alpha: true,
        precision: "lowp",
        logarithmicDepthBuffer: true,
        powerPreference: "high-performance"});

      //this.renderer.shadowMapCullFace = THREE.CullFaceBack;


      this.threeWorker = {} //new Worker('./scripts/threeWorker.js')
      /*
      var canvas = document.createElement('canvas')
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      var offscreen = canvas.transferControlToOffscreen()

      var drawCanvas = document.createElement('canvas')
      drawCanvas.width = window.innerWidth;
      drawCanvas.height = window.innerHeight;

      this.offCanvas = canvas;
      this.bmpCanvas = drawCanvas;

      var bmpC = drawCanvas.getContext('bitmaprenderer')
      document.body.appendChild( drawCanvas );
      this.threeWorker.postMessage({
        task: "initialize",
        data: { canvas: offscreen, size: { width: drawCanvas.width, height: drawCanvas.height } },
      },  [offscreen] )

      this.threeWorker.postMessage({
        task: "loadGLTFScene",
        data: { file: "scene.glb" },
      })

      var x = this;
      this.threeWorker.onmessage = function(e) {
        var data = e.data.data;
        switch(e.data.task) {
          case "setLinearVelocity":
            x.ammoWorker.postMessage({
              task: "setLinearVelocity",
              data: data
            })
          break;
          case "addPhysicsBody":
            x.ammoWorker.postMessage({
              task: "add",
              data: data
            })
          break;
          case "togglepointerlock":
            x.togglePointerLock()
          break;
          case "lockpointer":
          console.log('Locking pointer')
            x.lockPointer()
            break;
          case "resize":
            x.resize()
          break;
          case "render":
            bmpC.transferFromImageBitmap(data.bmp);
          break;
        }
      }
      */
      this.renderer.gammaOutput = true;
      this.renderer.gammaFactor = 2.2;
      // Configure renderer clear color
      this.renderer.setClearColor("#000000");
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      this.renderer.physicallyCorrectLights = true;
      this.renderer.shadowMapEnabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.shadowMap.renderReverseSided = false
      this.renderer.shadowMap.renderSingleSided = false;
  // xxx
      this.loader = new GLTFLoader();

      this.mouse = { dx: 0, dy: 0 }

      // Configure renderer size


      // Append Renderer to DOM

      document.body.appendChild( this.renderer.domElement );


      // Set up window key Events
      this.actionKeys = require('./actionKeys.json')
      this.actionKeyPressed = {}
      var x = this;


      window.addEventListener('keydown', (e) => {

        var action = Object.keys(this.actionKeys).find(a => {
          return this.actionKeys[a].includes(e.keyCode)
        })
        if (action) {
          x.actionKeyPressed[action] = true;
        }

        /*
        this.threeWorker.postMessage({
          task: "keydown",
          data: e.keyCode
        })
        */
      })
      window.addEventListener('keyup', (e) => {
        var action = Object.keys(this.actionKeys).find(a => {
          return this.actionKeys[a].includes(e.keyCode)
        })
        if (action) {
          x.actionKeyPressed[action] = false;
        }
        /*
        this.threeWorker.postMessage({
          task: "keyup",
          data: e.keyCode
        })
        */
      })



      var x = this;
      this.resize = function(e) {


        x.renderer.setSize( window.innerWidth, window.innerHeight );

        if (x.fxaaPass) {
          x.fxaaPass.setSize( window.width, window.height)
        }

        if (x.composer)
          x.composer.setSize( window.innerWidth, window.innerHeight)
        if (x.camera instanceof THREE.PerspectiveCamera) {
          x.camera.aspect = window.innerWidth / window.innerHeight;
          x.camera.updateProjectionMatrix();
        }



        //this.offCanvas.width = window.innerWidth;
        /*
        x.bmpCanvas.width = window.innerWidth;
        x.bmpCanvas.height = window.innerHeight;

        x.threeWorker.postMessage({
          task: "resize",
          data: { width: window.innerWidth, height: window.innerHeight },
        })
        */
      }

      window.addEventListener('resize', this.resize)


      window.addEventListener('mousemove', e => {
        x.mouse.dx = e.movementX //-1 + 2 * (x.renderer.domElement.width / 2 + e.movementX) / x.renderer.domElement.width;
        x.mouse.dy = e.movementY // -1 + 2 * (x.renderer.domElement.height / 2 + e.movementY) / x.renderer.domElement.height;

        /*
        x.threeWorker.postMessage({
          task: "mousemove",
          data: { dx: x.mouse.dx, dy: x.mouse.dy }
        })
        */
      });

      // Set up Ammo.js

      x.loadGLTFScene(__dirname + './scenes/title.glb')
      .then(() => {
        x.clockDraw = new THREE.Clock();
        x.deltaTime = 1
        //x._update(1);
        x.renderer.setAnimationLoop(() => {
          x._render()
        })
        x.resize()
      })


      this.socket = new xSocket(this);
    }

    setScene(scene) {

    }

    setOverlay(overlay, options) {
      var str =  ejs.render( fs.readFileSync(__dirname + '/html/' + overlay).toString(), {}, options )

      document.body.innerHTML = str;

      var v = document.getElementById('viewport')
      if (v) {
        v.appendChild(this.renderer.domElement)
      }
    }

    loadObjectScene(file) {
      var x = this;
      return new Promise((resolve, reject) => {
        x.objloader.load(
        	// resource URL
        	file,

        	// onLoad callback
        	// Here the loaded data is assumed to be an object
        	function ( obj ) {
        		// Add the loaded object to the scene
        		resolve(scene)
        	},

        	// onProgress callback
        	function ( xhr ) {
        		console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
        	},

        	// onError callback
        	function ( err ) {
        		reject(err);
        	}
        );


        // Alternatively, to parse a previously loaded JSON structure
        //const object = loader.parse( a_json_object );
      })

    }

    toToonMaterial(m) {
  		var shader = new THREE.MeshToonMaterial()

  		shader.skinning = true
  		shader.transparent = true
  		if (m.map) {
  			 shader.map = m.map
  		}

      shader.magFilter = THREE.NearestFilter;
      shader.minFilter = THREE.NearestMipMapNearestFilter

  		if (m.color)
  			shader.color = m.color

  		if (m.specular)
  			shader.specular = m.specular

  		if (m.roughness)
  			shader.roughness = m.roughness

  		if (m.metallic)
  			shader.metallic = m.metallic

  		if (m.alpha)
  			shader.alpha = m.alpha

  		if (m.alphaMap)
  			shader.alphaMap = m.alphaMap

  		shader.alphaTest = m.alphaTest
  		shader.blending = m.blending
  		shader.blendSrcAlpha = m.blendSrcAlpha
  		shader.blendSrc = m.blendSrc
  		shader.blendEquationAlpha = m.blendEquationAlpha
  		shader.blendEquation = m.blendEquation
  		shader.blendDstAlpha = m.blendDstAlpha
  		shader.blendDst = m.blendDst
  		shader.emissive = m.emissive
  		shader.emissiveMap = m.emissiveMap

   		shader.gradientMap = m.gradientMap
  		shader.displacementMap = m.displacementMap
  		shader.alphaMap = m.alphaMap

  		shader.normalMap = m.normalMap
  		shader.normalMapType = m.normalMapType

  		shader.depthFunc = m.depthFunc
  		shader.depthTest = m.depthTest
  		shader.side = m.side
  		shader.shadowSide = m.shadowSide
  		shader.lightMap = m.lightMap
  		shader.shininess = 0;
  		shader.side = m.side
  		shader.shadowSide = m.shadowSide
  		shader.color.convertSRGBToLinear();
  		shader.anisotropy  = 0
      shader.transparent = true
      shader.opacity = m.opacity

      shader.side = THREE.FrontSide

  		return shader
  	}

    loadGLTF(file, onLoading) {
      var x = this;
      return new Promise((resolve, reject) => {
        x.loader.load(__dirname + '/' + file,
          function (glb) {
            resolve(glb)
          },
          function (xhr) {
            if (onLoading) onLoading(xhr)
          },
          function (err) {
            reject(err)
          }
        )

      })
    }

    loadGLTFModel(file, onLoading) {
      var x = this;
      return new Promise((resolve, reject) => {
        x.loader.load(
        	// resource URL
        	__dirname + '/resources/' + file,
        	// called when the resource is loaded
        	function ( gltf ) {

            gltf.scene.traverse(obj => {
              obj.visible = !(obj.userData['visible'] === 0)
            })



        		resolve(gltf);
        	},
        	// called while loading is progressing
        	function ( xhr ) {

            if (onLoading)
        		  onLoading(xhr);

        	},
        	// called when loading has errors
        	function ( error ) {

        		reject(error)

        	}
        );
      })
    }

    loadGLTFScene(file, onLoading) {

      var xtrap = this;
      xtrap.scene.remove.apply(xtrap.scene, xtrap.scene.children);
      return new Promise((resolve, reject) => {
          var x = xtrap;
          xtrap.loader.load(
        	// resource URL
        	file,
        	// called when the resource is loaded
        	function ( glb ) {



            x.mixer = new THREE.AnimationMixer( glb.scene );
            x.clips = glb.animations;

            x.clips.forEach(cl => {
              const clip = THREE.AnimationClip.findByName( x.clips, cl.name );
              const action = x.mixer.clipAction( clip );
              action.play();
            })




            console.log(glb)

            x.scene = new THREE.Scene()
            x.scene.add(glb.scene)

            if (glb.scene.userData['fog_enabled'] == 1) {
              console.log('Enabling fog')
              var c = glb.scene.userData['fog_color'] || [0, 0, 0];

              x.scene.fog = new THREE.FogExp2(new THREE.Color(c[0], c[1], c[2]), glb.scene.userData['fog_intensity'] )

            }
            x.scene.background = new THREE.Color(0, 0, 0)



            x.scene.traverse(async obj => {


              obj.castShadow = !(obj.userData['cast_shadow'] == 0)
              obj.receiveShadow = !(obj.userData['receive_shadow'] == 0)



              if (obj.userData['ambient']) {
                const light = new THREE.AmbientLight( obj.userData['ambient'] )
                x.scene.add(light)
              }


              obj.visible = !(obj.userData['visible'] == 0)



              if (obj.material) {

                //obj.material = x.toToonMaterial(obj.material)
                obj.material.depthWrite = true;
                //obj.material.bumpMap = obj.material.map;
                //obj.material.bumpMap = obj.material.normalMap
                obj.material.bumpScale = 1

                //obj.material.transparent = true
                //obj.material.depthTest = true
                //obj.material.alphaTest = 0.01
              }

              if (obj instanceof THREE.PointLight) {
                obj.castShadow = true;
                obj.shadow.bias = -0.003
                obj.shadow.mapSize.width = 512;
                obj.shadow.mapSize.height = 512;
                obj.shadow.mapType = THREE.PCFSoftShadowMap
                if (obj.distance > 500) obj.distance = 500;
              }

              if (obj instanceof THREE.SpotLight) {
                obj.castShadow = true;
                obj.shadow.bias = -0.0003
                obj.shadow.mapSize.width = 512;
                obj.shadow.mapSize.height = 512;
                obj.shadow.mapType = THREE.PCFSoftShadowMap
                if (obj.userData['lense_flare'])

  /*
                var t = new THREE.TextureLoader();
                var flare0 = t.load("resources/flare0.png")

                var flare = new Lensflare()
                flare.addElement( new LensflareElement(flare0, 512, 0))
                obj.add(flare)
  */
                if (obj.distance > 500) obj.distance = 500;
    /*
                  const spotLightHelper = new THREE.SpotLightHelper( obj );
                  console.log(spotLightHelper)
                  //spotLightHelper.visible = false;



                  x.scene.add(spotLightHelper)
                  var mesh = new THREE.Mesh(spotLightHelper.cone.geometry, new THREE.MeshBasicMaterial({
                    color: 0xFF0000
                  }))
                  spotLightHelper.add( mesh );
                  mesh.position.copy(obj.position)
                  */

              }

              if (obj.userData['model']) {
                var gltf = await x.loadGLTFModel(obj.userData['model'])

                obj.clips = gltf.animations

                gltf.scene.name = obj.userData['model']


                let bbox = new THREE.Box3().setFromObject(gltf.scene)//.applyMatrix4(gltf.scene.matrix)

                gltf.scene.position.copy(obj.position)
                gltf.scene.quaternion.copy(obj.quaternion)

                if (gltf.scene.userData['ammo_enabled']) {

                  gltf.scene.body = x.loadPhysics(gltf.scene)

                }
                var sh =  obj.children.find(c => c.userData['tpye'] == 'collision_shape')
                if (sh)
                {
                  sh.rotation.set(0, 0, 0)
                  sh.updateMatrix()
                  bbox = new THREE.Box3().setFromObject(sh)//.applyMatrix4(gltf.scene.matrix)
                } else {
                  gltf.scene.rotation.set(0, 0, 0)
                  gltf.scene.updateMatrix();
                  bbox = new THREE.Box3().setFromObject(gltf.scene)//.applyMatrix4(gltf.scene.matrix)
                }

                //gltf.scene.position.copy(obj.position)
                  // XXX
                  obj.remove(sh)
                  obj.add(gltf.scene)
              }

              if (obj.userData['ammo_enabled']) {
                obj.body = x.loadPhysics(obj)

              }

              if (obj.userData['script']) {
                obj.engine = x;
                x.loadScript(obj, obj.userData['script'])
              }

              if (obj.onInitialize)
                obj.onInitialize();
            })

            /*
            var skyGeo = new THREE.SphereGeometry(256, 25, 25);
            var loader  = new THREE.TextureLoader(),
            texture = loader.load( "resources/stars.jpg" );
            var material = new THREE.MeshPhongMaterial({
              map: texture,
              shading: THREE.FlatShading
            });


            var sky = new THREE.Mesh(skyGeo, material);
            sky.material.side = THREE.BackSide;
            x.scene.add(sky);
            */


            x.resize()





            //x.composer = new THREE.EffectComposer(x.renderer);
            //x.composer.addPass(new THREE.EffectComposer.RenderPass(x.scene, x.camera))
            //var effect = new EffectComposer.ShaderPass(DotScreenShader)
            //x.composer.addPass(effect)

            x.camera = glb.cameras[0]
            //x.camera = glb.cameras[0]
            if (glb.scene.userData['camera'])
              var camera = glb.scene.userData['camera']


                x.composer = new THREE.EffectComposer(x.renderer);

              var renderPass = new THREE.RenderPass(x.scene, x.camera);
              x.composer.addPass( renderPass );
                var effectCopy = new THREE.ShaderPass(THREE.CopyShader);


              var bokehPass = new THREE.BokehPass(x.scene, x.camera, {
  					focus: -1.0,
  					aperture: 0.00005,
  					maxblur: 1,

  					width: window.width,
  					height: window.height
  				});
              x.bokehPass = bokehPass
              x.composer.addPass( bokehPass );

              const effectController = {

  					focus: 500.0,
  					aperture: 5,
  					maxblur: 0.01

  				};

          var bloomPass = new THREE.BloomPass(1, 5, 0.4, 1024)
          x.composer.addPass(bloomPass);
          x.composer.addPass(effectCopy);

  					//bokehPass.uniforms[ "focus" ].value = effectController.focus;
  					//bokehPass.uniforms[ "aperture" ].value = effectController.aperture * 0.00001;
					//bokehPass.uniforms[ "maxblur" ].value = effectController.maxblur;


            //var glitchPass = new THREE.RenderPass(x.scene, x.camera);
            //x.composer.addPass( glitchPass );

          //  x.renderer.compile(x.scene, x.camera)
          if (glb.scene.userData['script'])
            x.loadScript(x.scene, glb.scene.userData['script'])

          if (x.scene.onInitialize) {
            x.scene.onInitialize()
          }

      		resolve(glb)

      	},
      	// called while loading is progressing
      	function ( xhr ) {

          if (onLoading)
      		  onLoading(xhr)

      	},
      	// called when loading has errors
      	function ( error ) {

      		reject(error)

      	}
      );
    })
  }

  initPhysics() {

  }

  chat(e) {
    var t = document.createElement('div')
    t.innerHTML = (e.sender ? `[${e.sender}] ` : ``) + `${e.text}`
    var chat = document.getElementById('chat')
    chat.appendChild(t)
    chat.scrollTop = chat.scrollHeight

    console.log(e)
  }

  loadPhysics(obj, collision) {
    if (obj.body) return obj.body;
    let bbox;
    let shape;
    obj.traverse(o => {
      if (o.userData['type'] == 'collision_shape')
        shape = o;
    })

    if (obj.userData['ammo_type'] == AMMO_TYPES.TRIMESH && obj.geometry) {

      const geometry = new THREE.Geometry().fromBufferGeometry(obj.geometry);
      geometry.computeVertexNormals()
      geometry.applyMatrix4(obj.matrixWorld)
      var faces = geometry.faces,
      vertices = geometry.vertices,
      meshInfo = [];

      faces.forEach(function (f, i, arr) {

      var convex = [{ x: vertices[f.a].x, y: vertices[f.a].y, z: vertices[f.a].z },
       { x: vertices[f.b].x, y: vertices[f.b].y, z: vertices[f.b].z },
       { x: vertices[f.c].x, y: vertices[f.c].y, z: vertices[f.c].z }];
      f.d && convex.push({ x: vertices[f.d].x, y: vertices[f.d].y, z: vertices[f.d].z });

       meshInfo.push(convex);
      });

      this.sabWorker.postMessage({
        task: "addTrimesh",
        name: obj.name,
        position: {
          x: obj.position.x,
          y: obj.position.y,
          z: obj.position.z,
        },
        quaternion: {
          x: obj.quaternion.x,
          y: obj.quaternion.y,
          z: obj.quaternion.z,
          w: obj.quaternion.w
        },
        meshInfo: meshInfo,
        mass: obj.userData['mass'] || 0,
        friction: obj.userData['friction'],
        collision: obj.userData['collision'] || collision
      })
    } else
    {
      if (shape) {
        obj.rotation.set(0, 0, 0)
        shape.updateMatrix();
        bbox = new THREE.Box3()
        shape.geometry.computeBoundingBox()
        bbox.copy(shape.geometry.boundingBox)

        bbox.sz = {
          x: bbox.max.x - bbox.min.x,
          y: bbox.max.y - bbox.min.y,
          z: bbox.max.z - bbox.min.z
        }
        shape.parent.remove(shape)

        obj.shape = shape;

      } else
      {
        //obj.updateMatrixWorld()
        obj.rotation.set(0,0,0);
        obj.updateMatrix();
        bbox = new THREE.Box3();
        if (obj.geometry) {
          obj.updateMatrixWorld()
          obj.geometry.computeBoundingBox();
          bbox.copy(obj.geometry.boundingBox)
          .applyMatrix4(obj.matrixWorld)

          /*
          const geometry = new THREE.Geometry().fromBufferGeometry(obj.geometry);
          console.log(geometry.faces)
        var faces = geometry.faces,
         vertices = geometry.vertices,
         meshInfo = [];

               faces.forEach(function (f, i, arr) {
                   var convex = [{ x: vertices[f.a].x, y: vertices[f.a].y, z: vertices[f.a].z },
                   { x: vertices[f.b].x, y: vertices[f.b].y, z: vertices[f.b].z },
                                   { x: vertices[f.c].x, y: vertices[f.c].y, z: vertices[f.c].z }];
                   f.d && convex.push({ x: vertices[f.d].x, y: vertices[f.d].y, z: vertices[f.d].z });

                   meshInfo.push(convex);
               });
               */
        // Physics worker

      } else if (obj.userData['ammo_type'] == AMMO_TYPES.BOX){
          bbox.setFromObject(obj)
        }


        bbox.sz = {
          x: bbox.max.x - bbox.min.x,
          y: bbox.max.y - bbox.min.y,
          z: bbox.max.z - bbox.min.z
        }

        /*
        this.sabWorker.postMessage({ task: "addObjectToSimulationWorld", meshName: obj.name, shape: "box", angularFactor: obj.userData['angularFactor'], friction: 0.8, restitution: 0.7, mass: 5,
          pos: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
          rot: { x: obj.quaternion.x, y: obj.quaternion.y, z: obj.quaternion.z, w: obj.quaternion.w }, box: { x: bbox.max.x - bbox.min.x, y: bbox.max.y - bbox.min.y, z: bbox.max.z - bbox.min.z }
        });
        */
      }

      obj.sz = bbox.sz;

    this.sabWorker.postMessage({
      task: "add",
      name: obj.name,
      position: {
        x: obj.position.x,
        y: obj.position.y,
        z: obj.position.z,
      },
      quaternion: {
        x: obj.quaternion.x,
        y: obj.quaternion.y,
        z: obj.quaternion.z,
        w: obj.quaternion.w
      },
      angularFactor: obj.userData['angular_factor'],
      sz: obj.sz,
      mass: obj.userData['mass'] || 0,
      friction: obj.userData['friction'],
      collision: obj.userData['collision'] || collision
    })

    }

    return obj.body;
  }

  _handlePort(xtrap, e) {
    console.log('Worker return.', xtrap)

    this.portHandlers[e.data.handler](xtrap, e.data.data)
  }

  loadScript(obj, file) {
    var script = require('./scripts/' + file);

    obj.onInitialize = script.onInitialize
    //obj.onUpdateEnabled = obj.userData['onUpdateEnabled'] ? (!obj.userData['onUpdateEnabled'] === 'false') : true
    obj.onUpdate = script.onUpdate
    obj.onUse = script.onUse

    return obj;
  }

  lockPointer() {
    this._pointerLocked = true;
    this.renderer.domElement.requestPointerLock();
  }

  unlockPointer() {
    this._pointerLocked = false;
    document.exitPointerLock();
  }

  togglePointerLock() {
    if (this._pointerLocked)
      this.unlockPointer();
    else
      this.lockPointer()
  }

  update(dt) {

    this.emit('update')

    if (this.mixer)
      this.mixer.update(dt)



    this.scene.traverse(obj => {



      if (obj.onUpdate) {
          obj.onUpdate(dt)
      }

      if (obj.sab) {
        obj.position.set(obj.sab[0], obj.sab[1], obj.sab[2])
        obj.quaternion.set(obj.sab[3], obj.sab[4], obj.sab[5], obj.sab[6])
      }

      if (obj.body && false) {



        /*
        var body = obj.body
        if (obj.body.needsUpdate || obj.userData['animated']) {


          var tr  = new Ammo.btTransform();
          tr.setIdentity()
          tr.setOrigin( new Ammo.btVector3(
            obj.position.x,
            obj.position.y,
            obj.position.z
          ))

          tr.setRotation( new Ammo.btQuaternion(
            obj.quaternion.x,
            obj.quaternion.y,
            obj.quaternion.z,
            obj.quaternion.w,
          ));
          obj.body.setWorldTransform(tr);


        }
          if (body.getMotionState()) {


            var body = obj.body;
            body.getMotionState().getWorldTransform(trans);
            //print("world pos = " + [trans.getOrigin().x().toFixed(2), trans.getOrigin().y().toFixed(2), trans.getOrigin().z().toFixed(2)]);
            obj.position.set(
              trans.getOrigin().x(),
              trans.getOrigin().y(),
              trans.getOrigin().z(),
            )
            obj.quaternion.set(
              trans.getRotation().x(),
              trans.getRotation().y(),
              trans.getRotation().z(),
              trans.getRotation().w(),
            )

        }
          */

      }

    })

    if (this.actionKeyPressed['unlockPointer']) {
      this.togglePointerLock();

      // XXX

      var tb = document.getElementById('textbox')


      this.actionKeyPressed['unlockPointer'] = false;

      if (this._pointerLocked)
      {
        tb.style.display = 'none'
      }
        else
        {
          tb.style.display = 'flex'
        }
    }


  }

  render(xtrap) {
    /*
    if (!xtrap.simulating) {
          xtrap.simulating = true;
          xtrap.ammoWorker.postMessage({ task: "simulate", dt: 1/60 });
      }
      */
    if (xtrap.camera && xtrap.camera instanceof THREE.PerspectiveCamera)
    {
      //xtrap.composer.render(this.deltaTime);
      //xtrap.composer.render()
      xtrap.composer.render()
      //xtrap.renderer.render(xtrap.scene, xtrap.camera);
    }
      //



  }



  _render() {

    this.deltaTime = this.clockDraw.getDelta()
		if (this.deltaTime < 1/60) {

      this.update(this.deltaTime);
			this.render(this)
    }


    /*
    window.requestAnimationFrame(() => {
      var d = 1/60 - this.deltaTime
      if (d < 0) d = 1/60
      setTimeout(() => {

      }, d)
    })
    */
  }
  _physics(dt) {
    return;
    this.deltaPhysics = this.clockPhysics.getDelta();
    var d = 1;
    if (this.deltaPhysics < 1/60) {
      d = 1/60 - this.deltaPhysics
    }

    setTimeout(() => {
      this._physics()
    }, 1000/60)

  }

  _update() {
    /*
    //this.physicsUpdate = this.clockPhysics.getDelta()
    setInterval(async () => {

      //this.world.stepSimulation(this.deltaUpdate, 30)



            this.deltaUpdate = this.clockUpdate.getDelta()
              if (this.deltaUpdate < 1000/60) {
                var t1 = Date.now()
                this.update(this.deltaUpdate);
                var t2 = Date.now()
                //this.world.stepSimulation((this.deltaUpdate + (t2-t1)*0.01), 30);
              }





    }, 1000/60)
    */
    /*

		let d = 0;
		if (this.deltaUpdate + this.clockUpdate.getDelta() < this.updateFPS) {
			d = this.updateFPS - (this.deltaUpdate + this.clockUpdate.getDelta())
		}
    if (d < 0) d = 1;
		requestAnimationFrame(() => {
			this._update()
		})

    */
  }

  setDialog(text) {
    clearTimeout(this.dialogTimeout)


        var d = document.getElementById('dialog')
        d.innerHTML = text;

        this.dialogTimeout = setTimeout(() => {
          d.innerHTML = "";
        }, text.length * 160)

  }
}
module.exports = xTrap
