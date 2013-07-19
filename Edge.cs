using System;
using System.Collections.Generic;

namespace concave
{
	public class Edge
	{
		public Vertex A;
		public Vertex B;
		public Edge (Vertex v1, Vertex v2)
		{
			A = v1;
			B = v2;
		}
	}

}

