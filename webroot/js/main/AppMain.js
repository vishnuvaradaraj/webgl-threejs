var PARABAY = PARABAY || {};

PARABAY.AppMain = function() {

    this.timelineExpanded = 1;

    this.timelineSizeChanged = new signals.Signal();
    this.timelineItemDropped = new signals.Signal();

    this.timelineSizeChanged.add($.proxy(this.onTimelineSizeChanged, this));

    this.currentProject = {
        guid: PARABAY.Utils.getUUID(),
        preview: undefined,
        template: undefined,
		data: {},
		title : "New Project"
    };
    //currentProject
    this._popupManager = new PopupManager(),
    this._buttonManager = new ButtonManager();
 	this._pluginManager = new PARABAY.PluginManager(
		{ target: "plugin-tray" } );

    this._popupManager.init();
    this._buttonManager.init();

    this._loadingOverlay = $("#loading-overlay");
    this._loadingOverlay.hide();

	this.toggleKeyboardFunctions(true);

    Object.defineProperty(this, "popupManager", {
        get: function() {
            return this._popupManager;
        }
    });
    Object.defineProperty(this, "buttonManager", {
        get: function() {
            return this._buttonManager;
        }
    });
    Object.defineProperty(this, "pluginManager", {
        get: function() {
            return this._pluginManager;
        }
    });
};

PARABAY.AppMain._instance = null;

PARABAY.AppMain.getInstance = function() {

    if (null == PARABAY.AppMain._instance) {
        PARABAY.AppMain._instance = new PARABAY.AppMain();
    }

    return PARABAY.AppMain._instance;
};

PARABAY.AppMain.prototype.init = function() {

    this.graphicsContainer = $("#webgl-container");
    this.graphics = $("#graphics");
    this.propEditor = $("#propeditor-container");
    this.timeline = $(".properties-header");

    this._popupManager.addPopup("welcome", "#welcome-popup");

	this._pluginManager.addPluginType({name: 'text', type: PARABAY.TextPlugin});
	this._pluginManager.addPluginType({name: 'particle', type: PARABAY.ParticlePlugin});
	this._pluginManager.addPluginType({name: 'cubemap', type: PARABAY.CubeMapPlugin});
	
	this.menu = new PARABAY.Menu();
	this.menu.init(this);
	
    this.timeline = new PARABAY.Timeline();
    this.timeline.init();
    this.timeline.showTools();

    var that = this;
    $(window).resize(function(event) {
        that.onResize(event);
    });

    var FizzyText = function() {
        this.message = 'dat.gui';
        this.speed = 0.8;
        this.growthSpeed = 10;
        this.noiseStrength = 0.2;
        // Define render logic ...
    };
    var text = new FizzyText();

    var gui = new dat.GUI({
        autoPlace: false
    });

    var f1 = gui.addFolder('Flow Field');
    f1.add(text, 'speed');
    f1.add(text, 'noiseStrength');

    var f2 = gui.addFolder('Letters');
    f2.add(text, 'growthSpeed');
    f2.add(text, 'message');

    f2.open();

    var customContainer = document.getElementById('propeditor-container');
    customContainer.appendChild(gui.domElement);

    this.designerPane = new PARABAY.DesignerPane();
    this.designerPane.init();
    this.designerPane.animate();

    this._popupManager.hidePopups();
    //this._popupManager.showPopup( "welcome" );
    this.onResize();
};

PARABAY.AppMain.prototype.onTimelineSizeChanged = function(state) {

    console.log('timelineSizeChanged:' + state);
    this.timelineExpanded = state;

    var t = setTimeout($.proxy(this.onResize, this), 600);
};


PARABAY.AppMain.prototype.onResize = function(event) {


    var screenWidth = window.innerWidth;
    var screenHeight = window.innerHeight;

    var propEditorWidth = 246;
    var timelineHeight = 270 * this.timelineExpanded + 44;

    var propEditorHeight = screenHeight - (44);

    this.propEditor.css('width', propEditorWidth + 'px');
    this.propEditor.css('height', propEditorHeight + 'px');
    this.propEditor.css('left', (screenWidth - propEditorWidth) + 'px');

	if( THREEx.FullScreen.activated() ){
	    this.graphicsWidth = screenWidth;
	    this.graphicsHeight = screenHeight;
	}else{
	    this.graphicsWidth = screenWidth - (propEditorWidth);
	    this.graphicsHeight = screenHeight - (timelineHeight);
	}
	
    //console.log('width=' + this.graphicsWidth + ', height=' + this.graphicsHeight);
    this.graphicsContainer.css('width', this.graphicsWidth + 'px');
    this.graphicsContainer.css('height', this.graphicsHeight + 'px');

    this.designerPane.onResize(event);

    this.scrubberContainer = document.getElementById("scrubber-container");
    this.tracksContainer = document.getElementById("tracks-container");
    this.tracksContainer.style.width = (this.scrubberContainer.offsetWidth) + "px";

	this.timeline.onZoom(1);
};

PARABAY.AppMain.prototype.toggleLoadingScreen = function(state) {
    if (state) {
        this._loadingOverlay.show();
    }
    else {
        this._loadingOverlay.hide();
    }
};
//toggleLoadingScreen

PARABAY.AppMain.prototype.getProjectExport = function() {
    return {
        template: this.currentProject.template,
        title: this.currentProject.title,
        guid: this.currentProject.guid || PARABAY.Utils.getUUID(),
        data: this.timeline.exportProjectData(),
        timeStamp: this.currentProject.timeStamp || Date.now()
    };
};
//getProjectExport
PARABAY.AppMain.prototype.saveProject = function() {
    try {
        var localProjects = localStorage.getItem("Parabay.SavedProjects");
        localProjects = localProjects ? JSON.parse(localProjects) : {};

        var overwrite = localProjects[this.currentProject.guid]
        && localProjects[this.currentProject.guid].title === this.currentProject.title;

        if (!overwrite) {
            this.currentProject.guid = PARABAY.Utils.getUUID();
        }
        //if
        this.currentProject.timeStamp = Date.now();
        var projectToSave = this.getProjectExport();
        localProjects[projectToSave.guid] = projectToSave;
        localStorage.setItem("Parabay.SavedProjects", JSON.stringify(localProjects));
        this._popupManager.hidePopups();
    }
    catch(e) {
        throw new Error("Saving Failed...");
    }
};
//saveProject
PARABAY.AppMain.prototype.loadProject = function(guid) {
    var localProjects = localStorage.getItem("Parabay.SavedProjects");
    localProjects = localProjects ? JSON.parse(localProjects) : {};
    if (localProjects && localProjects[guid]) {
        var projectData = localProjects[guid],
        template = projectData.template;

        this.toggleLoadingScreen(true);
        this.toggleKeyboardFunctions(false);
        this._popupManager.hidePopups();

        this.currentProject.title = projectData.title;
        this.currentProject.guid = projectData.guid;
		this.currentProject.data = projectData.data;
        this.currentProject.timeStamp = projectData.timeStamp;

		$(".timeline-title").html(this.currentProject.title);

		this.timeline.loadProjectGUI(projectData.data);
		
		this.toggleLoadingScreen( false );
        this.toggleKeyboardFunctions( true );
    }
    //if
};
//loadProject
PARABAY.AppMain.prototype.newProject = function(projectOptions) {
    this.toggleLoadingScreen(true);
    this.toggleKeyboardFunctions(false);

    this.currentProject.title = projectOptions.title;
    this.currentProject.guid = PARABAY.Utils.getUUID();

	this.toggleLoadingScreen( false );
    this.toggleKeyboardFunctions( true );
};
//newProject

PARABAY.AppMain.prototype.toggleKeyboardFunctions = function( state ) {
  if ( state ) {
    document.addEventListener( "keydown", this.onKeyDown, false);
  }
  else {
    document.removeEventListener( "keydown", this.onKeyDown, false);
  }
}; //toggleKeyboardFunctions

PARABAY.AppMain.prototype.onKeyDown = function ( event ) {
  var inc = event.shiftKey ? 1 : 0.1;

  if( event.keyCode === 93 ) {
	/* right apple key pressed */
	var webglContainer= document.getElementById("webgl-container");
	if( THREEx.FullScreen.activated() ){
	    THREEx.FullScreen.cancel();
	}else{
	    THREEx.FullScreen.request(webglContainer);
	}
  }
  else if( event.keyCode === 37 ) {
	
  }
  else if ( event.keyCode === 32 ) {
    if ( !_popupManager.open ) {
      event.preventDefault();
    }
  }
} //onKeyDown