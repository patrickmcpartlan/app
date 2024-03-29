import './style.css';
import '/node_modules/ol-layerswitcher/dist/ol-layerswitcher.css'
import {Map, Overlay, VectorTile, View} from 'ol';
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
import Zoom from 'ol/control/Zoom';
import Attribution from 'ol/control/Attribution';
import ZoomSlider from 'ol/control/ZoomSlider';
import MousePosition from 'ol/control/MousePosition';
import ScaleLine from 'ol/control/ScaleLine';
import OverviewMap from 'ol/control/OverviewMap';

import TileWMS from 'ol/source/TileWMS';
import XYZ from 'ol/source/XYZ';
import RasterSource from 'ol/source/Raster';
import ImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';
import LayerSwitcher from 'ol-layerswitcher';
import Group from 'ol/layer/Group';
import Tile from 'ol/layer/Layer';
import { Geolocation } from 'ol';
import {bbox} from 'ol/loadingstrategy';

import {Fill, Stroke, Style} from 'ol/style';
import { createStringXY } from 'ol/coordinate';
import olGeocoder from 'ol-geocoder';
import Layer from 'ol/layer/Layer';
import Vector from 'ol/layer/Vector';

import WMSCapabilities from 'ol/format/WMSCapabilities';
import { transformExtent } from 'ol/proj';


const select = new Select({
  hitTolerance:5,
  multi:true,
  wrapX: false,
});

const modify = new Modify({
  features: select.getFeatures(),
});



// An array of numbers representing an extent: [minx, miny, maxx, maxy].
 
var maxExtent = fromLonLat([-87.4952140000000043,36.9699719999999985,-91.5135180000000048, 42.5083479999999980])

const view = new View({
  center: [-9920914.790650634, 4889523.777846614],
  zoom: 4,
  // minZoom: 6.5,
  // extent: [-10020914.341856, 5211017.966314, -96.3456, 6636950.728974], //Lake Michigan
  extent: [-10620914.341856, 4289523.777846614, -9120914.790650634, 5289523.777846614],
});

// const view = new View({
//   // center: fromLonLat([-89.198326, 40.064990]),
//   center: [-9920914.790650634, 4889523.777846614], //x,y
//   zoom: 8, 
//   minZoom: 7.5,
//   // extent: fromLonLat([-87.4952140000000043,36.9699719999999985,-91.5135180000000048, 42.5083479999999980]),
//   extent: [-10187238.224461077, 5237434.309635073, -9713006.067917068, 4422340.778897436]
// });


let url22 = "https://levees.sec.usace.army.mil:443/api-local/leveed-areas?system_id=5105210001&embed=geometry&format=geo"





const illinois = new TileLayer({
  title: "Illinois",
  source: new TileWMS({
    url: 'http://localhost:8080/geoserver/wms',
    params: {'LAYERS': 'cite:Illinois', 'TILED': true},
    serverType: 'geoserver',
    transition: 0,
  }),
})

const k3will = new TileLayer({
  title: "County Drainage District Boundaries 2022",
  source: new TileWMS({
    url: 'http://localhost:8080/geoserver/wms',
    params: {'LAYERS': 'cite:k3will', 'TILED': true},
    serverType: 'geoserver',
    transition: 0,
  }),
})

var styleDD = new ol.style.Style({
  stroke: new ol.style.Stroke({
      color: '#DE1010',
      width: 3,
  })
});

//Attempt 1
  // const leveedAreasSource = new ol.source.VectorTile({
  //   format: new GeoJSON().readFeatures(),
  //   url: url22
  // });

  // const leveedAreasLayer = new ol.layer.VectorTile({
  //   source: leveedAreasSource.getSource().getFeatures()
  // });

  
  // map.addLayer(leveedAreasLayer);

// Attempt 2
  // var leveedAreasSource2 = new VectorSource({
  //   url: url22,
  //   format: new GeoJSON({featureProjection: "EPSG:4326"})
  // });

  // const leveedAreasLayer2 = new ol.layer.TileWMS({
  //   source: leveedAreasSource2
  // });
  // map.addLayer(leveedAreasLayer2)



// //attempt 3
// const polySource = new ol.source.Vector({
//   url: url22,
//   format: new GeoJSON().readFeatures({featureProjection: "EPSG:4326"})
// });

// const polyLayer = new ol.layer.Vector({
//   source: polySource
// });
// /////////Runs into issues for unsupported geojson type


// ///attempt 4
// const vectorLayerLeveedArea = new VectorLayer({
//   background: '#1a2b39',
//   source: new VectorSource({
//     url: url22,
//     projection: "EPSG:4326",
//     format: new GeoJSON(),
//   }),
//   style: function (feature) {
//     const color = feature.get('COLOR') || '#eeeeee';
//     style.getFill().setColor(color);
//     return style;
//   },
// });




const usaceLeveedAreas = new TileLayer({
  title: "USACE Leveed Areas Boundaries",
  source: new TileWMS({
    url: 'http://localhost:8080/geoserver/wms',
    params: {'LAYERS': 'cite:leveedAreasUSACE', 'TILED': true},
    serverType: 'geoserver',
    transition: 0,
  }),
})



var vectorSource = new VectorLayer({
  format:new GeoJSON(),
  loader: function(extent,resolution,projection,success,failure) {
    var proj = projection.getCode();
    var url = 'http://localhost:8080/geoserver/wfs?service=WFS&version=1.1.0' 
    + '&request=GetFeature&typeName=cite:IADD_Sourced_DD_V2&outputFormat=application/json&srcname=' + proj + '&' +
    'bbox=' + extent.join(',') + ',' + proj; 
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    var onError = function() {
      VectorSource.removeLoadedExtent(extent);
      failure();
    }
    xhr.onerror = onError;
    xhr.onload = function() {
      if (xhr.status == 200) {
        var features = vectorSource.getFormat().readFeatures(xhr.responseText);
        vectorSource.addFeatures(features);
        success(features);
      } else {
        onError();
      }
    }
    xhr.send();
  },
  strategy: bbox
});

const vectorX = new VectorLayer({
  source: vectorSource})

const style = new Style({
  fill: new Fill({
    color: 'rgba(255, 4, 0, 0.92)',
  }),
  stroke: new Stroke({
    color: 'rgba(255,12,12,1.0)',
    width: 3
  })
});


const map = new Map({
  interactions: defaultInteractions().extend([select,modify]),
  target: 'map',
  layers: [ new VectorLayer({
      title: 'Updated County Drainage Districts',
      source: new VectorSource({
          url: "http://localhost:8080/geoserver/cite/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cite%3AMergedDD__&maxFeatures=50&outputFormat=application%2Fjson",
          format: new GeoJSON({
            defaultDataProjection: 'EPSG:4326'
          }),
          wrapX: false,
      }, {
        name: 'Drainage District Boundaries',
        tileOptions: {crossOriginKeyword: 'anonymous'},
        transitionEffect: null
      }, ), style: function (feature) {
        const color = feature.get('COLOR') || 'rgba(246, 245, 247, 0.05)';

        style.getFill().setColor(color);
        return style;
      },
    }), new ImageLayer({
      title: '1970 Illinois Drainage Districts Scans',
      // extent: [-180, -90, -180, 90extent: fromLonLat([-91.513518, 36.9699719,-87.495214, 42.5083479]),
      source: new ImageWMS({
          projection: 'EPSG:4326',
          url: 'http://localhost:8080/geoserver/wms',
          params: {
              'LAYERS': 'cite:mergedDrainageDocs'
          },
          ratio: 1,
          serverType: 'geoserver',
          zIndex:2,
      })
    })
    ,
    new VectorLayer({
      title:'Boundaries From Document',
      source: new VectorSource({
        url: "http://localhost:8080/geoserver/cite/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cite%3AIADD_Sourced_DD_V2&maxFeatures=500&outputFormat=application%2Fjson",
        format: new GeoJSON({
          defaultDataProjection: 'EPSG:4326'
        }),
        wrapX: false,    
      }, {
        name: 'Drainage District Boundaries From Docs',
        tileOptions: {crossOriginKeyword: 'anonymous'},
        transitionEffect: null
      }, ), style: function (feature) {
        const color = feature.get('COLOR') || 'rgba(246, 245, 247, 0.05)';

        style.getFill().setColor(color);
        return style;
      },
    })
    , illinois,
    k3will, 
    vectorSource, usaceLeveedAreas,
    // vectorLayerLeveedArea,
    // polyLayer,
    // features,
    // vectorX,
    

    
    new TileLayer({
      title: 'OSM',
      type: 'base',
      visible: true,
      source: new OSM(),
      zIndex: -1,
  }),

  new TileLayer({
      title: 'Satellite',
      type: 'base',
      visible: false,
      zIndex: -1,
      source: new XYZ({
          attributions: ['Powered by Esri',
              'Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
          ],
          attributionsCollapsible: false,
          url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          maxZoom: 23,
      })
  }),
  ],
  controls:[
    //Define the default controls
    new Zoom(),
    new Attribution(),
    //Define some new controls
    new ZoomSlider(),
    new MousePosition({
      coordinateFormat: createStringXY(4),
      target: 'coordinates',

      projection: 'EPSG:4326',
    }),
    new ScaleLine(),
  ],view: view,
});
//have the map load the previous exent from the previous session
// sync(map);

const featureOverlay = new VectorLayer({
  source: new VectorSource(),
  map: map,
  style: new Style({
    stroke: new Stroke({
      color: 'rgba(255, 255, 255, 0.7)',
      width: 2,
    }),
  }),
});

let highlight;
const displayFeatureInfo = function (pixel) {
  const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
    return feature;
  });

  const info = document.getElementById('info');
  if (feature) {
    info.innerHTML = feature.get('DistrictName' ) || '&nbsp;';
  } else {
    info.innerHTML = '&nbsp;';
  }

  if (feature !== highlight) {
    if (highlight) {
      featureOverlay.getSource().removeFeature(highlight);
    }
    if (feature) {
      featureOverlay.getSource().addFeature(feature);
    }
    highlight = feature;
  }
};

map.on('pointermove', function (evt) {
  if (evt.dragging) {
    return;
  }
  const pixel = map.getEventPixel(evt.originalEvent);
  displayFeatureInfo(pixel);
});

map.on('click', function (evt) {
  displayFeatureInfo(evt.pixel);
});

// var layerSwitcher = new LayerSwitcher({
//   activationMode: 'mouseover',
//   collapseLabel: '\u00BB',
//   tipLabel: 'Legend',
//   collapseTipLabel: 'Collapse legend',
//   groupSelectStyle: 'children',
//   reverse: false
// });
// map.addControl(layerSwitcher);

const layerSwitcher = new LayerSwitcher({
  activationMode: 'mouseover',
  startActive: false,
  label: 'Legend',
  collapseLabel: '»',
  tipLabel: 'X',
  collapseTipLabel: 'Collapse legend',
  groupSelectStyle: 'children',
  reverse: false,
});
map.addControl(layerSwitcher);


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

//AutoLocation
var intervalAutolocate;
var posCurrent;
var geolocation = new Geolocation({
    trackingOptions: {
        enableHighAccuracy: true,
    },
    tracking: true,
    projection: view.getProjection()
});
var positionFeature = new ol.Feature();
positionFeature.setStyle(
    new ol.style.Style({
        image: new ol.style.Circle({
            radius: 6, 
            fill: new ol.style.Fill({
                color: '#3399CC',
            }),
            stroke: new ol.style.Stroke({
                color: '#fff',
                width: 2,
            }),
        }),
    })
);
var accuracyFeature = new ol.Feature();
var currentPositionLayer = new ol.layer.Vector({
    map: map, 
    source: new ol.source.Vector({
        features: [accuracyFeature, positionFeature],
    }),
});
function startAutolocate() {
    var coordinates = geolocation.getPosition();
    positionFeature.setGeometry(coordinates ? new ol.geom.Point(coordinates) : null);
    view.setCenter(coordinates);
    view.setZoom(16);
    accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
    intervalAutolocate = setInterval(function () {
        var coordinates = geolocation.getPosition();
        var accuracy = geolocation.getAccuracyGeometry()
        positionFeature.setGeometry(coordinates ? new ol.geom.Point(coordinates) : null);
        map.getView().setCenter(coordinates);
        view.setZoom(16);
        accuracyFeature.setGeometry(accuracy);
    }, 10000);
}
function stopAutolocation() {
    clearInterval(intervalAutolocate);
    positionFeature.setGeometry(null);
    accuracyFeature.setGeometry(null);
};
//live location
$("#btnCrosshair").on("click", function (event) {
    $("#btnCrosshair").toggleClass("clicked");
    if ($("#btnCrosshair").hasClass("clicked")) {
        startAutolocate();
    } else {
        stopAutolocation();
    }
});


// Geocoder

var geocoder = new olGeocoder('nominatim', {
  provider: 'mapquest',
  key: 'HlrLb12WQRlz48MTGxmXw0e0urf6DaZN',
  lang: 'en-US', //en-US, pt-BR, fr-FR
  placeholder: 'Search for ...',
  targetType: 'text-input',
  limit: 5,
  keepOpen: true
});
map.addControl(geocoder);

geocoder.on('addresschosen', function(evt){
  var feature = evt.feature,
      coord = evt.coordinate,
      address = evt.address;
  // some popup solution
  content.innerHTML = '<p>'+ address.formatted +'</p>';
  overlay.setPosition(coord);
});

