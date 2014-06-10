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

Array.prototype.findMinYPoint = function(){
    var minI = this.length;
    var min = 360;
    for(i = 0; i < this.length; i++) {
        if(min > this[i].lat){
            min = this[i].lat;
            minI = i;
        }
    }
    return this[minI];
}

Array.prototype.remove = function(obj){
    this.splice(this.indexOf(obj), 1);
}

var angles = [];
var prevAngle = 0;

function fixAngle(angle){
    var delta = 0.001;
    if(angle < 0)
        angle = 2*Math.PI + angle;
    if(angle >= 2*Math.PI)
        angle = angle - 2*Math.PI;
    if((angle > Math.PI/2 && angle - Math.PI/2 < delta ) || (Math.PI/2 > angle && Math.PI/2 - angle < delta))
        angle = Math.PI/2;
    if((angle > Math.PI && angle - Math.PI < delta ) || (Math.PI > angle && Math.PI - angle < delta))
        angle = Math.PI;
    if((angle > Math.PI*3/4 && angle - Math.PI*3/4 < delta ) || (Math.PI*3/4 > angle && Math.PI*3/4 - angle < delta))
        angle = Math.PI*3/4;
    return angle;
}

L.LatLng.prototype.angleTo = function(p) {
    var p1 = L.CRS.EPSG3395.latLngToPoint(this, 18);
    var p2 = L.CRS.EPSG3395.latLngToPoint(p, 18);
    var angle = 2*Math.PI - Math.atan2(p2.x - p1.x, p2.y - p1.y) - Math.PI/2;
    return fixAngle(angle)
}

Array.prototype.sortByAngle = function (point){
    angles = [];
    this.sort(function(a,b){
        return fixAngle((Math.PI - prevAngle) + point.angleTo(b)) - fixAngle((Math.PI - prevAngle) + point.angleTo(a));
    });
    for(i = 0; i < this.length; i++)
        angles.push(this[i].name + ': '+ point.angleTo(this[i])*180/Math.PI+'°')
}

L.LatLng.prototype.nearestPoints = function(points, count){
    var /* L.LatLng */ source = this;
    points.sort(function(a, b){
        return source.distanceTo(a) - source.distanceTo(b)
    });
    return points.slice(0, count);
}

Array.prototype.pointInPolygon = function (point) {
    // (c) https://github.com/substack/point-in-polygon
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    var x = point.lng, y = point.lat;
    var inside = false;
    for (var i = 0, j = this.length - 1; i < this.length; j = i++) {
        var xi = this[i].lng, yi = this[i].lat;
        var xj = this[j].lng, yj = this[j].lat;
        var intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};

function ccw(A, B, C){
    var cccw = (C.y-A.y)*(B.x-A.x) - (B.y-A.y)*(C.x-A.x);
    return cccw > 0.0 ? 1 : cccw < 0.0 ? -1 : 0;
}

function intersectQ(/* LatLng */ a1, a2, b1, b2){
    var A = L.CRS.EPSG3395.latLngToPoint(a1, 18);
    var B = L.CRS.EPSG3395.latLngToPoint(a2, 18);
    var C = L.CRS.EPSG3395.latLngToPoint(b1, 18);
    var D = L.CRS.EPSG3395.latLngToPoint(b2, 18);
    return (ccw(A,C,D) != ccw(B,C,D) && ccw(A,B,C) != ccw(A,B,D));
}

Array.prototype.concaveHull = function(k){
    if(k < 3)
        return [];
    var dataset = this.getUnique();
    if(this.length <= 3)
        return this;
    var kk = Math.min(k,dataset.length-1);
    var firstPoint = dataset.findMinYPoint();
    var hull = [];
    hull.push(firstPoint);
    var currentPoint  = firstPoint;
    //prevPoint = currentPoint;
    prevAngle = 0;
    //if(DEBUG) L.circleMarker(currentPoint,{color:"#F00", radius:3}).addTo(map);
    dataset.remove(firstPoint);
    var step = 1;
    while (((currentPoint != firstPoint) || (step == 1)) && (dataset.length > 0)){
        if (step == 4){
            dataset.push(firstPoint)
        }
        var cPoints = currentPoint.nearestPoints(dataset,kk);
        cPoints.sortByAngle(currentPoint);
        //if(DEBUG){
        //    clearMarks();
        //    for(xx=0; xx < cPoints.length; xx++)mark(cPoints[xx], 2*(xx+1), "#F0F");
        //}
        var its = true;
        //if(DEBUG) console.log('step:'+step);
        for(i = 0; its && i < cPoints.length; i++){//check all candidates if their segments cross any prev segment in hull
            its = false;
            if(cPoints[i] == firstPoint){
                i++;
                break;
            }
            for(j = step - 2; !its && j > 0; j--){ //check with all prev hull segments, except the last
                its = intersectQ(hull[step - 1], cPoints[i], hull[j], hull[j - 1]);
                //if(DEBUG){ console.log('i:'+i+',j:'+j+') '+hull[step - 1].name + '-'+cPoints[i].name
                //    +' x '+hull[j].name+'-'+hull[j - 1].name + ': '+its);
            }
        }

        if(its)//since all candidates intersect at least one edge, try again with a higher number of neighbours
            return this.concaveHull(kk + 1);
        currentPoint = cPoints[i - 1];
        hull.push(currentPoint);//a valid candidate was found
        //if(DEBUG) drawHull(hull, map);
        prevAngle = hull[step - 1].angleTo(hull[step]);
        dataset.remove(currentPoint);
        step++;
        i++;
    }
    var allInside = true;
    i = dataset.length;
    while (allInside && i > 0) {// check if all the given points are inside the computed polygon
        i--;
        allInside = hull.pointInPolygon(dataset[i]);
        //if(DEBUG) console.log(dataset[i].name + " inside: "+allInside);
    }
    if(!allInside)
        return this.concaveHull(kk + 1); //since at least one point is out of the computed polygon, try again with a higher number of neighbours
    return hull;
}
