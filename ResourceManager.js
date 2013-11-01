/* -*- js-indent-level: 8 -*- 
 * @author Erno Kuusela
 * @author Tapani Jamsa
 */
"use strict";
/* jshint -W097, -W040 */

function ResourceManager() {
	// this.disposables = [];
	// this.texcache = {};
	// this.useTexcache = false;
	// var unloadAssets, doLoadAssets;
	this.loadAssetsAtStartup = true;
	this.realTextures = [];
}


ResourceManager.prototype = {

	constructor: ResourceManager,

	unloadAssets: function(disposables) {

		// // test
		// for (var x = 0; x < gridManager.blockCount; x++) {
		// 	for (var z = 0; z < gridManager.blockCount; z++) {
		// 		console.log("remove block: " + x + " " + z);
		// 		scene.remove(gridManager.visibleBlocks[x][z].mesh);
		// 	}
		// }

		console.log("unloadAssets");

		// note: this code currently works only when loadAssetsAtStartup is on
		// scene.remove(newMesh);
		for (var i = 0; i < disposables.length; i++) {
			var d = disposables[i];
			// dispose geometry, material etc.
			d.dispose();

			if (d instanceof THREE.Geometry) {
				console.log("after dispose with geom, faces", d.faces.length, "uvs", d.faceVertexUvs.length);
				d.faces.length = 0;
				d.vertices.length = 0;
				d.faceVertexUvs.length = 0;
				console.log("geometry unloaded");
			}
		}
		disposables.length = 0; // yes, really the way to clear js arrays

		// // TexCache
		// for (var key in this.texcache)
		// 	if (this.texcache.hasOwnProperty(key)) {
		// 		this.texcache[key].dispose();
		// 		delete this.texcache[key].image;
		// 		delete this.texcache[key].mimpaps;
		// 		delete this.texcache[key];

		// 		console.log("material unloaded");
		// 	}
		// 	// console.log("done");


	},

	// Used in console only
	doLoadAssets: function() {
		console.log("loading", this.realTextures.length, "textures");
		var nchanged = 0;
		for (var i = 0; i < this.realTextures.length; i++) {
			// oulu.material.materials[i].map = loadTexture(this.realTextures[key]);
			var m = oulu.material.materials[i];
			if (m === undefined)
				console.log("material", i, "was undefined");
			else if (this.realTextures[i] !== undefined) {
				m.map = loadTexture(this.realTextures[i]);
				m.needsUpdate = true;
				nchanged++;
			}
		}
		console.log("done", nchanged);
	},

	regDisposable: function(disposable, disposables) {
		console.log("regDisposable");

		// loop children[i].geometry for group? (non bufferedGeometry)

		if (typeof(disposable.dispose) !== "function")
			throw ("doesn't have a .dispose(): " + x);
		disposables.push(disposable);
	},
};