/**
 * @author Tapani Jamsa
 */
"use strict";

var GRID = {};

GRID.Manager = function() {

	this.target = null; // target to track e.g. a car or avatar
	this.targetGridPosition = {
		x: 0,
		z: 0
	};

	this.blockCount = 0; // block count is the amount of blocks in a single row (buffer * 2 + 1)
	this.blocks = [];
	// 2D array of blocks currently on screen
	this.visibleBlocks = [];
	for (var a = 0; a < this.blockCount; a++) {
		this.visibleBlocks[a] = [];
	}

	this.size = 1; // length of a side of the block
	this.buffer = 1; // blocks in the scene at any one time

	this.setTarget = function(targetPosition) {
		this.target = targetPosition;
	};

	this.update = function() {
		var newGridPosition = getGridPosition(this.target, this.size);

		if (newGridPosition.x !== this.targetGridPosition.x) {
			this.cull(newGridPosition.x - this.targetGridPosition.x, 0);
			this.targetGridPosition.x = newGridPosition.x;
		}

		if (newGridPosition.z !== this.targetGridPosition.z) {
			this.cull(0, newGridPosition.z - this.targetGridPosition.z);
			this.targetGridPosition.z = newGridPosition.z;
		}
	};

	this.generateBlock = function(gridPosition) {
		var newBlock = new GRID.Block();
		newBlock.gridPosition.x = gridPosition.x;
		newBlock.gridPosition.z = gridPosition.z;
		newBlock.mesh = true;

		return newBlock;
	}

	// this function could possibly be optimized, but is a proof of concept.
	// by recording the gridPosition.x and gridPosition.z (as -1 or 1) we can
	// remove the un needed cells and re generate the grid array with the
	// correct blocks.
	this.cull = function(gridPosition) {
		var i = 0,
			j = 0;
		var newBlocks = [this.blockCount];
		var newVisibleBlocks = [];
		for (var a = 0; a < this.blockCount; a++) {
			newVisibleBlocks[a] = [];
		}

		// firstly remove the old block gameblocks and null them from the array.
		// populate a temporary array with the newly made blocks.
		if (gridPosition.x !== 0) {
			for (i = 0; i < this.blockCount; i++) {
				// Destroy(this.visibleBlocks[buffer - buffer * gridPosition.x, i].gameObject);
				// this.visibleBlocks[buffer - buffer * gridPosition.x, i] = null;
				// newBlocks[i] = Generateblock(targetGridPosition.x + buffer * gridPosition.x + gridPosition.x, targetGridPosition.z - buffer + i);
				console.log("destroy: " + this.visibleBlocks[this.buffer - this.buffer * gridPosition.x][i]);
				console.log("null: " + this.visibleBlocks[this.buffer - this.buffer * gridPosition.x][i]);
				console.log("generateBlock: x:" + this.targetGridPosition.x + this.buffer * gridPosition.x + gridPosition.x + "z: " + this.targetGridPosition.z - this.buffer + i);

				this.visibleBlocks[this.buffer - this.buffer * gridPosition.x][i].mesh = false;
				this.visibleBlocks[this.buffer - this.buffer * gridPosition.x][i] = null;
				newBlocks[i] = this.generateBlock(this.targetGridPosition.x + this.buffer * gridPosition.x + gridPosition.x, this.targetGridPosition.z - this.buffer + i);
			}
		}
		if (gridPosition.z !== 0) {
			for (i = 0; i < this.blockCount; i++) {
				// Destroy(this.visibleBlocks[i, buffer - buffer * gridPosition.z].gameblock);
				// this.visibleBlocks[i, buffer - buffer * gridPosition.z] = null;
				// newBlocks[i] = Generateblock(targetGridPosition.x - buffer + i, targetGridPosition.z + buffer * gridPosition.z + gridPosition.z);
				console.log("destroy: " + this.visibleBlocks[i][this.buffer - this.buffer * gridPosition.z]);
				console.log("null: " + this.visibleBlocks[i][this.buffer - this.buffer * gridPosition.z]);
				console.log("generateBlock: x:" + this.targetGridPosition.x - this.buffer + i + "z: " + this.targetGridPosition.z + this.buffer * gridPosition.z + gridPosition.z);

				this.visibleBlocks[i][this.buffer - this.buffer * gridPosition.z].mesh = false;
				this.visibleBlocks[i][this.buffer - this.buffer * gridPosition.z] = null;
				newBlocks[i] = this.generateBlock(this.targetGridPosition.x - this.buffer + i, this.targetGridPosition.z + this.buffer * gridPosition.z + gridPosition.z);
			}
		}

		// make a copy of the old visibleblocks to reference when creating the new block map.
		// Array.Copy(visibleblocks, newVisibleblocks, blockCount * blockCount);
		for (var k = 0; k < this.visibleBlocks; k++) {
			// Deep copy
			newVisibleBlocks.push(jQuery.extend(true, {}, this.visibleBlocks[k]));
		}
		console.log("newVisibleBlocks: ");
		console.log(newVisibleBlocks);

		// go through the current blocks on screen (minus the ones we just deleted, and reapply there 
		// new position in the newVisibleblocks array.
		for (i = 0; i < this.blockCount; i++) {
			for (j = 0; j < this.blockCount; j++) {
				var t = this.visibleBlocks[i][j];
				if (t !== null) {
					newVisibleBlocks[-this.targetGridPosition.x - gridPosition.x + this.buffer + t.gridPosition.x][-this.targetGridPosition.z - gridPosition.z + this.buffer + t.gridPosition.z] = t;
				}
			}
		}
		console.log("newVisibleBlocks: ");
		console.log(newVisibleBlocks);

		// add the newly created blocks to this new array.
		for (i = 0; i < newBlocks.Length; i++) {
			var t = newBlocks[i];
			newVisibleBlocks[-this.targetGridPosition.x - gridPosition.x + this.buffer + t.gridPosition.x][-this.targetGridPosition.z - gridPosition.z + this.buffer + t.gridPosition.z] = t;
		}

		// set the current map to the new array.
		this.visibleBlocks = newVisibleBlocks;
	};

	function getGridPosition(targetPosition, blockSize) {
		var gridPosition = {
			x: Math.round(targetPosition.x / blockSize),
			z: Math.round(targetPosition.z / blockSize),
		};

		return gridPosition;

		// this.targetGridPosition.x = Math.round(this.target.x / this.blockSize);
		// this.targetGridPosition.z = Math.round(this.target.z / this.blockSize);
	}
};

GRID.Tester = function() {
	

	this.drawGrid = function() {
		// Roguelike presentation
		var rows = [];
		rows.push(" #######");
		rows.push(" #######");
		rows.push(" ##...##");
		rows.push(" ##.@.##");
		rows.push(" ##...##");
		rows.push(" #######");
		rows.push(" #######");
		rows.push("-3210123+");
		console.clear();
		for (var i = 0; i < rows.length; i++) {
			var pos = " ";
			(i - 3) < 4 ? pos = i - 3 : pos = " ";
			console.log(rows[i] + " " + pos);
		}
	}
};

GRID.Block = function() {

	this.gridPosition = {
		x: 0,
		y: 0
	};

	this.mesh = null;
	this.colliders = [];

	// this.setMesh = function(newMesh){

	// };

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