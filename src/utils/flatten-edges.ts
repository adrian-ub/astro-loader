export function flattenEdges(data: any): any {
  const flatten = (edges: { node: any }[]): any[] => edges.map((edge) => {
    const flattenedEdge = { ...edge.node }
    for (const key in flattenedEdge) {
      if (Array.isArray(flattenedEdge[key].edges)) {
        flattenedEdge[key] = flatten(flattenedEdge[key].edges)
      }
      else if (typeof flattenedEdge[key] === 'object') {
        flattenedEdge[key] = flattenEdges(flattenedEdge[key])
      }
    }
    return flattenedEdge
  })

  for (const key in data) {
    if (Array.isArray(data[key].edges)) {
      data[key] = flatten(data[key].edges)
    }
    else if (typeof data[key] === 'object') {
      data[key] = flattenEdges(data[key])
    }
  }

  return data
}
