/*
 * Copyright (C) 2015 B3Partners B.V.
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

 /**
  * This class/object controls the map module for the verkeerbeheer webapplication.
  * It's responsibilities are the creation of the map and handling the userinteraction with the map.
  */

function vbmap(){
	this.map  = null,
	this.layers = null,
	this.baseLayers = null,

	this.currentLocation = null,
	/**
	 * Initialize the map: create the map object, and the layers.
	 * @params config Configuration object. See the header in config.json for the specification of the file.
	 */
	this.init = function (config){
		var res = [3440.640, 1720.320, 860.160, 430.080, 215.040, 107.520, 53.760, 26.880, 13.440, 6.720, 3.360, 1.680, 0.840, 0.420,0.210,0.105,0.052,0.025,0.012,0.006,0.003];
	
		//var res = [3440.6399,1720.3199,860.1599,430.0799,215.0399,107.5199,53.7599,26.8799,13.4399,6.7199,3.3599,1.6799,0.8400,0.4200,0.2100,0.1050,0.0525,0.0262,0.0131,0.0065,0.0032,0.0016];
		var rd = new L.Proj.CRS.TMS(
	        'EPSG:28992',
	        '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +towgs84=565.2369,50.0087,465.658,-0.406857330322398,0.350732676542563,-1.8703473836068,4.0812 +no_defs', [-285401.92, 22598.08, 595401.9199999999, 903401.9199999999], 
	    {
	            transformation: new L.Transformation(1,0,-1,0),
	            resolutions: res
	    });

		this.map = L.map('map', 
		{
			crs:rd
		}).setView([51.95085,5.78016],6);

		this.baseLayers = this.initLayers(config.baseLayers);
		this.layers = this.initLayers(config.layers);
		this.initControls(config);
	},

	this.getLocation = function(returnFunction){
		this.map.once('locationfound', returnFunction, this)
		this.map.locate({
			enableHighAccuracy: true
		});
	},

	this.initControls = function(config){
		this.map.addControl( new L.Control.Gps({autoActive:false, maxZoom: 14, setView:true}) );

	//	L.control.layers(this.baseLayers, null).addTo(this.map);
	},

	/**
	 * Initialize all the layers given in the layers object. This function delegates all the subsequent JSONObjects with layer information to the correct functions.
	 */
	this.initLayers = function(layers){
		var layerObjects = {};
		for (var i = 0; i < layers.length; i++) {
			var layer = layers[i];
			if ( layer.type === "TMS"){
				this.createTMS(layer);
			} else if(layer.type === "WMS"){
				this.createWMS(layer);
			}else if(layer.type === "ESRI"){
				this.createEsriLayer(layer);
			}else{
				throw 'Layer type ' + layer.type + ' does not exist';
			}
			layerObjects[layer.label] = layer.instance;
		}
		return layerObjects;
	},

	/**
	 * Create a WMS layer, and add it to the map
	 */
	this.createWMS = function(layer){
		var l = L.tileLayer.wms(layer.url,{
			layers:layer.layers,
			transparent: true,
			format: 'image/png'
		});
		l.addTo(this.map);
		layer.instance = l;
	},

	/**
	 * Create a TMS layer, and add it to the map.
	 */
	this.createTMS = function(layer){
		var l = L.tileLayer(layer.url, {
		    tms: true,
		    minZoom: 0,
			opacity: layer.opacity ? layer.opacity : 1.0,
		   // maxZoom: 13,
		    continuousWorld: true
		});
		l.addTo(this.map);
		layer.instance = l;
	},

	/**
	 * Create an ESRI ArcGIS dynamic maplayer
	 */
	 this.createEsriLayer = function(layer){
		var l = L.esri.dynamicMapLayer({
			url: 'http://ags101.prvgld.nl/arcgis/rest/services/IMGEO/imgeo_wms/MapServer',
			opacity: 0.5
		});
		l.addTo(this.map);

		layer.instance = l;
	 }
}
