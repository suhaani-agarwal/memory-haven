"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Phone, Bell, Home } from "lucide-react";
import { Save } from "lucide-react";



const LocationTracker = () => {
  // State for location tracking
  const [currentLocation, setCurrentLocation] = useState(null);
  const [homeLocation, setHomeLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [isOutOfRange, setIsOutOfRange] = useState(false);
  const [safeRadius, setSafeRadius] = useState(100); // Default 100 meters
  const [emergencyContact, setEmergencyContact] = useState("");
  const [alertSent, setAlertSent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  // Refs
  const sirenRef = useRef(null);
  const watchIdRef = useRef(null);


  useEffect(() => {
    const savedContact = localStorage.getItem("emergencyContact");
    if (savedContact) {
      setEmergencyContact(savedContact);
    }
  }, []);

  // Save emergency contact to localStorage
  const saveEmergencyContact = async () => {
    if (!emergencyContact) {
      alert("Please enter a valid phone number.");
      return;
    }

    setIsSaving(true);
    try {
      // Validate the phone number format (you can adjust the regex as needed)
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(emergencyContact)) {
        throw new Error("Please enter a valid phone number with country code.");
      }

      // Save to localStorage
      localStorage.setItem("emergencyContact", emergencyContact);
      localStorage.setItem("safeRadius", safeRadius.toString());

      // You might want to validate the number by sending a test SMS here
      // For now, we'll just show a success message
      alert("Emergency contact and safe radius saved successfully!");
    } catch (error) {
      alert(error.message || "Error saving emergency contact. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

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


  // const sendSMSAlert = async () => {
  //   if (!emergencyContact || alertSent || !currentLocation) return;
  
  //   try {
  //     const response = await fetch('/api/send-alert', {
  //       method: 'POST', // Ensure this is POST
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         to: emergencyContact,
  //         message: `ALERT: Your family member has wandered ${distance?.toFixed(
  //           0
  //         )} meters away from home. Current location: https://www.google.com/maps?q=${
  //           currentLocation.latitude
  //         },${currentLocation.longitude}`,
  //       }),
  //     });
  
  //     if (!response.ok) {
  //       throw new Error('Failed to send SMS alert.');
  //     }
  
  //     const data = await response.json();
  //     console.log('SMS alert sent:', data);
  //   } catch (error) {
  //     console.error('Error sending SMS:', error);
  //   }
  // };

  // const showPushNotification = () => {
  //   if (!homeLocation || !currentLocation) return;

  //   // Generate Google Maps directions link
  //   const directionsLink = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${homeLocation.latitude},${homeLocation.longitude}&travelmode=walking`;

  //   // Check if the browser supports notifications
  //   if (!("Notification" in window)) {
  //     alert("This browser does not support desktop notifications.");
  //     return;
  //   }

  //   // Request permission for notifications
  //   if (Notification.permission === "granted") {
  //     new Notification("Follow this map to reach your home!", {
  //       body: `Click here for directions: ${directionsLink}`,
  //     });
  //   } else if (Notification.permission !== "denied") {
  //     Notification.requestPermission().then((permission) => {
  //       if (permission === "granted") {
  //         new Notification("Follow this map to reach your home!", {
  //           body: `Click here for directions: ${directionsLink}`,
  //         });
  //       }
  //     });
  //   }
  // };


  const WebsiteNotification = ({ message, isVisible, onClose }) => {
    if (!isVisible) return null;
  
    return (
      <div className="fixed top-4 right-4 z-50 w-96 transform transition-all duration-500 ease-in-out">
        <Alert className="bg-red-100 border-red-400">
          <Bell className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {message}
          </AlertDescription>
          <button 
            onClick={onClose}
            className="absolute top-2 right-2 text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </Alert>
      </div>
    );
  };


  const showPushNotification = async () => {
    console.log("Attempting to show push notification");
    
    if (!homeLocation || !currentLocation) {
      console.log("Missing location data for notification");
      return;
    }
  
    // Generate Google Maps directions link
    const directionsLink = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${homeLocation.latitude},${homeLocation.longitude}&travelmode=walking`;
    
    try {
      // Check if the browser supports notifications
      if (!("Notification" in window)) {
        console.log("Browser does not support notifications");
        alert("This browser does not support desktop notifications");
        return;
      }
  
      // Handle different permission states
      if (Notification.permission === "granted") {
        console.log("Notification permission already granted");
        await createNotification(directionsLink);
      } else if (Notification.permission !== "denied") {
        console.log("Requesting notification permission");
        const permission = await Notification.requestPermission();
        console.log(`Notification permission response: ${permission}`);
        
        if (permission === "granted") {
          await createNotification(directionsLink);
        } else {
          console.og("Notification permission not granted");
          alert("Please enable notifications to receive alerts");
        }
      } else {
        console.log("Notifications are denied by user");
        alert("Please enable notifications in your browser settings to receive alerts");
      }
    } catch (error) {
      console.log(`Error showing notification: ${error.message}`);
      console.error("Notification error:", error);
    }
  };
  
  // Helper function to create the notification
  const createNotification = async (directionsLink) => {
    try {
      const notification = new Notification("Location Alert", {
        body: "You have wandered too far from home. Click for directions back.",
        icon: "/notification-icon.png", // Add an icon in your public folder
        badge: "/notification-badge.png", // Add a badge in your public folder
        vibrate: [200, 100, 200], // Vibration pattern
        tag: "location-alert", // Unique tag for the notification
        requireInteraction: true, // Notification will remain until user interacts
      });
  
      notification.onclick = function(event) {
        event.preventDefault();
        console.log("Notification clicked - opening directions");
        window.open(directionsLink, '_blank');
      };
  
      console.log("Notification created successfully");
    } catch (error) {
      console.log(`Error creating notification: ${error.message}`);
      throw error;
    }
  };


  const simulateOutOfRange = () => {
    if (!homeLocation) {
      alert("Please set a home location first.");
      return;
    }
  
    // Set a fake current location far away from home
    const fakeLocation = {
      latitude: homeLocation.latitude + 0.01, // Adjust this value to simulate distance
      longitude: homeLocation.longitude + 0.01, // Adjust this value to simulate distance
    };
  
    setCurrentLocation(fakeLocation);
  
    // Calculate distance
    const dist = calculateDistance(
      homeLocation.latitude,
      homeLocation.longitude,
      fakeLocation.latitude,
      fakeLocation.longitude
    );
    setDistance(dist);
  
    // Trigger out-of-range behavior
    setIsOutOfRange(true);
    sirenRef.current?.play();
    // sendSMSAlert();
    showPushNotification();
  };


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
          showPushNotification();
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
  // }, [homeLocation, safeRadius, calculateDistance, sendSMSAlert]);
  }, [homeLocation, safeRadius, calculateDistance]);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">

<WebsiteNotification
        message={notificationMessage}
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />


      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-6 h-6" />
            Emergency Contact Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Emergency Contact Number (with country code)</label>
            <Input
              type="tel"
              placeholder="e.g., +1234567890"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Safe Radius (meters)</label>
            <Input
              type="number"
              value={safeRadius}
              onChange={(e) => setSafeRadius(Number(e.target.value))}
              min="1"
              max="10000"
            />
          </div>
          <Button
            onClick={saveEmergencyContact}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Emergency Contact & Safe Radius"}
          </Button>
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


          <Button onClick={simulateOutOfRange} className="mt-4">
            Simulate Out of Range
          </Button>


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
