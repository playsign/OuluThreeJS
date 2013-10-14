/**
 * @author Tapani Jämsä (tapani@playsign.net)
 */

GRID.Block = function() {
	
	this.gridPosition = {
		x: 0,
		y: 0
	};

	this.mesh = null;
	this.collider = null;

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