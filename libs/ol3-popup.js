

b3p.Popup = function(options){
	var me = this;
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