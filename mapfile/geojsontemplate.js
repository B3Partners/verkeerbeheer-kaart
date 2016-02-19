// mapserver template
[resultset layer=gemeentes2]
{
  "type": "FeatureCollection",
  "features": [
    [feature trimlast=","]
    {
      "type": "Feature",
      "id": "[gid]",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          {
            "type": "Polygon"
          }
        ]
      },
      "properties": {
        "gm_naam": "[gm_naam]",
        "gm_code": "[gm_code]"
      }
    },
    [/feature]
  ]
}
[/resultset]
