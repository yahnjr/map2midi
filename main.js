const mapboxAccessToken = 'pk.eyJ1IjoiaWZvcm1haGVyIiwiYSI6ImNsaHBjcnAwNDF0OGkzbnBzZmUxM2Q2bXgifQ.fIyIgSwq1WWVk9CKlXRXiQ'; // Replace with your Mapbox token
mapboxgl.accessToken = mapboxAccessToken;
const map1 = new mapboxgl.Map({
    container: 'map1',
    style: 'mapbox://styles/mapbox/satellite-streets-v11',
    center: [0, 0], // Initial center
    zoom: 2 // Initial zoom
});

 // Fetch the soundfonts.json file
 fetch("soundfonts.json")
 .then((response) => response.json())
 .then((data) => {
   window.soundfonts = data.soundfonts;
 })
 .catch((error) => console.error("Error fetching soundfonts:", error));

function changeMidi(playerId, visualizerId, newSrc) {
 const player = document.getElementById(playerId);
 const visualizer = document.getElementById(visualizerId);
 player.src = newSrc;
 visualizer.src = newSrc;
}

function changeSoundfont(playerId, soundfontName) {
 const soundfontUrl = window.soundfonts[soundfontName];
 if (!soundfontUrl) {
   console.error("Soundfont URL not found for:", soundfontName);
   return;
 }
 const player = document.getElementById(playerId);
 player.stop();
 player.soundFont = soundfontUrl;
}

document.addEventListener('DOMContentLoaded', () => {
 const datasetSelector = document.getElementById('datasetSelect');
 const datasets = {
    USCities: new dataset("https://yahnjr.github.io/map2midi/docs/USAMajor.geojson", "tracks/USMajor.mid"),
    LaPine: new dataset("https://yahnjr.github.io/map2midi/docs/Lapine_comment.geojson", "tracks/Lapine_comments.mid"),
    RTAStops = new dataset("https://yahnjr.github.io/map2midi/docs/RTAStops.geojson", "tracks/RTAStops.mid")
    Walls = new dataset("https://yahnjr.github.io/map2midi/docs/Walls.geojson", "tracks/Walls.mid")
    Copper = new dataset("https://yahnjr.github.io/map2midi/docs/Copper.geojson", "tracks/Copper.mid")
    AirportsMetadata = new dataset("https://yahnjr.github.io/map2midi/docs/AirportsMetadata.geojson", "tracks/AirportsMetadata.mid")
    Enriched_USA_Major_Cities = new dataset("https://yahnjr.github.io/map2midi/docs/Enriched_USA_Major_Cities.geojson", "tracks/Enriched_USA_Major_Cities.mid")
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
     console.log("Dataset not found");
   }
 });
});