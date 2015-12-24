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

	/**
	 * Initialize the map: create the map object, and the layers.
	 * @params config Configuration object. See the header in config.json for the specification of the file.
	 */
	this.init = function (config){
		var res = [3440.640, 1720.320, 860.160, 430.080, 215.040, 107.520, 53.760, 26.880, 13.440, 6.720, 3.360, 1.680, 0.840, 0.420];
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
		}).setView([52.5, 5.8], 3);

		this.initLayers(config.baseLayers);
		this.initLayers(config.layers);
	},

	/**
	 * Initialize all the layers given in the layers object. This function delegates all the subsequent JSONObjects with layer information to the correct functions.
	 */
	this.initLayers = function(layers){
		for (var i = 0; i < layers.length; i++) {
			var layer = layers[i];
			if ( layer.type === "TMS"){
				this.createTMS(layer);
			} else if(layer.type === "WMS"){
				this.createWMS(layer);
			}
		}
	},

	/**
	 * Create a WMS layer, and add it to the map
	 */
	this.createWMS = function(layer){
		L.tileLayer.wms(layer.url,{
			layers:layer.layers,
			transparent: true,
			format: 'image/png'
		}).addTo(this.map);
	},

	/**
	 * Create a TMS layer, and add it to the map.
	 */
	this.createTMS = function(layer){
		L.tileLayer(layer.url, {
		    tms: true,
		    minZoom: 3,
			opacity: 0.5,
		    maxZoom: 13,
		    continuousWorld: true
		}).addTo(this.map);
	}
}
