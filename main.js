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







const geojson = new VectorLayer({
  title: 'IADD Boundaries',
  source: new VectorSource({
      url: "http://localhost:8080/geoserver/cite/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cite%3AIL_Drainage_Districts&maxFeatures=50&outputFormat=application%2Fjson",
      format: new GeoJSON({
        defaultDataProjection: 'EPSG:4326'
      }),
      wrapX: false,
  }, {
    name: 'Drainage District Boundaries',
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
    }), new VectorLayer({
      title: 'IADD Boundaries',
      source: new VectorSource({
          url: "http://localhost:8080/geoserver/cite/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cite%3AIL_Drainage_Districts&maxFeatures=50&outputFormat=application%2Fjson",
          format: new GeoJSON({
            defaultDataProjection: 'EPSG:4326'
          }),
          wrapX: false,
      }, {
        name: 'Drainage District Boundaries',
        tileOptions: {crossOriginKeyword: 'anonymous'},
        transitionEffect: null
      })
    }),
  ],
  controls:[
    //Define the default controls
    new Zoom(),
    new Rotate(),
    new Attribution(),
    //Define some new controls
    new ZoomSlider(),
    new MousePosition({
      target: 'coordinates'
    }),
    new ScaleLine(),
    new OverviewMap()
  ],view: new View({
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