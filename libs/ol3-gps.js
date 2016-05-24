/*
 * Copyright (C) 2015-2016 B3Partners B.V.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

b3p.GPSControl = function(options) {
	initOptions(this,options);

	var me = this;
	var toggle = function(e){
        e = e || window.event;
		me.toggle();
        e.preventDefault();
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
	this.mustZoom = false;

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
			console.log("mustzoom:",me.mustZoom);
			if(me.mustZoom){
				me.map.getView().setZoom(12);
				me.mustZoom = false;
			}
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
	var loc = this.geolocation.getPosition();
	if(loc === undefined){
		var me = this;
		if(!this.tracking){
			this.toggle();
		}
		var f = function(event){
			me.toggle();
		    returnFunction(event.target.getPosition());
		};
		this.geolocation.once('change:position',f);
	}else{
		returnFunction(loc);
	}
}

b3p.GPSControl.prototype.toggle = function() {
	if(this.tracking){
		this.vectorLayer.getSource().clear();
	}else{
		this.mustZoom = true;
		console.log("mustzoom:",this.mustZoom);
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