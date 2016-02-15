var b3p = {};
b3p.GPSControl = function(opt_options) {

	var options = opt_options || {};
	this.map = options.map;
	var me = this;
	var toggle = function(){
		me.toggle();
	};
	this.button = document.createElement('button');
	this.button.addEventListener('click', toggle, false);
	this.button.addEventListener('touchstart', toggle, false);

	var element = document.createElement('div');
	element.className = 'rotate-north ol-unselectable ol-control';
	element.appendChild(this.button);

	ol.control.Control.call(this, {
		element: element,
		target: options.target
	});

	this.tracking = false;
	this.geolocation = new ol.Geolocation({
		projection: this.map.getView().getProjection(),
		tracking: this.tracking
	});

	var positionFeature = new ol.Feature();
		positionFeature.setStyle(new ol.style.Style({
		image: new ol.style.Circle({
			radius: 16,
			fill: new ol.style.Fill({
				color: '#3399CC'
			}),
			stroke: new ol.style.Stroke({
				color: '#fff',
				width: 22
			})
		})
	}));

	var me = this;
	this.geolocation.on('change:position', function(event) {
		var coordinates = event.target.getPosition();
		if(me.geolocation.getTracking() && coordinates){
			positionFeature.setGeometry( new ol.geom.Point(coordinates));
			me.map.getView().setCenter(coordinates);
		}
	});

	new ol.layer.Vector({
		map: this.map,
		source: new ol.source.Vector({
			features: [ positionFeature]
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
		this.button.style["background-position"] = "1px 1px";
	}else{
		this.button.style["background-position"] = "1px -51px";
	}
	this.tracking = !this.tracking;
	this.geolocation.setTracking(this.tracking);
};