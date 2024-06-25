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

document.addEventListener('DOMContentLoaded', () => {
    const datasetSelector = document.getElementById('datasetSelect1');

    const datasets = {
        USCities: new dataset("https://yahnjr.github.io/map2midi/docs/USAMajor.geojson", "tracks/USMajor.mid"),
        LaPine: new dataset("https://yahnjr.github.io/map2midi/docs/Lapine_comment.geojson", "tracks/Lapine_comments.mid")
        // Add more datasets as needed
    };

    datasetSelector.addEventListener('change', async (event) => {
        const selectedDatasetKey = event.target.value;
        const selectedDataset = datasets[selectedDatasetKey];

        if (selectedDataset) {
            // Wait for the dataset to fully load
            const checkLoaded = setInterval(() => {
                if (selectedDataset.loaded) {
                    clearInterval(checkLoaded);

                    // Update Mapbox map
                    if (selectedDataset.center && selectedDataset.zoom) {
                        map1.flyTo({
                            center: selectedDataset.center,
                            zoom: selectedDataset.zoom
                        });
                    }

                    // Remove existing GeoJSON layer if it exists
                    if (map1.getSource('geojson-layer')) {
                        map1.removeLayer('geojson-layer');
                        map1.removeSource('geojson-layer');
                    }

                    // Add new GeoJSON layer
                    map1.addSource('geojson-layer', {
                        type: 'geojson',
                        data: selectedDataset.path
                    });

                    map1.addLayer({
                        id: 'geojson-layer',
                        type: 'circle',
                        source: 'geojson-layer',
                        paint: {
                            'circle-radius': 5,
                            'circle-color': '#007cbf'
                        }
                    });

                    // Update MIDI player
                    const midiPlayer1 = document.getElementById('midiPlayer1');
                    if (midiPlayer1) {
                        midiPlayer1.src = selectedDataset.midi_path;
                    }
                    const midiVisualizer1 = document.getElementById('pianoRollVisualizer1');
                    if (midiVisualizer1) {
                        midiVisualizer1.src = selectedDataset.midi_path;
                    }
                }
            }, 100); // Check every 100ms if the dataset is loaded
        } else {
            console.log("oops")
        }
    });
});
