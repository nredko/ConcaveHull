using System;
using System.Collections.Generic;

namespace concave
{
	public class ConcaveHull
	{
		public ConcaveHull ()
		{
		}

		//Main method
public static Vertex[] Calculate(Vertex[] points, int k = 3)
{
    if (k < 3)
        throw new ArgumentException("K is required to be 3 or more", "k");
    List<Vertex> hull = new List<Vertex>();
    //Clean first, may have lots of duplicates
    Vertex[] clean = RemoveDuplicates(points);
    if (clean.Length < 3)
        throw new ArgumentException("At least 3 dissimilar points reqired", "points");
    if (clean.Length == 3)//This is the hull, its already as small as it can be.
        return clean;
    if (clean.Length < k)
        throw new ArgumentException("K must be equal to or smaller then the amount of dissimilar points", "points");
    Vertex firstPoint = clean[0]; //TODO find mid point
    hull.Add(firstPoint);
    Vertex currentPoint = firstPoint;
    Vertex[] dataset = RemoveIndex(clean, 0);
    double previousAngle = 0;
    int step = 2;
    int i;
    while (((currentPoint != firstPoint) || (step == 2)) && (dataset.Length > 0))
    {
        if (step == 5)
            dataset = Add(dataset, firstPoint);
        Vertex[] kNearestPoints = nearestPoints(dataset, currentPoint, k);
        Vertex[] cPoints = sortByAngle(kNearestPoints, currentPoint, previousAngle);
        bool its = true;
        i = 0;
        while ((its) && (i < cPoints.Length))
        {
            i++;
            int lastPoint = 0;
            if (cPoints[0] == firstPoint)
                lastPoint = 1;
            int j = 2;
            its = false;
            while ((!its) && (j < hull.Count - lastPoint))
            {
                its = intersectsQ(hull[step - 1 - 1], cPoints[0], hull[step - i - j - 1], hull[step - j - 1]);
                j++;
            }
        }
        if (its)
        {
            return ConcaveHull(points, k + 1);
        }
        currentPoint = cPoints[0];
        hull.Add(currentPoint);
        previousAngle = angle(hull[step - 1], hull[step - 2]);
        dataset = RemoveIndex(dataset, 0);
        step++;
    }
    bool allInside = true;
    i = dataset.Length;
    while (allInside && i > 0)
    {
        allInside = new Polygon(dataset).Contains(currentPoint); //TODO havent finished ray casting yet.
        i--;
    }
    if (!allInside)
        return ConcaveHull(points, k + 1);
    return hull.ToArray();
}

private static Vertex[] Add(Vertex[] vs, Vertex v)
{
    List<Vertex> n = new List<Vertex>(vs);
    n.Add(v);
    return n.ToArray();
}

private static Vertex[] RemoveIndex(Vertex[] vs, int index)
{
    List<Vertex> removed = new List<Vertex>();
    for (int i = 0; i < vs.Length; i++)
        if (i != index)
            removed.Add(vs[i]);
    return removed.ToArray();
}

private static Vertex[] RemoveDuplicates(Vertex[] vs)
{
    List<Vertex> clean = new List<Vertex>();
    VertexComparer vc = new VertexComparer();
    foreach (Vertex v in vs)
    {
        if (!clean.Contains(v, vc))
            clean.Add(v);
    }
    return clean.ToArray();
}

private static Vertex[] nearestPoints(Vertex[] vs, Vertex v, int k)
{
    Dictionary<double, Vertex> lengths = new Dictionary<double, Vertex>();
    List<Vertex> n = new List<Vertex>();
    double[] sorted = lengths.Keys.OrderBy(d => d).ToArray();
    for (int i = 0; i < k; i++)
    {
        n.Add(lengths[sorted[i]]);
    }
    return n.ToArray();
}

private static Vertex[] SortByAngle(Vertex[] vs, Vertex v, double angle)
{
    List<Vertex> vertList = new List<Vertex>(vs);
    vertList.Sort((v1, v2) => AngleDifference(angle, Angle(v, v1)).CompareTo(AngleDifference(angle, Angle(v, v2))));
    return vertList.ToArray();
}

private static double AngleDifference(double a, double b)
{
    while (a < b - Math.PI) a += Math.PI * 2;
    while (b < a - Math.PI) b += Math.PI * 2;

    return Math.Abs(a - b);
}

private static bool intersectsQ(Vertex v1, Vertex v2, Vertex v3, Vertex v4)
{
    return intersectsQ(new Edge(v1, v2), new Edge(v3, v4));
}

private static bool intersectsQ(Edge e1, Edge e2)
{
    double x1 = e1.A.X;
    double x2 = e1.B.X;
    double x3 = e2.A.X;
    double x4 = e2.B.X;

    double y1 = e1.A.Y;
    double y2 = e1.B.Y;
    double y3 = e2.A.Y;
    double y4 = e2.B.Y;

    var x = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
    var y = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4));
    if (double.IsNaN(x) || double.IsNaN(y))
    {
        return false;
    }
    else
    {
        if (x1 >= x2)
        {
            if (!(x2 <= x && x <= x1)) { return false; }
        }
        else
        {
            if (!(x1 <= x && x <= x2)) { return false; }
        }
        if (y1 >= y2)
        {
            if (!(y2 <= y && y <= y1)) { return false; }
        }
        else
        {
            if (!(y1 <= y && y <= y2)) { return false; }
        }
        if (x3 >= x4)
        {
            if (!(x4 <= x && x <= x3)) { return false; }
        }
        else
        {
            if (!(x3 <= x && x <= x4)) { return false; }
        }
        if (y3 >= y4)
        {
            if (!(y4 <= y && y <= y3)) { return false; }
        }
        else
        {
            if (!(y3 <= y && y <= y4)) { return false; }
        }
    }
    return true;
}

private static double angle(Vertex v1, Vertex v2)
{
    // TODO fix
    Vertex v3 = new Vertex(v1.X, 0);
    if (Orientation(v3, v1, v2) == 0)
        return 180;

    double b = EuclideanDistance(v3, v1);
    double a = EuclideanDistance(v1, v2);
    double c = EuclideanDistance(v3, v2);
    double angle = Math.Acos((Math.Pow(a, 2) + Math.Pow(b, 2) - Math.Pow(c, 2)) / (2 * a * b));

    if (Orientation(v3, v1, v2) < 0)
        angle = 360 - angle;

    return angle;
}

private static double Angle(Vertex v1, Vertex v2)
{
    return Math.Atan2(v2.Y - v1.Y, v2.X - v1.X);
}

private static double EuclideanDistance(Vertex v1, Vertex v2)
{
    return Math.Sqrt(Math.Pow((v1.X - v2.X), 2) + Math.Pow((v1.Y - v2.Y), 2));
}

public static double Orientation(Vertex p1, Vertex p2, Vertex p)
{
    double Orin = (p2.X - p1.X) * (p.Y - p1.Y) - (p.X - p1.X) * (p2.Y - p1.Y);
    if (Orin > 0)
        return -1;//Left
    if (Orin < 0)
        return 1;//Right
    return 0;//Colinier
}

}
}

