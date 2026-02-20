
// 1. Set Mapbox access token (REPLACE WITH YOUR OWN)
mapboxgl.accessToken = 'pk.eyJ1IjoidmFtaWthZ29lbCIsImEiOiJjbWx1Y2R6a24wNXR3M2ZxbmJqZTM5dm5xIn0.EBko8Qe2Q7TVmozPuaC6AQ';

// 2. Declare global variables
let map;
let scriptPanel = scrollama();
let currentPopup = null; // track the open popup
const restaurantsData = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            properties: {
                name: "Pike Place Chowder",
                address: "1530 Post Aly, Seattle, WA 98101",
                cuisine: "Seafood",
                scene: 0,
                image: "pike_place_chowder.jpg"
            },
            geometry: {
                type: "Point",
                coordinates: [-122.3406, 47.6087]
            }
        },
        {
            type: "Feature",
            properties: {
                name: "Canlis",
                address: "2576 Aurora Ave N, Seattle, WA 98109",
                cuisine: "Fine Dining",
                scene: 1,
                image: "canlis.jpg"
            },
            geometry: {
                type: "Point",
                coordinates: [-122.3455, 47.6457]
            }
        },
        {
            type: "Feature",
            properties: {
                name: "Toulouse Petit",
                address: "601 Queen Anne Ave N, Seattle, WA 98109",
                cuisine: "Creole",
                scene: 2,
                image: "toulouse_petit.jpg"
            },
            geometry: {
                type: "Point",
                coordinates: [-122.3570, 47.6240]
            }
        },
        {
            type: "Feature",
            properties: {
                name: "Salumi",
                address: "309 3rd Ave S, Seattle, WA 98104",
                cuisine: "Italian Sandwiches",
                scene: 3,
                image: "salumi.jpg"
            },
            geometry: {
                type: "Point",
                coordinates: [-122.3296, 47.6001]
            }
        },
        {
            type: "Feature",
            properties: {
                name: "Molly Moon's",
                address: "917 E Pine St, Seattle, WA 98122",
                cuisine: "Ice Cream",
                scene: 4,
                image: "molly_moons.jpg"
            },
            geometry: {
                type: "Point",
                coordinates: [-122.3204, 47.6143]
            }
        }
    ]
};

// Helper to generate popup HTML
function getPopupContent(index) {
    const restaurant = restaurantsData.features.find(f => f.properties.scene === index);
    if (!restaurant) return '';
    const props = restaurant.properties;
    return `
        <div style="text-align: center; max-width: 200px;">
            <img src="img/${props.image}" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 8px;" alt="${props.name}">
            <h3 style="margin: 5px 0; font-size: 1.1rem;">${props.name}</h3>
            <p style="margin: 3px 0; font-style: italic;">${props.cuisine}</p>
            <p style="margin: 3px 0; font-size: 0.9rem;">${props.address}</p>
        </div>
    `;
}

// Initialize map
function initMap() {
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-122.3321, 47.6062],
        zoom: 11,
        pitch: 0,
        scrollZoom: false,   
        dragPan: true,      
        dragRotate: false    
    });

    map.on('load', () => {
        map.loadImage('https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png', (error, image) => {
            if (error) throw error;
            map.addImage('custom-marker', image);

            map.addSource('restaurants', {
                type: 'geojson',
                data: restaurantsData
            });

            map.addLayer({
                id: 'restaurant-points',
                type: 'symbol',
                source: 'restaurants',
                layout: {
                    'icon-image': 'custom-marker',
                    'icon-size': 0.7,
                    'icon-allow-overlap': true,
                    'text-field': ['get', 'name'],
                    'text-offset': [0, 1.5],
                    'text-anchor': 'top',
                    'text-size': 11
                },
                paint: {
                    'text-color': '#ffffff',
                    'text-halo-color': '#000000',
                    'text-halo-width': 1
                }
            });
        });

        // Initially hide all points
        map.setLayoutProperty('restaurant-points', 'visibility', 'none');
    });
}

// Scrollama setup
function setupScrollama() {
    scriptPanel
        .setup({
            step: '.scene',
            offset: 0.5,
            debug: false
        })
        .onStepEnter(handleSceneEnter)
        .onStepExit(handleSceneExit);
}

// Handle scene enter
function handleSceneEnter(response) {
    const index = response.index;

    if (index === 0) {
        document.getElementById('cover').style.visibility = 'hidden';
    }

    // Remove any existing popup
    if (currentPopup) {
        currentPopup.remove();
        currentPopup = null;
    }

    const allFeatures = restaurantsData.features;
    const currentFeature = allFeatures.find(f => f.properties.scene === index);
    if (!currentFeature) return;

    // Show only this marker
    const singleFeatureCollection = {
        type: 'FeatureCollection',
        features: [currentFeature]
    };

    if (map.getSource('restaurants')) {
        map.getSource('restaurants').setData(singleFeatureCollection);
        map.setLayoutProperty('restaurant-points', 'visibility', 'visible');
    }

    // Fly to the restaurant
    map.flyTo({
        center: currentFeature.geometry.coordinates,
        zoom: 15,
        pitch: 30,
        bearing: 0,
        speed: 0.6,
        curve: 1
    });

    // Create and open popup
    const popupContent = getPopupContent(index);
    currentPopup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        anchor: 'bottom'
    })
        .setLngLat(currentFeature.geometry.coordinates)
        .setHTML(popupContent)
        .addTo(map);

    // Change map style for specific scenes (optional)
    if (index === 1) {
        map.setStyle('mapbox://styles/mapbox/light-v11');
    } else if (index === 3) {
        map.setStyle('mapbox://styles/mapbox/satellite-streets-v11');
    } else {
        const currentStyle = map.getStyle().name;
        if (currentStyle !== 'Streets' && index !== 1 && index !== 3) {
            map.setStyle('mapbox://styles/mapbox/streets-v11');
        }
    }
}

// Handle scene exit
function handleSceneExit(response) {
    const index = response.index;

    if (index === 0 && response.direction === 'up') {
        document.getElementById('cover').style.visibility = 'visible';
    }

    // Hide marker and remove popup
    if (map.getLayer('restaurant-points')) {
        map.setLayoutProperty('restaurant-points', 'visibility', 'none');
    }
    if (currentPopup) {
        currentPopup.remove();
        currentPopup = null;
    }
}

// Initialize on load
window.addEventListener('load', () => {
    initMap();
    setupScrollama();
    window.addEventListener('resize', () => {}); // no extra logic needed
});
