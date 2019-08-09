var mymap = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, }).addTo(mymap);
var myIcon = L.icon({
    iconUrl: '../node_modules/leaflet/dist/images/marker-icon.png',
    iconRetinaUrl: 'marker-icon-2x.png',
    shadowUrl:     'marker-shadow.png',
    iconSize:    [25, 41],
    iconAnchor:  [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize:  [0, 0],
});
console.log(L.edgeMarker);
var marker = L.edgeMarker([50,5], { icon: myIcon }).addTo(mymap);
var marker2 = L.marker({lat: 50, lng: 5}).addTo(mymap);
