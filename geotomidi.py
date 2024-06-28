import arcpy
import os
import pandas as pd
import geopandas as gpd
from midiutil.MidiFile import MIDIFile

def createMidi(df, features_name):
    filename = f"C:\\python\\scripts\\midi2play\\tracks\\{features_name}.mid"
    mf = MIDIFile(1)  # 1 track
    track = 0
    channel = 0
    
    # Set tempo (120 BPM for a standard tempo)
    tempo = 120
    mf.addTempo(track, 0, tempo)
    
    # Set time signature to 4/4
    mf.addTimeSignature(track, 0, 4, 2, 24)
    
    # Calculate duration for each quarter note (in beats)
    quarter_note_duration = 1/3  # 1/3 beat for a quarter note to fit 48 notes in 16 beats
    
    # Loop through each column (1 to 48)
    for col in range(1, 49):
        # Find the row with the current column value
        row = df[df['col'] == col]
        
        if not row.empty:
            note = row['Note'].values[0]  # Get the note value
            
            # Calculate time based on the column number (adjust for 0-based index)
            note_time = (col - 1) * quarter_note_duration
            
            # Add note
            mf.addNote(track, channel, note, note_time, quarter_note_duration, volume=100)
            print(f"Note added at time: {note_time:.2f}")

    with open(filename, "wb") as outf:
        mf.writeFile(outf)
    print(f"MIDI file created at {filename}")

def geo2midi2(input_layer):
    features = gpd.read_file(input_layer)
    bounds = features.total_bounds
    min_x, min_y, max_x, max_y = bounds
    x_range = max_x - min_x
    y_range = max_y - min_y
    x_step = x_range / 48
    y_step = y_range / 24
    print(f"{x_step}, {y_step}")
    features['normalized_x'] = features.geometry.x - min_x
    features['normalized_y'] = features.geometry.y - min_y
    # Calculate column and row values
    features['col'] = (features['normalized_x'] / x_step).astype(int) + 1
    features['row'] = (features['normalized_y'] / y_step).astype(int) + 1
    for idx, feature in features.iterrows():
        print(f"Point at {feature.geometry.x:.2f} assigned value {feature['col']}")
    duplicate_rows = features.duplicated(subset=['row','col'], keep = 'first')
    features = features[~duplicate_rows]
    features["Note"] = features["row"].astype(int) + 63
    print("Processing complete")
   
    features_name = input_layer.split("\\")[-1][:-4]
    createMidi(features, features_name)

input_layer = r"C:\python\shapefiles\AirportsMetadata.shp"
geo2midi2(input_layer)

################################################################################################################################################s
filename = r"C:\python\scripts\midiplay\out_midi3.mid"

createMidi(midi_dataframe, filename)







geo2midi2(input_layer)

arcpy.env.overwriteOutput = True
out_geodb = r"C:\Users\ianm\Desktop\Projects\Scratch\Scratch.gdb"
arcpy.env.workspace = out_geodb

# Specify the path to your layer file
layer_file = r"C:\Users\ianm\Desktop\Projects\Scratch\Scratch.gdb\USAMajorCities"

midi_dataframe = []



def geo2midi(workspace, layer_file):
    arcpy.env.overwriteOutput = True
    arcpy.env.workspace = workspace
    # Describe the layer
    desc = arcpy.Describe(layer_file)

    # Get the extent of the layer
    extent = desc.extent

    sr = desc.spatialReference

    # Print the extent
    print("Extent of the layer:")
    print(
        "XMin: {0}, YMin: {1}, XMax: {2}, YMax: {3}".format(
            extent.XMin, extent.YMin, extent.XMax, extent.YMax
        )
    )

    x_range = extent.XMax - extent.XMin
    y_range = extent.YMax - extent.YMin
    x_step = x_range / 16
    y_step = y_range / 12

    print(f"X range:{x_range} X step {x_step} Y range {y_range} Y step {y_step}")

    x_list = []
    y_list = []

    mult = 0

    for _ in range(16):
        current_x = extent.XMin + (mult * x_step)
        x_list.append(current_x)
        mult += 1

    mult = 0

    for _ in range(12):
        current_y = extent.YMin + (mult * y_step)
        y_list.append(current_y)
        mult += 1

    out_feature = "midi_out"

    output_fc = os.path.join(out_geodb, out_feature)
    arcpy.CreateFeatureclass_management(
        out_geodb, out_feature, geometry_type="POLYGON", spatial_reference=sr
    )

    # Start an edit session
    edit = arcpy.da.Editor(out_geodb)
    edit.startEditing(False, True)
    edit.startOperation()

    # Create features
    with arcpy.da.InsertCursor(output_fc, ["SHAPE@"]) as cursor:
        for x in x_list:
            for y in y_list:
                square = arcpy.Polygon(
                    arcpy.Array(
                        [
                            arcpy.Point(x, y),
                            arcpy.Point(x + x_step, y),
                            arcpy.Point(x + x_step, y + y_step),
                            arcpy.Point(x, y + y_step),
                        ]
                    )
                )
                cursor.insertRow([square])

    edit.stopOperation()
    edit.stopEditing(True)

    print("Created midi_out file, joining features...")

    arcpy.SpatialJoin_analysis(
        out_feature, layer_file, os.path.join(out_geodb, "midi_join")
    )

    arcpy.management.CalculateField(
        in_table="midi_join",
        field="Row",
        expression="rowfunc(!TARGET_FID!)",
        expression_type="PYTHON3",
        code_block="""def rowfunc(field):
        if field % 12 == 0:
            return 12
        else:
            return field % 12""",
        field_type="TEXT",
        enforce_domains="NO_ENFORCE_DOMAINS",
    )

    arcpy.management.CalculateField(
        in_table="midi_join",
        field="Col",
        expression="colfunc(!TARGET_FID!)",
        expression_type="PYTHON3",
        code_block="""def colfunc(field):
        if field % 12 == 0:
            return field / 12
        else:
            return math.floor(field / 12) + 1""",
        field_type="TEXT",
        enforce_domains="NO_ENFORCE_DOMAINS",
    )

    print("Features joined and note data created.")

    midi_gdf = gpd.read_file(workspace, driver="FileGDB", layer="midi_join")
    midi_gdf = midi_gdf[midi_gdf["Join_Count"] != 0]

    desired_columns = ["Join_Count", "Row", "Col"]
    return midi_gdf[desired_columns]


midi_dataframe = geo2midi(out_geodb, layer_file)
print(midi_dataframe)

midi_dataframe = midi_dataframe[midi_dataframe["Join_Count"] != 0]

print(midi_dataframe)

max_attack = int(midi_dataframe["Join_Count"].max())
print(max_attack)

midi_dataframe["Attack"] = ((midi_dataframe["Join_Count"] // max_attack) * 64) + 64
print(midi_dataframe["Attack"].mean())

print(midi_dataframe["Row"].dtypes)

midi_dataframe["Note"] = midi_dataframe["Row"].astype(int) + 63
print(midi_dataframe["Note"])

print(midi_dataframe)

from midiutil.MidiFile import MIDIFile


def createMidi(df, filename):
    mf = MIDIFile(1)
    # Set the tempo (optional, adjust as needed)
    mf.addTempo(0, 0, 120)  # Tempo of 120bpm

    # Track for notes
    track = 0
    # Define time resolution (in ticks per beat)
    tempo = 120
    time_resolution = 480

    seconds_per_beat = 60 / tempo

    # Desired song length in seconds
    song_length = 4

    # Total number of ticks for the song
    total_ticks = int(song_length * time_resolution / seconds_per_beat)

    # Ticks per column (assuming 4 beats and 16 columns)
    ticks_per_column = int(total_ticks / 16)

    # Loop through each row in the dataframe
    for index, row in df.iterrows():
        # Calculate time offset based on position (Col)
        # Calculate time offset based on ticks per column
        time_offset = int(row["Col"])
        mf.addNote(track, 0, row["Note"], time_offset, 1, int(row["Attack"]))
        print(f"note added at {time_offset}")

    with open(filename, "wb") as outf:
        mf.writeFile(outf)
    print("midi file created")


filename = r"C:\python\scripts\midiplay\out_midi3.mid"

createMidi(midi_dataframe, filename)

####Work in progress below// sample code


from midiutil.MIDIFile import MIDIFile


def create_midi_from_dataframe(filepath, dataframe, tempo=120):
    """
    Creates a MIDI file based on data in a DataFrame.

    Args:
      filepath: The filepath to save the MIDI file.
      dataframe: A pandas DataFrame with columns for note, timing_tick, and attack_velocity.
      tempo: The tempo of the MIDI file in beats per minute (defaults to 120).
    """
    # Create a new MIDI file
    midi_file = MIDIFile(1)  # One track

    # Set the track information
    track = midi_file.tracks[0]
    track.append(midiutil.MetaMessage("set_tempo", data=[tempo >> 8, tempo & 0xFF]))

    # Iterate through each row in the DataFrame
    for index, row in dataframe.iterrows():
        note = int(row["note"])
        timing_tick = int(row["timing_tick"])
        attack_velocity = int(row["attack_velocity"])

        # Create note on message
        track.append(
            midiutil.NoteOnEvent(
                tick=timing_tick, channel=0, data=[note, attack_velocity]
            )
        )
        # Add corresponding note off message based on desired note duration (replace with your logic)
        track.append(
            midiutil.NoteOffEvent(tick=120, channel=0, data=[note, attack_velocity])
        )  # Placeholder for 1 quarter note

    # Save the MIDI file
    with open(filepath, "wb") as outf:
        midi_file.save(outf)


# Example usage: Assuming your DataFrame is called 'data'
data = {
    "note": [60, 62, 64, 65, 67],
    "timing_tick": [0, 60, 120, 180, 240],
    "attack_velocity": [64, 72, 80, 72, 64],
}
create_midi_from_dataframe("output.midi", data, tempo=120)
print("MIDI file created successfully!")


import arcpy
from mido import MidiFile, MidiTrack

joined_fc = os.path.join(out_geodb, "midi_join")
note_list = []

# Loop through each feature in the joined feature class
with arcpy.da.SearchCursor(joined_fc, ["SHAPE@", "Join_Count", "YMin"]) as cursor:
    for row in cursor:
        # Extract data from each row
        geometry = row[0]  # Polygon geometry
        join_count = row[1]  # Join count (attack velocity)
        y_min = row[2]  # Minimum y-coordinate (represents pitch)

        # Convert y-coordinate to MIDI note number (E2 is note 64)
        midi_note = int(y_min) + 64 - 1  # Subtract 1 to account for zero-based indexing

        # Append data to note list as a tuple (note, velocity)
        note_list.append((midi_note, join_count))

# Sort the note list by MIDI note number (ascending pitch)
note_list.sort(key=lambda x: x[0])

# Create a new MIDI file object
mid = MidiFile()

# Create a new track for notes
track = MidiTrack()
mid.tracks.append(track)

# Define the tempo (optional, adjust as needed)
track.append(
    mido.MetaMessage("set_tempo", tempo=500000)
)  # Tempo in microseconds per quarter note

# Loop through each note in the sorted list
for note, velocity in note_list:
    # Create note on and off events with appropriate durations (adjust durations as needed)
    track.append(
        mido.Message("note_on", note=note, velocity=velocity, time=250000)
    )  # Quarter note duration
    track.append(
        mido.Message("note_off", note=note, velocity=velocity, time=250000)
    )  # Quarter note duration

# Set the track name (optional)
track.append(mido.MetaMessage("track_name", name="Grid Notes"))

# Save the MIDI file
mid.save("grid_music.mid")

print("MIDI file created successfully!")
