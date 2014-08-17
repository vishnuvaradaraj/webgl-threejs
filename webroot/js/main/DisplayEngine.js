var PARABAY = PARABAY || {};

var Signal = signals.Signal;

PARABAY.DisplayEngine = function() {
    this.meshes = {};
    
    this.displayAspect = 2.35;
    this.displayWidth = window.innerWidth;
    this.displayHeight = this.displayWidth/this.displayAspect;
    
    this.mouse = { x: 0, y: 0 };
	this.screenWidth = window.innerWidth;
	this.screenHeight= window.innerHeight;

	this.signals = {

		mousedown : new Signal(),
		mouseup : new Signal(),
		mousemoved : new Signal(),
		mousewheel : new Signal(),

		windowresized : new Signal(),

		load : new Signal(),
		loadItemAdded : new Signal(),
		loadItemCompleted : new Signal(),

		startfilm : new Signal(),
		stopfilm : new Signal()

	};

	this.sequences= {};
	this.currentTime= 0;
	
};

PARABAY.DisplayEngine.prototype.init = function(_container) {
    
    if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

	this.container = document.getElementById( "graphics" );
    this.sequencer = new Sequencer();

    $(document).mousedown($.proxy( this.onDocumentMouseDown, this ));
    $(document).mouseup($.proxy( this.onDocumentMouseUp, this ));
    $(document).mousemove($.proxy( this.onDocumentMouseMove, this ));
    $(document).resize($.proxy( this.onWindowResize, this ));
    
    this.showStats();
    
    this.initVideo();     

};

PARABAY.DisplayEngine.prototype.initScene = function() {
           
  	var light = new THREE.DirectionalLight( 0xffffff );
  	light.position.set( 0.5, 1, 1 );
  	light.position.normalize();
  	this.scene.add( light );
  	  
	var geometry = new THREE.CubeGeometry( 400, 200, 20 );
	var material = new THREE.MeshLambertMaterial( { color: 0xffaa00, shading: THREE.FlatShading } );

	var mesh = new THREE.Mesh( geometry, material );

	mesh.position.x =   0;
	mesh.position.y = 100;
	mesh.position.z = -1300;

	mesh.scale.x = mesh.scale.y = mesh.scale.z = 4;

	this.scene.add(mesh);
	this.meshes[ 'plane' ] = mesh;

};

PARABAY.DisplayEngine.prototype.showStats = function() {
        
	this.stats = new Stats();
	this.stats.domElement.style.position = 'absolute';
	this.stats.domElement.style.top = '0px';
	this.container.appendChild( this.stats.domElement );

};

PARABAY.DisplayEngine.prototype.animate = function () {

	requestAnimationFrame( $.proxy( this.animate, this )  );

    this.player.update();
	//this.render();
	this.stats.update();

};

PARABAY.DisplayEngine.prototype.renderScene = function () {

	var time = new Date().getTime() * 0.00005;

    var cube = this.meshes[ 'plane' ];
    cube.rotation.x += 0.02;
    cube.rotation.y += 0.0225;
    cube.rotation.z += 0.0175;
    
};

PARABAY.DisplayEngine.prototype.initVideo = function (){

     try {
        this.renderer = new THREE.WebGLRenderer({ clearColor: 0x000000, clearAlpha: 0, antialias: false, alpha: true });
        this.renderer.setSize(this.displayWidth, this.displayHeight);
        this.container.appendChild(this.renderer.domElement);  
   	        
        this.container.style.position  = 'absolute';	
   		this.container.style.left = '0px';	
   		this.container.style.top = Math.abs( (  this.displayHeight - this.screenHeight  ) / 2 ) + 'px';
		
	    this.container.style.width = this.screenWidth + 'px';
	    this.container.style.height = this.screenHeight + 'px';
	    
	    
     }
     catch (e) {
       console.log(e);
     }
    
    
    var layers =   VideoShots.introLayers;

    var conf = {
      paralaxHorizontal: 40,
      paralaxVertical: 10
    };

    this.player = new VideoPlayer(this, layers, conf);
    this.player.init();
    
    // Only to simulate what happens in prototype
    setTimeout($.proxy( this.onPlayerReady, this ), 1000);   
    
	 
};

PARABAY.DisplayEngine.prototype.onPlayerReady = function () {
  this.player.show(0);
  this.animate();
};

PARABAY.DisplayEngine.prototype.onDocumentMouseDown = function ( event ) {

	this.signals.mousedown.dispatch( event );

	event.preventDefault();
	event.stopPropagation();

};

PARABAY.DisplayEngine.prototype.onDocumentMouseUp = function ( event ) {

	this.signals.mouseup.dispatch( event );

	event.preventDefault();
	event.stopPropagation();

};

PARABAY.DisplayEngine.prototype.onDocumentMouseMove =function ( event ) {

	this.mouse.x = event.clientX;
	this.mouse.y = event.clientY;

	this.signals.mousemoved.dispatch( event );

};

PARABAY.DisplayEngine.prototype.onWindowResize =function ( event ) {

	this.screenWidth = window.innerWidth;
	this.screenHeight = window.innerHeight;

    this.displayWidth = window.innerWidth;
    this.displayHeight = this.displayWidth/this.displayAspect;
    
    composer.reset();
	this.renderer.setSize( this.displayWidth, this.displayHeight );

	this.signals.windowresized.dispatch();

};


var initSlider1 = false;
var initSlider2 = false;

$(document).on('pagebeforecreate', '#home', function() {

    var data = {
      sliderId: "homeSlider",
      panelId: "homePanel"
    };
    $('#home').append(Handlebars.templates['home'](data));
})

$(document).on('pagebeforecreate', '#gallery', function() {

    var data = {
      sliderId: "gallerySlider",
      panelId: "galleryPanel"
    };
    
    $('#gallery').append(Handlebars.templates['gallery'](data));
})

$(document).on('pageshow', '#home', function() {

    console.log("home-init");

    $(".show-sidebar").click(function() {
        $("#homePanel").panel("open");
    });

    if (!initSlider1) {
        initSlider1 = true;
        $('#homeSlider').layerSlider({
            skinsPath: 'skins/',
            skin: 'glass',
            thumbnailNavigation: 'hover',
            hoverPrevNext: false,
            responsive: false,
            responsiveUnder: 940,
            sublayerContainer: 900,
            navPrevNext: false,
            navStartStop: false,
            navButtons: false,
        });
    }

    $('#homeSlider').layerSlider('start');

    $('#plusgallery').plusGallery();

})

$(document).on('pagehide', '#home', function() {
    $('#homeSlider').layerSlider('stop');
})

$(document).on('pageshow', '#gallery', function() {

    $(".show-sidebar").click(function() {
        $("#galleryPanel").panel("open");
    });

    if (!initSlider2) {
        initSlider2 = true;
        $('#gallerySlider').layerSlider({
            skinsPath: 'skins/',
            skin: 'fullWidth',
            thumbnailNavigation: 'hover',
            hoverPrevNext: false,
            responsive: false,
            responsiveUnder: 940,
            sublayerContainer: 900,
            navPrevNext: false,
            navStartStop: false,
            navButtons: false,
        });
    }

    $('#gallerySlider').layerSlider('start');
    $('#plusgallery').plusGallery();

})


$(document).on('pagehide', '#gallery', function() {
    $('#gallerySlider').layerSlider('stop');
})
