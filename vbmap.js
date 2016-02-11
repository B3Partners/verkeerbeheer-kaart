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

 /**
  * This class/object controls the map module for the verkeerbeheer webapplication.
  * It's responsibilities are the creation of the map and handling the userinteraction with the map.
  */

function vbmap(){
    this.map = null,
    this.config = null,

    this.init = function(config){
        this.config = config;
        this.initComponent();
    },

    this.initComponent = function (){
        proj4.defs("EPSG:28992","+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs");
        proj4.defs('http://www.opengis.net/gml/srs/epsg.xml#28992', proj4.defs('EPSG:28992'));
      
        var extentAr = [-285401.0,22598.0,595401.0,903401.0];
        var resolutions = [3440.64, 1720.32, 860.16, 430.08, 215.04, 107.52, 53.76, 26.88, 13.44, 6.72, 3.36, 1.68, 0.84, 0.42,0.21,0.105];
        var matrixIds = [];
        for (var z = 0; z < resolutions.length; ++z) {
            matrixIds[z] = 'EPSG:28992:' + z;
        }
        var projection = ol.proj.get('EPSG:28992');
        projection.setExtent(extentAr);

        var layers = [];

        this.initTMSLayers(this.config.tms_layers, layers, extentAr, projection);
        this.initWMSLayers(this.config.wms_layers,layers);

        this.createMap(layers,this.config.initial_zoom || 2, extentAr,projection, this.config.map_id);
        this.initWMTSLayers(this.config.wmts_layers,layers, extentAr, projection, resolutions, matrixIds);

        this.initTools(this.config.tools);
  
    },

    this.initTMSLayers = function(tmslayers,layers,extentAr, projection){
        for(var i = 0 ; i < tmslayers.length; i++){
            var layer = tmslayers[i];
            var tms = this.initTMSLayer(layer.url,extentAr, projection);
            layers.push(tms);
        }
    },

    this.initTMSLayer = function(layer,extentAr, projection){
        var openbasiskaartSource = new ol.source.XYZ({
            crossOrigin: 'anonymous',
            extent: extentAr,
            projection: projection,
            url: layer
        });
        var tms = new ol.layer.Tile({
            source: openbasiskaartSource
        });
        return tms;
    },
   
    this.initWMTSLayers = function(layersConfig, layers, extentAr, projection, resolutions, matrixIds){
        for (var i = 0 ; i < layersConfig.length ;i++){
            var config = layersConfig[0];
            var layer = this.initWMTSLayer(config, extentAr, projection, resolutions, matrixIds);
            layers.push(layer);
        }
    },

    this.initWMTSLayer = function (layerConfig, extentAr, projection, resolutions, matrixIds){
        var me = this;
        me.projection = projection;
        $.ajax(layerConfig.url).then(function(response) {
            var result = me.wmtsParser.read(response);
            var options = ol.source.WMTS.optionsFromCapabilities(result,
              {layer: layerConfig.layer, matrixSet: layerConfig.matrixSet, crossOrigin: null});

            var source =  new ol.source.WMTS(options);
            var layer = new ol.layer.Tile({
                opacity: 1,
                source:source
            });
            me.map.getLayers().insertAt(0, layer);
        });
    },

    this.initWMSLayers = function (layersConfig, layers){
        for (var i = 0; i < layersConfig.length; i++) {
            var layerConfig = layersConfig[i];
            var layer = this.initWMSLayer(layerConfig);
            if(layer){
                layers.push(layer);
            }
        };
    },

    this.initWMSLayer = function (layerConfig){
        var layer = new ol.layer.Image({
            source: new ol.source.ImageWMS({
                url: layerConfig.url,
                title: layerConfig.label,
                params: {
                    layers: layerConfig.layers
                }
            })
        });
        return layer;
    },

    /**
    * Init Tools
    * @param tools Configuration array, where each element is a configuration of a tool.
    * Initializes and adds the tool to the map. General layout of one configuration element:
    * {
        tool_id: <id_the_tool>
      }
    * Possible tool_id's:
    * MousePosition
    * ScaleLine
    * Zoom
    * ZoomSlider
    */
    this.initTools = function(tools){
        if(tools.length > 1) {
            // sort string ascending so ZoomSlider is always added on top of Zoom
            tools.sort(function(a, b){
                if (a.tool_id < b.tool_id){
                    return -1;
                }
                if (a.tool_id > b.tool_id){
                    return 1;
                }
                return 0;
            });
        }
        for (var i = 0; i < tools.length; i++) {
            var toolConfig = tools[i];
            var tool = this.initTool(toolConfig);
            this.map.addControl(tool);
        };

        this.initGPS();

        var layerSwitcher = new ol.control.LayerSwitcher({
            tipLabel: 'Légende' // Optional label for button
        });
        this.map.addControl(layerSwitcher);
    },

    this.getLocation = function(returnFunction){
        var f = function(event){
            returnFunction(event.target.getPosition());
        };
        this.geolocation.once('change:position',f);
    },

    this.initGPS = function(){
		this.geolocation = new ol.Geolocation({
            projection: this.map.getView().getProjection(),
            tracking: true
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
	},

    /**
    * initTool (toolConfig)
    * @param toolConfig Object with the id (ie. classname) of the tool.
    * Initialises the actual tool and returns it.
    */
    this.initTool = function (toolConfig){
        var id = toolConfig["tool_id"];

        var config = {};
        if(id === "MousePosition"){
            config.coordinateFormat = ol.coordinate.createStringXY(2);
        }

        var tool = new ol.control[id](config);
        return tool;
    },

    this.createMap = function(layers, zoom, extent, projection,mapId){
        this.map = new ol.Map({
            target: mapId,
            layers: layers,
            view: new ol.View({
                projection: projection,
                center: [112623, 400081],
                zoom: zoom,
                minResolution: 0.105,
                maxResolution: 3440.64,
                extent: extent
            }),
            controls: []
        });
    }
}