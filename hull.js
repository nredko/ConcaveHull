// concave hull

Array.prototype.getUnique = function(){
        var u = {}, a = [];
        for(var i = 0, l = this.length; i < l; ++i){
            if(u.hasOwnProperty(this[i].toString())) {
                continue;
            }
            a.push(this[i]);
            u[this[i].toString()] = 1;
        }
        return a;
    }

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
    var byX = this.slice(0);
    byX.sort(function(a, b){ 
        if(a.x > b.x)
            return 1;
        if(a.x < b.x)
            return -1;
        return 0;
    });
    var byY = this.slice(0);
    byY.sort(function(a, b){ 
        if(a.y > b.y)
            return 1;
        if(a.y < b.y)
            return -1;
        return 0;
    });
    var yy = [];
    for(var i = 1; i < byY.length; i++)
        yy[i - 1] = byY[i].y - byY[i - 1].y;
    var str = "[";
    for(var i = 1; i < byY.length; i++)
        str += byY[i].name + ", ";
    if(DEBUG) console.log(str + "]");    
    if(DEBUG) console.log("byY: " + yy.join());
    if(DEBUG) console.log("byY: " + yy.sort(function(a, b){ return (a - b);}));

    var hull = [];

    var start = byY[0];
    hull.push(start);
    var prev = start;
    var next;
return this;
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
