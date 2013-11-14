/* -*- js-indent-level: 8 -*- 
 * @author Erno Kuusela
 * @author Tapani Jamsa
 */
"use strict";
/* jshint -W097, -W040 */

function AssetDisposer() {
	// this.disposables = [];
	// this.texcache = {};
	// this.useTexcache = false;
	// var unloadAssets, doLoadAssets;
	this.loadAssetsAtStartup = true;
	this.realTextures = [];
}


AssetDisposer.prototype = {

	constructor: AssetDisposer,

	unloadAssets: function(disposables) {

		// note: this code currently works only when loadAssetsAtStartup is on
		for (var i = 0; i < disposables.length; i++) {
			var d = disposables[i];
			// dispose geometry, material etc.
			d.dispose();

			if (d instanceof THREE.Geometry) {
				//console.log("after dispose with geom, faces", d.faces.length, "uvs", d.faceVertexUvs.length);
				d.faces.length = 0;
				d.vertices.length = 0;
				d.faceVertexUvs.length = 0;
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
	// doLoadAssets: function() {
	// 	console.log("loading", this.realTextures.length, "textures");
	// 	var nchanged = 0;
	// 	for (var i = 0; i < this.realTextures.length; i++) {
	// 		// oulu.material.materials[i].map = loadTexture(this.realTextures[key]);
	// 		var m = oulu.material.materials[i];
	// 		if (m === undefined)
	// 			console.log("material", i, "was undefined");
	// 		else if (this.realTextures[i] !== undefined) {
	// 			m.map = loadTexture(this.realTextures[i]);
	// 			m.needsUpdate = true;
	// 			nchanged++;
	// 		}
	// 	}
	// 	console.log("done", nchanged);
	// },

	regDisposable: function(disposable, disposables) {
		// loop children[i].geometry for group? (non bufferedGeometry)

		if (typeof(disposable.dispose) !== "function")
			throw ("doesn't have a .dispose(): " + disposable);
		disposables.push(disposable);
	},
};