/* -*- js-indent-level: 8 -*- */
/* globals window, console, document, THREEx, THREE, Stats, Detector, requestAnimationFrame */
/*
 * 	OuluThreeJS
 * 	@author Tapani Jamsa
 * 	@author Erno Kuusela
 * 	Date: 2013
 */
"use strict";
// MAIN

var container, scene, carCamera, flyCamera, renderer, flyControls, stats, rendererStats, directionalLight;
var flyMode = false;
var clock = new THREE.Clock();
var time = Date.now();
var car;
var oulu = new GRID.Block();
var gridManager = new GRID.Manager();
// var tester = new GRID.Tester();
var ouluClones = [];
// var clonePosition = {
// 	x: 0,
// 	z: 0
// };
// var cloneOffset = 370;
// var cloneAmount = 2;

// Debug draw colliders
var debugMode = false;


var controlsCar = {
	moveForward: false,
	moveBackward: false,
	moveLeft: false,
	moveRight: false

};

init();
animate();

// FUNCTIONS	

function init() {

	// SCENE
	scene = new THREE.Scene();
	// CAR CAMERA
	var SCREEN_WIDTH = window.innerWidth,
		SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45,
		ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
		NEAR = 0.1,
		FAR = 20000;
	carCamera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(carCamera);
	carCamera.position.set(0, 0, 0);
	// FLY CAMERA
	flyCamera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(flyCamera);
	flyCamera.position.set(0, 0, 0); // don't touch this! modify freelook.js --> yawObject.position instead
	// RENDERER
	if (Detector.webgl)
		renderer = new THREE.WebGLRenderer({
			antialias: true
		});
	else
		renderer = new THREE.CanvasRenderer();
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);

	// For shadows
	// renderer.shadowMapEnabled = true;
	// renderer.shadowMapSoft = true;

	// renderer.shadowCameraNear = 3;
	// renderer.shadowCameraFar = camera.far;
	// renderer.shadowCameraFov = 50;

	// renderer.shadowMapBias = 0.0039;
	// renderer.shadowMapDarkness = 0.5;
	// renderer.shadowMapWidth = 1024;
	// renderer.shadowMapHeight = 1024;

	container = document.getElementById('ThreeJS');
	container.appendChild(renderer.domElement);
	// EVENTS
	THREEx.WindowResize(renderer, carCamera);

	THREEx.FullScreen.bindKey({
		charCode: 'm'.charCodeAt(0)
	});

	document.addEventListener('keydown', onKeyDown, false);
	document.addEventListener('keyup', onKeyUp, false);
	// FLY CONTROLS
	// flyControls = new THREE.FlyControls(camera);
	// flyControls.movementSpeed = 1000;
	// flyControls.domElement = renderer.domElement;
	// flyControls.rollSpeed = Math.PI / 12; // Math.PI / 24
	// flyControls.autoForward = false;
	// flyControls.dragToLook = true;
	flyControls = new THREE.PointerLockControls(flyCamera);
	flyControls.enabled = false;
	scene.add(flyControls.getObject());
	// STATS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild(stats.domElement);
	// RENDERER STATS
	rendererStats = new THREEx.RendererStats();
	rendererStats.domElement.style.position = 'absolute';
	rendererStats.domElement.style.left = '0px';
	rendererStats.domElement.style.bottom = '200px';
	container.appendChild(rendererStats.domElement);
	// White directional light at half intensity shining from the top.
	directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
	directionalLight.position.set(100, 100, 100);
	directionalLight.castShadow = true;
	scene.add(directionalLight);

	////////////
	// CUSTOM //
	////////////

	//JSON

	// Note: if imported model appears too dark,
	//   add an ambient light in this file
	//   and increase values in model's exported .js file
	//    to e.g. "colorAmbient" : [0.75, 0.75, 0.75]
	// var jsonLoader = new THREE.JSONLoader();
	var masterscene_file = "Masterscene.js";

	// jsonLoader.load(masterscene_file, function(geometry, material) {
	// 	console.log("load 1st scene");
	// 	addOuluModelToScene(geometry, material, "oulu");

	// 	for (var i = 0; i < cloneAmount; i++) {
	// 		window.setTimeout(function() {
	// 			jsonLoader = new THREE.JSONLoader();
	// 			console.log("unloading prev assets before loading new clone");
	// 			unloadAssets();
	// 			jsonLoader.load(masterscene_file, function(geometry, material) {
	// 				addOuluModelToScene(geometry, material, "oulu");
	// 			});
	// 		}, 5000*(i+1));

	// 	}

	// });

	// jsonLoader.load("ColliderBuildings.js", function(geometry, material) {
	// 	addColliderModelToScene(geometry, material, "colliderbuildings");
	// });
	// jsonLoader.load("ColliderGround.js", function(geometry, material) {
	// 	addColliderModelToScene(geometry, material, "colliderground");
	// });
	// addModelToScene function is called back after model has loaded

	var ambientLight = new THREE.AmbientLight(0x6b6b6b);
	scene.add(ambientLight);

	// CAR

	car = new THREE.Car();

	car.modelScale = 0.8;
	car.backWheelOffset = 0.02;

	car.MAX_SPEED = 0.6; //0.9 , 25
	car.MAX_REVERSE_SPEED = -0.5; //-15
	car.FRONT_ACCELERATION = 0.4; //12
	car.BACK_ACCELERATION = 0.5; //15

	car.WHEEL_ANGULAR_ACCELERATION = 1; //1.5

	car.FRONT_DECCELERATION = 0.5; //10
	car.WHEEL_ANGULAR_DECCELERATION = 1; //1.0

	car.STEERING_RADIUS_RATIO = 0.23; //0.23

	car.callback = function(object) {
		addCar(object, -75, 11.5, 0, 1); //addCar(object, 142, 15, -20, 1);
	};

	car.loadPartsJSON("GreenCar.js", "GreenCar.js");

	// GRID
	// gridManager.setTarget(car.root.position);
	gridManager.target = {
		x: function() {
			return car.root.position.x
		},
		z: function() {
			return car.root.position.z
		}
	};
	gridManager.init();


}

function addCar(object, x, y, z, s) {
	// console.log("Add car");

	object.root.position.set(x, y, z);
	scene.add(object.root);

	// object.root.castShadow = true;
	// object.root.receiveShadow = true;
}

var texcache = {};
var useTexcache = true;
var unloadAssets, doLoadAssets;
var loadAssetsAtStartup = true;

function loadTexture(path) {
	if (typeof(path) !== "string")
		throw ("bad path " + path);
	var tex = THREE.ImageUtils.loadCompressedTexture(path);
	tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
	tex.repeat.set(1, 1);
	tex.minFilter = tex.magFilter = THREE.LinearFilter;
	tex.anisotropy = 4;
	return tex;
}

function addColliderModelToScene(geometry, origMaterials, type, newBlock) {
	var faceMaterial, newMesh;
	var placeholderTexture = loadTexture("images/balconieRailings.dds");
	faceMaterial = new THREE.MeshFaceMaterial(origMaterials);
	newMesh = new THREE.Mesh(geometry, faceMaterial);

	// Todo refactor this
	if (newBlock) {
		newMesh.position.set(newBlock.gridPosition.x * gridManager.size, 0, newBlock.gridPosition.z * gridManager.size);
		newMesh.rotation.y = 45 * Math.PI / 180;
	}
	if (debugMode === false) {
		newMesh.visible = false;
	}
	if (type == "colliderbuildings") {
		if (newBlock) {
			newBlock.colliders[0] = newMesh;
		}
	} else if (type == "colliderground") {
		if (newBlock) {
			newBlock.colliders[1] = newMesh
		}
	}

	newMesh.scale.set(1.5, 1.5, 1.5);

	scene.add(newMesh);
}

function addOuluModelToScene(group, newBlock) {
	// console.log("addOuluModelToScene");
	// console.log(newBlock);
	// console.log(group);
	var disposables = [];
	var newMesh, newTexture;
	var basicMaterial;
	var placeholderTexture = loadTexture("images/balconieRailings.dds");
	var newMaterials = [];
	var realTextures = [];

	// function regDisposable(x) {

	// loop children[i].geometry for group

	// if (typeof(x.dispose) !== "function")
	// 	throw ("doesn't have a .dispose(): " + x);
	// disposables.push(x);
	// }
	// regDisposable(newMesh.geometry);

	// for (var i = 0; i < group.children.length; i++) {
	// 	// for (var i = 0; i < group.children[k].material.length; i++) {
	// 	// regDisposable(group.children[k].material[i]);
	// 	// debugger;
	// 	if (group.children[i].material.map) {
	// 		// debugger;
	// 		//  JPG TO DDS
	// 		var ddsName = group.children[i].material.map.sourceFile.substr(0, group.children[i].material.map.sourceFile.lastIndexOf(".")) + ".dds";
	// 		console.log("ddsName: " + ddsName);
	// 		var texpath = "./images/" + ddsName;
	// 		if (loadAssetsAtStartup) {
	// 			if (useTexcache && texcache.hasOwnProperty(texpath))
	// 				newTexture = texcache[texpath];
	// 			else
	// 				newTexture = texcache[texpath] = loadTexture(texpath);

	// 			basicMaterial = new THREE.MeshBasicMaterial({
	// 				map: newTexture
	// 			});
	// 		} else {
	// 			realTextures[i] = texpath;
	// 			basicMaterial = new THREE.MeshBasicMaterial({
	// 				//color: 0xaabbcc,
	// 				map: placeholderTexture,
	// 			});
	// 		}
	// 		// regDisposable(basicMaterial);
	// 		newMaterials.push(basicMaterial);
	// 	} else {
	// 		newMaterials.push(group.children[i].material);
	// 		// console.log("png: " + i);
	// 	}
	// 	// }
	// 	var faceMaterial = new THREE.MeshFaceMaterial(newMaterials);
	// 	console.log("faceMaterial");
	// 	console.log(faceMaterial);
	// 	group.children[i] = new THREE.Mesh(group.children[i].geometry, faceMaterial);


	// }
	// Todo refactor this
	if (group) {

		group.position.set(newBlock.gridPosition.x * gridManager.size, 0, newBlock.gridPosition.z * gridManager.size);
		// newMesh.rotation.y = 45 * Math.PI / 180;
		newBlock.mesh = group;
		// console.log("group: ");
		// console.log(group);
	}

	unloadAssets = function() {
		// // note: this code currently works only when loadAssetsAtStartup is on
		// scene.remove(newMesh);
		// for (var i = 0; i < disposables.length; i++) {
		// 	var d = disposables[i];
		// 	d.dispose();
		// 	if (d instanceof THREE.Geometry) {
		// 		console.log("after dispose with geom, faces", d.faces.length, "uvs", d.faceVertexUvs.length);
		// 		d.faces.length = 0;
		// 		d.vertices.length = 0;
		// 		d.faceVertexUvs.length = 0;
		// 	}
		// }
		// disposables.length = 0; // yes, really the way to clear js arrays
		// for (var key in texcache)
		// 	if (texcache.hasOwnProperty(key)) {
		// 		texcache[key].dispose();
		// 		delete texcache[key].image;
		// 		delete texcache[key].mimpaps;
		// 		delete texcache[key];
		// 	}
		// 	// console.log("done");
	};
	doLoadAssets = function() {
		console.log("loading", realTextures.length, "textures");
		var nchanged = 0;
		for (var i = 0; i < realTextures.length; i++) {
			// oulu.material.materials[i].map = loadTexture(realTextures[key]);
			var m = oulu.material.materials[i];
			if (m === undefined)
				console.log("material", i, "was undefined");
			else if (realTextures[i] !== undefined) {
				m.map = loadTexture(realTextures[i]);
				m.needsUpdate = true;
				nchanged++;
			}
		}
		console.log("done", nchanged);
	};

	// oulu.castShadow = true;
	// oulu.receiveShadow = true;

	group.scale.set(1.5, 1.5, 1.5);

	scene.add(group);
}


function animate() {
	requestAnimationFrame(animate);
	render();
	update();
}

function setFlyMode(flying) {
	if (flying === true || flying === false) {
		flyMode = flying;
		flyControls.dragging = false;
		flyControls.enabled = flying;
		if (flying === true) {
			THREEx.WindowResize(renderer, flyCamera);
		} else {
			THREEx.WindowResize(renderer, carCamera);
		}
	} else {
		console.log("setFlyMode illegal parameter");
	}
}

function update() {
	var delta = clock.getDelta(); // seconds.

	if (flyMode === true) {
		// flyControls.movementSpeed = delta * 10000;
		// flyControls.update(delta);

		flyControls.update(Date.now() - time);
	} else {
		if (car && car.bodyMesh) {
			var relativeCameraOffset = new THREE.Vector3(0, 3, -15);

			var cameraOffset = relativeCameraOffset.applyMatrix4(car.bodyMesh.matrixWorld);

			carCamera.position.x = cameraOffset.x;
			carCamera.position.y = cameraOffset.y;
			carCamera.position.z = cameraOffset.z;
			carCamera.lookAt(car.root.position);
			carCamera.position.y += 3;
		}

		// update car model
		car.updateCarModel(delta, controlsCar);
	}

	gridManager.update(delta);
	stats.update();
	rendererStats.update(renderer);
}

function render() {
	if (flyMode) {
		renderer.render(scene, flyCamera);
	} else {
		renderer.render(scene, carCamera);
	}
}

function onKeyDown(event) {

	switch (event.keyCode) {

		case 38:
			/*up*/
			controlsCar.moveForward = true;
			break;
		case 87:
			/*W*/
			controlsCar.moveForward = true;
			break;

		case 40:
			/*down*/
			controlsCar.moveBackward = true;
			break;
		case 83:
			/*S*/
			controlsCar.moveBackward = true;
			break;

		case 37:
			/*left*/
			controlsCar.moveLeft = true;
			break;
		case 65:
			/*A*/
			controlsCar.moveLeft = true;
			break;

		case 39:
			/*right*/
			controlsCar.moveRight = true;
			break;
		case 68:
			/*D*/
			controlsCar.moveRight = true;
			break;
		case 70:
			/*F*/
			setFlyMode(!flyMode);
			break;

	}

}

function onKeyUp(event) {

	switch (event.keyCode) {

		case 38:
			/*up*/
			controlsCar.moveForward = false;
			break;
		case 87:
			/*W*/
			controlsCar.moveForward = false;
			break;

		case 40:
			/*down*/
			controlsCar.moveBackward = false;
			break;
		case 83:
			/*S*/
			controlsCar.moveBackward = false;
			break;

		case 37:
			/*left*/
			controlsCar.moveLeft = false;
			break;
		case 65:
			/*A*/
			controlsCar.moveLeft = false;
			break;

		case 39:
			/*right*/
			controlsCar.moveRight = false;
			break;
		case 68:
			/*D*/
			controlsCar.moveRight = false;
			break;
	}

}

function getNextClonePosition(pos) {
	/* 
	 * 12 13 14 15
	 * 6  7  8  11
	 * 2  3  5  10
	 * 0  1  4  9
	 *
	 */

	// Increase position for the next part
	if (pos.x == pos.z) { // at equal corner
		pos.x++;
		pos.z = 0;
	} else if (pos.x == (pos.z + 1)) { //at disequal corner
		pos.x = 0;
		pos.z++;
	} else {
		if (pos.x < pos.z) { // increase x
			pos.x++;
		} else {
			pos.z++; // increase y
		}
	}

	return pos;
}


function hackMaterials(origMaterials) {
	var stime = performance.now();
	var basicMaterial;
	var placeholderTexture = loadTexture("images/balconieRailings.dds");
	var newMaterials = [];
	var newTexture;
	var realTextures = [];

	for (var i = 0; i < origMaterials.length; i++) {

		var m = origMaterials[i];

			// regDisposable(origMaterials[i]);
			if (m.map) {
				//  JPG TO DDS
				var ddsName = m.map.sourceFile.substr(0, m.map.sourceFile.lastIndexOf(".")) + ".dds";
				// console.log("ddsName: " + ddsName);
				var texpath = "./images/" + ddsName;
				if (loadAssetsAtStartup) {
					if (useTexcache && texcache.hasOwnProperty(texpath))
						newTexture = texcache[texpath];
					else
						newTexture = texcache[texpath] = loadTexture(texpath);

					basicMaterial = new THREE.MeshBasicMaterial({
						map: newTexture
					});
				} else {
					realTextures[i] = texpath;
					basicMaterial = new THREE.MeshBasicMaterial({
						//color: 0xaabbcc,
						map: placeholderTexture,
					});
				}
				// regDisposable(basicMaterial);
				newMaterials.push(basicMaterial);
			} else {
				newMaterials.push(m);
				// console.log("png: " + i);
			}

		origMaterials[ i ] = new THREE.MeshFaceMaterial(newMaterials);

		origMaterials[ i ].side = THREE.DoubleSide;
		
	}
	var etime = performance.now();
	console.log("materials took", etime-stime, "ms");
}