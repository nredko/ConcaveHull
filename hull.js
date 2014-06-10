// concave hull
// get angle <prev - this - next>
L.LatLng.prototype.getAngle = function (prev, next){
    if(next.x == this.x && next.y == this.y)
        return 360.0;
    angle = (Math.atan2(next.y - this.y, next.x - this.x) - Math.atan2(prev.y - this.y, prev.x - this.x)) * 180 / Math.PI;
    while (angle < 0)
        angle += 360.0;
    return angle;
}

Array.prototype.pointInPolygon = function (point) {
    // (c) https://github.com/substack/point-in-polygon
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    var inside = false;
    for (var i = 0, j = this.length - 1; i < this.length; j = i++) {
        var xi = this[i].x, yi = this[i].y;
        var xj = this[j].x, yj = this[j].y;
        var intersect = ((yi > point.y) != (yj > point.y))
                && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};

Array.prototype.concaveHull = function(maxlen){
    if(this.length <= 3)
        return this;
    byX = this.slice(0).sort(function(a, b){ return a.x < b.x;});
    byY = this.slice(0).sort(function(a, b){ return a.y < b.y;});
    if(DEBUG) console.log("loaded and sorted");

    var hull = [];

    var start = byY[0];
    hull.push(start);
    var prev = start;
    var next;
    while(next != start){
        if(DEBUG)L.circleMarker(prev,{color:"#F00", radius:3, fillOpacity:1}).addTo(map);
        byAngle = this.slice(0).sort(function(a, b){return a.getAngle(prev, b);})
        next = byAngle[0];
        hull.push(next);
        if(DEBUG) L.polyline([prev, next], {color: 'red'}).addTo(map);
        prev = next;
    }
    return hull;
}
