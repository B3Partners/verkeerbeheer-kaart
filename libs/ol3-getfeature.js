b3p.GetFeature = function(options) {
	this.editLink = options.editLink;
	this.viewLink = options.viewLink;
	this.createLink = options.createLink;
	this.mode = options.mode;

	this.map = options.map;
	this.maxResults = options.maxResults ? options.maxResults : 10;
	this.layer = options.layers;
	this.tolerance = options.tolerance ? options.tolerance : 4;
	
	/**;
	* Elements that make up the popup.
	*/
	var container = document.createElement('div');
	container.id = 'popup';
	container.className = 'ol-popup';

  	var closer = document.createElement('a');
    closer.href =  '#';
    closer.id = "popup-closer";
    closer.className = "ol-popup-closer";
   
	this.content = document.createElement('div');
	this.content.id = 'popup-content';
	container.appendChild(this.content);
	container.appendChild(closer);

	document.getElementsByTagName('body')[0].appendChild(container);

	/**
	* Create an overlay to anchor the popup to the map.
	*/
	this.overlay = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({
		element: container,
		autoPan: true,
		autoPanAnimation: {
			duration: 250
		}
	}));

	this.map.addOverlay(this.overlay);

	/**
	* Add a click handler to hide the popup.
	* @return {boolean} Don't follow the href.
	*/
	closer.onclick = function() {
		me.overlay.setPosition(undefined);
		closer.blur();
		return false;
	};
	
	var me = this;
	this.map.on('singleclick',this.onMapClicked, this);
};

b3p.GetFeature.prototype.onMapClicked = function(evt) {
	var coordinate = evt.coordinate;
	this.overlay.setPosition(coordinate);
	var extent = this.getBBOX(coordinate);
	var url = this.layer.getSource().getUrl() + '&service=WFS&' + 'version=1.1.0&request=GetFeature&typename=' + this.layer.getSource().getParams().layers.join(",") +
		'&outputFormat=geojson&srsName=EPSG:28992&bbox=' + extent + '';
	var me = this;
	$.ajax({
		url: url,
		crossDomain:true,
		dataType: 'text',
		success: function (response) {
			var data = JSON.parse(response);
			me.handleResults(data.features);
			if(data.features.length > 0){
				me.overlay.setPosition(coordinate);
			}
		},
		error: function(xhr, status, error) {
			throw "Error collecting features: " + status + " Error given:" + error;
		}
	});
};

b3p.GetFeature.prototype.getBBOX = function(point){
	var viewResolution = (this.map.getView().getResolution());
	var distance = this.tolerance * viewResolution;
	var extent = {
		minx: point[0] - distance,
		miny: point[1] - distance,
		maxx: point[0] + distance,
		maxy: point[1] + distance
	};
	var bbox = extent.minx +"," + extent.miny +"," + extent.maxx +"," + extent.maxy;
	return bbox;
};

b3p.GetFeature.prototype.handleResults = function(results) {
	var numResults = Math.min(this.maxResults,results.length);
	this.content.innerHTML = '';
	for(var i = 0 ; i < numResults ; i++){
		var result = results[i];
		this.handleResult(result);
	}
};

b3p.GetFeature.prototype.handleResult = function(result) {
	this.content.innerHTML += '<span class="result-block">';
	this.content.innerHTML += '<span class="result-title">Feature</span>';
	this.content.innerHTML += '<span class="result-content">Naam ' + result.properties["gm_naam"];
	switch(this.mode){
		case "edit":
			this.content.innerHTML += '<br/><a href="' + this.replaceId(result.properties["gm_code"],this.editLink) + '">Bewerk melding</a>';
			break
		case "new":
			this.content.innerHTML += '<br/><a href="' + this.replaceId(result.properties["gm_code"],this.createLink) + '">Maak melding</a>';
			break
		case "view":
		default:
			this.content.innerHTML += '<br/><a href="' + this.replaceId(result.properties["gm_code"],this.viewLink) + '">Bekijk melding</a>';
			break
	}
	this.content.innerHTML += '</span>';
};

b3p.GetFeature.prototype.replaceId = function(id, link){
	var newLink = link.replace("[meldingid]",id);
	return newLink;
};