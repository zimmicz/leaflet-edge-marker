var mymap = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', { maxZoom: 18, }).addTo(mymap);
var marker = L.edgeMarker({lat: 50, lng: 5}).addTo(mymap);
var marker2 = L.marker({lat: 50, lng: 5}).addTo(mymap);
