var map;
var polygon;
var counter = 0;


function deg_to_dec(deg, ref) {
  var dec = deg[0] + deg[1] / 60 + deg[2] / 3600;
  return ref != "N" || ref != "E" ? dec : -dec;
}

function geotag(file, callback) {
  if (file.type != "image/jpeg")
    return callback("Only JPG supported!");
  
  EXIF.getData(file, function(e) {
    var exif_data = EXIF.getAllTags(this);
    
    if (!Object.keys(exif_data).length)
      return callback("No EXIF data found.");
    
    var gps_lon       = exif_data.GPSLongitude;
    var gps_lon_ref   = exif_data.GPSLongitudeRef;
    var gps_lat       = exif_data.GPSLatitude;
    var gps_lat_ref   = exif_data.GPSLatitudeRef;
    var gps_datestamp = exif_data.GPSDateStamp;
    var gps_timestamp = exif_data.GPSTimeStamp;
    var gps_datetime  = exif_data.DateTime;
    
    if (!gps_lon || !gps_lat)
      return callback("No GPS coordinates found.");
    
    if (!gps_datetime && !(gps_datestamp || gps_timestamp))
      return callback("No GPS date found.");
    
    var longitude = deg_to_dec(gps_lon, gps_lon_ref);
    var latitude  = deg_to_dec(gps_lat, gps_lat_ref);
    
    if (gps_datetime) {
      var datetime_re = /(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
      var datetime = gps_datetime.replace(date_re, "$1-$2-$3 $4:$5:$6");
    } else {
      var date_re = /(\d{4}):(\d{2}):(\d{2})/;
      var date = gps_datestamp.replace(date_re, "$1-$2-$3");
      var time = gps_timestamp[0] + ":" + gps_timestamp[1] + ":" + gps_timestamp[2];
      var datetime = date + " " + time;
    }
    
    var geo_data = {
      'lon': longitude,
      'lat': latitude,
      'date': Date(datetime)
    }
    return callback(undefined, geo_data);
  });
}

function place_pin(map, geo_data) {
  var location = [geo_data.lat, geo_data.lon];
  var marker = L.marker(location).addTo(map);
}

function fileDragHover(e) {
  e.stopPropagation();
  e.preventDefault();
  e.target.className = (e.type == "dragover" ? "hover" : "");
}

function fileSelectHandler(e) {
  fileDragHover(e);
  var files = e.target.files || e.dataTransfer.files;
  counter += files.length;
  
  for (var i = 0, file; file = files[i]; i++) {
    fileHead = file.slice(0, 131072);
    
    geotag(fileHead, function(err, geo_data) {
      console.log(--counter);
      
      if (err)
        return console.warn(err);
      
      place_pin(map, geo_data);
    });
  }
}

function onMapClick(e) {
  if (!polygon)
    polygon = L.polygon([]).addTo(map);
  
  polygon.addLatLng(e.latlng);
}

function onMapContextmenu(e) {
  map.removeLayer(polygon);
  polygon = undefined;
}

(function(window) {
  // Initialization
  var win = require("nw.gui").Window.get();
  if (localStorage.width) {
    win.resizeTo(parseInt(localStorage.width), parseInt(localStorage.height));
    win.moveTo(parseInt(localStorage.x), parseInt(localStorage.y));
  }
  win.show();
  
  // File drag'n'drop
  var dropzone = document.getElementById("dropzone"); // window;
  dropzone.addEventListener("dragover",  fileDragHover,     false);
  dropzone.addEventListener("dragleave", fileDragHover,     false);
  dropzone.addEventListener("drop",      fileSelectHandler, false);
  
  // Map
  map = L.map("map").setView([0, 0], 1);
  L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Map data &copy; <a href='http://openstreetmap.org/copyright'>OpenStreetMap</a> contributors, <a href='http://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>",
    maxZoom: 18,
    styleId: 997
  }).addTo(map);
  
  map.on('click', onMapClick);
  map.on('contextmenu', onMapContextmenu);
  
  // Testing...
  /*
    var marker = L.marker([51.5, -0.09]).addTo(map);
    
    var circle = L.circle([51.508, -0.11], 500, {
      color: "red",
      fillColor: "#f03",
      fillOpacity: 0.5
    }).addTo(map);
    
    var polygon = L.polygon([
      [51.509, -0.08],
      [51.503, -0.06],
      [51.51, -0.047]
    ]).addTo(map);
  */
  
})(window);
