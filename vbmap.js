var res = [3440.640, 1720.320, 860.160, 430.080, 215.040, 107.520, 53.760, 26.880, 13.440, 6.720, 3.360, 1.680, 0.840, 0.420];

var RD2 = new L.Proj.CRS.TMS(
        'EPSG:28992',
        '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +units=m +towgs84=565.2369,50.0087,465.658,-0.406857330322398,0.350732676542563,-1.8703473836068,4.0812 +no_defs', [-285401.92, 22598.08, 595401.9199999999, 903401.9199999999], 
    {
            transformation: new L.Transformation(1,0,-1,0),
            resolutions: res
    });


var map = L.map('map', {crs:RD2}).setView([52.5, 5.8], 2);
/*
L.tileLayer('http://geodata.nationaalgeoregister.nl/tms/1.0.0/brtachtergrondkaart/{z}/{x}/{y}.png', {
    tms: true
}).addTo(map);*/

L.esri.DynamicMapLayer("http://geo.flevoland.nl/arcgis/rest/services/Groen_Natuur/Agrarische_Natuur/MapServer", {
    "layers": "0"
}).addTo(map);