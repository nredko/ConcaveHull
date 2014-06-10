// concave hull

// get angle <prev - this - next>
L.LatLng.prototype.getAngle = function (prev, next){
    if(next.x == this.x && next.y == this.y)
        return 360.0;
    if(next.x == prev.x && next.y == prev.y)
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
    var byY = this.slice();
    byY.sort(function(a, b){ return b.y - a.y;});
if(DEBUG){
    var str = ""
    for(var i = 0, l = byY.length; i < l; i++)
        str +=  byY[i].name + ", "
    console.log("points: "+str);
}
    var hull = [];

    var start = byY[0];
    if(DEBUG) console.log("start: "+start.name)
    hull.push(start);
    var prev = start;
    var prevprev = {};
    prevprev.y = start.y - 1;
    prevprev.x = start.x;
    var next;
    while(next != start){
        if(DEBUG)L.circleMarker(prev,{color:"#F00", radius:3, fillOpacity:1}).addTo(map);
        byAngle = this.slice().sort(function(a, b){return prev.getAngle(prevprev, b) - prev.getAngle(prevprev, a);})

    if(DEBUG){
        console.log("from: "+start.name)
        console.log("prev: "+prev.name)
        var str = ""
        for(var i = 0, l = byY.length; i < l; i++)
            str +=  byAngle[i].name + ":"+prev.getAngle(prevprev, byAngle[i])+", "
        console.log("points by angle: "+str);
    }


        next = byAngle[0];
        hull.push(next);
        if(DEBUG) L.polyline([prev, next], {color: 'red'}).addTo(map);
        prevprev = prev;
        prev = next;
    }
    return hull;
}
