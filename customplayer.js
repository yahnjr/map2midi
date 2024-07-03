let player;
let sequence;
const playButton = document.getElementById('playButton');
const instrumentSelect = document.getElementById('instrumentSelect');

// Set your static MIDI file path here
const STATIC_MIDI_PATH = 'tracks/Copper.mid';

// Initialize the player
async function initPlayer() {
    player = new mm.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus');
    await player.loadSamples({ programNumbers: [0, 24, 56] });
}

// Load MIDI file
async function loadMidiFile() {
    try {
        const midi = await mm.urlToNoteSequence(STATIC_MIDI_PATH);
        sequence = midi;
        console.log('MIDI file loaded successfully');
    } catch (error) {
        console.error('Error loading MIDI file:', error);
    }
}

// Play/Pause function
function togglePlayPause() {
    if (player.isPlaying()) {
        player.stop();
        playButton.textContent = 'Play';
    } else {
        if (sequence) {
            player.start(sequence).then(() => {
                playButton.textContent = 'Play';
            });
            playButton.textContent = 'Pause';
        } else {
            console.error('No MIDI sequence loaded');
        }
    }
}

// Change instrument
function changeInstrument() {
    const instrumentNumber = parseInt(instrumentSelect.value);
    player.programChange(0, instrumentNumber); // Change instrument on channel 0
}

// Event listeners
playButton.addEventListener('click', togglePlayPause);
instrumentSelect.addEventListener('change', changeInstrument);

// Initialize everything
async function init() {
    await initPlayer();
    await loadMidiFile();
    console.log('Player initialized and MIDI file loaded');
}

// Wait for the page to load before initializing
window.addEventListener('load', init);