var VIDEO_OPAQUE = 1;
var VIDEO_HALFALPHA = 2;
var VIDEO_OPAQUE_DISTORT = 3;
var VIDEO_KEYED = 4;
var VIDEO_KEYED_DISTORT = 5;
var VIDEO_KEYED_INVERSE = 6;
var VIDEO_SMARTALPHA = 7;
var VIDEO_SMARTALPHA_DISTORT = 8;

var VideoPlayer = function( shared, layers, conf ) {

	var that = this;
	var oldTime = new Date().getTime();

	SequencerItem.call( this );

	var clearColor = new THREE.Color( 0x000000 );

	var config = {};
	var planes = [];
	var gridLoaded = false;
	
	var scene, camera, composer;
	var renderer = shared.renderer, renderTarget = shared.renderTarget;
	
	var mouseX = 0, mouseY = 0;
	var mouseOldX = 0, mouseOldY = 0;
	var mouseNewX = 0, mouseNewY = 0;
	var mouseRad = 1;
	var mouseSpeed = 1;
	var targetPos;
    
    var target = new THREE.Vector3();

	this.duration = layers[ 0 ].duration;
	
	this.init = function(){
		
		config.prx = layers[0].paralaxHorizontal || 0;
		config.pry = layers[0].paralaxVertical || 0;
		config.tgd = layers[0].targetDistance || 1500;
		
		gridLoader = new THREE.JSONLoader();
		gridLoader.load( "js/libs/video/VideoDistortGrid.js", function(geometry){

			config.grid = geometry;
			that.onLoad();

		});

	};
	
	this.onLoad = function() {

		gridLoaded = true;
	
	 	shared.signals.mousemoved.add(function(){

	 		mouseX = ( shared.mouse.x / shared.screenWidth ) * -2 + 1;
	 		mouseY = ( shared.mouse.y / shared.screenHeight ) * 2 - 1;

	 	});
		
		targetPos = new THREE.Vector2( 0, 0 );
		
		config.fov = 54;
		config.aspect = 2.35;
		config.adj = Math.tan( config.fov * Math.PI / 360 ) * 2;
		
		shared.camera = new THREE.PerspectiveCamera( config.fov, config.aspect, 1, 100000 );
		camera = shared.camera;
		
		target.x =0;
		target.y = 0;
		target.z = config.tgd * -1;
		camera.lookAt( target );
		camera.updateMatrix();
		
		shared.scene = new THREE.Scene();
		scene = shared.scene;
		
		scene.add( new THREE.AmbientLight( 0x000000 ) );
		scene.add(camera);

		for(var i = 0; i < layers.length; i++) {			
			var p = new VideoPlane(shared, layers[i], config);
			planes.push(p);
		}
		
		// postprocessing

		shared.composer = new THREE.EffectComposer( renderer );
		composer = shared.composer;
		
		composer.addPass( new THREE.RenderPass( scene, camera ) );

        
		var effect = new THREE.ShaderPass( THREE.DotScreenShader );
		effect.uniforms[ 'scale' ].value = 4;
		composer.addPass( effect );

		var effect = new THREE.ShaderPass( THREE.RGBShiftShader );
		effect.uniforms[ 'amount' ].value = 0.0015;
		effect.renderToScreen = true;
	    composer.addPass( effect );


		/*
		var effectBloom = new THREE.BloomPass( 1.3 );
		var effectCopy = new THREE.ShaderPass( THREE.CopyShader );

		var effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );

		var width = window.innerWidth || 2;
		var height = window.innerHeight || 2;

		effectFXAA.uniforms[ 'resolution' ].value.set( 1 / width, 1 / height );

		effectCopy.renderToScreen = true;

		composer.addPass( effectFXAA );
		composer.addPass( effectBloom );
		composer.addPass( effectCopy );
		*/
		
		/*
		var shaderBleach = THREE.BleachBypassShader;
		var shaderSepia = THREE.SepiaShader;
		var shaderVignette = THREE.VignetteShader;
		var shaderCopy = THREE.CopyShader;

		var effectBleach = new THREE.ShaderPass( shaderBleach );
		var effectSepia = new THREE.ShaderPass( shaderSepia );
		var effectVignette = new THREE.ShaderPass( shaderVignette );
		var effectCopy = new THREE.ShaderPass( shaderCopy );

		effectBleach.uniforms[ "opacity" ].value = 0.95;

		effectSepia.uniforms[ "amount" ].value = 0.9;

		effectVignette.uniforms[ "offset" ].value = 0.95;
		effectVignette.uniforms[ "darkness" ].value = 1.6;

		var effectFilm = new THREE.FilmPass( 0.35, 0.025, 648, false );
		var effectFilmBW = new THREE.FilmPass( 0.35, 0.5, 2048, true );
		
		effectVignette.renderToScreen = true;
		composer.addPass( effectFilmBW );
		composer.addPass( effectVignette );
		
		//effectSepia.renderToScreen = true;
		//composer.addPass( effectSepia );
		*/
		
		//R:shared.initScene();
		
	};
	
	this.show = function( progress ) {
	    console.log('VideoPlayer::show');
		for ( var i = 0; i < planes.length; i++ ) {
			var p = planes[i];
			if(p.locked) camera.addChild(p.mesh);
			else scene.add(p.mesh);
			p.start( progress, mouseX, mouseY );
		}
		
		renderer.setClearColor( clearColor );

	};
	
	this.hide = function(){
		for ( var i = 0; i < planes.length; i++ ) {
			planes[i].stop();
		}

	};
	
	this.update = function( progress, delta, time ) {
	
    time = new Date().getTime();
    
    delta = time - oldTime;
    oldTime = time;

		if( !gridLoaded ) return;

      mouseNewX = mouseX;
      mouseNewY = mouseY;

      var vX = Math.abs(limitSpeed(mouseNewX-mouseOldX,0.05)/delta);
      var vY = Math.abs(limitSpeed(mouseNewY-mouseOldY,0.05)/delta);

      mouseSpeed += (700*(vX+vY) - mouseSpeed)/20;

      mouseOldX = mouseX;
      mouseOldY = mouseY;

      function limitSpeed(speed, limit){
        return Math.max(Math.min(speed,limit),-limit);
      }
		
		targetPos.x = mouseX * - 2 * config.prx;
		targetPos.y = mouseY * - 2 * config.pry;
		
		targetPos.x = Math.min(targetPos.x, config.prx);
		targetPos.x = Math.max(targetPos.x, -config.prx);
		
		targetPos.y = Math.min(targetPos.y, config.pry);
		targetPos.y = Math.max(targetPos.y, -config.pry);
		
		target.x += (targetPos.x - target.x) * 0.1;
		target.y += (targetPos.y - target.y) * 0.1;
		camera.lookAt( target );
		camera.updateMatrix();
				
		for ( var i = 0; i < planes.length; i++ ) {
			var p = planes[i];
			if (progress > p.removeAt && !p.removed) {
				if (p.locked) 
					camera.removeChild(p.mesh);
				scene.removeChild(p.mesh);
				p.stop();
				p.removed = true;
				//console.log(p.path + " removed at " + progress + " (planned at " + p.removeAt + ")");
			}
			else {
				p.update(mouseX, mouseY, mouseSpeed, mouseRad);
			}

		}
		
		renderer.clear();
		//R:shared.renderScene();
		//renderer.render( scene, camera);
		composer.render();
	};
};

VideoPlayer.prototype = new SequencerItem();
VideoPlayer.prototype.constructor = VideoPlayer;
