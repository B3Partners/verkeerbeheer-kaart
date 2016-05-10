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
b3p.Popup = function(options){
	var me = this;
	initOptions(this,options);

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
		offset: [0,-32],
		autoPan: true,
		autoPanAnimation: {
			duration: 250
		}
	}));

	options.map.addOverlay(this.overlay);

	/**
	* Add a click handler to hide the popup.
	* @return {boolean} Don't follow the href.
	*/
	closer.onclick = function() {
		me.overlay.setPosition(undefined);
		closer.blur();
		return false;
	};
	
};

b3p.Popup.prototype.setPosition = function(coordinate){
	this.overlay.setPosition(coordinate);
};

b3p.Popup.prototype.setInnerHTML = function(innerHTML){
	this.content.innerHTML = innerHTML;
};