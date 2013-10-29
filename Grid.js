/* -*- js-indent-level: 8 -*-
 *
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

	this.size = 166; //500 // length of a side of the block
	this.buffer = 1; // how many extra blocks you will see to any direction. buffer0 == 1block, buffer1 = 9blocks, buffer2 = 25blocks
	this.lodBuffer = 1;
	this.totalBuffer = this.buffer + this.lodBuffer;

	this.debugGroup = null;

	// Culling cooldown. Prevents excessive block generating
	this.cullTimer = 0;
	this.cullCooldown = 3; // seconds
	this.orphanBlocks = [];


};

GRID.Manager.prototype = {

	constructor: GRID.Manager,

	update: function(deltaTime) {
		var newGridPosition = this.getGridPosition(this.target, this.size);

		if (this.orphanBlocks.length !== 0) {
			// console.log("We have orphan blocks! array length: " + this.orphanBlocks.length);
			for (var i = 0; i < this.orphanBlocks.length; i++) {
				this.resetBlock(this.orphanBlocks[i], i);
			}
			// debugger;
		} else if (this.cullCooldown <= this.cullTimer && this.orphanBlocks.length === 0) {
			if (newGridPosition.x !== this.targetGridPosition.x) {
				var cullPosition = {
					x: newGridPosition.x - this.targetGridPosition.x,
					z: 0
				};
				this.cull(cullPosition);
				this.targetGridPosition.x = newGridPosition.x;
				this.cullTimer = 0;
			}

			if (newGridPosition.z !== this.targetGridPosition.z) {
				var cullPosition = {
					x: 0,
					z: newGridPosition.z - this.targetGridPosition.z
				};
				this.cull(cullPosition);
				this.targetGridPosition.z = newGridPosition.z;
				this.cullTimer = 0;
			}
		}

		this.cullTimer += deltaTime;
	},

	getGridPosition: function(targetPosition, blockSize) {
		// console.log("getGridPosition");
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
		this.blockCount = this.totalBuffer * 2 + 1;
		this.visibleBlocks = new Array(this.blockCount);
		for (var a = 0; a < this.blockCount; a++) {
			this.visibleBlocks[a] = new Array(this.blockCount);
		}
		var newGridPosition = this.getGridPosition(this.target, this.size);

		for (var x = 0; x < this.blockCount; x++) {
			for (var z = 0; z < this.blockCount; z++) {
				// debugger;

				var blockGridPosition = {
					x: newGridPosition.x - this.totalBuffer + x,
					z: newGridPosition.z - this.totalBuffer + z
				};
				var enableTextures = false;

				var posX = x - this.totalBuffer;
				var posZ = z - this.totalBuffer;
				if (posX >= -this.buffer && posX <= this.buffer && posZ >= -this.buffer && posZ <= this.buffer) {
					enableTextures = true;
				}

				this.visibleBlocks[x][z] = this.generateBlock(blockGridPosition, enableTextures);

			}
		}
	},


	generateBlock: function(gridPosition, enableTextures) {
		// console.log("generateBlock");
		// console.log("gridPosition: ");
		// console.log(gridPosition);
		var newBlock = new GRID.Block();
		newBlock.gridPosition.x = gridPosition.x;
		newBlock.gridPosition.z = gridPosition.z;

		var blockId = "block-" + gridPosition.x + "_" + gridPosition.y + ".js";

		// Oulu
		// var jsonLoader = new THREE.JSONLoader();

		// jsonLoader.load("Masterscene.js", function(geometry, material) {
		// 	addOuluModelToScene(geometry, material, newBlock);
		// });

		// // Colliders
		// jsonLoader.load("ColliderBuildings.js", function(geometry, material) {
		// 	addColliderModelToScene(geometry, material, "colliderbuildings", newBlock);
		// });
		// jsonLoader.load("ColliderGround.js", function(geometry, material) {
		// 	addColliderModelToScene(geometry, material, "colliderground", newBlock);
		// });

		// CTM
		// var loader = new THREE.CTMLoader();

		// loader.load("joined.ctm", function(geometry) {

		// 	var material = new THREE.MeshLambertMaterial({
		// 		color: 0xffffff
		// 	});
		// 	// var material2 = new THREE.MeshPhongMaterial({
		// 	// 	color: 0xff4400,
		// 	// 	specular: 0x333333,
		// 	// 	shininess: 100
		// 	// });
		// 	// var material3 = new THREE.MeshPhongMaterial({
		// 	// 	color: 0x00ff44,
		// 	// 	specular: 0x333333,
		// 	// 	shininess: 100
		// 	// });

		// 	// callbackModel(geometry, 5, material1, -200, 0, -50, 0, 0, newBlock);
		// 	// callbackModel(geometry, 2, material2, 100, 0, 125, 0, 0);
		// 	// callbackModel(geometry, 2, material3, -100, 0, 125, 0, 0);

		// 	addOuluModelToScene(geometry, material, newBlock);

		// }, {
		// 	useWorker: true
		// });


		//CTM LOAD PARTS
		var loaderCTM = new THREE.CTMLoader(true);
		var group = new THREE.Object3D(); //create an empty container
		// document.body.appendChild(loaderCTM.statusDomElement);

		// var position = new THREE.Vector3(-105, -78, -40);
		// var scale = new THREE.Vector3(30, 30, 30);

		loaderCTM.loadParts("BlockCTM_normals.js", function(geometries, materials) {
			// console.log("geometries");
			// console.log(geometries);

			if (enableTextures) {
				hackMaterials(materials);
			} else {
				var origMaterials = materials;

				// var lambertMaterial = [];
				// lambertMaterial.push(new THREE.MeshLambertMaterial({
				// 	color: 0x8888ff,
				// }));

				var basicMaterial = [];
				var placeholderTexture = loadTexture("images/balconieRailings.dds");
				basicMaterial.push(new THREE.MeshBasicMaterial({
					//color: 0xaabbcc,
					map: placeholderTexture,
				}));

				basicMaterial.materialIndex = 0;

				materials = new THREE.MeshFaceMaterial(basicMaterial);

				materials.materialIndex = 0;
				materials.origMaterials = origMaterials;

				//map.sourceFile.lastIndexOf(".")) + ".dds";
			}

			for (var i = 0; i < geometries.length; i++) {
				// console.log("add mesh");
				var mesh = null;
				if (enableTextures) {
					materials[i].materialIndex = i;
					mesh = new THREE.Mesh(geometries[i], materials[i]);
				} else {
					mesh = new THREE.Mesh(geometries[i], materials);
				}

				// mesh.position = position;
				// mesh.scale = scale;
				// scene.add(mesh);
				group.add(mesh); //add a mesh with geometry to it

			}

			loaderCTM.statusDomElement.style.display = "none";

			// var end = Date.now();

			// console.log("load time:", end - start, "ms");

			addOuluModelToScene(group, newBlock);
			// scene.add(group);
			// gridManager.debugGroup = group;

		}, {
			useWorker: true
		});

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
				// OUTER (geometry)
				var newBlock = this.visibleBlocks[this.totalBuffer - this.totalBuffer * gridPosition.x][i];

				this.resetBlock(newBlock);
				this.visibleBlocks[this.totalBuffer - this.totalBuffer * gridPosition.x][i] = undefined;

				var blockGridPosition = {
					x: this.targetGridPosition.x + this.totalBuffer * gridPosition.x + gridPosition.x,
					z: this.targetGridPosition.z - this.totalBuffer + i
				};

				newBlocks[i] = this.generateBlock(blockGridPosition);

				// INNER (textures)
				var indX = this.buffer - this.buffer * gridPosition.x;
				hackMaterials(this.visibleBlocks[indX][i].mesh.material);

			}
		}
		if (gridPosition.z !== 0) {
			for (i = 0; i < this.blockCount; i++) {
				// OUTER (geometry)
				var indZ = this.totalBuffer - this.totalBuffer * gridPosition.z;
				var newBlock = this.visibleBlocks[i][indZ];

				this.resetBlock(newBlock);
				this.visibleBlocks[i][indZ] = undefined;

				var blockGridPosition = {
					x: this.targetGridPosition.x - this.totalBuffer + i,
					z: this.targetGridPosition.z + this.totalBuffer * gridPosition.z + gridPosition.z
				};

				console.log("remove geometry x:" + i + " z:" + indZ);

				newBlocks[i] = this.generateBlock(blockGridPosition);

				// INNER (textures)
				// indZ = this.buffer - this.buffer * gridPosition.z;
				indZ = this.blockCount - this.lodBuffer;
				if (i > this.lodBuffer - 1 && i < this.blockCount - this.lodBuffer) {
					for (var j = 0; j < this.visibleBlocks[i][indZ].mesh.children.length; j++) {
						var newMaterial = hackMaterials(this.visibleBlocks[i][indZ].mesh.children[j].material);
						// console.log("newMaterial: ");
						// console.log(newMaterial);


						// newMaterial = new THREE.MeshLambertMaterial({
						// 	color: 0x1111ff,
						// });


						this.visibleBlocks[i][indZ].mesh.children[j].material = newMaterial[0];
						// this.visibleBlocks[i][indZ].mesh.children[j].material.needsUpdate = true;
					}



					console.log("new texture x:" + i + " z:" + indZ);
				}
			}
		}

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
					var indX = -this.targetGridPosition.x - gridPosition.x + this.totalBuffer + t.gridPosition.x;
					var indY = -this.targetGridPosition.z - gridPosition.z + this.totalBuffer + t.gridPosition.z;
					// console.log("x: " + indX + " y: " + indY);
					newVisibleBlocks[indX][indY] = t;
				}
			}
		}

		// add the newly created blocks to this new array.
		for (i = 0; i < newBlocks.length; i++) {
			var t = newBlocks[i];
			newVisibleBlocks[-this.targetGridPosition.x - gridPosition.x + this.totalBuffer + t.gridPosition.x][-this.targetGridPosition.z - gridPosition.z + this.totalBuffer + t.gridPosition.z] = t;
		}

		// set the current map to the new array.
		this.visibleBlocks = newVisibleBlocks;
	},

	resetBlock: function(b, orphanIndex) {
		// console.clear();
		// console.log("resetBlock: ");
		// console.log(b);
		// console.log(b.mesh);
		if (b.mesh === null) {
			// console.log("Can't remove the block because the scene is still adding the mesh!");

			if (!b.orphan) {
				b.orphan = true;
				this.orphanBlocks.push(b);
				b.orphanID = this.orphanBlocks.length - 1;
			}
			// debugger;
		} else {

			// console.log("unloading prev assets before loading new clone");
			// unloadAssets();

			scene.remove(b.mesh);
			for (var i = 0; i < b.colliders.length; i++) {
				scene.remove(b.colliders[i]);
			}

			if (b.orphan) {
				// debugger;
				b.orphan = false;

				this.orphanBlocks.splice(orphanIndex, 1);
				b.mesh = null;

			}
			// b.mesh = null;
		}

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
	this.orphan = false;
	this.orphanID = 0;
	// this.texturesEnabled = false;

};