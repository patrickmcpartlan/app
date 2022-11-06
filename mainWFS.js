import './style.css';
import {Map, Overlay, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import 'ol/ol.css';

import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {
  Modify,
  Select,
  defaults as defaultInteractions,
  defaults,
} from 'ol/interaction';
import {fromLonLat} from 'ol/proj';
import sync from 'ol-hashed';
import DragAndDrop from 'ol/interaction/DragAndDrop';
import Draw from 'ol/interaction/Draw';
import Zoom from 'ol/control/Zoom';
import Rotate from 'ol/control/Rotate';
import Attribution from 'ol/control/Attribution';
import ZoomSlider from 'ol/control/ZoomSlider';
import MousePosition from 'ol/control/MousePosition';
import ScaleLine from 'ol/control/ScaleLine';
import OverviewMap from 'ol/control/OverviewMap';
import GML from 'ol/format/GML';
import WFS from 'ol/format/WFS';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
// import createStringXY  from 'ol/coordinate/createStringXY';





// controlMousePos = new MousePosition({
//   coordinateFormat: createStringXY(4),
// });

var popup = document.getElementById('popup');

$('#popup-closer').on('click', function() {
  overlayPopup.setPosition(undefined);
});

var overlayPopup = new Overlay({
  element: popup
})



const urlILCo = "https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/illinois-counties.geojson" 

// var vectorLayerJSON_1 = new VectorLayer({
//   projection : 'EPSG:4326',
//   url: urlILCo,
//   format: new GeoJSON()
// });





var sourceVector = new VectorSource({
  loader: function(extent) {
      $.ajax('http://localhost:8080/geoserver/wfs', {
          type: 'GET',
          data: {
              service: 'WFS',
              version: '1.1.0',
              request: 'GetFeature',
              typename: 'cite:IL_Drainage_Districts',
              srsname: 'EPSG:4326', //the srs of map.
              //cql_filter: "property='Value'",
              //cql_filter: "BBOX(geometry," + extent.join(',') + ")",
              bbox: extent.join(',') + ',EPSG:4326'
          },
      }).done(function(response) {
          console.log("response: " + response);
          formatWFS = new WFS(),
              sourceVector.addFeatures(formatWFS.readFeatures(response))
      });
  },
});

var layerVector = new VectorLayer({
  source: sourceVector,
  wrapX: false
});

//hover highlight
var selectPointerMove = new Select({
  condition: 'pointermove'
});


var map = new Map({
  // interactions: defaultInteractions().extend([select,modify]),
  target: 'map',
  overlays: [overlayPopup],


  layers: [
    new TileLayer({
      source: new OSM()
    }),layerVector,
  ],
  controls:[
    //Define the default controls
    new Zoom(),
    new Rotate(),
    new Attribution(),
    //Define some new controls
    new ZoomSlider(),
    new MousePosition(),
    // controlMousePos,
    new ScaleLine(),
    new OverviewMap()
  ],view: new View({
    center: fromLonLat([-88.75, 41.85]),
    zoom: 10,
  })
});
//have the map load the previous exent from the previous session
// sync(map);
map.addInteraction(selectPointerMove);


var interaction;
var select = new Select({
    style: new Style({
        stroke: new Stroke({
            color: '#FF2828'
        })
    })
});



//add drag and drop interaction
const source = new VectorSource();
//Drag and drop empty layer
const layer = new VectorLayer({
  source: source,
});
map.addLayer(layer);

map.addInteraction(
  new DragAndDrop({
    source: source,
    formatConstructors: [GeoJSON],
  })
);

const clear = document.getElementById('clear');
clear.addEventListener('click', function () {
  source.clear();
});

const format = new GeoJSON({featureProjection: 'EPSG:4326'});
const download = document.getElementById('download');
source.on('change', function () {
  const features = source.getFeatures();
  const json = format.geojson;
  download.href =
    'data:application/json;charset=utf-8,' + encodeURIComponent(json);
});

////Wfs-t
var dirty = {};
var formatWFS = new WFS();
var formatGML = new GML({
    featureNS: 'http://geoserver.org/cite',
    featureType: 'cite:IL_Drainage_Districts',
    srsName: 'EPSG:4326'
});
var writeOptions = {
  featureNS: 'http://geoserver.org/cite',
  featurePrefix:  'cite',
  featureType: 'IL_Drainage_Districts',
  srsName: 'EPSG:4326',
  nativeElements: null
}

//transactWFS function
var transactWFS = function(p, f) {
  switch (p) {
      case 'insert':
          node = formatWFS.writeTransaction([f], null, null, writeOptions);
          break;
      case 'update':
          node = formatWFS.writeTransaction(null, [f], null, formatGML);
          break;
      case 'delete':
          node = formatWFS.writeTransaction(null, null, [f], formatGML);
          break;
  }

  s = new XMLSerializer();
  str = s.serializeToString(node);
  $.ajax('http://localhost:8080/geoserver/wfs', {
      type: 'POST',
      dataType: 'xml',
      processData: false,
      contentType: 'text/xml',
      data: str
  }).done(function(response){
          alert(response);
      });
}  

$('.btn-floating').hover(
  function() {
      $(this).addClass('darken-2');
  },
  function() {
      $(this).removeClass('darken-2');
  }
);


$('.btnMenu').on('click', function(event) {
  $('.btnMenu').removeClass('orange');
  $(this).addClass('orange');
  map.removeInteraction(interaction);
  select.getFeatures().clear();
  map.removeInteraction(select);
  switch ($(this).attr('id')) {

      case 'btnSelect':
          interaction = new ol.interaction.Select({
              style: new ol.style.Style({
                  stroke: new ol.style.Stroke({
                      color: '#f50057',
                      width: 2
                  })
              })
          });
          map.addInteraction(interaction);
          interaction.getFeatures().on('add', function(e) {
              props = e.element.getProperties();
              if (props.status) {
                  $('#popup-status').html(props.status);
              } else {
                  $('#popup-status').html('n/a');
              }
              if (props.tiendas) {
                  $('#popup-tiendas').html(props.tiendas);
              } else {
                  $('#popup-tiendas').html('n/a');
              }
              coord = $('.ol-mouse-position').html().split(',');
              overlayPopup.setPosition(coord);
          });
          break;

      case 'btnEdit':
          map.addInteraction(select);
          interaction = new ol.interaction.Modify({
              features: select.getFeatures()
          });
          map.addInteraction(interaction);

          snap = new ol.interaction.Snap({
              source: layerVector.getSource()
          });
          map.addInteraction(snap);

          dirty = {};
          select.getFeatures().on('add', function(e) {
              e.element.on('change', function(e) {
                  dirty[e.target.getId()] = true;
              });
          });
          select.getFeatures().on('remove', function(e) {
              f = e.element;
              if (dirty[f.getId()]) {
                  delete dirty[f.getId()];
                  featureProperties = f.getProperties();
                  delete featureProperties.boundedBy;
                  var clone = new ol.Feature(featureProperties);
                  clone.setId(f.getId());
                  transactWFS('update', clone);
              }
          });
          break;

      case 'btnDrawPoint':
          interaction = new ol.interaction.Draw({
              type: 'Point',
              source: layerVector.getSource()
          });
          map.addInteraction(interaction);
          interaction.on('drawend', function(e) {
              transactWFS('insert', e.feature);
          });
          break;

      case 'btnDrawLine':
          interaction = new ol.interaction.Draw({
              type: 'LineString',
              source: layerVector.getSource()
          });
          map.addInteraction(interaction);
          interaction.on('drawend', function(e) {
              transactWFS('insert', e.feature);
          });
          break;

      case 'btnDrawPoly':
          interaction = new ol.interaction.Draw({
              type: 'Polygon',
              source: layerVector.getSource()
          });
          map.addInteraction(interaction);
          interaction.on('drawend', function(e) {
            var feature = e.feature;
            feature.setGeometry(feature.getGeometry());
              transactWFS('insert', e.feature);
          });
          break;

      case 'btnDelete':
          interaction = new ol.interaction.Select();
          map.addInteraction(interaction);
          interaction.getFeatures().on('change:length', function(e) {
              transactWFS('delete', e.target.item(0));
              interaction.getFeatures().clear();
              selectPointerMove.getFeatures().clear();
          });
          break;

      default:
          break;
  }
});

$('#btnZoomIn').on('click', function() {
  var view = map.getView();
  var newResolution = view.constrainResolution(view.getResolution(), 1);
  view.setResolution(newResolution);
});

$('#btnZoomOut').on('click', function() {
  var view = map.getView();
  var newResolution = view.constrainResolution(view.getResolution(), -1);
  view.setResolution(newResolution);
});


// /////Geojson to WFS-T///////////
// import wfs from 'geojson-to-wfs-t-2';
 
// const nullIsland = {
//   type: 'Feature',
//   properties: {place_name: 'null island'},
//   geometry: {
//     type: 'Point',
//     coordinates: [0, 0]
//   }
//   id: 'feature_id'
// }
// const params = {geometry_name: 'geom', layer: 'my_lyr', ns: 'my_namespace'};
 
// // create a stringified transaction inserting null island
// wfs.Transaction(
//   wfs.Insert(nullIsland, params),
//   {
//     nsAssignments: {
//       my_namespace: 'https://example.com/namespace_defn.xsd'
//     }
//   }
// );
 
// // create a stringified transaction updating null island's name
// wfs.Transaction(
//   wfs.Update({properties: {place_name: 'not Atlantis'}, id: nullIsland.id }),
//   {nsAssignments: ...}
// )
// // same deal, but deleting it
// wfs.Transaction(
//   wfs.Delete({id: nullIsland.id}, params),
//   {nsAssignments: ...}
// )
// /////////////


// //////Saving with WFS-T///////////
// var WFSTSerializer = new ol.format.WFS();
// var featObject = WFSTSerializer.writeTransaction(this.getFeatures(), null, null, {
//     featureType: 'ne:countries',
//     featureNS: 'http://naturalearthdata.com',
//     srsName: 'EPSG:3857'
// });
// var serializer = new XMLSerializer();
// var featString = serializer.serializeToString(featObject);
// var request = new XMLHttpRequest();
// request.open('POST', 'myowsserver?SERVICE=WFS');
// request.setRequestHeader('Content-Type', 'text/xml');
// request.send(featString);