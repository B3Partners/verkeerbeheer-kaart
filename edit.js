var config = {
  mode: "edit", // [ view | edit | new ]

  map_id : "map",
  initial_zoom: 9, // "zoomfactor van de kaart bij opstart",
  getFeature :{
      tolerance: 10,
      createLink : "http://map.verkeersbeheer.nl/default.aspx?page=melding&id=0", // http://<server>.nl/<path>
      viewLink : "http://map.verkeersbeheer.nl/default.aspx?page=melding&id=[meldingid]", // http://<server>.nl/<path>/[meldingid]
      editLink : "http://map.verkeersbeheer.nl/default.aspx?page=melding&id=[meldingid]", // http://<server>.nl/<path>/[meldingid]
      idProperty : "zId",
      labelProperty : "zWeg",
      typeProperty: "zTypeRef"
  },
  edit:{
        1 :{ 
          label :  "calamiteit",
          button: "radio_rood.png"
          },
        2 :{ 
          label :   "schouw",
          button: "radio_blauw.png"
          },
        3 :{ 
          label :   "melding",
          button: "radio_groen.png"
        }
  },
  baseLayers:[
    {
      url: "http://www.openbasiskaart.nl/mapcache/tms/1.0.0/osm@rd/{z}/{x}/{-y}.png",
      label: "Openbasiskaart",
      type: "TMS",
      visible: true
    },
    {
      url: "https://geodata.nationaalgeoregister.nl/wmts/brtachtergrondkaart?request=GetCapabilities",
      label :"BRT",
      projection: "EPSG:28992",
      layer: "brtachtergrondkaart",
      type: "WMTS"
    },
    {
      url: "http://webservices.gbo-provincies.nl/lufo/services/wms?",
      layers : "actueel_zomer",
      type: "WMS",
      label : "Luchtfoto"
    }/*,
    {
      url: "https://geodata.nationaalgeoregister.nl/tiles/service/wmts/bgtachtergrond?request=GetCapabilities",
      layer : "top10nlv2",
      type: "WMTS",
      label : "BGT"
    }*/
  ],
 thematicLayers:[
    {
      url: "http://mapserver.verkeersbeheer.nl/cgi-bin/mapserv.exe?map=c:\\maps\\verkeersbeheer.map",
      layers: ["meldingenFilter"],
      type: "WMS",
      label: "Meldingen",
      visible:true,
	  maxResolution: 14
    },
	{
      url: "https://geodata.nationaalgeoregister.nl/nwbwegen/wms",
      layers: ["hectopunten"],
      type: "WMS",
      label: "hectopunten",
      visible:true,
	  opacity: 0.6
    }
  ],
  tools: [
    {tool_id: "MousePosition"},
    {tool_id: "ZoomSlider"},
    {tool_id: "Zoom"},
    {tool_id: "ScaleLine"}
  ]

};


/**


 

Topografische ondergrond Arcgis rest: http://ags101.prvgld.nl/arcgis/rest/services/Algemeen/Ondergrond_grijs/MapServer

Topografische ondergrond TMS (PDOK): zie overzicht op https://www.pdok.nl/nl/producten/pdok-services/overzicht-urls/t

Basiskaart provinciale wegen Gelderland (IMGEO): http://ags101.prvgld.nl/arcgis/rest/services/IMGEO/imgeo_wms/MapServer 

Luchtfoto (alleen voor intern gebruik bij provincies!): http://webservices.gbo-provincies.nl/lufo/services/wms?

 */