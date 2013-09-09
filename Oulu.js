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
var oulu, car;

init();
animate();

// FUNCTIONS 		
function init() 
{
	var temppi;

	// SCENE
	scene = new THREE.Scene();
	// CAMERA
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	camera.position.set(0,150,400);
	camera.lookAt(scene.position);	
	// RENDERER
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer(); 
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	container = document.getElementById( 'ThreeJS' );
	container.appendChild( renderer.domElement );
	// EVENTS
	THREEx.WindowResize(renderer, camera);
	THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
	// CONTROLS
	// controls = new THREE.OrbitControls( camera, renderer.domElement );
	// STATS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );
	// White directional light at half intensity shining from the top.
	var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
	directionalLight.position.set( 0, 1, 0 );
	scene.add( directionalLight );
	// FLOOR
	/*
	var floorTexture = new THREE.ImageUtils.loadTexture( 'images/checkerboard.jpg' );
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
	floorTexture.repeat.set( 10, 10 );
	var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
	var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.position.y = -0.5;
	floor.rotation.x = Math.PI / 2;
	scene.add(floor);
	*/
	// SKYBOX/FOG
	// var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
	// var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
	// var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
	// // scene.add(skyBox);
	// scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );
	
	////////////
	// CUSTOM //
	////////////
	
	// Note: if imported model appears too dark,
	//   add an ambient light in this file
	//   and increase values in model's exported .js file
	//    to e.g. "colorAmbient" : [0.75, 0.75, 0.75]
	var jsonLoader = new THREE.JSONLoader();
	jsonLoader.load( "Masterscene.js", addModelToScene );
	// addModelToScene function is called back after model has loaded
	
	var ambientLight = new THREE.AmbientLight(0x111111);
	scene.add(ambientLight);

	// CAR
	// Create an array of materials to be used in a cube, one for each side
	var cubeMaterialArray = [];
	// order to add materials: x+,x-,y+,y-,z+,z-
	cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0xff3333 } ) );
	cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0xff8800 } ) );
	cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0xffff33 } ) );
	cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0x33ff33 } ) );
	cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0x3333ff } ) );
	cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 0x8833ff } ) );
	var cubeMaterials = new THREE.MeshFaceMaterial( cubeMaterialArray );
	// Cube parameters: width (x), height (y), depth (z), 
	//        (optional) segments along x, segments along y, segments along z
	var cubeGeometry = new THREE.CubeGeometry( 10, 10, 10, 1, 1, 1 );
	// using THREE.MeshFaceMaterial() in the constructor below
	//   causes the mesh to use the materials stored in the geometry
	car = new THREE.Mesh( cubeGeometry, cubeMaterials );
	car.position.set(0, 80, 0);
	scene.add( car );	
	
}

function addModelToScene( geometry, materials ) 
{
	temppi = materials; //TODO remove

	newMaterials = [];

	for(var i = 0; i < materials.length; i++){
		if(materials[i].map){
			// replace .jpg to .dds
			var ddsName = materials[i].map.sourceFile.substr(0, materials[i].map.sourceFile.lastIndexOf(".")) + ".dds";
			console.log("ddsName: "+ddsName);
			map = THREE.ImageUtils.loadCompressedTexture( "./images/"+ddsName );
			// map = THREE.ImageUtils.loadCompressedTexture( materials[i].map.sourceFile + ".dds" );
			map.minFilter = map.magFilter = THREE.LinearFilter;
			map.anisotropy = 4;

			newMaterials.push(new THREE.MeshBasicMaterial( { map: map } ));
		}
		else {
			newMaterials.push(materials[i]);
			console.log("png: "+i);
		}
	}


	 var material = new THREE.MeshFaceMaterial( newMaterials );
// var material = new THREE.MeshNormalMaterial( ); //materials );
// 		var material = new THREE.MeshLambertMaterial(
//     {
//       color: 0xCC0000
//     });
	oulu = new THREE.Mesh( geometry, material );
	oulu.scale.set(10,10,10);
	scene.add( oulu );
}

function animate() 
{
    requestAnimationFrame( animate );
	render();		
	update();
}

function update()
{
var delta = clock.getDelta(); // seconds.
	var moveDistance = 200 * delta; // 200 pixels per second
	var rotateAngle = Math.PI / 2 * delta;   // pi/2 radians (90 degrees) per second
	
	// local transformations

		// move forwards/backwards/left/right
	if ( keyboard.pressed("W") || keyboard.pressed("up") )
		car.translateZ( -moveDistance );
	if ( keyboard.pressed("S") || keyboard.pressed("down") )
		car.translateZ(  moveDistance );
	// if ( keyboard.pressed("Q") )
	// 	car.translateX( -moveDistance );
	// if ( keyboard.pressed("E") )
	// 	car.translateX(  moveDistance );	

	// rotate left/right/up/down
	var rotation_matrix = new THREE.Matrix4().identity();
	if ( keyboard.pressed("A") || keyboard.pressed("left") )
		car.rotateOnAxis( new THREE.Vector3(0,1,0), rotateAngle);
	if ( keyboard.pressed("D")  || keyboard.pressed("right") )
		car.rotateOnAxis( new THREE.Vector3(0,1,0), -rotateAngle);
	// if ( keyboard.pressed("R") )
	// 	car.rotateOnAxis( new THREE.Vector3(1,0,0), rotateAngle);
	// if ( keyboard.pressed("F") )
	// 	car.rotateOnAxis( new THREE.Vector3(1,0,0), -rotateAngle);
	
	if ( keyboard.pressed("Z") )
	{
		car.position.set(0,25.1,0);
		car.rotation.set(0,0,0);
	}
	
	var relativeCameraOffset = new THREE.Vector3(0,10,50);

	var cameraOffset = relativeCameraOffset.applyMatrix4( car.matrixWorld );

	camera.position.x = cameraOffset.x;
	camera.position.y = cameraOffset.y;
	camera.position.z = cameraOffset.z;
	camera.lookAt( car.position );
	
	// controls.update();
	stats.update();
}

function render() 
{
	renderer.render( scene, camera );
}
