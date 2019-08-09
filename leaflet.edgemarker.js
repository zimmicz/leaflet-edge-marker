const deg2rad = (deg) => deg * Math.PI / 180;
const rad2deg = (rad) => rad * 180 / Math.PI;

(function (factory) {
    if(typeof define === 'function' && define.amd) {
    //AMD
        define(['leaflet'], factory);
    } else if(typeof module !== 'undefined') {
    // Node/CommonJS
        module.exports = factory(require('leaflet'));
    } else {
    // Browser globals
        if(typeof window.L === 'undefined')
            throw 'Leaflet must be loaded first';
        factory(window.L);
    }
})(function (L) {
    L.EdgeMarker = L.Marker.extend({
        _edgeMarker: null,
        options: {
            heightOffset: 29,
            widthOffset: 29,
            rotationOffset: -180,
            rotationAngle: 0,
        },
        initialize(latLng, options) {
            L.Util.setOptions(this, options);
            L.Icon.Default.prototype.options.shadowSize = [0,0];
            this._latLng = L.latLng(latLng);
        },
        _removeEdgeMarker() {
            if (this._map && this._edgeMarker) {
                this._map.removeLayer(this._edgeMarker);
            }
        },
        _findEdge(map) {
            return map && L.bounds([0,0], map.getSize())
        },
        _getBearingToPoint() {
            if (!this._map) {
              return;
            }
            const lat1 = deg2rad(this._map.getCenter()['lat']);
            const lat2 = deg2rad(this._latLng.lat);
            const dLon = deg2rad(this._map.getCenter()['lng'] - this._latLng.lng);
            const y = Math.sin(dLon) * Math.cos(lat2);
            const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
            let brng = Math.atan2(y, x);
            brng = parseInt(rad2deg(brng));
            brng = 360 - ((brng + 360) % 360);
            return brng;
        },
        _getPointOutsideViewport() {
            if (!this._map) {
              return;
            }
            const mapPixelBounds = this._findEdge(this._map);
            const currentMarkerPosition = this._map.latLngToContainerPoint([this._latLng.lat, this._latLng.lng]);

            if (!(currentMarkerPosition.y < mapPixelBounds.min.y ||
                currentMarkerPosition.y > mapPixelBounds.max.y ||
                currentMarkerPosition.x > mapPixelBounds.max.x ||
                currentMarkerPosition.x < mapPixelBounds.min.x
            )) {
                return;
            }

            let {x,y} = currentMarkerPosition;
            const center = mapPixelBounds.getCenter();
            const markerWidth = this.options.widthOffset;
            const markerHeight = this.options.heightOffset;
            let markerDistance;

            const rad = Math.atan2(center.y - y, center.x - x);
            const rad2TopLeftCorner = Math.atan2(center.y-mapPixelBounds.min.y,center.x-mapPixelBounds.min.x);

            // target is in between diagonals window/ hourglass
            // more out in y then in x
            if (Math.abs(rad) > rad2TopLeftCorner && Math.abs (rad) < Math.PI -rad2TopLeftCorner) {

                // bottom out
                if (y < center.y ) {
                    y = mapPixelBounds.min.y + markerHeight/2;
                    x = center.x -  (center.y-y) / Math.tan(Math.abs(rad));
                    markerDistance = currentMarkerPosition.y - mapPixelBounds.y;
                    // top out
                } else {
                    y = mapPixelBounds.max.y - markerHeight/2;
                    x = center.x - (y-center.y)/ Math.tan(Math.abs(rad));
                    markerDistance = -currentMarkerPosition.y;
                }
            } else {

                // left out
                if (x < center.x ) {
                    x = mapPixelBounds.min.x + markerWidth/2;
                    y = center.y -  (center.x-x ) *Math.tan(rad);
                    markerDistance = -currentMarkerPosition.x;
                    // right out
                } else {
                    x = mapPixelBounds.max.x - markerWidth/2;
                    y = center.y +  (x - center.x) *Math.tan(rad);
                    markerDistance = currentMarkerPosition.x - mapPixelBounds.x;
                }
            }
            // correction so that is always has same distance to edge

            // top out (top has y=0)
            if (y < mapPixelBounds.min.y + markerHeight/2) {
                y = mapPixelBounds.min.y + markerHeight/2;
                // bottom out
            } else if (y > mapPixelBounds.max.y - markerHeight/2) {
                y = mapPixelBounds.max.y - markerHeight/2 ;
            }
            // right out
            if (x > mapPixelBounds.max.x - markerWidth / 2) {
                x = mapPixelBounds.max.x - markerWidth / 2;
                // left out
            } else if (x < markerWidth / 2) {
                x = mapPixelBounds.min.x + markerWidth / 2;
            }

            return {x,y};
        },
        onAdd(map) {
            this._map = map;
            map.on('move', this._addEdgeMarker, this);
            map.on('viewreset', this._addEdgeMarker, this);
            this._addEdgeMarker();
        },
        onRemove() {
            this._removeEdgeMarker();
        },
        _addEdgeMarker() {
            if (!this._map) {
              return;
            }
            this._removeEdgeMarker();
            const position = this._getPointOutsideViewport();

            if (!position) {
                return;
            }

            const latLon = this._map.containerPointToLatLng(position);
            this.options.rotationAngle = this._getBearingToPoint();
            this.options.rotationAngle -= this.options.rotationOffset;

            this._edgeMarker = L.marker(latLon, this.options);
            this._map.addLayer(this._edgeMarker);
        },
    });

L.edgeMarker = function(latLng, options) {
    return new L.EdgeMarker(latLng, options);
};

return L.EdgeMarker;
});
