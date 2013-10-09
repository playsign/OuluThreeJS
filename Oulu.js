/* -*- js-indent-level: 8 -*- */
/*jslint white: true */
/*
	OuluThreeJS
	Author: Playsign
	Date: 2013
*/

// MAIN

var container, scene, carCamera, flyCamera, renderer, controls, flyControls, stats, directionalLight;
var flyMode = false;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
var time = Date.now();
var car, oulu, colliderBuildings, colliderGround;
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
	// White directional light at half intensity shining from the top.
	directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
	directionalLight.position.set(100, 100, 100);
	directionalLight.castShadow = true;
	scene.add(directionalLight);

	////////////
	// CUSTOM //
	////////////

	// Note: if imported model appears too dark,
	//   add an ambient light in this file
	//   and increase values in model's exported .js file
	//    to e.g. "colorAmbient" : [0.75, 0.75, 0.75]
	var jsonLoader = new THREE.JSONLoader();
	jsonLoader.load("Masterscene.js", function(geometry, material) {
		addModelToScene(geometry, material, "oulu");
	});
	jsonLoader.load("ColliderBuildings.js", function(geometry, material) {
		addModelToScene(geometry, material, "colliderbuildings");
	});
	jsonLoader.load("ColliderGround.js", function(geometry, material) {
		addModelToScene(geometry, material, "colliderground");
	});
	// addModelToScene function is called back after model has loaded

	var ambientLight = new THREE.AmbientLight(0x6b6b6b);
	scene.add(ambientLight);

	// CAR

	car = new THREE.Car();

	car.modelScale = 0.8;
	car.backWheelOffset = 0.02;

	car.MAX_SPEED = 0.9; //25
	car.MAX_REVERSE_SPEED = -0.5; //-15
	car.FRONT_ACCELERATION = 0.4; //12
	car.BACK_ACCELERATION = 0.5; //15

	car.WHEEL_ANGULAR_ACCELERATION = 1; //1.5

	car.FRONT_DECCELERATION = 0.5 //10
	car.WHEEL_ANGULAR_DECCELERATION = 1; //1.0

	car.STEERING_RADIUS_RATIO = 0.23; //0.23

	car.callback = function(object) {
		addCar(object, 142, 15, -20, 1); //10
	};

	car.loadPartsJSON("GreenCar.js", "GreenCar.js");


}

function addCar(object, x, y, z, s) {
	console.log("Add car");

	object.root.position.set(x, y, z);
	scene.add(object.root);

	// object.root.castShadow = true;
	// object.root.receiveShadow = true;
}

var texcache = {};
var useTexcache = false;
var allMaterials = [];
var allGeometries = [];
var unloadTextures = null;

function addModelToScene(geometry, materials, type) {

	var material, newMesh;
	var basicMaterial;
	allGeometries.push(geometry);
	if (type == "oulu" && debugMode === false) {
		var newMaterials = [];

		for (var i = 0; i < materials.length; i++) {
			if (materials[i].map) {
				//  JPG TO DDS
				var ddsName = materials[i].map.sourceFile.substr(0, materials[i].map.sourceFile.lastIndexOf(".")) + ".dds";
				// console.log("ddsName: " + ddsName);
				var texpath = "./images/" + ddsName;
				if (useTexcache && texcache.hasOwnProperty(texpath)) {
					map = texcache[texpath];
					console.log("tex cache hit: " + texpath);
				} else {
					map = texcache[texpath] = THREE.ImageUtils.loadCompressedTexture(texpath);
					map.wrapS = map.wrapT = THREE.RepeatWrapping; // for dds only
					map.repeat.set(1, 1); // for dds only
					// map = THREE.ImageUtils.loadCompressedTexture( materials[i].map.sourceFile + ".dds" );
					map.minFilter = map.magFilter = THREE.LinearFilter;
					map.anisotropy = 4;
				}
				basicMaterial = new THREE.MeshBasicMaterial({
					map: map
				})
				newMaterials.push(basicMaterial);
				allMaterials.push(basicMaterial);
			} else {
				newMaterials.push(materials[i]);
				allMaterials.push(materials[i]);
				// console.log("png: " + i);
			}
		}
		unloadTextures = function () {
			console.log("unloading textures");
			for (var i = 0; i < allMaterials.length; i++)
				allMaterials[i].dispose();
			for (var i = 0; i < allGeometries.length; i++)
				allGeometries[i].dispose();
			for (var key in texcache)
				if (texcache.hasOwnProperty(key))
					texcache[key].dispose();
			console.log("done");
		}
		material = new THREE.MeshFaceMaterial(newMaterials);
		newMesh = new THREE.Mesh(geometry, material);
		oulu = newMesh;
		// oulu.castShadow = true;
		// oulu.receiveShadow = true;

	} else if (type == "colliderbuildings") {
		material = new THREE.MeshFaceMaterial(materials);
		newMesh = new THREE.Mesh(geometry, material);
		if (debugMode == false) {
			newMesh.visible = false;
		}
		colliderBuildings = newMesh;
	} else if (type == "colliderground") {
		material = new THREE.MeshFaceMaterial(materials);
		newMesh = new THREE.Mesh(geometry, material);
		if (debugMode == false) {
			newMesh.visible = false;
		}
		colliderGround = newMesh;
	}

	newMesh.scale.set(1.5, 1.5, 1.5);

	scene.add(newMesh);
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
		flying === true ? THREEx.WindowResize(renderer, flyCamera) : THREEx.WindowResize(renderer, carCamera);
	} else {
		console.log("setFlyMode illegal parameter")
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

	stats.update();
}

function render() {
	flyMode ? renderer.render(scene, flyCamera) : renderer.render(scene, carCamera);
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

};

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

};