const mapboxAccessToken = 'pk.eyJ1IjoiaWZvcm1haGVyIiwiYSI6ImNsaHBjcnAwNDF0OGkzbnBzZmUxM2Q2bXgifQ.fIyIgSwq1WWVk9CKlXRXiQ'; // Replace with your Mapbox token
mapboxgl.accessToken = mapboxAccessToken;
const map1 = new mapboxgl.Map({
    container: 'map1',
    style: 'mapbox://styles/mapbox/satellite-streets-v11',
    center: [0, 0], // Initial center
    zoom: 2 // Initial zoom
});

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
    RTAStops: new dataset("https://yahnjr.github.io/map2midi/docs/RTAStops.geojson", "tracks/RTAStops.mid"),
    Walls: new dataset("https://yahnjr.github.io/map2midi/docs/Walls.geojson", "tracks/Walls.mid"),
    Copper: new dataset("https://yahnjr.github.io/map2midi/docs/Copper.geojson", "tracks/Copper.mid"),
    AirportsMetadata: new dataset("https://yahnjr.github.io/map2midi/docs/AirportsMetadata.geojson", "tracks/AirportsMetadata.mid"),
    Enriched_USA_Major_Cities: new dataset("https://yahnjr.github.io/map2midi/docs/Enriched_USA_Major_Cities.geojson", "tracks/Enriched_USA_Major_Cities.mid"),
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

// let player;
// let playerInitialized = false;
// let pendingInstrumentChange = null;

// fetch('https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus')
//   .then(response => {
//     if (response.ok) {
//       console.log('SoundFont URL is accessible');
//       return response.text();
//     }
//     throw new Error('SoundFont URL is not accessible');
//   })
//   .then(data => console.log('First 100 characters of response:', data.slice(0, 100)))
//   .catch(error => console.error('Error checking SoundFont URL:', error));

// document.addEventListener('DOMContentLoaded', (event) => {
//   console.log(`DOM content loaded at ${new Date().toISOString()}, initializing player...`);
//   const initializationTimeout = setTimeout(() => {
//     console.error("Player initialization timed out after 10 seconds");
//   }, 10000);

//   const corsProxy = 'https://cors-anywhere.herokuapp.com/';
// const soundfontUrl = corsProxy + 'https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus';

//   mm.SoundFontPlayer.fromUrl(soundfontUrl)
//     .then((loadedPlayer) => {
//       clearTimeout(initializationTimeout);
//       player = loadedPlayer;
//       playerInitialized = true;
//       console.log(`Player initialized successfully at ${new Date().toISOString()}`);
//       if (pendingInstrumentChange !== null) {
//         console.log("Executing pending instrument change");
//         changeInstrument(pendingInstrumentChange);
//         pendingInstrumentChange = null;
//       }
//     })
//     .catch((error) => {
//       clearTimeout(initializationTimeout);
//       console.error("Error initializing player:", error);
//     });

//     console.log("Magenta Music library version:", mm.version);

//   fetch("soundfonts.json")
//     .then((response) => response.json())
//     .then((data) => {
//       window.soundfonts = data.soundfonts;
//       console.log("Soundfonts loaded");
//     })
//     .catch((error) => console.error("Error fetching soundfonts:", error));
// });

// function changeMidi(playerId, visualizerId, newSrc) {
//   const playerElement = document.getElementById(playerId);
//   const visualizer = document.getElementById(visualizerId);
//   playerElement.src = newSrc;
//   visualizer.src = newSrc;
// }

// function changeInstrument(instrumentNumber) {
//   console.log(`Attempting to change instrument to ${instrumentNumber}`);
//   if (!playerInitialized) {
//     console.log("Player is not yet initialized. Queueing instrument change.");
//     pendingInstrumentChange = instrumentNumber;
//     return;
//   }

//   console.log("Player is initialized, proceeding with instrument change");
//   player.loadSamples(instrumentNumber)
//     .then(() => {
//       console.log(`Loaded instrument: ${instrumentNumber}`);
//       player.stop(); // Stop any currently playing notes
//       player.playNoteDown(instrumentNumber, 60); // Play C4 as a test
//       setTimeout(() => player.playNoteUp(instrumentNumber, 60), 1000);
     
//       // Update the midi-player soundfont property
//       const midiPlayer = document.getElementById('midiPlayer1');
//       if (midiPlayer) {
//         midiPlayer.src = selectedDataset.midi_path;
//         midiPlayer.soundFont = `https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus/${instrumentNumber}`;
//       } else {
//         console.warn("MIDI player element not found");
//       }
//     })
//     .catch(error => {
//       console.error("Error loading samples:", error);
//       console.error("Player state:", player);
//     });
// }


// function triggerPendingInstrumentChange() {
//   if (playerInitialized && pendingInstrumentChange !== null) {
//     console.log("Manually triggering pending instrument change");
//     changeInstrument(pendingInstrumentChange);
//     pendingInstrumentChange = null;
//   } else {
//     console.log("No pending instrument change or player not initialized");
//   }
// }
// // Function to check if player is initialized
// function isPlayerReady() {
//   console.log(`Player initialization status: ${playerInitialized}`);
//   return playerInitialized;
// }