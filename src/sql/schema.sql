-- drops (idempotente)
DROP TABLE IF EXISTS stop_times;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS shapes;
DROP TABLE IF EXISTS routes;
DROP TABLE IF EXISTS stops;

-- GTFS mínimo
CREATE TABLE stops (
  stop_id TEXT PRIMARY KEY,
  stop_name TEXT,
  stop_lat DOUBLE PRECISION,
  stop_lon DOUBLE PRECISION,
  zone_id TEXT
);

CREATE TABLE routes (
  route_id TEXT PRIMARY KEY,
  agency_id TEXT,
  route_short_name TEXT,
  route_long_name TEXT,
  route_type INT
);

CREATE TABLE trips (
  trip_id TEXT PRIMARY KEY,
  route_id TEXT REFERENCES routes(route_id),
  service_id TEXT,
  shape_id TEXT
);

CREATE TABLE stop_times (
  trip_id TEXT REFERENCES trips(trip_id),
  arrival_time TEXT,
  departure_time TEXT,
  stop_id TEXT REFERENCES stops(stop_id),
  stop_sequence INT,
  PRIMARY KEY (trip_id, stop_sequence)
);

CREATE TABLE shapes (
  shape_id TEXT,
  shape_pt_lat DOUBLE PRECISION,
  shape_pt_lon DOUBLE PRECISION,
  shape_pt_sequence INT,
  PRIMARY KEY (shape_id, shape_pt_sequence)
);

CREATE INDEX idx_stops_name ON stops USING GIN (to_tsvector('simple', stop_name));
CREATE INDEX idx_stop_times_stop ON stop_times (stop_id);
CREATE INDEX idx_stop_times_tripseq ON stop_times (trip_id, stop_sequence);
CREATE INDEX idx_trips_route ON trips (route_id);
CREATE INDEX idx_shapes_idseq ON shapes (shape_id, shape_pt_sequence);
