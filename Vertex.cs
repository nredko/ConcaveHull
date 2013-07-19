using System;
using System.Collections.Generic;

namespace concave
{
	public class Vertex{
		public double X;
		public double Y;

		public double DistanceTo(Vertex v)
		{
		    return Math.Sqrt(Math.Pow((this.X - v.X), 2) + Math.Pow((this.Y - v.Y), 2));
		}
	}
}

