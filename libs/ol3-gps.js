var b3p = {};
b3p.GPSControl = function(opt_options) {

	var options = opt_options || {};
	this.map = options.map;
	var me = this;
	var toggle = function(){
		me.toggle();
	};
	var button = document.createElement('button');
	button.addEventListener('click', toggle, false);
	button.addEventListener('touchstart', toggle, false);

	this.element = document.createElement('div');
	this.element.className = 'ol-gps gps-inactive ol-unselectable ol-control';
	this.element.appendChild(button);

	ol.control.Control.call(this, {
		element: this.element,
		target: options.target
	});

	this.tracking = options.tracking ? options.tracking : false;
	if(this.tracking){
		this.toggleStyle();
	}
	this.geolocation = new ol.Geolocation({
		projection: this.map.getView().getProjection(),
		tracking: this.tracking
	});

	this.positionFeature = new ol.Feature();
	this.positionFeature.setStyle(new ol.style.Style({
		image: new ol.style.Circle({
			radius: 6,
			stroke: new ol.style.Stroke({
				color: '#f00',
				width: 2
			}),
			fill: new ol.style.Fill({
              color: '#3399CC'
            })
		}),
	
	}));

	var me = this;
	this.geolocation.on('change:position', function(event) {
		var coordinates = event.target.getPosition();
		if(me.geolocation.getTracking() && coordinates){
			me.positionFeature.setGeometry( new ol.geom.Point(coordinates));
			me.map.getView().setCenter(coordinates);
		}
	});

	this.vectorLayer = new ol.layer.Vector({
		map: this.map,
		source: new ol.source.Vector({
			features: [this.positionFeature]
		})
	});

};
ol.inherits(b3p.GPSControl, ol.control.Control);

b3p.GPSControl.prototype.getLocation = function(returnFunction){
	var f = function(event){
	    returnFunction(event.target.getPosition());
	};
	this.geolocation.once('change:position',f);
}

b3p.GPSControl.prototype.toggle = function() {
	if(this.tracking){
		this.vectorLayer.getSource().clear();
	}else{
		if(this.vectorLayer.getSource().getFeatures().length === 0){
			this.vectorLayer.getSource().addFeature(this.positionFeature);
		}
	}
	this.tracking = !this.tracking;
	this.toggleStyle();
	this.geolocation.setTracking(this.tracking);
};

b3p.GPSControl.prototype.toggleStyle = function() {
	if(!this.tracking){
		this.element.className = this.element.className.replace(/\bgps-active\b/,'gps-inactive');
	}else{
		this.element.className = this.element.className.replace(/\bgps-inactive\b/,'gps-active');
	}
};