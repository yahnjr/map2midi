const mapboxAccessToken =
  "pk.eyJ1IjoiaWZvcm1haGVyIiwiYSI6ImNsaHBjcnAwNDF0OGkzbnBzZmUxM2Q2bXgifQ.fIyIgSwq1WWVk9CKlXRXiQ"; // Replace with your Mapbox token
mapboxgl.accessToken = mapboxAccessToken;
const map1 = new mapboxgl.Map({
  container: "map1",
  style: "mapbox://styles/mapbox/satellite-streets-v11",
  center: [0, 0], // Initial center
  zoom: 2, // Initial zoom
});

console.log("Map initialized");

function changeMidi(playerId, visualizerId, newSrc) {
  console.log("changeMidi called with", playerId, visualizerId, newSrc);
  const player = document.getElementById(playerId);
  const visualizer = document.getElementById(visualizerId);
  player.src = newSrc;
  visualizer.src = newSrc;
}

function changeSoundfont(playerId, soundfontName) {
  console.log("changeSoundfont called with", playerId, soundfontName);
  const soundfontUrl = window.soundfonts[soundfontName];
  if (!soundfontUrl) {
    console.error("Soundfont URL not found for:", soundfontName);
    return;
  }
  const player = document.getElementById(playerId);
  player.stop();
  player.soundFont = soundfontUrl;
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");
  const datasetSelector = document.getElementById("datasetSelect");
  const datasets = {
    RTAStops: new dataset(
      "https://yahnjr.github.io/map2midi/docs/RTAStops.geojson",
      "tracks/RTAStops.mid",
      "#9a17f1"
    ),
    Walls: new dataset(
      "https://yahnjr.github.io/map2midi/docs/Walls.geojson",
      "tracks/Walls.mid",
      "#a45c05"
    ),
    Copper: new dataset(
      "https://yahnjr.github.io/map2midi/docs/Copper.geojson",
      "tracks/Copper.mid",
      "#f88a2e"
    ),
    AirportsMetadata: new dataset(
      "https://yahnjr.github.io/map2midi/docs/AirportsMetadata.geojson",
      "tracks/AirportsMetadata.mid",
      "#74fffd"
    ),
    Enriched_USA_Major_Cities: new dataset(
      "https://yahnjr.github.io/map2midi/docs/Enriched_USA_Major_Cities.geojson",
      "tracks/Enriched_USA_Major_Cities.mid",
      "#f5f526"
    ),
    himalayas: new dataset(
      "https://yahnjr.github.io/map2midi/docs/himalayas.geojson",
      "tracks/himalayas.mid",
      "#6ccbfb"
    ),
    lemurs: new dataset(
      "https://yahnjr.github.io/map2midi/docs/lemurs.geojson",
      "tracks/lemurs.mid",
      "#ef1b1b"
    ),
    rio_graffiti: new dataset(
      "https://yahnjr.github.io/map2midi/docs/rio_graffiti.geojson",
      "tracks/rio_graffiti.mid",
      "#baf741"
    ),
    Hurricanes: new dataset(
      "https://yahnjr.github.io/map2midi/docs/Hurricanes.geojson",
      "tracks/Hurricanes.mid",
      "#999999"
    ),
  };

  datasetSelector.addEventListener("click", async (event) => {
    const progressBar = document.getElementById("progress-bar");
    const progressBarFill = document.createElement("div");
    progressBarFill.id = "progress-bar-fill";
    progressBar.appendChild(progressBarFill);

    if (event.target.classList.contains("playlist-item")) {
      const selectedDatasetKey = event.target.getAttribute("data-value");
      const selectedDataset = datasets[selectedDatasetKey];
      console.log("Dataset selected:", selectedDatasetKey);

      document
        .querySelectorAll(".playlist-item")
        .forEach((item) => item.classList.remove("selected"));
      event.target.classList.add("selected");

      if (selectedDataset) {
        console.log("Loading dataset:", selectedDataset);
        // Wait for the dataset to fully load
        const checkLoaded = setInterval(() => {
          if (selectedDataset.loaded) {
            clearInterval(checkLoaded);

            // Update Mapbox map
            if (selectedDataset.center && selectedDataset.zoom) {
              map1.flyTo({
                center: selectedDataset.center,
                zoom: selectedDataset.zoom,
              });
            }

            // Remove existing GeoJSON layer if it exists
            if (map1.getSource("geojson-layer")) {
              map1.removeLayer("geojson-layer");
              map1.removeSource("geojson-layer");
            }

            // Add new GeoJSON layer
            map1.addSource("geojson-layer", {
              type: "geojson",
              data: selectedDataset.path,
            });

            map1.addLayer({
              id: "geojson-layer",
              type: "circle",
              source: "geojson-layer",
              paint: {
                "circle-radius": 4,
                "circle-color": selectedDataset.color,
              },
            });

            // Update MIDI player
            const midiPlayer = document.getElementById("playButton");
            if (midiPlayer) {
              midiPlayer.dataset.midiPath = selectedDataset.midi_path;
              console.log("MIDI path set to:", selectedDataset.midi_path);
            }
          }
        }, 100); // Check every 100ms if the dataset is loaded
      } else {
        console.log("Dataset not found");
      }
    }
  });

  let synth;
  let context;
  let isPlaying = false;

  async function playSong() {
    console.log("playSong called");
    const datasetSelect = document.getElementById("datasetSelect");
    const soundFontSelect = document.getElementById("soundFontSelect");
    const selectedDatasetKey = datasetSelect
      .querySelector(".selected")
      .getAttribute("data-value");
    const selectedDataset = datasets[selectedDatasetKey];
    const midiUrl = selectedDataset.midi_path;
    const soundFontUrl = soundFontSelect.value;

    console.log("Fetching MIDI from", midiUrl);
    const midi = await fetch(midiUrl).then((response) =>
      response.arrayBuffer()
    );
    console.log("Fetching SoundFont from", soundFontUrl);
    const sfontBuffer = await fetch(soundFontUrl).then((response) =>
      response.arrayBuffer()
    );

    await JSSynth.waitForReady();
    loadSynthesizer(midi, sfontBuffer);
  }

  async function loadSynthesizer(midi, sfontBuffer) {
    console.log("loadSynthesizer called");
    context = new AudioContext();
    synth = new JSSynth.Synthesizer();
    synth.init(context.sampleRate);

    const node = synth.createAudioNode(context, 8192);
    node.connect(context.destination);

    try {
      await synth.loadSFont(sfontBuffer);
      await synth.addSMFDataToPlayer(midi);
      await synth.playPlayer();
      await synth.waitForPlayerStopped();
    } catch (err) {
      console.log("Failed:", err);
    }
  }

  function stopSong() {
    console.log("stopSong called");
    if (synth) {
      if (synth.stopPlayer) {
        synth.stopPlayer();
      }
      synth.close();
      context.close();
      synth = null;
      context = null;
      isPlaying = false;
    }
  }

  const playButton = document.getElementById("playButton");
  if (playButton) {
    console.log("playButton found");
    playButton.addEventListener("click", playSong);
  } else {
    console.error("playButton not found");
  }

  const stopButton = document.getElementById("stopButton");
  if (stopButton) {
    console.log("stopButton found");
    stopButton.addEventListener("click", stopSong);
  } else {
    console.error("stopButton not found");
  }
});

let progressInterval;
let progressWidth = 0;

function startProgress() {
    if (progressInterval) {
        clearInterval(progressInterval);
    }
    progressWidth = 0;
    const progressBarFill = document.getElementById('progress-bar-fill');
    progressBarFill.style.width = '0%';
    
    progressInterval = setInterval(() => {
        progressWidth += 100 / 48;
        progressBarFill.style.width = `${progressWidth}%`;
        
        if (progressWidth >= 100) {
            clearInterval(progressInterval);
            // Add any additional logic for when the progress completes
        }
    }, 167); // 8000ms / 48 ≈ 167ms
}

function stopProgress() {
    if (progressInterval) {
        clearInterval(progressInterval);
    }
    const progressBarFill = document.getElementById('progress-bar-fill');
    progressBarFill.style.width = '0%';
    progressWidth = 0;
}

document.getElementById('playButton').addEventListener('click', () => {
    startProgress();
    // Your existing play logic here
});

document.getElementById('stopButton').addEventListener('click', () => {
    stopProgress();
    // Your existing stop logic here
});