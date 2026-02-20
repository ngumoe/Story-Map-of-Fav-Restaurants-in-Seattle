mapboxgl.accessToken = "pk.eyJ1IjoidmFtaWthZ29lbCIsImEiOiJjbWx1Y2R6a24wNXR3M2ZxbmJqZTM5dm5xIn0.EBko8Qe2Q7TVmozPuaC6AQ";

let map, scriptPanel = scrollama();

map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v10',
  center: [-121.93, 47.33],
  zoom: 7
});

map.on('load', () => {

  scriptPanel
    .setup({
      step: ".scene",
      offset: 0.33,
      debug: false
    })
    .onStepEnter(handleSceneEnter)
    .onStepExit(handleSceneExit);

});

function handleSceneEnter(response) {

  const index = response.index;

  if (index === 0) {
    map.flyTo({
      center: [-121.93, 47.33],
      zoom: 8,
      pitch: 0,
      speed: 0.5
    });
    document.getElementById("cover").style.visibility = "hidden";

  } else if (index === 1) {
    map.flyTo({
      center: [-122.33, 47.60],
      zoom: 10,
      pitch: 45
    });

  } else if (index === 2) {
    map.setStyle('mapbox://styles/mapbox/satellite-v9');
  }
}

function handleSceneExit(response) {

  const index = response.index;

  if (index === 0) {
    if (response.direction === 'up') {
      document.getElementById("cover").style.visibility = "visible";
    }
  }
}
