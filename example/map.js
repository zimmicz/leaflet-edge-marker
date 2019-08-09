var mymap = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, }).addTo(mymap);
var marker = L.edgeMarker([50,5]).addTo(mymap);
var marker2 = L.marker({lat: 50, lng: 5}).addTo(mymap);
