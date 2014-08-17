var PARABAY = PARABAY || {};

PARABAY.IntroScreen = function() {

    this.container = null;

    this.camera = null;
    this.scene = null;
    this.renderer = null;

    this.cube = null;

    this.startTime = Date.now();

    this.viewWidth = window.innerWidth;
    this.aspect = 2.35;
    this.viewHeight = this.viewWidth / this.aspect;
    this.margin = window.innerHeight - this.viewHeight / 2;

};

PARABAY.IntroScreen.prototype.init = function() {


    // test if webgl is supported
    if (!Detector.webgl) Detector.addGetWebGLMessage();

    this.container = document.getElementById("graphics");


    // create the camera
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.position.z = 350;

    // create the Scene
    this.scene = new THREE.Scene();

    // create the Cube
    this.cube = new THREE.Mesh(new THREE.CubeGeometry(200, 200, 200), new THREE.MeshNormalMaterial());

    // add the object to the scene
    this.scene.add(this.cube);

    // init the WebGL renderer and append it to the Dom
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);

    // init the Stats and append it to the Dom - performance vuemeter
    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = '0px';
    this.container.appendChild(this.stats.domElement);

}

PARABAY.IntroScreen.prototype.animate = function() {

    // render the 3D scene
    this.render();
    // relaunch the 'timer' 
    requestAnimationFrame($.proxy(this.animate, this));
    // update the stats
    this.stats.update();
}

PARABAY.IntroScreen.prototype.render = function() {

    // animate the cube
    this.cube.rotation.x += 0.02;
    this.cube.rotation.y += 0.0225;
    this.cube.rotation.z += 0.0175;
    // make the cube bounce
    var dtime = Date.now() - this.startTime;
    this.cube.scale.x = 1.0 + 0.3 * Math.sin(dtime / 300);
    this.cube.scale.y = 1.0 + 0.3 * Math.sin(dtime / 300);
    this.cube.scale.z = 1.0 + 0.3 * Math.sin(dtime / 300);
    // actually display the scene in the Dom element
    this.renderer.render(this.scene, this.camera);
}
