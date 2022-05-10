import './style.css';
import {Map, View} from 'ol';
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
} from 'ol/interaction';
import {fromLonLat} from 'ol/proj';
import sync from 'ol-hashed';
import DragAndDrop from 'ol/interaction/DragAndDrop';





const geojson = new VectorLayer({
  title: 'IADD Boundaries',
  source: new VectorSource({
      url: "http://localhost:8080/geoserver/cite/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cite%3AIL_Drainage_Districts&maxFeatures=50&outputFormat=application%2Fjson",
      format: new GeoJSON(),
      wrapX: false,
  }, {
    tileOptions: {crossOriginKeyword: 'anonymous'},
    transitionEffect: null
  })
});

const urlILCo = "https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/illinois-counties.geojson" 

// var vectorLayerJSON_1 = new VectorLayer({
//   projection : 'EPSG:4326',
//   url: urlILCo,
//   format: new GeoJSON()
// });

const select = new Select({
  wrapX: false,
});

const modify = new Modify({
  features: select.getFeatures(),
});

const map = new Map({
  interactions: defaultInteractions().extend([select,modify]),
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    }), geojson,
  ],
  view: new View({
    center: fromLonLat([-88.75, 41.85]),
    zoom: 10,
  })
});
//have the map load the previous exent from the previous session
sync(map);

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