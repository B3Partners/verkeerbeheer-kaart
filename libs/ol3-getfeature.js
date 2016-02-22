b3p.GetFeature = function(opt_options) {
	this.map = opt_options.map;
	/**
	* Elements that make up the popup.
	*/
	var container = document.getElementById('popup');
	var content = document.getElementById('popup-content');
	var closer = document.getElementById('popup-closer');


      /**
       * Create an overlay to anchor the popup to the map.
       */
      var overlay = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({
        element: container,
        autoPan: true,
        autoPanAnimation: {
          duration: 250
        }
      }));

      this.map.addOverlay(overlay);


      /**
       * Add a click handler to hide the popup.
       * @return {boolean} Don't follow the href.
       */
      closer.onclick = function() {
        overlay.setPosition(undefined);
        closer.blur();
        return false;
      };



        var layer = opt_options.layers;
        this.map.on('singleclick', function(evt) {

            var coordinate = evt.coordinate;
            overlay.setPosition(coordinate);
            var extent = [101688.72,443365.44,115367.28,450502.08];
            var me = this;
            var url = layer.getSource().getUrl() + '&service=WFS&' +
            'version=1.1.0&request=GetFeature&typename=' + layer.getSource().getParams().layers.join(",") +
            '&outputFormat=geojson&srsName=EPSG:28992&bbox=' + extent.join(',') + '';
            $.ajax({
                url: url,
                crossDomain:true,
                dataType: 'text',
                success: function (response) {
                    var data = JSON.parse(response);
                    var a = 0;
                    overlay.setPosition(coordinate);

                    content.innerHTML = '<p>You clicked here:</p>';
                },
                error: function(xhr, status, error) {
                    throw "Error collecting features: " + status + " Error given:" + error;
                }
            });


            document.getElementById('info').innerHTML = '';
            var viewResolution = (this.getView().getResolution());
            var url = layer.getSource().getGetFeatureInfoUrl(
                evt.coordinate, viewResolution, 'EPSG:28992',
                {'INFO_FORMAT': 'text/plain'});
            if (url) {
              document.getElementById('info').innerHTML =
                  '<iframe seamless src="' + url + '"></iframe>';
            }
        });
};
ol.inherits(b3p.GetFeature, ol.control.Control);
