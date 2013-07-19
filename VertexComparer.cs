using System;
using System.Collections.Generic;

namespace concave
{
	static class VertexComparer: IComparer<Vertex>
	{
		#region IComparer implementation
		public int Compare (Vertex v1, Vertex v2)
		{
			int cmp = v1.X.CompareTo(v2.X);
			if(cmp == 0)
				return v1.Y.CompareTo(v2.Y);
			return cmp;
		}
		#endregion
	}

}

