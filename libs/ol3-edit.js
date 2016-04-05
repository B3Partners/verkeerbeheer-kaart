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
 * This class controls the adding and editting of features. It creates the buttons, handles the placement of the features and provides the callback when the user clicks 
 * on the link to save the feature to the database.
 *
 */
b3p.EditControl = function(options) {
    initOptions(this,options);

    this.geojsonParser = new ol.format.GeoJSON();
    this.currentItem = null;
    this.buttons = [];
    this.interaction = null;

    var me = this;
    var styleFunction = function(a,b,c){
        return me.getStyle(a,b,me);
    };
    this.features = new ol.Collection();
    this.featureOverlay = new ol.layer.Vector({
        source: new ol.source.Vector({features: this.features}),
            style: styleFunction
        });
    this.featureOverlay.setMap(this.map);

    if(this.mode === "new"){
        for (var key in this.buttonConfig){
            var button = this.buttonConfig[key];
            this.createButton(key, button);
        }
    }
};

ol.inherits(b3p.EditControl, ol.control.Control);

/* Public API functions */

/*
 *  Function to generate the URL to be called when clicked on the link in the popup. This function adds the geometry to the URL.
 */
b3p.EditControl.prototype.generateURL = function(){
    var feature = this.featureOverlay.getSource().getFeatures()[0];
    var coords = feature.getGeometry().getCoordinates()
    var coordString = "&zLocX=" + coords[0].toFixed(2) + "&zLocY=" + coords[1].toFixed(2);
    var feature = this.activeFeature;
    var url = "";
    switch(this.mode){
        case "edit":
            url =  this.replaceId(feature.properties[this.idProperty],this.editLink);
            break
        case "new":
            url = this.createLink;
            break
        case "view":
        default:
            url = this.replaceId(feature.properties[this.idProperty],this.viewLink);
            break
    }
    url += "&type=" + this.type;
    url += coordString;
    return url;
};

b3p.EditControl.prototype.setPosition = function(coords){
    this.popup.setPosition(coords);
    var feature = this.featureOverlay.getSource().getFeatures()[0];
    var coords = feature.getGeometry().setCoordinates(coords);
};

/*
 * Set a feature to the map as a vector.
 */
b3p.EditControl.prototype.setFeature = function(geojson){
    if(!this.modify){
        this.addInteraction();
    }
    this.activeFeature = geojson;
    this.features.clear();
    var feature = this.geojsonParser.readFeature(geojson);
    this.type = geojson.properties[this.typeProperty] ? geojson.properties[this.typeProperty] : 1;
    this.featureOverlay.getSource().addFeature(feature);
};


/* Helper functions */

b3p.EditControl.prototype.addInteraction = function(){
    var me = this;
    var styleFunction = function(a,b,c){
        return me.getStyle(a,b,me);
    };

    switch(this.mode){
        case "view":
            break;
        case "new":
            this.draw = new ol.interaction.Draw({
                features: this.features,
                type: "Point",
                style:  styleFunction
            });
            this.map.addInteraction(this.draw);
            this.draw.on("drawend",this.featureDrawn, this);
            // no break, "new also requires a modify interactions"
        case "edit":  
            this.modify = new ol.interaction.Modify({
                features: this.features
            });
            this.modify.on("modifyend",this.featureModified,this);
            this.map.addInteraction(this.modify);
            break;
    };
};

b3p.EditControl.prototype.createButton = function(typeMelding,options){
    var me = this;
    var toggle = function(e){
        e = e || window.event;
        var button = e.target;
        var type = button.typeMelding;
        me.toggle(button, type);
        e.preventDefault();
    };
    var button = document.createElement('button');
    button.typeMelding = typeMelding;
    button.id = "editButton" + typeMelding;
    button.title = "Maak een " + options.label;
    button.addEventListener('click', toggle, false);
    button.addEventListener('touchstart', toggle, false);

    var className = "edit" + typeMelding;

    var element = document.createElement('div');
    element.id = "editElement" + typeMelding;
    element.className = className +' edit ol-selectable ol-control ' + className +"-inactive" ;
    element.appendChild(button);

    document.getElementById("map").appendChild(element);

    ol.control.Control.call(this, {
       element : element 
    });

    this.buttons.push(button);
};

b3p.EditControl.prototype.removeInteraction = function(){
    this.map.removeInteraction(this.modify);
    this.map.removeInteraction(this.draw);
};

b3p.EditControl.prototype.getPopupText = function(){
    var newFeat = {properties : {}};
    var content = '<span class="result-block">';
    content += '<span class="result-title">Nieuwe ' + this.buttonConfig[this.type].label + ' maken </span>';
    newFeat.properties [this.idProperty] = 0;
    this.activeFeature = newFeat;
    content += this.getLink(newFeat);
    return content;
};

b3p.EditControl.prototype.getLink = function(result){
    var content = "";
    var onclickhandlerOpen = 'onclick="vbmap.openlink()"';
    var onclickhandlerGPS = 'onclick="vbmap.useGPS()"';
    switch(this.mode){
        case "edit":
            content += '<br/><a ' + onclickhandlerOpen + ' href="#">Bewerk melding</a>';
            this.setFeature(result);
            break
        case "new":
            content += '<br/><a ' + onclickhandlerOpen + ' href="#">Maak</a>';
            break
        case "view":
        default:
            content += '<br/><a ' + onclickhandlerOpen + ' href="#">Bekijk melding</a>';
            break
    }
    content += '<br/><a ' + onclickhandlerGPS + ' href="#">Gebruik GPS locatie</a>';
    return content;
};

b3p.EditControl.prototype.toggleStyle = function(button,active) {
    var element = button.parentElement;
    var parentClasses = element.className;
    
    var editElement = "edit" + button.typeMelding;
    var activeClass = editElement + "-active";
    var inactiveClass = editElement + "-inactive";
    if(active){
        element.className = element.className.split(inactiveClass).join(activeClass);
    }else{
        element.className = element.className.split(activeClass).join(inactiveClass);
    }
};

b3p.EditControl.prototype.replaceId = function(id, link){
    var newLink = link.replace("[meldingid]",id);
    return newLink;
};

b3p.EditControl.prototype.getStyle = function(a,b,me){
    var src = 'images/icon-' + me.type + ".png";

    return new ol.style.Style({
        image: new ol.style.Icon({
            scale: 1,
            src: src
        })});
};

/* Event handlers */

b3p.EditControl.prototype.toggle = function(button, type) {
    if(this.features){
        this.popup.setPosition()
        this.features.clear();
    }
    var element = button.parentElement;
    var parentClasses = element.className;
    
    var active = parentClasses.indexOf("-inactive") !== -1;
    if(active){
        this.type = type;
        this.addInteraction();
        for( var b in this.buttons){
            var but = this.buttons[b];
            if(b.id !== button.id){
                this.toggleStyle(but, false);
            }
        }
    }else{
        this.type = null;
        this.removeInteraction();
    }
    this.toggleStyle(button, active);
};

b3p.EditControl.prototype.featureModified = function(evt){
    var feature = evt.features.getArray()[0];
    var coords = feature.getGeometry().getCoordinates();
    this.popup.setPosition(coords);
};

b3p.EditControl.prototype.featureDrawn = function(evt){
    this.features.clear();
    var feature = evt.feature;
    this.activeFeature = feature;
    var coords = feature.getGeometry().getCoordinates();
    var content = this.getPopupText();
    this.popup.setInnerHTML (content);
    this.popup.setPosition(coords);
};