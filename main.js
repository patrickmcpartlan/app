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

import TileWMS from 'ol/source/TileWMS';
import XYZ from 'ol/source/XYZ';
import RasterSource from 'ol/source/Raster';
import ImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';
import LayerSwitcher from 'ol-layerswitcher';
import Group from 'ol/layer/Group';
import Tile from 'ol/layer/Layer';
import { Geolocation } from 'ol';


var name1,status1

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

const select = new Select({
  hitTolerance:5,
  multi:true,
  wrapX: false,
});

const modify = new Modify({
  features: select.getFeatures(),
});


const view = new View({
  center: fromLonLat([-88.75, 41.85]),
  zoom: 10,
});


// const base_maps = new Group({
//   'title': 'Base maps',
//   layers: [
//       new Tile({
//           title: 'OSM',
//           type: 'base',
//           visible: true,
//           source: new OSM()
//       }),

//       new Tile({
//           title: 'Satellite',
//           type: 'base',
//           visible: true,
//           source: new XYZ({
//               attributions: ['Powered by Esri',
//                   'Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
//               ],
//               attributionsCollapsible: false,
//               url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
//               maxZoom: 23
//           })
//       })
//   ]
// });

const ddBoundaries =  new TileLayer({
  title: 'Drainage Docs Boundaries',
  source: new TileWMS({
    url: 'http://localhost:8080/geoserver/wms',
    params: {'LAYERS': 'cite:IADD_Sourced_DD_V2', 'TILED': true},
    serverType: 'geoserver',
    // Countries have transparency, so do not fade tiles:
    transition: 0,
  }),
});

const illinois = new TileLayer({
  title: "Illinois",
  source: new TileWMS({
    url: 'http://localhost:8080/geoserver/wms',
    params: {'LAYERS': 'cite:Illinois', 'TILED': true},
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

const ddBoundariesWFS = new VectorLayer({
  title: 'Drainage Docs Boundaries',
  source: new VectorSource({
      url: "http://localhost:8080/geoserver/cite/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cite%3AIADD_Sourced_DD_V2&maxFeatures=50&outputFormat=application%2Fjson",
      format: new GeoJSON({
        defaultDataProjection: 'EPSG:4326'
      }),
      wrapX: false,
      style: styleDD,
  }, {
    name: 'Drainage Docs Boundaries',
    tileOptions: {crossOriginKeyword: 'anonymous'},
    transitionEffect: null
  })
})

const map = new Map({
  interactions: defaultInteractions().extend([select,modify]),
  target: 'map',
  layers: [ new VectorLayer({
      title: 'Updated County Drainage Districts',
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
    }), new ImageLayer({
      title: '1970 Illinois Drainage Districts Scans',
      // extent: [-180, -90, -180, 90],
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
    }), ddBoundariesWFS, illinois,
    
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
      target: 'coordinates',
      projection: 'EPSG:4326',
    }),
    new ScaleLine(),
  ],view: view,
});
//have the map load the previous exent from the previous session
sync(map);

var layerSwitcher = new LayerSwitcher({
  activationMode: 'mouseover',
  startActive: false,
  collapseLabel: '\u00BB',
  tipLabel: 'Legend',
  collapseTipLabel: 'Collapse legend',
  groupSelectStyle: 'children',
  reverse: false
});
map.addControl(layerSwitcher);
layerSwitcher.renderPanel();

  // // Select control
  // var popup = new PopupFeature({
  //   popupClass: 'default anim',
  //   select: select,
  //   canFix: true,
  //   template: {
  //       title: 
  //         // 'nom',   // only display the name
  //         function(f) {
  //           return f.get('nom')+' ('+f.get('fid')+')';
  //         },
  //       attributes: // [ 'name', 'county', 'area']
  //       {
  //         'name': { title: 'name' },
  //         'county': { title: 'county' },
  //         'area': { title: 'area' },
  //       }
  //   }
  // });
  // map.addOverlay (popup);




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
////////////////////////////////////


function toggle_editing() {

  var color = $('#toggle_editing').css("background-color");

 if (color == 'rgb(239, 239, 239)') {
 
    document.getElementById("get_info").style.backgroundColor = '';	
    document.getElementById("toggle_editing").style.backgroundColor = 'coral';
     document.getElementById("select_feature").style.backgroundColor = '';
     document.getElementById("create_feature").style.backgroundColor = '';
     document.getElementById("modify_feature").style.backgroundColor = '';
     
     document.getElementById("select_feature").disabled = false;
     document.getElementById("create_feature").disabled = false;
     document.getElementById("modify_feature").disabled = false;
     document.getElementById("delete_feature").disabled = false;
     
     document.getElementById("get_info").disabled = true;
     map.un('singleclick', getinfo);
     overlay.setPosition(undefined);
     closer.blur();
 
 }
 
 else if (color == 'rgb(255, 127, 80)') {
 
     document.getElementById("toggle_editing").style.backgroundColor = '';
     document.getElementById("select_feature").style.backgroundColor = '';
     document.getElementById("create_feature").style.backgroundColor = '';
     document.getElementById("modify_feature").style.backgroundColor = '';
 
     document.getElementById("select_feature").disabled = true;
     document.getElementById("create_feature").disabled = true;
     document.getElementById("modify_feature").disabled = true;
     document.getElementById("delete_feature").disabled = true;
     
     document.getElementById("get_info").disabled = false;
     
      if (modify) {
         map.removeInteraction(modify);
     }
     if (draw_add) {
         map.removeInteraction(draw_add);
     }
     if (snap_edit) {
         map.removeInteraction(snap_edit);
     }
     
     map.un('click', highlight);
     map.un('click', highlight_mod_attributes);
     overlay.setPosition(undefined);
     closer.blur();
 
 }
}


function highlight(evt) {
  if (featureOverlay) {
      featureOverlay.getSource().clear();
      map.removeLayer(featureOverlay);
  }
  feature = map.forEachFeatureAtPixel(evt.pixel,
      function(feature, layer) {
          return feature;
      });

  if (feature) {

      var geometry = feature.getGeometry();
      var coord = geometry.getCoordinates();
      var coordinate = evt.coordinate;

      featureOverlay.getSource().addFeature(feature);
      var content1 = '<h4>Name:' + feature.get('name') + '</h4>';
      content1 += '<h6> Status:' + feature.get('status') + '</h6>';

      content.innerHTML = content1;
      overlay.setPosition(coordinate);

      layerSwitcher.renderPanel();
      map.updateSize();
  }

}


function highlight_mod_attributes(evt) {
  if (featureOverlay) {
      featureOverlay.getSource().clear();
      map.removeLayer(featureOverlay);
  }
  //if (geojson) {geojson.getSource().refresh();}
  feature = map.forEachFeatureAtPixel(evt.pixel,
      function(feature, layer) {
          return feature;
      });

  if (feature) {

      var geometry = feature.getGeometry();
      var coord = geometry.getCoordinates();
      var coordinate = evt.coordinate;
      //alert(coordinate);
      featureOverlay.getSource().addFeature(feature);
      //overlays.getLayers().push(featureOverlay);


      content1 = '<label for="name">name:</label><input type="text" id="name" name="name" value=' + feature.get('name') + '><br><br>';
      content1 += '<label for="status">status:</label><input type="text" id="status" name="status" value=' + feature.get('status') + '><br><br>';
      content1 += ' <button onclick="save_mod_features()" id = "save_mod_features">Save Features</button>';
      content1 += ' <button onclick="cancel_mod_features()" id = "cancel_mod_features">Cancel</button>';


      //  alert(feature.getId());
      content.innerHTML = content1;
      overlay.setPosition(coordinate);


      map.updateSize();
  }
}

function select_feature() {
  document.getElementById("get_info").style.backgroundColor = '';
  map.un('singleclick', getinfo);
  overlay.setPosition(undefined);
  closer.blur();

  document.getElementById("select_feature").style.backgroundColor = 'coral';
  document.getElementById("create_feature").style.backgroundColor = '';
  document.getElementById("modify_feature").style.backgroundColor = '';

  if (draw_add) {
      map.removeInteraction(draw_add);
  }
  if (modify) {
      map.removeInteraction(modify);
  }
  if (snap_edit) {
      map.removeInteraction(snap_edit);
  }
  map.on('click', highlight);
}

function create_feature() {
  map.un('click', highlight_mod_attributes);
  map.un('click', highlight);
  document.getElementById("get_info").style.backgroundColor = '';
  map.un('singleclick', getinfo);
  overlay.setPosition(undefined);
  closer.blur();

  //map.on('click
  //alert('change');
  if (modify) {
      map.removeInteraction(modify);
  }
  if (snap_edit) {
      map.removeInteraction(snap_edit);
  }
  document.getElementById("create_feature").style.backgroundColor = 'coral';
  document.getElementById("modify_feature").style.backgroundColor = '';
  document.getElementById("select_feature").style.backgroundColor = '';


  source_mod = ddBoundariesWFS.getSource();
  draw_add = new ol.interaction.Draw({
      source: source_mod,
      type: 'Polygon' 
  });
  map.addInteraction(draw_add);
  //var source_g = geojson.getSource();
  snap_edit = new ol.interaction.Snap({
      source: source_mod
  });
  map.addInteraction(snap_edit);
  draw_add.on('drawend',
      function(e) {
          //pop = prompt("Enter Population", "");
          //state_name = prompt("Enter Name", "");
          //map.on('click', highlight_mod);
          myFeature = e.feature;
          if (myFeature) {

              var geometry = myFeature.getGeometry();
              var coord = geometry.getCoordinates();
              var extent = geometry.getExtent();
              var centroid = ol.extent.getCenter(extent);
              //alert(centroid);
              //var coordinate = e.coordinate;

              featureOverlay.getSource().addFeature(myFeature);
              //overlays.getLayers().push(featureOverlay);


              content1 = '<label for="name">name:</label><input type="text" id="name" name="name" value=' + myFeature.get('name') + '><br><br>';
              content1 += '<label for="status">status:</label><input type="text" id="status" name="status" value=' + myFeature.get('status') + '><br><br>';
              content1 += ' <button onclick="save_created()" id = "save_created">Save Feature</button>';
              content1 += ' <button onclick="cancel_created()" id = "cancel_created">Delete Feature</button>';
              
              content.innerHTML = content1;
              overlay.setPosition(centroid);



              //layerSwitcher.renderPanel();

              //alert(feature.get('gid'));

              //  alert(feature.get('gid'));

              //	map.updateSize();
          }
          // alert(state_name+''+pupulation);

          // alert('karan');
          //var features = geojson.getSource().getFeatures();
          //var length = features.length;
          // alert(length);
      }, this);

  ddBoundariesWFS.getSource().on('addfeature', function() {
      var features = ddBoundariesWFS.getSource().getFeatures();
      var length = features.length;
      // alert(length);
  });

}

///////Geoserver Specific 
function save_created() {
  name1 = document.getElementById("name").value;
  status1 = document.getElementById("status").value;
  var coords = myFeature.getGeometry();
  
  var format = new ol.format.GML({
  });
  var gml3 = format.writeGeometry(coords, {
          //dataProjection: 'EPSG:4326',
          //featureProjection: 'urn:ogc:def:crs:EPSG::4326'
          //rightHanded: false
      }
  );
  var url1 = 'http://localhost:8080/geoserver/wfs';
  var method = 'POST';
  var postData1 =
      '<wfs:Transaction service="WFS" version="1.0.0"\n' +
      'xmlns:sesc_projects="http://www.openplans.org/sesc_projects"\n' +
      'xmlns:ogc="http://www.opengis.net/ogc"\n' +
      'xmlns:wfs="http://www.opengis.net/wfs"\n' +
      'xmlns:gml="http://www.opengis.net/gml"\n' +
      'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n' +
      'xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.0.0/WFS-transaction.xsd">\n' +
      '<wfs:Insert>\n' +
      'cite:IADD_Sourced_DD_V2>\n' +
      '<sesc_projects:geom>\n' +
      '<gml:coordinates decimal="." cs="," ts=" ">\n'
      + gml3 + '\n' +
      '</gml:coordinates decimal>>\n' +
      '</sesc_projects: geom>>\n' +
      '<sesc_projects:name>' + name1 + '</sesc_projects:name>\n' +
      '<sesc_projects:status>' + status1 + '</sesc_projects:status>\n' +
      // '<sesc_projects:status>' + status + '</sesc_projects:status>\n' +
      '</cite:IADD_Sourced_DD_V2>\n' +
      '</wfs:Insert>\n' +
      '</wfs:Transaction>\n';

{/* <wfs:Transaction service="WFS" version="1.0.0"
xmlns:wfs="http://www.opengis.net/wfs"
xmlns:topp="http://www.openplans.org/topp"
xmlns:gml="http://www.opengis.net/gml"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.0.0/WFS-transaction.xsd http://www.openplans.org/topp http://localhost:8080/geoserver/wfs/DescribeFeatureType?typename=topp:tasmania_roads">
<wfs:Insert>
  <topp:tasmania_roads>
    <topp:the_geom>
      <gml:MultiLineString srsName="http://www.opengis.net/gml/srs/epsg.xml#4326">
        <gml:lineStringMember>
          <gml:LineString>
            <gml:coordinates decimal="." cs="," ts=" ">
494475.71056415,5433016.8189323 494982.70115662,5435041.95096618
            </gml:coordinates>
          </gml:LineString>
        </gml:lineStringMember>
      </gml:MultiLineString>
    </topp:the_geom>
    <topp:TYPE>alley</topp:TYPE>
  </topp:tasmania_roads>
</wfs:Insert>
</wfs:Transaction> */}

  //alert(postData1);
  var req1 = new XMLHttpRequest();
  req1.open("POST", 'http://localhost:8080/geoserver/wfs', false);
  console.log("connected to designated folder")
  req1.setRequestHeader('User-Agent', 'XMLHTTP/1.0');
  // req1.setRequestHeader('User-Agent', '	Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:99.0) Gecko/20100101 Firefox/99.0');
  req1.setRequestHeader('Content-type', 'text/xml');
  req1.onreadystatechange = function() {
      if (req1.readyState != 4) return;
      if (req1.status != 200 && req1.status != 304) {
          alert('HTTP error ' + req1.status);
          return;
      }
  }
  if (req1.readyState == 4) return;
  req1.send(postData1);
  //alert(req1.responseText);
  alert('Feature saved successfully');
  ddBoundariesWFS.getSource().refresh();
  overlay.setPosition(undefined);
  console.log("Set position")
  closer.blur();
  featureOverlay.getSource().clear();
}

function cancel_created() {

  featureOverlay.getSource().clear();
  ddBoundariesWFS.getSource().removeFeature(myFeature);
  overlay.setPosition(undefined);
  closer.blur();

}

function modify_feature() {
  //alert('change');
  document.getElementById("get_info").style.backgroundColor = '';
  map.un('singleclick', getinfo);
  map.un('click', highlight);
  overlay.setPosition(undefined);
  closer.blur();

  if (draw_add) {
      map.removeInteraction(draw_add);
  }
  if (snap_edit) {
      map.removeInteraction(snap_edit);
  }


  document.getElementById("select_feature").style.backgroundColor = '';
  document.getElementById("create_feature").style.backgroundColor = '';
  document.getElementById("modify_feature").style.backgroundColor = 'coral';
  source_mod = featureOverlay.getSource();
  modify = new ol.interaction.Modify({
      source: source_mod
  });
  map.addInteraction(modify);

  var source_g = ddBoundariesWFS.getSource();
  var snap_edit = new ol.interaction.Snap({
      source: source_g
  });
  map.addInteraction(snap_edit);
  map.on('click', highlight_mod_attributes);

}

function save_mod_features() {

  name1 = document.getElementById("name").value;
  status1 = document.getElementById("status").value;

  var feat_mod = featureOverlay.getSource().getFeatures();
  //alert(del_feat);

  var fid_feat_mod = feat_mod[0].getId();

  var coords = feat_mod[0].getGeometry();
  //alert(coords.toString());
  var format = new ol.format.GML({
      //featureNS: 'http://www.census.gov',
      //  featurePrefix: 'tiger',
      // featureType: 'tiger:tiger_roads',
      srsName: 'urn:ogc:def:crs:EPSG::4326'

  });
  //var id = mod_features[i].getId();

  var gml3 = format.writeGeometry(coords, {
      //dataProjection: 'EPSG:4326',
      featureProjection: 'urn:ogc:def:crs:EPSG::4326',
      //rightHanded: false
  });
  //alert(fid_feat_att);
  var url1 = 'http://localhost:8080/geoserver/wfs';
  var method = 'POST';
  var postData =
      '<wfs:Transaction service="WFS" version="1.0.0"\n' +
      'xmlns:sesc_projects="http://www.openplans.org/sesc_projects"\n' +
      'xmlns:ogc="http://www.opengis.net/ogc"\n' +
      'xmlns:wfs="http://www.opengis.net/wfs"\n' +
      'xmlns:gml="http://www.opengis.net/gml"\n' +
      'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n' +
      'xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/WFS-transaction.xsd">\n' + 
      '<wfs:Update typeName="cite:IADD_Sourced_DD_V2">\n' +
      '<wfs:Property>\n' +
      '<wfs:Name>geom</wfs:Name>\n' +
      '<wfs:Value>\n' +
      gml3 + '\n' +
      '</wfs:Value>\n' +
      '</wfs:Property>\n' +
      '<wfs:Property>\n' +
      '<wfs:Name>name</wfs:Name>\n' +
      '<wfs:Value>\n' +
      name1 + '\n' +
      '<wfs:Name>status</wfs:Name>\n' +
      '<wfs:Value>\n' +
      status1 + '\n' +
      '</wfs:Value>\n' +
      '</wfs:Property>\n' +
      '<ogc:Filter>\n' +
      '<ogc:FeatureId fid="' + fid_feat_mod + '"/>\n' +
      '</ogc:Filter>\n' +
      '</wfs:Update>\n' +
      '</wfs:Transaction>\n';
  //alert(postData);
  var req = new XMLHttpRequest();
  req.open("POST", url1, false);
  // req.setRequestHeader('User-Agent', 'XMLHTTP/1.0');
  req.setRequestHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:99.0) Gecko/20100101 Firefox/99.0');
  req.setRequestHeader('Content-type', 'text/xml');
  req.onreadystatechange = function() {
      if (req.readyState != 4) return;
      if (req.status != 200 && req.status != 304) {
          alert('HTTP error ' + req.status);
          return;
      }
      // req_res[i] = req.responseText;


      //alert(req.responseText);
      //  Ext.MessageBox.alert('Status', 'changes saved successfully');
  }
  if (req.readyState == 4) return;
  req.send(postData);

  alert('Feature updated successfully');
  ddBoundariesWFS.getSource().refresh();
  overlay.setPosition(undefined);
  closer.blur();
  featureOverlay.getSource().clear();
}

function cancel_mod_features() {

  featureOverlay.getSource().clear();
  overlay.setPosition(undefined);
  closer.blur();

}

function delete_feature() {

  del_feat = featureOverlay.getSource().getFeatures();
  //alert(del_feat);

  var fid_del_feat = del_feat[0].getId();
  //alert(fid_del_feat);

  if (confirm('Are you sure you want to delete the selected feature?')) {
      // Save it!
      if (fid_del_feat == undefined) {
          featureOverlay.getSource().removeFeature(del_feat[0]);
          ddBoundariesWFS.getSource().removeFeature(feature);
      } else if (fid_del_feat != undefined) {
          var feat = ddBoundariesWFS.getSource().getFeatureById(fid_del_feat);

          ddBoundariesWFS.getSource().removeFeature(feat);

          var feat1 = featureOverlay.getSource().getFeatureById(fid_del_feat);
          featureOverlay.getSource().removeFeature(feat1);
          var postData_del =
              '<wfs:Transaction service="WFS" version="1.0.0"\n' +
              'xmlns:cdf="http://www.opengis.net/cite/data"\n' +
              'xmlns:ogc="http://www.opengis.net/ogc"\n' +
              'xmlns:wfs="http://www.opengis.net/wfs"\n' +
              'xmlns:sesc_projects="http://www.openplans.org/sesc_projects">\n' +
              '<wfs:Delete typeName="cite:IADD_Sourced_DD_V2">\n' +
              '<ogc:Filter>\n' +
              '<ogc:FeatureId fid="' + fid_del_feat + '"/>\n' +
              '</ogc:Filter>\n' +
              '</wfs:Delete>\n' +
              '</wfs:Transaction>\n';

          var req_del = new XMLHttpRequest();
          req_del.open("POST", 'http://localhost:8080/geoserver/wfs', false);
          req_del.setRequestHeader('User-Agent', 'XMLHTTP/1.0');
          // req_del.setRequestHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:99.0) Gecko/20100101 Firefox/99.0');
          req_del.setRequestHeader('Content-type', 'text/xml');
          req_del.onreadystatechange = function() {
              if (req_del.readyState != 4) return;
              if (req_del.status != 200 && req_del.status != 304) {
                  alert('HTTP error ' + req_del.status);
                  return;
              }
          }
          if (req_del.readyState == 4) return;
          req_del.send(postData_del);

          alert('Feature deleted Successfully');
          ddBoundariesWFS.getSource().refresh();
          overlay.setPosition(undefined);
          closer.blur();
      }

  } else {
      // Do nothing!
      alert('Feature not deleted');
      featureOverlay.getSource().clear();
      overlay.setPosition(undefined);
      closer.blur();
  }

}

function get_info() {
  

  featureOverlay.getSource().clear();
  overlay.setPosition(undefined);
  closer.blur();
  var color = $('#get_info').css("background-color");

  if (color == 'rgb(239, 239, 239)') {
      //alert(color);
      if (modify) {
          map.removeInteraction(modify);
      }
      if (draw_add) {
          map.removeInteraction(draw_add);
      }
      if (snap_edit) {
          map.removeInteraction(snap_edit);
      }

      document.getElementById("get_info").style.backgroundColor = 'coral';
      document.getElementById("select_feature").style.backgroundColor = '';
      document.getElementById("create_feature").style.backgroundColor = '';
      document.getElementById("modify_feature").style.backgroundColor = '';
      map.un('click', highlight);
  map.un('click', highlight_mod_attributes);
      map.on('singleclick', getinfo);

  } else if (color == 'rgb(255, 127, 80)') {
      //alert(color);
      document.getElementById("get_info").style.backgroundColor = '';
      map.un('singleclick', getinfo);
      overlay.setPosition(undefined);
      closer.blur();
      //map.on('click', highlight);

  }

}


function getinfo(evt) {


  var coordinate = evt.coordinate;
  var viewResolution = /** @type {number} */ (view.getResolution());

  //alert(coordinate1);
  $("#popup-content").empty();

  document.getElementById('info').innerHTML = '';
  var no_layers = overlays.getLayers().get('length');
  // alert(no_layers);
  var url = new Array();
  var wmsSource = new Array();
  var layer_title = new Array();


  var i;
  for (i = 0; i < no_layers; i++) {
      //alert(overlays.getLayers().item(i).getVisible());
      var visibility = overlays.getLayers().item(i).getVisible();
      //alert(visibility);
      if (visibility == true) {
          //alert(i);
          layer_title[i] = overlays.getLayers().item(i).get('title');
          // alert(layer_title[i]);
          wmsSource[i] = new ol.source.ImageWMS({
              url: 'http://localhost:8080/geoserver/wms',
              params: {
                  'LAYERS': layer_title[i]
              },
              serverType: 'geoserver',
              crossOrigin: 'anonymous'
          });
          //alert(wmsSource[i]);
          //var coordinate2 = evt.coordinate;
          // alert(coordinate);
          url[i] = wmsSource[i].getFeatureInfoUrl(
              evt.coordinate, viewResolution, 'EPSG:4326', {
                  'INFO_FORMAT': 'text/html'
              });
          //  alert(url[i]);

          //assuming you use jquery
          $.get(url[i], function(data) {
              //alert(i);
              //append the returned html data


              // $("#info").html(data);
              //document.getElementById('info').innerHTML = data;
              //document.getElementById('popup-content').innerHTML = '<p>Feature Info</p><code>' + data + '</code>';

              //alert(dat[i]);
              $("#popup-content").append(data);
              //document.getElementById('popup-content').innerHTML = '<p>Feature Info</p><code>' + data + '</code>';

              overlay.setPosition(coordinate);

              layerSwitcher.renderPanel();

          });
          //alert(layer_title[i]);
          //alert(fid1[0]);



      }
  }


}
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