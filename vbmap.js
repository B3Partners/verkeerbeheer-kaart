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

window.b3p = window.b3p || {};
b3p.Vbmap = function(){
    this.map = null,
    this.config = null,
    this.baseLayers = null,
    this.thematicLayers = null,
    this.wmtsParser =  null,
    this.getFeature = null,
    this.mode = null,
    this.popup = null,
    this.scripts = null,
    this.ready = false,
    this.layerIndexOffsetByAsyncLayers = 0, //necessary for asynchronously loaded layers (like wmts layers)
    this.debugScripts = [
        "//ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js",
        "//cdnjs.cloudflare.com/ajax/libs/proj4js/2.3.6/proj4.js",
        "map/libs/ol-debug.js",
        "map/libs/ol3-layerswitcher.js",
        "map/libs/ol3-gps.js",
        "map/libs/ol3-edit.js",
        "map/libs/ol3-getfeature.js",
        "map/libs/ol3-popup.js"
    ],
    this.minifiedScripts =[
        "map/libs/target.min.js"
    ],

    this.init = function(config){
        this.ready = false;
        this.config = config;
        this.mode = config.mode;
        if(this.getQueryStringValue("debug")== "true"){
            this.scripts = this.debugScripts;
        }else{
            this.scripts = this.minifiedScripts;
        }

        this.loadScripts();
        window.vbmap = this;
    },

    this.initComponent = function(){
        this.initLayers();
        this.initTools(this.config.tools);
        this.ready = true;
    },


    /************************** API functions *********************/
    
    this.resetConfig = function (config){
        var node = document.getElementById(this.config.map_id);
        while (node.hasChildNodes()) {
            node.removeChild(node.lastChild);
        }
        this.init(config);
    },
    /**
     * openLink
     * Function to save the modifications/new feature to the database. Called when clicking on the link in the popup.
     */
    this.openlink = function(id){
        var url = this.edit.generateURL(id);
        window.open(url, '_parent');
    },

    this.useGPS = function(){
        var me = this;
        var f = function(coords){
            me.edit.setPosition(coords);
        };
        this.getLocation(f);
    },
    
    /**
     * zoomTo
     * Function to zoom/move to a coordinate.
     */
     
     this.zoomTo = function(x, y){
        this.map.getView().setCenter([x,y]);
        this.map.getView().setZoom(18);
     },
     
    /**
     * zoomTo
     * Function to zoom/move to a coordinate.
     */
     
     this.zoomToExtent = function(minx, miny, maxx, maxy){
        if(minx !== null && miny !== null && maxx !== null && maxy !== null){
            if(this.ready){
                var extent = [minx, miny, maxx, maxy];
                this.map.getView().fit(extent, this.map.getSize());
            }else{
                var me = this;
                me.extent = extent;
                me.minx = minx;
                me.miny = miny;
                me.maxx = maxx;
                me.maxy = maxy;
                setTimeout(function(minx, miny, maxx, maxy){
                    me.zoomToExtent(me.minx,me.miny,me.maxx,me.maxy);
                }, 300);
            }
        }
     },

     /**
      * highlight
      * zooms to the given extent and does getfeatureinfo on the minx,miny
      */
     this.highlight = function(minx, miny, maxx, maxy){
        if(minx !== null && miny !== null && maxx !== null && maxy !== null){
            if(this.ready){
                this.zoomToExtent(minx, miny, maxx, maxy);
                this.getFeature.onMapClicked({coordinate: [minx, miny]});
            }else{
                var me = this;
                me.minx = minx;
                me.miny = miny;
                me.maxx = maxx;
                me.maxy = maxy;
                setTimeout(function(minx, miny, maxx, maxy){
                    me.highlight(me.minx,me.miny,me.maxx,me.maxy);
                }, 300);
            }
        }
     },

     /**
      * getExtent
      * Gets the current extent of the map
      */
     this.getExtent = function (){
        var extent = this.map.getView().calculateExtent(this.map.getSize());
        return extent.join(",");
     },

    /*
     * getLocation
     * Function to retrieve the location of the device.
     * @param returnFunction Function to be called when the location is present. Must take one argument, which will be an array of the coordinates [xPosition, yPosition]
     */
    this.getLocation = function(returnFunction){
        this.gps.getLocation(returnFunction);
    },
    /*
     * setFilter
     * Set a filter to the meldingen layer.
     * @param Takes a javascript Object as a parameter, which denotes the filter. The object is as follows:
            var filter = {
                id: "",
                schade_nr: "",
                weg: [],
                hmpbegin: "",
                hmpeind: "",
                coordinator:[],
                datumbegin: "",
                datumeind: "",
                type: [],
                categorie: [],
                status: []
            };
     */
     this.setFilter = function(filter){
        if(this.ready){
            var layer = this.getMeldingLayer();
            this.resetFilter(layer);
            if(layer.getSource().updateParams !== undefined){
                for (var key in filter){
                    var f = {};
                    f[key] = Array.isArray(filter[key]) ? filter[key].join(",") : filter[key];
                    f[key + "_active"] = true;
                    if(f[key] !== ""){
                        layer.getSource().updateParams(f);
                    }
                }
            }
            
        }else{
            var me = this;
            me.filter = filter;
            setTimeout(function(filter){
                me.setFilter(me.filter);
            }, 300);
        }
     },

    this.setEditTools = function(tools){
        if(this.ready){
            this.edit.buttonConfig = tools;
        }else{
            var me = this;
            me.tools = tools;
            setTimeout(function(tools){
                me.setEditTools(me.tools);
            }, 300);
        }
    },

     this.resetAllFilters = function(){
		if(this.ready){            
            var layers = this.thematicLayers.getLayers().getArray();
            for (var i = 0 ; i < layers.length ;i++){
                this.resetFilter(layers[i]);
            }
        }else{
            var me = this;
            setTimeout(function(){
                me.resetAllFilters();
            }, 300);
        }
     },

     this.resetFilter = function(layer){
        if(this.ready && layer !== undefined && layer.getSource()!== undefined && layer.getSource().getParams !== undefined){        
            var params = layer.getSource().getParams();
            var newParams = {};
            for(var key in params){
                if(key !== "layers"){
                    newParams[key]= null;
                }
            }
            layer.getSource().updateParams(newParams);
        }else{
            var me = this;
            me.layer;
            setTimeout(function(){
                me.resetFilter(me.layer);
            }, 300);
        }
     },

     this.dummyFilter = function(){
        var filter = {
            type: [,1,3]
        };
        this.setFilter(filter);
     },

    /************************** Map creation functions *********************/

    /************** Creation of layers *************/
    this.initLayers = function(){
        this.wmtsParser =  new ol.format.WMTSCapabilities();
        this.baseLayers = new ol.layer.Group({
            title: 'Ondergronden',
            layers: []
        });

        this.thematicLayers = new ol.layer.Group({
            title: 'Themalagen',
            layers: []
        });

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
        this.initBaseLayers(extentAr, projection, resolutions, matrixIds);
        this.initThematicLayers(extentAr, projection, resolutions, matrixIds);

        this.createMap(this.config.initial_zoom || 2, extentAr,projection, this.config.map_id);
    },

    this.initBaseLayers = function(extentAr, projection, resolutions, matrixIds){
        var layers = this.config.baseLayers;
        for(var i= 0 ; i < layers.length; i++){
            var layer = layers[i];
            this.initLayer(layer,this.baseLayers, extentAr, projection, resolutions, matrixIds, true);
        }
    },

    this.initThematicLayers = function(extentAr, projection, resolutions, matrixIds){
        var layers = this.config.thematicLayers;
        for(var i= 0 ; i < layers.length; i++){
            var layer = layers[i];
            this.initLayer(layer,this.thematicLayers, extentAr, projection, resolutions, matrixIds, false, i);
        }
    },

    this.initLayer = function (layerConfig, group, extentAr, projection, resolutions, matrixIds, base, index){
        var type = layerConfig.type;
        var layer = null;
        switch(type){
            case "TMS":
                layer = this.initTMSLayer(layerConfig, extentAr, projection, base);
                break;
            case "WMS":
                layer = this.initWMSLayer(layerConfig, base);
                break;
            case "WMTS":
                layer = this.initWMTSLayer(layerConfig, extentAr, projection, resolutions, matrixIds, base, group,index)
                break;
            default:
                console.error("Type " + type + " not possible to instantiate as a layer");
        }
        if(layer){
            group.getLayers().push(layer);
        }
    },

    this.initTMSLayer = function(layer,extentAr, projection, base){
        var tmsSource = new ol.source.XYZ({
            crossOrigin: 'anonymous',
            extent: extentAr,
            projection: projection,
            tilePixelRatio: layer.tilePixelRatio ? layer.tilePixelRatio : 1,
        });
        var tms = new ol.layer.Tile({
            source: tmsSource,
            type: base ? "base" : null,
            opacity: layer.opacity ? layer.opacity : 1,
            maxResolution: layer.maxResolution,
            minResolution: layer.minResolution,
            title: layer.label,
            visible: layer.visible ? layer.visible : false
        });
        return tms;
    },
   
    this.initWMTSLayer = function (layerConfig, extentAr, projection, resolutions, matrixIds, base, group, index){
        var me = this;
        me.projection = projection;
        me.index = index;
        $.ajax(layerConfig.url).then(function(response) {
            var result = me.wmtsParser.read(response);
            var config = {
                layer: layerConfig.layer,
                crossOrigin: null,
                projection: "EPSG:28992"
            };

            if(layerConfig.matrixSet){
                config.matrixSet = layerConfig.matrixSet;
            }
            if(layerConfig.projection){
                config.projection = layerConfig.projection;
            }
            var options = ol.source.WMTS.optionsFromCapabilities(result, config);

            var source =  new ol.source.WMTS(options);
            var layer = new ol.layer.Tile({
                opacity: layerConfig.opacity ? layerConfig.opacity : 1,
                maxResolution: layerConfig.maxResolution,
                minResolution: layerConfig.minResolution,
                title: layerConfig.label,
                type: base ? "base" : null,
                source:source,
                visible: layerConfig.visible !== undefined ? layerConfig.visible : false
            });
            group.getLayers().insertAt(me.index,layer);
            if(group.getProperties().title === "Themalagen"){
                me.layerIndexOffsetByAsyncLayers ++;
            }
        });
    },

    this.initWMSLayer = function (layerConfig, base){
      /*  var layer = new ol.layer.Tile({
            type: base ? "base" : null,
            title: layerConfig.label,
            opacity: layerConfig.opacity ? layerConfig.opacity : 1,
            maxResolution: layerConfig.maxResolution,
            minResolution: layerConfig.minResolution,
            visible: layerConfig.visible ? layerConfig.visible : false,
            source: new ol.source.TileWMS({
                url: layerConfig.url,
                params: {
                    layers: layerConfig.layers,
                    width: 512,
                    height: 512,
                    query_layers: layerConfig.layers
                }
            })
        });*/
        var layer = new ol.layer.Image({
            type: base ? "base" : null,
            title: layerConfig.label,
            opacity: layerConfig.opacity ? layerConfig.opacity : 1,
            maxResolution: layerConfig.maxResolution,
            minResolution: layerConfig.minResolution,
            visible: layerConfig.visible ? layerConfig.visible : false,
            source: new ol.source.ImageWMS({
                url: layerConfig.url,
                params: {
                    layers: layerConfig.layers,
                    query_layers: layerConfig.layers
                }
            })
        });
        return layer;
    },


    /************** Creation of Tools *************/
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

        this.gps = new b3p.GPSControl({
            map:this.map,
            tracking :false
        });
        this.map.addControl(this.gps);

        var layerSwitcher = new ol.control.LayerSwitcher({});
        this.map.addControl(layerSwitcher);

        this.popup = new b3p.Popup({map:this.map});

        var editConfig = this.config.getFeature;
        editConfig.map = this.map;
        editConfig.popup = this.popup;
        editConfig.mode = this.mode;

        this.edit = new b3p.EditControl(editConfig);

        if(this.mode === "view" || this.mode === "edit"){
            var getfeatureconfig = this.config.getFeature;
			var index = getfeatureconfig.layerIndex ? getfeatureconfig.layerIndex : 0;
            getfeatureconfig.map = this.map;
            getfeatureconfig.layer = this.getMeldingLayer();
            getfeatureconfig.mode = this.mode;
            getfeatureconfig.popup = this.popup;
            getfeatureconfig.edit = this.edit;
            this.getFeature = new b3p.GetFeature(getfeatureconfig);
        }
        
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

    /************** Creation of the map *************/
    this.createMap = function(zoom, extent, projection,mapId){
        var interactions = ol.interaction.defaults({altShiftDragRotate:false, pinchRotate:false});

        this.map = new ol.Map({
            target: mapId,
            layers: [this.baseLayers,this.thematicLayers],
            interactions: interactions,
            view: new ol.View({
                projection: projection,
                center: [154863, 373544],
                zoom: zoom,
                minResolution: 0.105,
                maxResolution: 3440.64,
                extent: extent
            }),
            controls: []
        });
    },

    /**
     * Load the scripts
     */
    this.loadScripts = function(){
        if(this.scripts.length > 0 ){
            var script = this.scripts[0];
            this.scripts.splice(0,1);
            if(script.indexOf("map") !== -1 && this.getQueryStringValue("local")== "true"){
                script = script.substring(4);
            }
            this.loadScript(script, this.loadScripts);
        }else{
            this.initComponent();
        }
    },
   
    this.getQueryStringValue = function (key) {  
      return unescape(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + escape(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));  
    },

    this.loadScript = function (url, callback){
        // Adding the script tag to the head as suggested before
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;

        // Then bind the event to the callback function.
        // There are several events for cross browser compatibility.
        var me = this;
        script.onreadystatechange = function(){
            callback.apply(me);
        };
        script.onload = function(){
            callback.apply(me);
        };

        // Fire the loading
        head.appendChild(script);
    },
    this.getMeldingLayer = function(){
        var layers = this.thematicLayers.getLayers().getArray();
        var index = this.config.getFeature.layerIndex ? this.config.getFeature.layerIndex : 0;
        index += this.layerIndexOffsetByAsyncLayers;
        var layer = layers[index];
        return layer;
        
    }
}

function initOptions(me,options){
    for ( key in options){
        me[key] = options[key];
    }
}
