/**
 * @author mrdoob / http://mrdoob.com/
 * free look mod by Playsign
 */

THREE.PointerLockControls = function(camera) {

	var scope = this;

	camera.rotation.set(0, 0, 0);

	var pitchObject = new THREE.Object3D();
	pitchObject.add(camera);

	var yawObject = new THREE.Object3D();
	yawObject.position.set(200,100,200);
	yawObject.add(pitchObject);

	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;
	var moveUp = false;
	var moveDown = false;

	var dragging = false;

	var isOnObject = false;
	var canJump = false;

	var velocity = new THREE.Vector3();

	var PI_2 = Math.PI / 2;

	var onMouseDown = function(event) {
		dragging = true;
	};

	var onMouseUp = function(event) {
		dragging = false;
	};

	var onMouseMove = function(event) {

		if (scope.enabled === false || dragging === false) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		yawObject.rotation.y -= movementX * 0.004;
		pitchObject.rotation.x -= movementY * 0.004;

		pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));

	};

	var onKeyDown = function(event) {

		switch (event.keyCode) {

			case 38: // up
			case 87: // w
				moveForward = true;
				break;

			case 37: // left
			case 65: // a
				moveLeft = true;
				break;

			case 40: // down
			case 83: // s
				moveBackward = true;
				break;

			case 39: // right
			case 68: // d
				moveRight = true;
				break;

			case 32: // space
				// if ( canJump === true ) velocity.y += 10;
				// canJump = false;
				moveUp = true;
				break;

			case 16: // shift
				moveDown = true;
				break;

		}

	};

	var onKeyUp = function(event) {

		switch (event.keyCode) {

			case 38: // up
			case 87: // w
				moveForward = false;
				break;

			case 37: // left
			case 65: // a
				moveLeft = false;
				break;

			case 40: // down
			case 83: // a
				moveBackward = false;
				break;

			case 39: // right
			case 68: // d
				moveRight = false;
				break;

			case 32: // space
				// if ( canJump === true ) velocity.y += 10;
				// canJump = false;
				velocity.y = 0;
				moveUp = false;
				break;

			case 16: // shift
				velocity.y = 0;
				moveDown = false;
				break;

		}

	};

	document.addEventListener('mouseup', onMouseUp, false);
	document.addEventListener('mousedown', onMouseDown, false);
	document.addEventListener('mousemove', onMouseMove, false);
	document.addEventListener('keydown', onKeyDown, false);
	document.addEventListener('keyup', onKeyUp, false);

	this.enabled = false;

	this.getObject = function() {

		return yawObject;

	};

	this.isOnObject = function(boolean) {

		isOnObject = boolean;
		canJump = boolean;

	};

	this.getDirection = function() {

		// assumes the camera itself is not rotated

		var direction = new THREE.Vector3(0, 0, -1);
		var rotation = new THREE.Euler(0, 0, 0, "YXZ");

		return function(v) {

			rotation.set(pitchObject.rotation.x, yawObject.rotation.y, 0);

			v.copy(direction).applyEuler(rotation);

			return v;

		}

	}();

	this.update = function(delta) {

		if (scope.enabled === false) return;

		delta *= 0.00001;

		velocity.x += (-velocity.x) * 0.08 * delta;
		velocity.y += (-velocity.y) * 0.08 * delta;
		velocity.z += (-velocity.z) * 0.08 * delta;

		// velocity.y -= 0.25 * delta;

		if (moveForward) velocity.z -= 0.12 * delta;
		if (moveBackward) velocity.z += 0.12 * delta;

		if (moveLeft) velocity.x -= 0.12 * delta;
		if (moveRight) velocity.x += 0.12 * delta;

		if (moveDown) velocity.y -= 0.12 * delta;
		if (moveUp) velocity.y += 0.12 * delta;

		// if ( isOnObject === true ) {

		// 	velocity.y = Math.max( 0, velocity.y );

		// }

		yawObject.translateX(velocity.x);
		yawObject.translateY(velocity.y);
		yawObject.translateZ(velocity.z);

		// if ( yawObject.position.y < 10 ) {

		// 	velocity.y = 0;
		// 	yawObject.position.y = 10;

		// 	canJump = true;

		// }

	};

};