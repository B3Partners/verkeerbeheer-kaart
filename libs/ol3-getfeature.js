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
	options.maxResults = options.maxResults ? options.maxResults : 10;
	options.tolerance = options.tolerance ? options.tolerance : 4;
	initOptions(this,options);

	var me = this;
	this.map.on('singleclick',this.onMapClicked, this);
};

b3p.GetFeature.prototype.onMapClicked = function(evt) {
	var coordinate = evt.coordinate;
	//this.popup.setPosition(coordinate);
	var extent = this.getBBOX(coordinate);
	var url = this.layer.getSource().getUrl() + '&service=WFS&' + 'version=1.1.0&request=GetFeature&typename=' + this.layer.getSource().getParams().layers.join(",") +
		'&outputFormat=geojson&srsName=EPSG:28992&bbox=' + extent + '';
	var me = this;
	$.ajax({
		url: url,
		crossDomain:true,
		dataType: 'text',
		success: function (response) {
			if(response && response !== ""){
				var data = JSON.parse(response);
				me.handleResults(data.features);
				if(data.features.length > 0){
					me.popup.setPosition(coordinate);
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
		content += this.handleResult(result);
	}
	this.popup.setInnerHTML(content);

};

b3p.GetFeature.prototype.handleResult = function(result) {
	var content = '<span class="result-block">';
	content += '<span class="result-title">Feature</span>';
	content += '<span class="result-content">Naam ' + result.properties[this.labelProperty];
	content += this.edit.getLink(result);
	content += '</span>';
	return content;
};