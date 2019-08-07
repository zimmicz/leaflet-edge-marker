const deg2rad = (deg) => deg * Math.PI / 180;
const rad2deg = (rad) => rad * 180 / Math.PI;

(function(L) {
    L.EdgeMarker = L.Layer.extend({
        options: {
            circleMarker: {
                heightOffset: 29,
                widthOffset: 29,
                rotationAngle: 0,
                fillOpacity: 1,
                stroke: false,
            }
        },
        _removeEdgeMarker() {
            if (this._map && this._edgeMarker) {
                this._map.removeLayer(this._edgeMarker);
            }
        },
        _findEdge(map) {
            return L.bounds([0,0], map.getSize())
        },
        _getBearingToPoint() {
            const lat1 = deg2rad(this._map.getCenter()['lat']);
            const lat2 = deg2rad(this.options.lat);
            const dLon = deg2rad(this._map.getCenter()['lng'] - this.options.lng);
            const y = Math.sin(dLon) * Math.cos(lat2);
            const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
            let brng = Math.atan2(y, x);
            brng = parseInt(rad2deg(brng));
            brng = 360 - ((brng + 360) % 360);
            return brng;
        },
        _getPointOutsideViewport() {
            const mapPixelBounds = this._findEdge(this._map);
            const currentMarkerPosition = this._map.latLngToContainerPoint([this.options.lat, this.options.lng]);

            if (!(currentMarkerPosition.y < mapPixelBounds.min.y ||
                currentMarkerPosition.y > mapPixelBounds.max.y ||
                currentMarkerPosition.x > mapPixelBounds.max.x ||
                currentMarkerPosition.x < mapPixelBounds.min.x
            )) {
                return;
            }

            let {x,y} = currentMarkerPosition;
            const center = mapPixelBounds.getCenter();
            const markerWidth = this.options.circleMarker.widthOffset;
            const markerHeight = this.options.circleMarker.heightOffset;
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
        initialize(options) {
            const _options = L.Util.extend(this.options, options);
            L.Util.setOptions(this, _options);
            L.Icon.Default.prototype.options.shadowSize = [0,0];
        },
        onAdd(map) {
            this._map = map;
            map.on('move', this._addEdgeMarker, this);
            map.on('viewreset', this._addEdgeMarker, this);
            this._addEdgeMarker();
        },
        onRemove(map) {
            this._removeEdgeMarker();
        },
        _addEdgeMarker() {
            const position = this._getPointOutsideViewport();
            this._removeEdgeMarker();

            if (!position) {
                return;
            }

            const latLon = this._map.containerPointToLatLng(position);
            this.options.circleMarker.rotationAngle = this._getBearingToPoint();

            this._edgeMarker = L.circleMarker(latLon, this.options.circleMarker);
            this._map.addLayer(this._edgeMarker);
        },
    });

    L.edgeMarker = function(options) {
        return new L.EdgeMarker(options);
    };
})(L);
