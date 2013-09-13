/*jslint white: true */
/*
	OuluThreeJS
	Author: Playsign
	Date: 2013
*/

// MAIN

// standard global variables
var container, scene, camera, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();

// custom global variables
var car,oulu,colliderBuildings,colliderGround;

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
	var temppi;

	// SCENE
	scene = new THREE.Scene();
	// CAMERA
	var SCREEN_WIDTH = window.innerWidth,
		SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45,
		ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
		NEAR = 0.1,
		FAR = 20000;
	camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	camera.position.set(0, 150, 400);
	camera.lookAt(scene.position);
	// RENDERER
	if (Detector.webgl)
		renderer = new THREE.WebGLRenderer({
			antialias: true
		});
	else
		renderer = new THREE.CanvasRenderer();
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	container = document.getElementById('ThreeJS');
	container.appendChild(renderer.domElement);
	// EVENTS
	THREEx.WindowResize(renderer, camera);
	THREEx.FullScreen.bindKey({
		charCode: 'm'.charCodeAt(0)
	});

	document.addEventListener('keydown', onKeyDown, false);
	document.addEventListener('keyup', onKeyUp, false);
	// CONTROLS
	// controls = new THREE.OrbitControls( camera, renderer.domElement );
	// STATS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild(stats.domElement);
	// White directional light at half intensity shining from the top.
	var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
	directionalLight.position.set(0, 1, 0);
	scene.add(directionalLight);

	////////////
	// CUSTOM //
	////////////

	// Note: if imported model appears too dark,
	//   add an ambient light in this file
	//   and increase values in model's exported .js file
	//    to e.g. "colorAmbient" : [0.75, 0.75, 0.75]
	var jsonLoader = new THREE.JSONLoader();
	jsonLoader.load("Masterscene.js", function(geometry, material){
		addModelToScene(geometry, material, "oulu");
	});
	jsonLoader.load("ColliderBuildings.js", function(geometry, material){
		addModelToScene(geometry, material, "colliderbuildings");
	});
	jsonLoader.load("ColliderGround.js", function(geometry, material){
		addModelToScene(geometry, material, "colliderground");
	});
	// addModelToScene function is called back after model has loaded

	var ambientLight = new THREE.AmbientLight(0x111111);
	scene.add(ambientLight);

	// CAR

	car = new THREE.Car();

	car.modelScale = 1;
	car.backWheelOffset = 0.02;

	car.MAX_SPEED = 25; //25
	car.MAX_REVERSE_SPEED = -15; //-15
	car.FRONT_ACCELERATION = 12;
	car.BACK_ACCELERATION = 15;

	car.WHEEL_ANGULAR_ACCELERATION = 1.5;

	car.FRONT_DECCELERATION = 10;
	car.WHEEL_ANGULAR_DECCELERATION = 1.0;

	car.STEERING_RADIUS_RATIO = 0.23;

	car.callback = function(object) {
		addCar(object, 142, 15, -20, 1); //10
	};

	car.loadPartsJSON("models/Car_LowPoly_Red.js", "models/Car_LowPoly_Red.js");


}

function addCar(object, x, y, z, s) {
	console.log("Add car");

	object.root.position.set(x, y, z);
	scene.add(object.root);
}

function addModelToScene(geometry, materials, type) {

	temppi = materials; //TODO remove
	var material, newMesh;

	if (type == "oulu") {
		var newMaterials = [];

		for (var i = 0; i < materials.length; i++) {
			if (materials[i].map) {
				//  JPG TO DDS
				var ddsName = materials[i].map.sourceFile.substr(0, materials[i].map.sourceFile.lastIndexOf(".")) + ".dds";
				// console.log("ddsName: " + ddsName);
				map = THREE.ImageUtils.loadCompressedTexture("./images/" + ddsName);
				map.wrapS = map.wrapT = THREE.RepeatWrapping; // for dds only
				map.repeat.set(1, 1); // for dds only

				// map = THREE.ImageUtils.loadCompressedTexture( materials[i].map.sourceFile + ".dds" );
				map.minFilter = map.magFilter = THREE.LinearFilter;
				map.anisotropy = 4;

				newMaterials.push(new THREE.MeshBasicMaterial({
					map: map
				}));
			} else {
				newMaterials.push(materials[i]);
				// console.log("png: " + i);
			}
		} 
		material = new THREE.MeshFaceMaterial(newMaterials);
		newMesh = new THREE.Mesh(geometry, material);
		oulu = newMesh;
	} else if(type == "colliderbuildings") {
		material = new THREE.MeshFaceMaterial(materials);
		newMesh = new THREE.Mesh(geometry, material);
		newMesh.visible = false;
		colliderBuildings = newMesh;
	} else if(type == "colliderground") {
		material = new THREE.MeshFaceMaterial(materials);
		newMesh = new THREE.Mesh(geometry, material);
		newMesh.visible = false;
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

function update() {
	var delta = clock.getDelta(); // seconds.

	if (car && car.bodyMesh) {
		var relativeCameraOffset = new THREE.Vector3(0, 8, -25);

		var cameraOffset = relativeCameraOffset.applyMatrix4(car.bodyMesh.matrixWorld);

		camera.position.x = cameraOffset.x;
		camera.position.y = cameraOffset.y;
		camera.position.z = cameraOffset.z;
		camera.lookAt(car.root.position);
	}

	// update car model
	car.updateCarModel(delta, controlsCar);

	// controls.update();
	stats.update();
}

function render() {
	renderer.render(scene, camera);
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