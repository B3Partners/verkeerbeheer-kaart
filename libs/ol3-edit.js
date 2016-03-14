b3p.EditControl = function(opt_options) {

	var options = opt_options || {};
	this.map = options.map;
	this.mode = options.mode;

    this.currentItem = null;

    this.createButton(1,options);
    this.createButton(2,options)
	this.init();
    
};
 

ol.inherits(b3p.EditControl, ol.control.Control);

    
b3p.EditControl.prototype.createButton = function(typeMelding,options){
    var me = this;
    var toggle = function(e){
        e = e || window.event;
        var button = e.target;
        var type = button.typeMelding;
        me.toggle(button, type);
        e.preventDefault();
    };
    var button = document.createElement('button');
    button.typeMelding = typeMelding;
    button.id = "editButton" + typeMelding;
    button.addEventListener('click', toggle, false);
    button.addEventListener('touchstart', toggle, false);

    var className = "edit" + typeMelding;

    var element = document.createElement('div');
    element.id = "editElement" + typeMelding;
    element.className = className +' edit ol-selectable ol-control ' + className +"-inactive" ;
    element.appendChild(button);

    document.getElementById("map").appendChild(element);

    ol.control.Control.call(this, {
       element : element 
    });
};

b3p.EditControl.prototype.init = function(){
    var style = new ol.style.Style({
        image: new ol.style.Icon({
            scale: 1,
            src: 'images/radio_rood.png'
        })
    });

    this.features = new ol.Collection();
    var featureOverlay = new ol.layer.Vector({
        source: new ol.source.Vector({features: this.features}),
            style: style
        });
    featureOverlay.setMap(this.map);

    switch(this.mode){
        case "view":
            break;
        case "new":
            draw = new ol.interaction.Draw({
                features: this.features,
                type: "Point",
                style:  style
            });
            this.map.addInteraction(draw);
            draw.on("drawend", function(){this.features.clear();}, this);
            // no break, "new also requires a modify interactions"
        case "edit":  
            var modify = new ol.interaction.Modify({
                features: this.features
            });
            this.map.addInteraction(modify);
            break;
    };
};

b3p.EditControl.prototype.toggle = function(button, type) {
	this.toggleStyle(button);
};

b3p.EditControl.prototype.toggleStyle = function(button) {
    var element = button.parentElement;
    var parentClasses = element.className;
    var editElement = "edit" + button.typeMelding;
    var activeClass = editElement + "-active";
    var inactiveClass = editElement + "-inactive";
    var tracking = parentClasses.indexOf(activeClass)  === -1;
	if(!tracking){
        element.className = element.className.split(activeClass).join(inactiveClass);
	}else{
        element.className = element.className.split(inactiveClass).join(activeClass);
	}
};