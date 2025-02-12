"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Phone, Bell, Home } from "lucide-react";

const LocationTracker = () => {
  // State for location tracking
  const [currentLocation, setCurrentLocation] = useState(null);
  const [homeLocation, setHomeLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [isOutOfRange, setIsOutOfRange] = useState(false);
  const [safeRadius, setSafeRadius] = useState(100); // Default 100 meters
  const [emergencyContact, setEmergencyContact] = useState("");
  const [alertSent, setAlertSent] = useState(false);

  // Refs
  const sirenRef = useRef(null);
  const watchIdRef = useRef(null);

  // Memoized calculation function
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }, []);

  // Load home location on mount only
  useEffect(() => {
    const savedHome = localStorage.getItem("homeLocation");
    if (savedHome) {
      try {
        setHomeLocation(JSON.parse(savedHome));
      } catch (error) {
        console.error("Error parsing saved home location:", error);
        localStorage.removeItem("homeLocation");
      }
    }
  }, []);

  // Initialize audio on mount
  useEffect(() => {
    sirenRef.current = new Audio("/alert-siren.mp3");
    return () => {
      if (sirenRef.current) {
        sirenRef.current.pause();
        sirenRef.current = null;
      }
    };
  }, []);

  // Set current location as home location
  const setCurrentAsHome = useCallback(() => {
    if (currentLocation) {
      setHomeLocation(currentLocation);
      localStorage.setItem("homeLocation", JSON.stringify(currentLocation));
    }
  }, [currentLocation]);

  // Send SMS alert (Simulated)
  const sendSMSAlert = useCallback(async () => {
    if (!emergencyContact || alertSent || !currentLocation) return;

    try {
      const response = await fetch("/api/send-alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: emergencyContact,
          message: `ALERT: Your family member has wandered ${distance?.toFixed(
            0
          )} meters away from home. Current location: https://www.google.com/maps?q=${
            currentLocation.latitude
          },${currentLocation.longitude}`,
        }),
      });

      if (response.ok) {
        setAlertSent(true);
      }
    } catch (error) {
      console.error("Error sending SMS:", error);
    }
  }, [emergencyContact, alertSent, currentLocation, distance]);

  // Location tracking effect
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      console.error("Geolocation is not supported");
      return;
    }

    const handlePositionUpdate = (position) => {
      const newLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setCurrentLocation(newLocation);

      if (homeLocation) {
        const dist = calculateDistance(
          homeLocation.latitude,
          homeLocation.longitude,
          newLocation.latitude,
          newLocation.longitude
        );
        setDistance(dist);

        const outOfRange = dist > safeRadius;
        setIsOutOfRange(outOfRange);

        if (outOfRange) {
          sirenRef.current?.play();
          sendSMSAlert();
        } else {
          sirenRef.current?.pause();
          if (sirenRef.current) sirenRef.current.currentTime = 0;
          setAlertSent(false);
        }
      }
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      (error) => console.error("Error getting location:", error),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [homeLocation, safeRadius, calculateDistance, sendSMSAlert]);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Emergency Contact Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-6 h-6" />
            Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="tel"
            placeholder="Emergency contact number"
            value={emergencyContact}
            onChange={(e) => setEmergencyContact(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Safe radius (meters)"
            value={safeRadius}
            onChange={(e) => setSafeRadius(Number(e.target.value))}
            min="1"
            max="10000"
          />
        </CardContent>
      </Card>

      {/* Location Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-6 h-6" />
            Location Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentLocation && (
            <div className="space-y-2">
              <p>
                Current Location: {currentLocation.latitude.toFixed(6)},{" "}
                {currentLocation.longitude.toFixed(6)}
              </p>
              <Button onClick={setCurrentAsHome} className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Set as Home Location
              </Button>
            </div>
          )}

          {homeLocation && (
            <div className="space-y-2">
              <p>
                Home Location: {homeLocation.latitude.toFixed(6)},{" "}
                {homeLocation.longitude.toFixed(6)}
              </p>
              {distance && <p>Distance from home: {distance.toFixed(0)} meters</p>}
            </div>
          )}

          {isOutOfRange && (
            <Alert variant="destructive">
              <Bell className="w-4 h-4" />
              <AlertDescription>
                Person has wandered {distance?.toFixed(0)} meters away from home!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Map View */}
      {currentLocation && (
        <Card>
          <CardHeader>
            <CardTitle>Location Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-96 bg-slate-100 rounded-lg">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${currentLocation.latitude},${currentLocation.longitude}`}
                allowFullScreen
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LocationTracker;


// "use client";
// import React, { useState, useEffect, useRef } from "react";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { MapPin, Phone, Bell, Home } from "lucide-react";

// const LocationTracker = () => {
//   // State for location tracking
//   const [currentLocation, setCurrentLocation] = useState(null);
//   const [homeLocation, setHomeLocation] = useState(null);
//   const [distance, setDistance] = useState(null);
//   const [isOutOfRange, setIsOutOfRange] = useState(false);
//   const [safeRadius, setSafeRadius] = useState(100); // Default 100 meters
//   const [emergencyContact, setEmergencyContact] = useState("");
//   const [alertSent, setAlertSent] = useState(false);

//   // Ref for audio alert
//   const sirenRef = useRef(null);
//   const watchIdRef = useRef(null);

//   // Function to calculate distance using Haversine formula
//   const calculateDistance = (lat1, lon1, lat2, lon2) => {
//     const R = 6371e3; // Earth's radius in meters
//     const φ1 = (lat1 * Math.PI) / 180;
//     const φ2 = (lat2 * Math.PI) / 180;
//     const Δφ = ((lat2 - lat1) * Math.PI) / 180;
//     const Δλ = ((lon2 - lon1) * Math.PI) / 180;

//     const a =
//       Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
//       Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//     return R * c; // Distance in meters
//   };

//   // Set current location as home location
//   const setCurrentAsHome = () => {
//     if (currentLocation) {
//       setHomeLocation(currentLocation);
//       localStorage.setItem("homeLocation", JSON.stringify(currentLocation));
//     }
//   };

//   // Send SMS alert (Simulated)
//   const sendSMSAlert = async () => {
//     if (!emergencyContact || alertSent) return;

//     try {
//       const response = await fetch("/api/send-alert", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           to: emergencyContact,
//           message: `ALERT: Your family member has wandered ${distance.toFixed(
//             0
//           )} meters away from home. Current location: https://www.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`,
//         }),
//       });

//       if (response.ok) {
//         setAlertSent(true);
//       }
//     } catch (error) {
//       console.error("Error sending SMS:", error);
//     }
//   };

//   // Effect to track location
//   useEffect(() => {
//     const savedHome = localStorage.getItem("homeLocation");
//     if (savedHome) {
//       setHomeLocation(JSON.parse(savedHome));
//     }

//     sirenRef.current = new Audio("/alert-siren.mp3");

//     if ("geolocation" in navigator) {
//       watchIdRef.current = navigator.geolocation.watchPosition(
//         (position) => {
//           const newLocation = {
//             latitude: position.coords.latitude,
//             longitude: position.coords.longitude,
//           };
//           setCurrentLocation(newLocation);

//           if (homeLocation) {
//             const dist = calculateDistance(
//               homeLocation.latitude,
//               homeLocation.longitude,
//               newLocation.latitude,
//               newLocation.longitude
//             );
//             setDistance(dist);

//             const outOfRange = dist > safeRadius;
//             setIsOutOfRange(outOfRange);

//             if (outOfRange) {
//               sirenRef.current.play();
//               sendSMSAlert();
//             } else {
//               sirenRef.current.pause();
//               sirenRef.current.currentTime = 0;
//               setAlertSent(false);
//             }
//           }
//         },
//         (error) => {
//           console.error("Error getting location:", error);
//         },
//         { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
//       );
//     }

//     return () => {
//       if (watchIdRef.current) {
//         navigator.geolocation.clearWatch(watchIdRef.current);
//       }
//       sirenRef.current.pause();
//     };
//   }, [homeLocation, safeRadius]);

//   return (
//     <div className="max-w-4xl mx-auto p-4 space-y-6">
//       {/* Emergency Contact Setup */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Phone className="w-6 h-6" />
//             Emergency Contact
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <Input
//             type="tel"
//             placeholder="Emergency contact number"
//             value={emergencyContact}
//             onChange={(e) => setEmergencyContact(e.target.value)}
//           />
//           <Input
//             type="number"
//             placeholder="Safe radius (meters)"
//             value={safeRadius}
//             onChange={(e) => setSafeRadius(Number(e.target.value))}
//           />
//         </CardContent>
//       </Card>

//       {/* Location Status */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <MapPin className="w-6 h-6" />
//             Location Status
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {currentLocation && (
//             <div className="space-y-2">
//               <p>
//                 Current Location: {currentLocation.latitude.toFixed(6)},{" "}
//                 {currentLocation.longitude.toFixed(6)}
//               </p>
//               <Button onClick={setCurrentAsHome} className="flex items-center gap-2">
//                 <Home className="w-4 h-4" />
//                 Set as Home Location
//               </Button>
//             </div>
//           )}

//           {homeLocation && (
//             <div className="space-y-2">
//               <p>
//                 Home Location: {homeLocation.latitude.toFixed(6)},{" "}
//                 {homeLocation.longitude.toFixed(6)}
//               </p>
//               {distance && <p>Distance from home: {distance.toFixed(0)} meters</p>}
//             </div>
//           )}

//           {isOutOfRange && (
//             <Alert variant="destructive">
//               <Bell className="w-4 h-4" />
//               <AlertDescription>
//                 Person has wandered {distance?.toFixed(0)} meters away from home!
//               </AlertDescription>
//             </Alert>
//           )}
//         </CardContent>
//       </Card>

//       {/* Map View */}
//       {currentLocation && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Location Map</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="w-full h-96 bg-slate-100 rounded-lg">
//               <iframe
//                 width="100%"
//                 height="100%"
//                 frameBorder="0"
//                 style={{ border: 0 }}
//                 src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${currentLocation.latitude},${currentLocation.longitude}`}
//                 allowFullScreen
//               />
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// };

// export default LocationTracker;




// import React, { useState, useEffect, useRef } from 'react';
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { MapPin, Phone, Bell, Home } from 'lucide-react';

// // Custom marker icon (Leaflet default marker doesn't load properly in some cases)
// const customIcon = new L.Icon({
//   iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
// });

// const LocationTracker = () => {
//   const [currentLocation, setCurrentLocation] = useState(null);
//   const [homeLocation, setHomeLocation] = useState(null);
//   const [distance, setDistance] = useState(null);
//   const [isOutOfRange, setIsOutOfRange] = useState(false);
//   const [safeRadius, setSafeRadius] = useState(100);
//   const [emergencyContact, setEmergencyContact] = useState('');
//   const [alertSent, setAlertSent] = useState(false);

//   const sirenRef = useRef(new Audio('/alert-siren.mp3'));
//   const watchIdRef = useRef(null);

//   // Haversine formula to calculate distance
//   const calculateDistance = (lat1, lon1, lat2, lon2) => {
//     const R = 6371e3; // Earth's radius in meters
//     const φ1 = lat1 * Math.PI / 180;
//     const φ2 = lat2 * Math.PI / 180;
//     const Δφ = (lat2 - lat1) * Math.PI / 180;
//     const Δλ = (lon2 - lon1) * Math.PI / 180;

//     const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
//               Math.cos(φ1) * Math.cos(φ2) *
//               Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//     return R * c; // Distance in meters
//   };

//   // Set current location as home
//   const setCurrentAsHome = () => {
//     if (currentLocation) {
//       setHomeLocation(currentLocation);
//       localStorage.setItem('homeLocation', JSON.stringify(currentLocation));
//     }
//   };

//   // Track user's location
//   useEffect(() => {
//     const savedHome = localStorage.getItem('homeLocation');
//     if (savedHome) {
//       setHomeLocation(JSON.parse(savedHome));
//     }

//     if ("geolocation" in navigator) {
//       watchIdRef.current = navigator.geolocation.watchPosition(
//         (position) => {
//           const newLocation = {
//             latitude: position.coords.latitude,
//             longitude: position.coords.longitude,
//           };
//           setCurrentLocation(newLocation);

//           if (homeLocation) {
//             const dist = calculateDistance(
//               homeLocation.latitude,
//               homeLocation.longitude,
//               newLocation.latitude,
//               newLocation.longitude
//             );
//             setDistance(dist);

//             const outOfRange = dist > safeRadius;
//             setIsOutOfRange(outOfRange);

//             if (outOfRange) {
//               sirenRef.current.play();
//             } else {
//               sirenRef.current.pause();
//               sirenRef.current.currentTime = 0;
//               setAlertSent(false);
//             }
//           }
//         },
//         (error) => {
//           console.error('Error getting location:', error);
//         },
//         { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
//       );
//     }

//     return () => {
//       if (watchIdRef.current) {
//         navigator.geolocation.clearWatch(watchIdRef.current);
//       }
//       sirenRef.current.pause();
//     };
//   }, [homeLocation, safeRadius]);

//   return (
//     <div className="max-w-4xl mx-auto p-4 space-y-6">
//       {/* Emergency Contact */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Phone className="w-6 h-6" />
//             Emergency Contact
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <Input
//             type="tel"
//             placeholder="Emergency contact number"
//             value={emergencyContact}
//             onChange={(e) => setEmergencyContact(e.target.value)}
//           />
//           <Input
//             type="number"
//             placeholder="Safe radius (meters)"
//             value={safeRadius}
//             onChange={(e) => setSafeRadius(Number(e.target.value))}
//           />
//         </CardContent>
//       </Card>

//       {/* Location Status */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <MapPin className="w-6 h-6" />
//             Location Status
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {currentLocation && (
//             <div className="space-y-2">
//               <p>Current Location: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}</p>
//               <Button onClick={setCurrentAsHome} className="flex items-center gap-2">
//                 <Home className="w-4 h-4" />
//                 Set as Home Location
//               </Button>
//             </div>
//           )}
//           {homeLocation && (
//             <div className="space-y-2">
//               <p>Home Location: {homeLocation.latitude.toFixed(6)}, {homeLocation.longitude.toFixed(6)}</p>
//               {distance && <p>Distance from home: {distance.toFixed(0)} meters</p>}
//             </div>
//           )}
//           {isOutOfRange && (
//             <Alert variant="destructive">
//               <Bell className="w-4 h-4" />
//               <AlertDescription>
//                 Person has wandered {distance?.toFixed(0)} meters away from home!
//               </AlertDescription>
//             </Alert>
//           )}
//         </CardContent>
//       </Card>

//       {/* Map View with Leaflet */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Location Map</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="w-full h-96 rounded-lg overflow-hidden">
//             {currentLocation ? (
//               <MapContainer
//                 center={[currentLocation.latitude, currentLocation.longitude]}
//                 zoom={15}
//                 className="w-full h-full"
//               >
//                 <TileLayer
//                   url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                   attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//                 />
//                 <Marker position={[currentLocation.latitude, currentLocation.longitude]} icon={customIcon}>
//                   <Popup>Current Location</Popup>
//                 </Marker>
//               </MapContainer>
//             ) : (
//               <p className="text-center text-gray-500">Fetching location...</p>
//             )}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default LocationTracker;
