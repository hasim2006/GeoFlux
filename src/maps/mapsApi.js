// mapsApi.js - Google Maps API & OpenStreetMap dynamic route, geocoding, and city preset engine

export const CITY_PRESETS = {
  paris: {
    name: "Paris",
    country: "France",
    landmark: "eiffel_tower",
    landmarkName: "Eiffel Tower",
    architecture: "haussmann",
    route: {
      streetStart: "Rue de Rivoli",
      streetTurn: "Rue Vivienne",
      passageName: "Galerie Vivienne",
      passageSub: "Historic Glass Arcade · 1823",
      streetExit: "Rue de Beaujolais",
      bikeStation: "Vélib’ – Palais-Royal",
      bikeSub: "Place Colette · 14 bikes available",
      cafeName: "Le Jardin Café",
      rooftopName: "Rooftop Rivoli",
      rooftopSub: "Cocktail lounge · Eiffel Tower view"
    },
    voiceLines: [
      "A bike around the corner.",
      "Shelter before the rain.",
      "A passage worth taking.",
      "Friends already there.",
      "And a rooftop just in time.",
      "Go like you live here. Paris."
    ]
  },
  delhi: {
    name: "New Delhi",
    country: "India",
    landmark: "india_gate",
    landmarkName: "India Gate",
    architecture: "modern",
    route: {
      streetStart: "Connaught Place Radial",
      streetTurn: "Janpath Road",
      passageName: "Palanquin Heritage Arcade",
      passageSub: "Lutyens Heritage Colonnade",
      streetExit: "Kasturba Gandhi Marg",
      bikeStation: "Yulu Miracle – Rajiv Chowk",
      bikeSub: "Inner Circle · 18 e-bikes available",
      cafeName: "United Coffee House",
      rooftopName: "The Imperial Rooftop",
      rooftopSub: "Panoramic terrace · India Gate view"
    },
    voiceLines: [
      "A bike around the circle.",
      "Shelter before the rain.",
      "A passage worth taking.",
      "Friends already there.",
      "And a rooftop just in time.",
      "Go like you live here. New Delhi."
    ]
  },
  newyork: {
    name: "New York",
    country: "USA",
    landmark: "empire_state",
    landmarkName: "Empire State Building",
    architecture: "modern",
    route: {
      streetStart: "7th Avenue & Broadway",
      streetTurn: "West 44th Street",
      passageName: "Shubert Alley Gallery",
      passageSub: "Historic Theater Arcade · Broadway",
      streetExit: "8th Avenue Boulevard",
      bikeStation: "Citi Bike – Times Square",
      bikeSub: "42nd St & Broadway · 24 bikes available",
      cafeName: "Joe Coffee Roasters",
      rooftopName: "Skyline Lounge Manhattan",
      rooftopSub: "Open terrace · Empire State view"
    },
    voiceLines: [
      "A bike on the avenue.",
      "Shelter before the rain.",
      "An alley worth taking.",
      "Friends already there.",
      "And a rooftop just in time.",
      "Go like you live here. New York."
    ]
  },
  tokyo: {
    name: "Tokyo",
    country: "Japan",
    landmark: "tokyo_tower",
    landmarkName: "Tokyo Tower",
    architecture: "modern",
    route: {
      streetStart: "Shibuya Crossing Avenue",
      streetTurn: "Cat Street Promenade",
      passageName: "Omotesando Hills Arcade",
      passageSub: "Light-filled architectural galleria",
      streetExit: "Meiji-dori Avenue",
      bikeStation: "Docomo Bike Share – Shibuya",
      bikeSub: "Station Square · 16 e-bikes available",
      cafeName: "Fuglen Tokyo",
      rooftopName: "Shibuya Sky Deck",
      rooftopSub: "360° Panorama · Tokyo Tower view"
    },
    voiceLines: [
      "A bike through the neon.",
      "Shelter before the rain.",
      "A passage worth taking.",
      "Friends already there.",
      "And a rooftop just in time.",
      "Go like you live here. Tokyo."
    ]
  },
  london: {
    name: "London",
    country: "United Kingdom",
    landmark: "big_ben",
    landmarkName: "Big Ben & Westminster",
    architecture: "haussmann",
    route: {
      streetStart: "Covent Garden Piazza",
      streetTurn: "The Strand",
      passageName: "Burlington Arcade",
      passageSub: "Historic Regency shopping arcade",
      streetExit: "Piccadilly",
      bikeStation: "Santander Cycles – Covent Garden",
      bikeSub: "Southampton St · 15 bikes available",
      cafeName: "Monmouth Coffee Co.",
      rooftopName: "Radio Rooftop London",
      rooftopSub: "Sunset lounge · Thames & Big Ben view"
    },
    voiceLines: [
      "A cycle round the corner.",
      "Shelter before the drizzle.",
      "An arcade worth taking.",
      "Friends already there.",
      "And a rooftop just in time.",
      "Go like you live here. London."
    ]
  },
  dubai: {
    name: "Dubai",
    country: "UAE",
    landmark: "burj_khalifa",
    landmarkName: "Burj Khalifa",
    architecture: "modern",
    route: {
      streetStart: "Sheikh Mohammed bin Rashid Blvd",
      streetTurn: "Burj Lake Promenade",
      passageName: "Souk Al Bahar Galleria",
      passageSub: "Arabesque waterfront arcade",
      streetExit: "Financial Center Road",
      bikeStation: "Careem BIKE – Downtown",
      bikeSub: "Opera District · 20 e-bikes available",
      cafeName: "Arabica Dubai Mall",
      rooftopName: "CÉ LA VI Sky Lounge",
      rooftopSub: "Infinity view · Burj Khalifa silhouette"
    },
    voiceLines: [
      "A bike on the boulevard.",
      "Cool breeze before sunset.",
      "A passage worth taking.",
      "Friends already there.",
      "And a rooftop just in time.",
      "Go like you live here. Dubai."
    ]
  }
};

export class MapsService {
  constructor() {
    this.apiKey = localStorage.getItem('google_maps_api_key') || '';
  }

  setApiKey(key) {
    this.apiKey = key.trim();
    if (this.apiKey) {
      localStorage.setItem('google_maps_api_key', this.apiKey);
    } else {
      localStorage.removeItem('google_maps_api_key');
    }
  }

  getApiKey() {
    return this.apiKey;
  }

  async geocodeLocation(query) {
    // 1. If Google Maps API key is configured, use Google Geocoding API
    if (this.apiKey) {
      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${this.apiKey}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === 'OK' && data.results.length > 0) {
          const loc = data.results[0].geometry.location;
          return {
            lat: loc.lat,
            lng: loc.lng,
            displayName: data.results[0].formatted_address
          };
        }
      } catch (e) {
        console.warn("Google Geocoding error, falling back to OSM", e);
      }
    }

    // 2. OpenStreetMap Nominatim Fallback (Free, zero setup)
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
      const res = await fetch(url, { headers: { 'User-Agent': 'GoogleMapsSpecAdGenerator/1.0' } });
      const data = await res.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          displayName: data[0].display_name
        };
      }
    } catch (e) {
      console.warn("Nominatim Geocoding error", e);
    }

    return null;
  }

  async fetchCustomRoute(originQuery, destinationQuery) {
    const origin = await this.geocodeLocation(originQuery);
    const dest = await this.geocodeLocation(destinationQuery);

    if (!origin || !dest) {
      throw new Error("Could not find location coordinates for origin or destination.");
    }

    // Try OSRM route service
    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson&steps=true`;
      const res = await fetch(osrmUrl);
      const data = await res.json();

      if (data.code === 'Ok' && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates; // [[lon, lat], ...]
        const steps = route.legs[0].steps.map(s => s.name).filter(Boolean);

        return {
          originName: origin.displayName.split(',')[0],
          destName: dest.displayName.split(',')[0],
          distanceMeters: route.distance,
          durationSec: route.duration,
          streetNames: steps.slice(0, 4),
          coordinates
        };
      }
    } catch (e) {
      console.warn("OSRM routing fallback failed", e);
    }

    return {
      originName: origin.displayName.split(',')[0],
      destName: dest.displayName.split(',')[0],
      distanceMeters: 2500,
      durationSec: 360,
      streetNames: [originQuery, "Central Boulevard", destinationQuery],
      coordinates: []
    };
  }
}

