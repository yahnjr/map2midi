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
        this.xRange = 0.0;
        this.yRange = 0.0;
        this.maxRange = 0.0;
        this.loaded = false;

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
                this.step = (maxLng - minLng) / 64;
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
    
        this.xRange = maxLng - minLng;
        this.yRange = maxLat - minLat;
        this.maxRange = Math.max(this.xRange, this.yRange);
        
        this.calculateZoom();
    }

    calculateZoom() {
        if (this.maxRange > 0) {
            this.zoom = -1.295 * Math.log(this.maxRange) + 7.9808;
        } else {
            console.warn(`Cannot calculate zoom for ${this.name}: maxRange is ${this.maxRange}`);
            this.zoom = 0; // or some default value
        }
    }

    isLoaded() {
        return this.loaded;
    }
}
W
let Enriched_USA_Major_Cities = new dataset("https://yahnjr.github.io/map2midi/docs/Enriched_USA_Major_Cities.geojson", "tracks/Enriched_USA_Major_Cities.mid", "#f5f526")
let Enriched_USA_Major_Cities1 = new dataset("https://yahnjr.github.io/map2midi/docs/Enriched_USA_Major_Cities.geojson", "tracks/Enriched_USA_Major_Cities1.mid", "#f5f526")
let RTAStops = new dataset("https://yahnjr.github.io/map2midi/docs/RTAStops.geojson", "tracks/RTAStops.mid", "#9a17f1")
let Walls = new dataset("https://yahnjr.github.io/map2midi/docs/Walls.geojson", "tracks/Walls.mid", "#a45c05")
let Copper = new dataset("https://yahnjr.github.io/map2midi/docs/Copper.geojson", "tracks/Copper.mid", "#f88a2e")
let AirportsMetadata = new dataset("https://yahnjr.github.io/map2midi/docs/AirportsMetadata.geojson", "tracks/AirportsMetadata.mid", "#74fffd")
let lemurs = new dataset("https://yahnjr.github.io/map2midi/docs/lemurs.geojson", "tracks/lemurs.mid", "#ef1b1b")
let Hurricanes = new dataset("https://yahnjr.github.io/map2midi/docs/Hurricanes.geojson", "tracks/Hurricanes.mid", "#999999") 
let rio_graffiti = new dataset("https://yahnjr.github.io/map2midi/docs/rio_graffiti.geojson", "tracks/rio_graffiti.mid", "#baf741")
let himalayas = new dataset("https://yahnjr.github.io/map2midi/docs/himalayas.geojson", "tracks/himalayas.mid", "6ccbfb")
let lemurs1 = new dataset("https://yahnjr.github.io/map2midi/docs/lemurs.geojson", "tracks/lemurs1.mid", "#ef1b1b")
let Hurricanes1 = new dataset("https://yahnjr.github.io/map2midi/docs/Hurricanes.geojson", "tracks/Hurricanes1.mid", "#999999") 

setTimeout(() => {
    const datasets = [
        Copper, AirportsMetadata, Walls, Enriched_USA_Major_Cities, 
        RTAStops, rio_graffiti, lemurs, Hurricanes, himalayas, lemurs1, Hurricanes1
    ];

    datasets.forEach(dataset => {
        console.log(`${dataset.name} extent:`, dataset.extent);
    }); 

});
    