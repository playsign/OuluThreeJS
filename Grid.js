/**
 * @author Tapani Jamsa
 */
"use strict";

var GRID = {};

GRID.Manager = function() {

	// TODO this.manager = ( manager !== undefined ) ? manager : GRID.DefaultLoadingManager;
	this.target = null; // target to track e.g. a car or avatar
	this.targetGridPosition = {
		x: 0,
		z: 0
	};

	this.blockCount = null; // Don't modify. block count is the amount of blocks in a single row (buffer * 2 + 1)
	this.blocks = [];
	// 2D array of blocks currently on screen
	this.visibleBlocks = [];
	// for (var a = 0; a < this.blockCount; a++) {
	// 	this.visibleBlocks[a] = [];
	// }

	this.size = 500; // length of a side of the block
	this.buffer = 0; // blocks in the scene at any one time

	// this.setTarget = function(targetPosition) {
	// 	this.target = targetPosition;
	// };

};

GRID.Manager.prototype = {

	constructor: GRID.Manager,

	update: function() {
		var newGridPosition = this.getGridPosition(this.target, this.size);

		if (newGridPosition.x !== this.targetGridPosition.x) {
			var cullPosition = {
				x: newGridPosition.x - this.targetGridPosition.x,
				z: 0
			};
			this.cull(cullPosition);
			this.targetGridPosition.x = newGridPosition.x;
		}

		if (newGridPosition.z !== this.targetGridPosition.z) {
			var cullPosition = {
				x: 0,
				z: newGridPosition.z - this.targetGridPosition.z
			};
			this.cull(cullPosition);
			this.targetGridPosition.z = newGridPosition.z;
		}
	},

	getGridPosition: function(targetPosition, blockSize) {
		// console.log("getGridPosition");
		// debugger;
		var gridPosition = {
			x: Math.round(targetPosition.x() / blockSize),
			z: Math.round(targetPosition.z() / blockSize),
		};
		// console.log("gridPosition: ");
		// console.log(gridPosition);

		return gridPosition;

		// this.targetGridPosition.x = Math.round(this.target.x / this.blockSize);
		// this.targetGridPosition.z = Math.round(this.target.z / this.blockSize);
	},

	init: function() {
		// console.log("init");
		this.blockCount = this.buffer * 2 + 1;
		this.visibleBlocks = new Array(this.blockCount);
		for (var a = 0; a < this.blockCount; a++) {
			this.visibleBlocks[a] = new Array(this.blockCount);
		}
		var newGridPosition = this.getGridPosition(this.target, this.size);

		for (var x = 0; x < this.blockCount; x++) {
			for (var z = 0; z < this.blockCount; z++) {
				// debugger;
				var blockGridPosition = {
					x: newGridPosition.x - this.buffer + x,
					z: newGridPosition.z - this.buffer + z
				};
				this.visibleBlocks[x][z] = this.generateBlock(blockGridPosition);
			}
		}
	},

	generateBlock: function(gridPosition) {
		// console.log("generateBlock");
		// console.log("gridPosition: ");
		// console.log(gridPosition);
		var newBlock = new GRID.Block();
		newBlock.gridPosition.x = gridPosition.x;
		newBlock.gridPosition.z = gridPosition.z;
		newBlock.mesh = true;
		newBlock.secondaryMesh = true;


		// Oulu
		var jsonLoader = new THREE.JSONLoader();

		jsonLoader.load("Masterscene.js", function(geometry, material) {
			addOuluModelToScene(geometry, material, newBlock);
		});

		// first model
		// if (oulu.mesh === null) {
		// 	console.log("oulu undfined");
		// 	jsonLoader.load("Masterscene.js", function(geometry, material) {
		// 		addOuluModelToScene(geometry, material, newBlock);
		// 	});
		// } else {
		// 	console.log("jsonloader");
		// 	window.setTimeout(function() {
		// 		jsonLoader = new THREE.JSONLoader();
		// 		console.log("unloading prev assets before loading new clone");
		// 		unloadAssets();
		// 		jsonLoader.load("Masterscene.js", function(geometry, material) {
		// 			addOuluModelToScene(geometry, material, newBlock);
		// 		});
		// 	}, 5000); // * (i + 1));
		// }

		// Colliders
		// jsonLoader.load("ColliderBuildings.js", function(geometry, material) {
		// 	addColliderModelToScene(geometry, material, "colliderbuildings", newBlock);
		// });
		// jsonLoader.load("ColliderGround.js", function(geometry, material) {
		// 	addColliderModelToScene(geometry, material, "colliderground", newBlock);
		// });

		return newBlock;
	},

	// this function could possibly be optimized, but is a proof of concept.
	// by recording the gridPosition.x and gridPosition.z (as -1 or 1) we can
	// remove the un needed cells and re generate the grid array with the
	// correct blocks.
	cull: function(gridPosition) {
		// console.log("cull");
		var i = 0,
			j = 0;
		var newBlocks = new Array(this.blockCount);
		var newVisibleBlocks = new Array(this.blockCount);
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
				// console.log("mesh false: " + this.visibleBlocks[this.buffer - this.buffer * gridPosition.x][i].mesh);
				// console.log("null: " + this.visibleBlocks[this.buffer - this.buffer * gridPosition.x][i]);
				// console.log("generateBlock: x:" + this.targetGridPosition.x + this.buffer * gridPosition.x + gridPosition.x + "z: " + this.targetGridPosition.z - this.buffer + i);

				console.log("unloading prev assets before loading new clone");
				unloadAssets();

				scene.remove(this.visibleBlocks[this.buffer - this.buffer * gridPosition.x][i].mesh);
				scene.remove(this.visibleBlocks[this.buffer - this.buffer * gridPosition.x][i].secondaryMesh);
				this.visibleBlocks[this.buffer - this.buffer * gridPosition.x][i].mesh = false;
				this.visibleBlocks[this.buffer - this.buffer * gridPosition.x][i].secondaryMesh = false;
				this.visibleBlocks[this.buffer - this.buffer * gridPosition.x][i] = undefined;

				var blockGridPosition = {
					x: this.targetGridPosition.x + this.buffer * gridPosition.x + gridPosition.x,
					z: this.targetGridPosition.z - this.buffer + i
				};
				newBlocks[i] = this.generateBlock(blockGridPosition);
			}
		}
		if (gridPosition.z !== 0) {
			for (i = 0; i < this.blockCount; i++) {
				// Destroy(this.visibleBlocks[i, buffer - buffer * gridPosition.z].gameblock);
				// this.visibleBlocks[i, buffer - buffer * gridPosition.z] = null;
				// newBlocks[i] = Generateblock(targetGridPosition.x - buffer + i, targetGridPosition.z + buffer * gridPosition.z + gridPosition.z);
				// console.log("destroy: " + this.visibleBlocks[i][this.buffer - this.buffer * gridPosition.z]);
				// console.log("null: " + this.visibleBlocks[i][this.buffer - this.buffer * gridPosition.z]);
				// console.log("generateBlock: x:" + this.targetGridPosition.x - this.buffer + i + "z: " + this.targetGridPosition.z + this.buffer * gridPosition.z + gridPosition.z);

				scene.remove(this.visibleBlocks[i][this.buffer - this.buffer * gridPosition.z].mesh);
				scene.remove(this.visibleBlocks[i][this.buffer - this.buffer * gridPosition.z].secondaryMesh);
				this.visibleBlocks[i][this.buffer - this.buffer * gridPosition.z].mesh = false;
				this.visibleBlocks[i][this.buffer - this.buffer * gridPosition.z].secondaryMesh = false;
				this.visibleBlocks[i][this.buffer - this.buffer * gridPosition.z] = undefined;

				var blockGridPosition = {
					x: this.targetGridPosition.x - this.buffer + i,
					z: this.targetGridPosition.z + this.buffer * gridPosition.z + gridPosition.z
				};
				newBlocks[i] = this.generateBlock(blockGridPosition);
			}
		}
		// make a copy of the old visibleblocks to reference when creating the new block map.
		// Array.Copy(visibleblocks, newVisibleblocks, blockCount * blockCount);
		for (var k = 0; k < this.visibleBlocks; k++) {
			// Deep copy
			newVisibleBlocks.push(jQuery.extend(true, {}, this.visibleBlocks[k]));
		}

		// go through the current blocks on screen (minus the ones we just deleted, and reapply there 
		// new position in the newVisibleblocks array.
		for (i = 0; i < this.blockCount; i++) {
			for (j = 0; j < this.blockCount; j++) {
				var t = this.visibleBlocks[i][j];
				if (t !== undefined) {
					newVisibleBlocks[-this.targetGridPosition.x - gridPosition.x + this.buffer + t.gridPosition.x][-this.targetGridPosition.z - gridPosition.z + this.buffer + t.gridPosition.z] = t;
				}
			}
		}

		// add the newly created blocks to this new array.
		for (i = 0; i < newBlocks.length; i++) {
			var t = newBlocks[i];
			newVisibleBlocks[-this.targetGridPosition.x - gridPosition.x + this.buffer + t.gridPosition.x][-this.targetGridPosition.z - gridPosition.z + this.buffer + t.gridPosition.z] = t;
		}

		// set the current map to the new array.
		this.visibleBlocks = newVisibleBlocks;
	},


	debugDrawGrid: function() {
		this.update();

		// Roguelike presentation
		var rows = [];
		var rowAmount = 7;
		var offset = 3;

		for (var z = 0; z < rowAmount; z++) {
			rows.push(" ");
			for (var x = 0; x < rowAmount; x++) {
				var blockGridPosition = {
					x: x - offset,
					z: z - offset
				};

				if (this.isOccupied(blockGridPosition)) {
					rows[z] += "#";
				} else {
					rows[z] += ".";
				}
			}
		}

		// rows.push(" #######");
		// rows.push(" #######");
		// rows.push(" ##...##");
		// rows.push(" ##.@.##");
		// rows.push(" ##...##");
		// rows.push(" #######");
		// rows.push(" #######");
		rows.push("-3210123+");
		// console.clear();

		for (var i = 0; i < rows.length; i++) {
			var pos = " ";
			(i - 3) < 4 ? pos = i - 3 : pos = " ";
			console.log(rows[i] + " " + pos);
		}
	},

	isOccupied: function(gridPosition) {
		// debugger;
		for (var x = 0; x < this.visibleBlocks.length; x++) {
			for (var z = 0; z < this.visibleBlocks.length; z++) {
				if (this.visibleBlocks[x][z].gridPosition.x === gridPosition.x && this.visibleBlocks[x][z].gridPosition.z === gridPosition.z) {
					return true;
				}
			}
		}
		return false;
	},
}

GRID.Tester = function() {

	this.position = {
		x: 0,
		z: 0
	};

	this.gm = new GRID.Manager();
	this.gm.size = 1;
	this.gm.buffer = 1;
	this.gm.target = this.position;
	this.gm.init();

	this.move = function(direction, distance) {
		if (distance > 1) {
			console.log("movement distance must be below 1");
			return;
		}

		if (direction == "d") {
			this.position.z += distance;
		} else if (direction == "u") {
			this.position.z -= distance;
		} else if (direction == "r") {
			this.position.x += distance;
		} else if (direction == "l") {
			this.position.x -= distance;
		} else {
			console.log("invalid direction");
		}
		this.gm.debugDrawGrid();
	};


};

GRID.Block = function() {
	// console.log("Block");

	this.gridPosition = {
		x: 0,
		z: 0
	};

	this.mesh = null;
	this.colliders = [];

};