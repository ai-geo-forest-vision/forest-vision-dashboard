import sqlite3
import json
import mercantile
from pathlib import Path
import sys
from tqdm import tqdm
import mapbox_vector_tile
import gzip
import io
import os

def is_valid_sqlite_db(file_path):
    """Check if the file is a valid SQLite database"""
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} does not exist")
        return False
        
    # Check file size
    size = os.path.getsize(file_path)
    if size == 0:
        print(f"Error: File {file_path} is empty (0 bytes)")
        return False
        
    print(f"File size: {size / (1024*1024):.2f} MB")
    
    # Check SQLite header
    try:
        with open(file_path, 'rb') as f:
            header = f.read(16)
            if header[:15] != b'SQLite format 3':
                print(f"Error: File {file_path} is not a valid SQLite database (invalid header)")
                print(f"Header: {header}")
                return False
    except Exception as e:
        print(f"Error reading file header: {e}")
        return False
    
    # Try to open and read schema
    try:
        conn = sqlite3.connect(file_path)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        if not tables:
            print("Warning: Database contains no tables")
        conn.close()
        return True
    except sqlite3.Error as e:
        print(f"SQLite error: {e}")
        return False
    except Exception as e:
        print(f"Unexpected error while checking database: {e}")
        return False

def inspect_database(conn):
    """Inspect the SQLite database structure"""
    cursor = conn.cursor()
    
    try:
        # Get all tables, views, and indexes
        cursor.execute("""
            SELECT name, type 
            FROM sqlite_master 
            WHERE type IN ('table', 'view', 'index')
            ORDER BY type, name;
        """)
        objects = cursor.fetchall()
        
        if not objects:
            print("\nDatabase is empty (no tables, views, or indexes found)")
            return
            
        print("\nDatabase objects:")
        for name, type_ in objects:
            print(f"  {type_}: {name}")
        
        # For each table, get its structure
        tables = [name for name, type_ in objects if type_ == 'table']
        for table in tables:
            print(f"\nTable '{table}' structure:")
            cursor.execute(f"PRAGMA table_info({table})")
            columns = cursor.fetchall()
            for col in columns:
                print(f"  {col[1]} ({col[2]})")
            
            # Show row count
            try:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                print(f"  Row count: {count}")
                
                # Show first row as sample if table is not empty
                if count > 0:
                    cursor.execute(f"SELECT * FROM {table} LIMIT 1")
                    sample = cursor.fetchone()
                    print(f"  Sample row: {sample}")
            except sqlite3.Error as e:
                print(f"  Error getting table info: {e}")
                
    except sqlite3.Error as e:
        print(f"Error inspecting database: {e}")

def decode_tile_data(tile_data):
    """Decode MVT tile data and return GeoJSON features"""
    if not tile_data:
        return []
    
    # Try to decompress if gzipped
    try:
        with gzip.GzipFile(fileobj=io.BytesIO(tile_data)) as gz:
            tile_data = gz.read()
    except:
        pass  # Data wasn't gzipped
    
    try:
        tile = mapbox_vector_tile.decode(tile_data)
    except Exception as e:
        print(f"Failed to decode tile data: {e}")
        return []
    
    features = []
    for layer_name, layer in tile.items():
        for feature in layer['features']:
            # Convert MVT geometry to GeoJSON
            geometry = feature.get('geometry', {})
            properties = feature.get('properties', {})
            properties['layer'] = layer_name
            
            features.append({
                "type": "Feature",
                "geometry": geometry,
                "properties": properties
            })
    
    return features

def extract_features_from_mbtiles(mbtiles_path, zoom_level=14, bounds=None, layer_filter=None):
    """
    Extract features from MBTiles file at a specific zoom level.
    bounds: tuple of (min_lon, min_lat, max_lon, max_lat) if you want to limit the area
    layer_filter: list of layer names to extract (e.g., ['building', 'road'])
    """
    conn = sqlite3.connect(mbtiles_path)
    
    # First, inspect the database structure
    inspect_database(conn)
    
    cursor = conn.cursor()
    
    # Try to find the main tiles table
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%tile%';")
    tile_tables = cursor.fetchall()
    
    if not tile_tables:
        print("Error: No tile-related tables found in the database")
        return None
    
    tile_table = tile_tables[0][0]
    print(f"\nUsing tile table: {tile_table}")
    
    # Get table structure
    cursor.execute(f"PRAGMA table_info({tile_table})")
    columns = [col[1] for col in cursor.fetchall()]
    print(f"Table columns: {columns}")
    
    # Try to identify zoom level, tile coordinates and data columns
    zoom_col = next((col for col in columns if 'zoom' in col.lower()), None)
    tile_col = next((col for col in columns if 'column' in col.lower() or 'x' in col.lower()), None)
    tile_row = next((col for col in columns if 'row' in col.lower() or 'y' in col.lower()), None)
    data_col = next((col for col in columns if 'data' in col.lower() or 'blob' in col.lower()), None)
    
    if not all([zoom_col, tile_col, tile_row, data_col]):
        print(f"Error: Could not identify required columns in {tile_table}")
        print(f"Looking for: zoom level, tile column/x, tile row/y, and tile data columns")
        return None
    
    # Build the query based on bounds
    query = f'SELECT {tile_col}, {tile_row}, {data_col} FROM {tile_table} WHERE {zoom_col} = ?'
    params = [zoom_level]
    
    if bounds:
        min_tile = mercantile.tile(bounds[0], bounds[1], zoom_level)
        max_tile = mercantile.tile(bounds[2], bounds[3], zoom_level)
        query += f' AND {tile_col} >= ? AND {tile_col} <= ? AND {tile_row} >= ? AND {tile_row} <= ?'
        params.extend([min_tile.x, max_tile.x, min_tile.y, max_tile.y])

    print(f"\nExecuting query: {query}")
    print(f"With parameters: {params}")
    
    cursor.execute(query, params)
    
    features = []
    for tile_column, tile_row, tile_data in tqdm(cursor.fetchall(), desc="Processing tiles"):
        # Decode MVT data
        tile_features = decode_tile_data(tile_data)
        
        # Filter layers if requested
        if layer_filter:
            tile_features = [f for f in tile_features if f['properties'].get('layer') in layer_filter]
        
        features.extend(tile_features)

    conn.close()

    return {
        "type": "FeatureCollection",
        "features": features
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extract_mbtiles.py <path_to_mbtiles> [zoom_level] [layer1,layer2,...]")
        sys.exit(1)

    mbtiles_path = sys.argv[1]
    
    # Validate the database file first
    if not is_valid_sqlite_db(mbtiles_path):
        print("Database validation failed. Please check if this is a valid MBTiles file.")
        sys.exit(1)
    
    zoom_level = int(sys.argv[2]) if len(sys.argv) > 2 else 14
    layer_filter = sys.argv[3].split(',') if len(sys.argv) > 3 else None

    # San Francisco bounds approximately
    sf_bounds = [-122.5, 37.7, -122.3, 37.9]
    
    print(f"Extracting features from {mbtiles_path}")
    print(f"Zoom level: {zoom_level}")
    print(f"Layer filter: {layer_filter}")
    print(f"Bounds: {sf_bounds}")
    
    geojson = extract_features_from_mbtiles(mbtiles_path, zoom_level, sf_bounds, layer_filter)
    
    if geojson:
        output_path = Path(mbtiles_path).with_suffix('.geojson')
        with open(output_path, 'w') as f:
            json.dump(geojson, f)
        print(f"\nExtracted {len(geojson['features'])} features")
        print(f"Exported GeoJSON to {output_path}")
    else:
        print("\nFailed to extract features from the MBTiles file")