/**
 * @author Tapani Jämsä  (tapani@playsign.net)
 */

GRID.Manager = function() {

	this.target; // target to track e.g. a car or avatar
	this.targetGridPosition = {
		x: 0,
		y: 0
	};

	this.blocks = [];
	this.visibleBlocks = []; // 2D array of blocks currently on screen
	this.buffer;  // blocks in the scene at any one time



	// this.setVisible = function(enable) {

	// 	for (var i = 0; i < this.meshes.length; i++) {

	// 		this.meshes[i].visible = enable;
	// 		this.meshes[i].visible = enable;

	// 	}

	// };

	// this.loadPartsJSON = function(bodyURL, wheelURL) {

	// 	var loader = new THREE.JSONLoader();

	// 	loader.load(bodyURL, createBody);
	// 	// loader.load(wheelURL, createWheels);

	// };


	// function isColliding(position, focusX, focusZ) {
	// 	var raycaster = new THREE.Raycaster(position, new THREE.Vector3(focusX, 0, focusZ), 0, 4);
	// 	var intersects = raycaster.intersectObject(colliderBuildings);
	// 	if (intersects.length > 0) {
	// 		return true;
	// 	}
	// 	return false;
	// }
};