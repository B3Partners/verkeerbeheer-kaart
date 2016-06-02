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
b3p.GetFeature = function(options) {
	options.maxResults = options.maxResults ? options.maxResults : 5;
	options.tolerance = options.tolerance ? options.tolerance : 4;
	initOptions(this,options);

	var me = this;
	this.gmlformat = new ol.format.WFS();
	this.geojsonformat = new ol.format.GeoJSON();
	this.map.on('singleclick',this.onMapClicked, this);
};

b3p.GetFeature.prototype.onMapClicked = function(evt) {
	var coordinate = evt.coordinate;
	//this.popup.setPosition(coordinate);
	var extent = this.getBBOX(coordinate);
	var url = this.layer.getSource().getUrl() + '&service=WFS&' + 'version=1.1.0&request=GetFeature&typename=' + this.layer.getSource().getParams().layers.join(",") +
		'&srsName=EPSG:28992&bbox=' + extent + '';
		//&outputFormat=geojson
	var me = this;
	$.ajax({
		url: url,
		crossDomain:true,
		dataType: 'text',
		success: function (response) {
			if(response && response !== ""){
				var data = me.gmlformat.readFeatures(response);
				if(data.length > 0){
					//var data = JSON.parse(response);
					me.handleResults(data);
					if(data.length > 0){
						me.popup.setPosition(coordinate);
					}
				}
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
	var content = '';
	for(var i = 0 ; i < numResults ; i++){
		var result = results[i];
		if(i > 0){
			content += "<hr>";
		}
		content += this.handleResult(result);
	}
	this.popup.setInnerHTML(content);

};

b3p.GetFeature.prototype.handleResult = function(result) {
	var content = '<span class="result-block">';
	content += '<span class="result-title">' + result.getProperties()["zType"]+'</span>';
	content += '<br/>';
	content += '<span class="result-content"><span class="result-head">Weg</span><span class="result-value"> ' + result.getProperties()["zWeg"] +"</span></span>";
	content += '<span class="result-content"><span class="result-head">Datum</span><span class="result-value"> ' + result.getProperties()["zDatum"] +"</span></span>";
	content += '<span class="result-content"><span class="result-head">Hectometer</span><span class="result-value"> ' + result.getProperties()["zHmp"] +"</span></span>";
	content += '<span class="result-content"><span class="result-head">Omschrijving</span><span class="result-value"> ' + this.emptyIfUndefined(result.getProperties()["zOpm"]) +"</span></span>";
	//content += '<span class="result-content"><span class="result-head">Omschrijving</span><span class="result-value"> ' + result.getProperties()["zWeg"] +"</span></span>";
	var geojson = this.geojsonformat.writeFeatureObject(result);
	content += this.edit.getLink(geojson);
	content += '</span>';
	return content;
};

b3p.GetFeature.prototype.emptyIfUndefined = function(value){
	if(value === undefined){
		return "";
	}else{
		return value;
	}
};