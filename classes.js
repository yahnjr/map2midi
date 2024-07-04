class dataset {
    constructor(json_file, midi_file, color) {
        this.name = json_file.replace(/\.[^/]+$/, "");
        this.path = json_file;
        this.midi_path = midi_file;
        this.features = null;
        this.center = null;
        this.zoom = 12;
        this.color = color;
        this.minLng = 0.0;
        this.maxLng = 0.0;
        this.step = 0.0;

        this.loadFeatures(json_file).then(() => {
            this.find_center();
            this.set_zoom();
            this.loaded = true;
        });
    }

    async loadFeatures(url) {
        console.log("Fetching data from:", url);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.status}`);
            }
            const data = await response.json();
            this.features = data.features;
        } catch (error) {
            console.error("Error loading features:", error);
        }
    }

    find_center() {
        if (!this.features) return;

        let minLat = Infinity, maxLat = -Infinity;
        let minLng = Infinity, maxLng = -Infinity;

        for (const feature of this.features) {
            const coordinates = feature.geometry.coordinates;

            if (feature.geometry.type === 'Point') {
                const [lng, lat] = coordinates;
                minLat = Math.min(minLat, lat);
                maxLat = Math.max(maxLat, lat);
                minLng = Math.min(minLng, lng);
                this.minLng = minLng;
                maxLng = Math.max(maxLng, lng);
                this.maxLng = maxLng;
                this.step = (maxLng - minLng) / 48;
            } else if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
                const flattenCoordinates = (coords) => {
                    if (typeof coords[0] === 'number') return [coords];
                    return coords.flatMap(flattenCoordinates);
                };

                const allCoords = flattenCoordinates(coordinates);
                for (const [lng, lat] of allCoords) {
                    minLat = Math.min(minLat, lat);
                    maxLat = Math.max(maxLat, lat);
                    minLng = Math.min(minLng, lng);
                    maxLng = Math.max(maxLng, lng);
                }
            }
        }

        this.center = [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
    }
        set_zoom() {
            if (!this.features) return;
        
            let minLat = Infinity, maxLat = -Infinity;
            let minLng = Infinity, maxLng = -Infinity;
        
            for (const feature of this.features) {
                const coords = feature.geometry.coordinates;
                minLat = Math.min(minLat, coords[1]);
                maxLat = Math.max(maxLat, coords[1]);
                minLng = Math.min(minLng, coords[0]);
                maxLng = Math.max(maxLng, coords[0]);
            }
        
            const LngDist = Math.floor(maxLng - minLng);
            const LatDist = Math.floor(maxLat - minLat);
            
            const minZoom = 2;
            const maxZoom = 10;

            function distanceToZoom(distanceInMeters) {
            
                // Calculate the zoom level based on the distance
                const zoomRange = maxZoom - minZoom;
                const zoom = minZoom + (zoomRange / distanceInMeters);
            
                // Ensure the zoom level is within bounds
                distance = Math.max(minZoom, Math.min(maxZoom, zoom));

                return distance
            }
        
            let distance;
            if (LngDist > LatDist) {
                distance = LngDist;
            } else {
                distance = LatDist;
            }
        
            const zoom = Math.min(maxZoom, distanceToZoom(distance) + 0.5);
        
            this.zoom = zoom;
        }
    }
let Enriched_USA_Major_Cities = new dataset("https://yahnjr.github.io/map2midi/docs/Enriched_USA_Major_Cities.geojson", "tracks/Enriched_USA_Major_Cities.mid", "#f5f526")
let RTAStops = new dataset("https://yahnjr.github.io/map2midi/docs/RTAStops.geojson", "tracks/RTAStops.mid", "#9a17f1")
let Walls = new dataset("https://yahnjr.github.io/map2midi/docs/Walls.geojson", "tracks/Walls.mid", "#a45c05")
let Copper = new dataset("https://yahnjr.github.io/map2midi/docs/Copper.geojson", "tracks/Copper.mid", "#f88a2e")
let AirportsMetadata = new dataset("https://yahnjr.github.io/map2midi/docs/AirportsMetadata.geojson", "tracks/AirportsMetadata.mid", "#74fffd")
let lemurs = new dataset("https://yahnjr.github.io/map2midi/docs/lemurs.geojson", "tracks/lemurs.mid", "#ef1b1b")
let Hurricanes = new dataset("https://yahnjr.github.io/map2midi/docs/Hurricanes.geojson", "tracks/Hurricanes.mid", "#999999") 
let rio_graffiti = new dataset("https://yahnjr.github.io/map2midi/docs/rio_graffiti.geojson", "tracks/rio_graffiti.mid", "#baf741")
let himalayas = new dataset("https://yahnjr.github.io/map2midi/docs/himalayas.geojson", "tracks/himalayas.mid", "6ccbfb")

// Note: Since loadFeatures is asynchronous, the center might not be immediately available.
// You might need to wait or use an event/callback to ensure it's loaded before accessing it.
setTimeout(() => {
    console.log('Copper zoom', Copper.zoom);
    console.log("Airports zoom", AirportsMetadata.zoom);
    console.log("Walls zoom", Walls.zoom);
    console.log("Enriched_USA_Major_Cities zoom", Enriched_USA_Major_Cities.zoom);
    console.log("RTAStops zoom", RTAStops.zoom);
    console.log("rio zoom:", rio_graffiti.zoom)
}, 2000); // Adjust timeout as needed based on load time


    