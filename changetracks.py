from mido import MidiFile, MidiTrack, Message

# Load the original MIDI file
original_midi = MidiFile(r"C:\python\scripts\midi2play\tracks\Copper.mid")

# Create a new track
new_track = MidiTrack()

# Map notes from track 0 to track 4 (adjust channel and instrument as needed)
for msg in original_midi.tracks[0]:
    if msg.type == 'note_on' or msg.type == 'note_off':
        new_msg = msg.copy(channel=4)  # Change channel to 4
        new_track.append(new_msg)

# Create a new MIDI file with the modified track
output_midi = MidiFile()
output_midi.tracks.append(new_track)
output_midi.save(r"C:\python\scripts\midi2play\tracks\Copper1.mid")
