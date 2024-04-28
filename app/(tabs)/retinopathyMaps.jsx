import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';

const API_KEY = 'AIzaSyBCadZ0puHhEgff60wx6aGk6VQYlVKFt_Q'; // Replace with your API key

export default function RetinopathyMaps() {
  const [pharmacyLocations, setPharmacyLocations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [mapRegion, setMapRegion] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMessage('Permission to access location was denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location.coords);

        // Fetch pharmacy locations from Google Places API
        const pharmacies = await fetchPharmacyLocations(
          location.coords.latitude,
          location.coords.longitude
        );
        setPharmacyLocations(pharmacies);

        setMapRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        setErrorMessage('Error getting location: ' + error.message);
      }
    }

    fetchData();
  }, []);

  const handleShowLiveLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);

      setMapRegion(prevRegion => ({
        ...prevRegion,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }));

      // Find nearest pharmacy
      const nearestPharmacy = await findNearestPharmacy(location.coords);

      // Fetch and display route to the nearest pharmacy
      if (nearestPharmacy) {
        await fetchRoute(location.coords, nearestPharmacy);
      } else {
        setErrorMessage('No pharmacies found.');
      }
    } catch (error) {
      setErrorMessage('Error getting live location: ' + error.message);
    }
  };

  const fetchPharmacyLocations = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=pharmacy&key=${API_KEY}`
      );
      const data = await response.json();

      const pharmacies = data.results.map(pharmacy => ({
        id: pharmacy.place_id,
        name: pharmacy.name,
        latitude: pharmacy.geometry.location.lat,
        longitude: pharmacy.geometry.location.lng,
      }));

      return pharmacies;
    } catch (error) {
      setErrorMessage('Error fetching pharmacy locations: ' + error.message);
      return [];
    }
  };

  const findNearestPharmacy = async (userLocation) => {
    let nearestPharmacy = null;
    let minDistance = Infinity;

    for (const pharmacy of pharmacyLocations) {
      const distance = await calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        pharmacy.latitude,
        pharmacy.longitude
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestPharmacy = pharmacy;
      }
    }

    return nearestPharmacy;
  };

  const calculateDistance = async (lat1, lon1, lat2, lon2) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${lat1},${lon1}&destinations=${lat2},${lon2}&key=${API_KEY}`
      );
      const data = await response.json();

      const distance = data.rows[0].elements[0].distance.value / 1000; // Distance in km
      return distance;
    } catch (error) {
      setErrorMessage('Error calculating distance: ' + error.message);
      return Infinity;
    }
  };

  const fetchRoute = async (origin, destination) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${API_KEY}`
      );
      const data = await response.json();

      if (data.routes.length > 0) {
        const route = data.routes[0].overview_polyline.points;
        const decodedRoute = decodePolyline(route);
        setRouteCoordinates(decodedRoute);
      } else {
        setErrorMessage('No route found.');
      }
    } catch (error) {
      setErrorMessage('Error fetching route: ' + error.message);
    }
  };

  const decodePolyline = (encoded) => {
    const len = encoded.length;
    let index = 0;
    const array = [];
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lat += dlat;
      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      array.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }

    return array;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pharmacy Map</Text>
      <MapView style={styles.map} initialRegion={mapRegion}>
        {pharmacyLocations.map(location => (
          <Marker
            key={location.id}
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title={location.name}
          />
        ))}
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Your Location"
            pinColor="blue"
          />
        )}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={4}
            strokeColor="red"
          />
        )}
      </MapView>
      <TouchableOpacity style={styles.button} onPress={handleShowLiveLocation}>
        <Text style={styles.buttonText}>Navigate to Nearest Pharmacy</Text>
      </TouchableOpacity>
      {errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  map: {
    width: '100%',
    height: '80%',
  },
  button: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});