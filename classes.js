class dataset {

    constructor(json_file, midi_file) {
        this.name = json_file.replace(/\.[^/]+$/, "");
        this.path = json_file;
        this.midi_path = midi_file;
        this.features = null;
        this.center = null;

        this.loadFeatures(json_file);
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
            this.calculateCenter(); // Call calculateCenter after features are loaded
          } catch (error) {
            console.error("Error loading features:", error);
    }
}

    find_center() {
        let center = [0, 0]; // Initial values
        if (features[0].geometry.type === 'Point') {
        // Logic for calculating center from point coordinates
            let sumLat = 0;
            let sumLng = 0;
            for (const feature of features) {
                sumLat += feature.geometry.coordinates[1]; // Latitude
                sumLng += feature.geometry.coordinates[0]; // Longitude
                }
            center = [sumLng / features.length, sumLat / features.length];
    }
}
}
let USCities = new dataset("https://github.com/yahnjr/map2midi/blob/main/geo/Lapine_comment.geojson.raw", "tracks\\midi1.mid");
console.log(USCities.name);
console.log(USCities.midi_path)
console.log(USCities.center)


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