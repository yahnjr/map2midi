const mapboxAccessToken = 'pk.eyJ1IjoiaWZvcm1haGVyIiwiYSI6ImNsaHBjcnAwNDF0OGkzbnBzZmUxM2Q2bXgifQ.fIyIgSwq1WWVk9CKlXRXiQ'; // Replace with your Mapbox token
mapboxgl.accessToken = mapboxAccessToken;
const map1 = new mapboxgl.Map({
    container: 'map1',
    style: 'mapbox://styles/mapbox/satellite-streets-v11',
    center: [0, 0], // Initial center
    zoom: 2 // Initial zoom
});

const map2 = new mapboxgl.Map({
    container: 'map2',
    style: 'mapbox://styles/mapbox/satellite-streets-v11',
    center: [0, 0], // Initial center
    zoom: 2 // Initial zoom
});

const datasets = {
    USCities: new dataset("https://yahnjr.github.io/map2midi/docs/USAMajor.geojson", "tracks/USMajor.mid"),
    LaPine: new dataset("https://yahnjr.github.io/map2midi/docs/Lapine_comment.geojson", "tracks/Lapine_comments.mid")
    // Add more datasets as needed
};

document.addEventListener('DOMContentLoaded', () => {
    const datasetSelectors = [
        document.getElementById('datasetSelect1'),
        document.getElementById('datasetSelect2')
        // Add more selectors as needed
    ];

    datasetSelectors.forEach((datasetSelector, index) => {
        datasetSelector.addEventListener('change', async (event) => {
            const selectedDatasetKey = event.target.value;
            const selectedDataset = datasets[selectedDatasetKey];
            const map = index === 0 ? map1 : map2;
            const midiPlayer = document.getElementById(`midiPlayer${index + 1}`);
            const midiVisualizer = document.getElementById(`pianoRollVisualizer${index + 1}`);

            if (selectedDataset) {
                // Wait for the dataset to fully load
                const checkLoaded = setInterval(() => {
                    if (selectedDataset.loaded) {
                        clearInterval(checkLoaded);

                        // Update Mapbox map
                        if (selectedDataset.center && selectedDataset.zoom) {
                            map.flyTo({
                                center: selectedDataset.center,
                                zoom: selectedDataset.zoom
                            });
                        }

                        // Remove existing GeoJSON layer if it exists
                        if (map.getSource('geojson-layer')) {
                            map.removeLayer('geojson-layer');
                            map.removeSource('geojson-layer');
                        }

                        // Add new GeoJSON layer
                        map.addSource('geojson-layer', {
                            type: 'geojson',
                            data: selectedDataset.path
                        });

                        map.addLayer({
                            id: 'geojson-layer',
                            type: 'circle',
                            source: 'geojson-layer',
                            paint: {
                                'circle-radius': 5,
                                'circle-color': '#007cbf'
                            }
                        });

                        // Update MIDI player
                        if (midiPlayer) {
                            midiPlayer.src = selectedDataset.midi_path;
                        }
                        if (midiVisualizer) {
                            midiVisualizer.src = selectedDataset.midi_path;
                        }
                        console.log('Dataset selector ${index + 1} loaded')
                    }
                }, 100); // Check every 100ms if the dataset is loaded
                
            } else {
                console.log(`Dataset selector ${index + 1} not found`);
            }
        });
    });
});
