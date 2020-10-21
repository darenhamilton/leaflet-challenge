// Store our API endpoint inside queryUrl
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
// Perform a GET request to the query URL
d3.json(queryUrl).then(data => {
  console.log(data);
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

function getColor(d) {
  return d > 700 ? '#024A26' :
    d > 110 ? '#356E51' :
    d > 90 ? '#5D8B74' :
    d > 70 ? '#7DA290' :
    d > 50 ? '#ACC4B8' :
    d > 30 ? '#CAD9D1' :
    d > 10 ? '#DDE7E1' :
    '#FFFFFF';
}



function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>Location:  " + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
        "<hr><p>Depth:   " + (feature.geometry.coordinates[2]) + " km</p>");
  }

  
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
  });

  let mags = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: (feature, latlng) => {
      return new L.Circle(latlng, {
        radius: feature.properties.mag*25000,
        color: "#02180C",
        opacity: 1,
        weight: .5,
        fillColor: getColor(feature.geometry.coordinates[2]),
        fillOpacity: 0.7,
        stroke: true 
      });
    }
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes, mags);
}

function createMap(earthquakes, mags) {

  // Define streetmap and darkmap layers
  let streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  let darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  let baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  let overlayMaps = {
    Magnitudes: mags,
    Earthquakes: earthquakes
    
  };

  // Create our map, giving it the Magnitudes and Street Map layers to display on load
  let myMap = L.map("map", {
    center: [15.5994, -28.6731],
      zoom: 3,
    layers: [streetmap, mags]
  });
  
  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

//Add a legend
let legend = L.control({
  position: 'bottomright'
});

legend.onAdd = function () {

  let div = L.DomUtil.create('div', 'info legend'),
    grades = [0-9 , 10, 30, 50, 70, 90, 110, 700],
    labels = [],
    from, to;

  for (var i = 0; i < grades.length; i++) {
    from = grades[i];
    to = grades[i + 1];

    labels.push(
      '<i style="background:' + getColor(from + 1) + '"></i> ' +
      from + (to ? '&ndash;' + to : '+'));
  }

  div.innerHTML = labels.join('<br>');
  return div;
};

legend.addTo(myMap);


}
