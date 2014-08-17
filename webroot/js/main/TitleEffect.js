var TitleEffect = function ( hex, shared ) {

	SequencerItem.call( this );

	var camera, scene, material, object,
	renderer = shared.renderer, renderTarget = shared.renderTarget;

	this.init = function( callback ) {

		camera = new THREE.Camera( 60, 1, 1, 10000 );
		camera.position.z = 20;

		scene = new THREE.Scene();

		material = new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0, transparent: true } );

		object = new THREE.Mesh( new THREE.IcosahedronGeometry( 2 ), material );
		object.scale.x = object.scale.y = object.scale.z = 2;
		
		scene.addObject( object );

		// renderer.initMaterial( material, scene.lights, scene.fog, object );

	};

	this.update = function ( progress, delta, time ) {

        console.log('TitleEffect::update= ' + progress);
		material.opacity = 1-progress;
		renderer.render( scene, camera, null, false );

	};

};

TitleEffect.prototype = new SequencerItem();
TitleEffect.prototype.constructor = TitleEffect;
