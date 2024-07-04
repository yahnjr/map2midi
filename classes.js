class dataset {
    constructor(json_file, midi_file) {
        this.name = json_file.replace(/\.[^/]+$/, "");
        this.path = json_file;
        this.midi_path = midi_file;
        this.features = null;
        this.center = null;
        this.zoom = 12;

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
                maxLng = Math.max(maxLng, lng);
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
        
            console.log("Long distance", LngDist);
            console.log("Lat distance", LatDist);
        
            function distanceToZoom(distanceInMeters) {
                // Define the desired zoom range
                const minZoom = 2;
                const maxZoom = 12;
            
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
        
            const zoom = distanceToZoom(distance);
        
            this.zoom = zoom;
        }
    }
let Enriched_USA_Major_Cities = new dataset("https://yahnjr.github.io/map2midi/docs/Enriched_USA_Major_Cities.geojson", "tracks/Enriched_USA_Major_Cities.mid")
let RTAStops = new dataset("https://yahnjr.github.io/map2midi/docs/RTAStops.geojson", "tracks/RTAStops.mid")
let Walls = new dataset("https://yahnjr.github.io/map2midi/docs/Walls.geojson", "tracks/Walls.mid")
let Copper = new dataset("https://yahnjr.github.io/map2midi/docs/Copper.geojson", "tracks/Copper.mid")
let AirportsMetadata = new dataset("https://yahnjr.github.io/map2midi/docs/AirportsMetadata.geojson", "tracks/AirportsMetadata.mid")
let lemurs = new dataset("https://yahnjr.github.io/map2midi/docs/lemurs.geojson", "tracks/lemurs.mid")
let Hurricanes = new dataset("https://yahnjr.github.io/map2midi/docs/Hurricanes.geojson", "tracks/Hurricanes.mid")
let rio_graffiti = new dataset("https://yahnjr.github.io/map2midi/docs/rio_graffiti.geojson", "tracks/rio_graffiti.mid")
let himalayas = new dataset("https://yahnjr.github.io/map2midi/docs/himalayas.geojson", "tracks/himalayas.mid")

// Note: Since loadFeatures is asynchronous, the center might not be immediately available.
// You might need to wait or use an event/callback to ensure it's loaded before accessing it.
setTimeout(() => {
    console.log('LaPine zoom', LaPine.zoom);
    console.log("USA Cities zoom", USCities.zoom);
    console.log('Copper zoom', Copper.zoom);
    console.log("Airports zoom", AirportsMetadata.zoom);
    console.log("Walls zoom", Walls.zoom);
    console.log("Enriched_USA_Major_Cities zoom", Enriched_USA_Major_Cities.zoom);
    console.log("RTAStops zoom", RTAStops.zoom);
}, 2000); // Adjust timeout as needed based on load time


        // .then(data => {
        //     this.features = data.features;

        //     let center = [0, 0]; // Initial values
        //     if (data.features[0].geometry.type === 'Point') {
        //         let sumLat = 0;
        //         let sumLng = 0;
        //         for (const feature of data.features) {
        //             sumLat += feature.geometry.coordinates[1]; // Latitude
        //             sumLng += feature.geometry.coordinates[0]; // Longitude
        //             }
        //         center = [sumLng / data.features.length, sumLat / data.features.length];
        //     } else {
        //         console.warn("Center calculation currently only supports Point geometries.");
        //     }
        //     this.center = center;
        //     })
        // .catch(error => {
        //     console.error("Error loading JSON data:", error);
        // });