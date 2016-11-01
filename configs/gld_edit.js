var config = {
  mode: "edit", // [ view | edit | new ]

  map_id : "map",
  initial_zoom: 9, // "zoomfactor van de kaart bij opstart",
  getFeature :{
      tolerance: 10,
      createLink : "https://gelderland.verkeersbeheer.nl/default.aspx?page=melding&id=0", // http://<server>.nl/<path>
      viewLink: "https://gelderland.verkeersbeheer.nl/default.aspx?page=melding&id=[meldingid]", // http://<server>.nl/<path>/[meldingid]
      editLink: "https://gelderland.verkeersbeheer.nl/default.aspx?page=melding&id=[meldingid]", // http://<server>.nl/<path>/[meldingid]
      idProperty : "zId",
      labelProperty : "zWeg",
      typeProperty: "zTypeRef",
      maxResults:3,
      layerIndex: 6
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
  baseLayers: [
    {
        url: "http://www.openbasiskaart.nl/mapcache/tms/1.0.0/osm@rd/{z}/{x}/{-y}.png",
        label: "Openbasiskaart",
        type: "TMS",
        visible: true
    },
    {
        url: "https://geodata.nationaalgeoregister.nl/wmts/brtachtergrondkaart?request=GetCapabilities",
        label: "BRT",
        projection: "EPSG:28992",
        layer: "brtachtergrondkaart",
        type: "WMTS"
    },
    {
        url: "http://webservices.gbo-provincies.nl/lufo/services/wms?",
        layers: "actueel_zomer",
        type: "WMS",
        label: "Luchtfoto"
    }/*,
    {
      url: "https://geodata.nationaalgeoregister.nl/tiles/service/wmts/bgtachtergrond?request=GetCapabilities",
      layer : "top10nlv2",
      type: "WMTS",
      label : "BGT"
    }*/
  ],
  thematicLayers: [
   {
        url: "https://geodata.nationaalgeoregister.nl/tiles/service/wmts/bgtachtergrond?request=GetCapabilities",
        layer: "bgtstandaard",
        type: "WMTS",
        label: "BGT",
        visible: false
    },
  {
      url: "http://ags101.prvgld.nl/arcgis/services/IMGEO/imgeo_wms/MapServer/WMSServer?styles=default,default,default,default,default,default,default,default,default,default,default,default",
      layers: ["3,4,5,6,7,8,9,10,11,12,13,14"],
      type: "WMS",
      label: "wegen- detail",
      visible: false
  },
  {
      url: "http://ags101.prvgld.nl/arcgis/services/IMGEO/imgeo_wms/MapServer/WMSServer?styles=default",
      layers: ["0"],
      type: "WMS",
      label: "wegen- beheer",
      visible: false
  },
  {
      url: "http://ags101.prvgld.nl/arcgis/services/IMGEO/imgeo_wms/MapServer/WMSServer?styles=default",
      layers: ["1"],
      type: "WMS",
      label: "wegen- eigendom",
      visible: false
  },
  {
      url: "http://ags101.prvgld.nl/arcgis/services/IMGEO/imgeo_wms/MapServer/WMSServer?styles=default",
      layers: ["2"],
      type: "WMS",
      label: "wegen- wegas",
      visible: true
  },
  {     
      url: "http://ags101.prvgld.nl/arcgis/services/IMGEO/imgeo_wms/MapServer/WMSServer?styles=default",
      layers: ["15"],
      type: "WMS",
      label: "wegen- kilometrering",
      visible: true
  },
    {
           url: "https://mapserver.verkeersbeheer.nl/cgi-bin/mapserv.exe?map=c:\\maps\\gelderland_prod.map",
           layers: ["meldingenFilter"],
           type: "WMS",
           label: "Meldingen",
           visible: true,
           maxResolution: 14
       }
//                     ,
//                {
//                    url: "http://ags101.prvgld.nl/arcgis/rest/services/IMGEO/imgeo_wms/MapServer/14",
//                    layers: ["0"],
//                    type: "WMS",
//                    label: "hectopunten",
//                    visible: true,
//                    opacity: 0.6
//                }

//              ,
//        {
//            url: "http://ags101.prvgld.nl/arcgis/services/Verkeersbeheer/Verkeersbeheer_Kilometrering/MapServer/WMSServer?styles=default",
//            layers: ["0"],
//            type: "WMS",
//            label: "hectopunten",
//            visible: true,
//            opacity: 0.6
//        }

//       ,
//  {
//      url: "https://geodata.nationaalgeoregister.nl/nwbwegen/wms",
//      layers: ["hectopunten"],
//      type: "WMS",
//      label: "hectopunten",
//      visible: true,
//      opacity: 0.6
//  }

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