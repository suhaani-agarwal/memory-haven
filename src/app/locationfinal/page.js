

"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Phone, Bell, Home, Navigation } from "lucide-react";
import { Save } from "lucide-react";
import Link from "next/link";

const LocationTracker = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [homeLocation, setHomeLocation] = useState(null);
  const [manualLatitude, setManualLatitude] = useState("");
  const [manualLongitude, setManualLongitude] = useState("");
  const [distance, setDistance] = useState(null);
  const [isOutOfRange, setIsOutOfRange] = useState(false);
  const [safeRadius, setSafeRadius] = useState(100);
  const [emergencyContact, setEmergencyContact] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [sirenPlaying, setSirenPlaying] = useState(false);

  const sirenRef = useRef(null);
  const watchIdRef = useRef(null);

  // Load saved contact on mount
  useEffect(() => {
    const savedContact = localStorage.getItem("emergencyContact");
    if (savedContact) {
      setEmergencyContact(savedContact);
    }
    
    const savedRadius = localStorage.getItem("safeRadius");
    if (savedRadius) {
      setSafeRadius(Number(savedRadius));
    }
  }, []);

  // Initialize siren audio
  useEffect(() => {
    sirenRef.current = new Audio("/alert-siren.mp3");
    sirenRef.current.loop = true;

    return () => {
      if (sirenRef.current) {
        sirenRef.current.pause();
        sirenRef.current = null;
      }
    };
  }, []);

  // Function to play siren only after user interaction
  const playSiren = useCallback(() => {
    if (sirenRef.current && !sirenPlaying) {
      sirenRef.current.currentTime = 0;
      sirenRef.current.play()
        .then(() => {
          setSirenPlaying(true);
        })
        .catch(e => {
          console.error("Error playing siren:", e);
        });
    }
  }, [sirenPlaying]);

  // Function to stop siren
  const stopSiren = useCallback(() => {
    if (sirenRef.current) {
      sirenRef.current.pause();
      sirenRef.current.currentTime = 0;
      setSirenPlaying(false);
    }
    setIsOutOfRange(false);
    setShowNotification(false);
    setShowDirections(false);
  }, []);

  const saveEmergencyContact = async () => {
    if (!emergencyContact) {
      alert("Please enter a valid phone number.");
      return;
    }

    setIsSaving(true);
    try {
      const phoneRegex = /^\+?[\d\s-]{10,}$/;
      if (!phoneRegex.test(emergencyContact)) {
        throw new Error("Please enter a valid phone number with country code.");
      }

      localStorage.setItem("emergencyContact", emergencyContact);
      localStorage.setItem("safeRadius", safeRadius.toString());

      alert("Emergency contact and safe radius saved successfully!");
    } catch (error) {
      alert(error.message || "Error saving emergency contact. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }, []);

  // Load home location on mount
  useEffect(() => {
    const savedHome = localStorage.getItem("homeLocation");
    if (savedHome) {
      try {
        const parsed = JSON.parse(savedHome);
        setHomeLocation(parsed);
        setManualLatitude(parsed.latitude.toString());
        setManualLongitude(parsed.longitude.toString());
      } catch (error) {
        console.error("Error parsing saved home location:", error);
        localStorage.removeItem("homeLocation");
      }
    }
  }, []);

  const setCurrentAsHome = useCallback(() => {
    if (currentLocation) {
      setHomeLocation(currentLocation);
      setManualLatitude(currentLocation.latitude.toString());
      setManualLongitude(currentLocation.longitude.toString());
      localStorage.setItem("homeLocation", JSON.stringify(currentLocation));
    }
  }, [currentLocation]);

  const setManualHomeLocation = () => {
    const lat = parseFloat(manualLatitude);
    const lng = parseFloat(manualLongitude);
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      alert("Please enter valid coordinates. Latitude: -90 to 90, Longitude: -180 to 180");
      return;
    }

    const newHomeLocation = {
      latitude: lat,
      longitude: lng
    };

    setHomeLocation(newHomeLocation);
    localStorage.setItem("homeLocation", JSON.stringify(newHomeLocation));

    // Recalculate distance and check range if current location exists
    if (currentLocation) {
      const newDistance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        lat,
        lng
      );
      setDistance(newDistance);

      const outOfRange = newDistance > safeRadius;
      if (outOfRange && !isOutOfRange) {
        setIsOutOfRange(true);
        setShowNotification(true);
        setShowDirections(true);
        showSimpleNotification();
      } else if (!outOfRange && isOutOfRange) {
        stopSiren();
      }
    }
  };

  // Function to generate Google Maps direction URL
  const getDirectionsUrl = useCallback(() => {
    if (currentLocation && homeLocation) {
      return `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${homeLocation.latitude},${homeLocation.longitude}&travelmode=walking`;
    }
    return '';
  }, [currentLocation, homeLocation]);

  // Simple notification component
  const WebsiteNotification = ({ isVisible, onClose }) => {
    if (!isVisible) return null;
  
    return (
      <div className="fixed top-4 right-4 z-50 w-96 transform transition-all duration-500 ease-in-out">
        <Alert className="bg-red-100 border-red-400">
          <Bell className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Alert: Person has wandered too far from home!
            {homeLocation && currentLocation && (
              <div className="mt-2">
                <a 
                  href={getDirectionsUrl()} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <Navigation className="w-4 h-4 mr-1 text-blue-600" /> Get directions to home
                </a>
              </div>
            )}
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

  const showSimpleNotification = useCallback(() => {
    if (!("Notification" in window)) {
      console.log("Browser does not support notifications");
      return;
    }

    if (Notification.permission === "granted") {
      const notification = new Notification("Location Alert", {
        body: "Person has wandered too far from home! Click for directions back home.",
        icon: "/notification-icon.png",
        tag: "location-alert",
      });
      
      notification.onclick = function() {
        window.open(getDirectionsUrl(), '_blank');
      };
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          const notification = new Notification("Location Alert", {
            body: "Person has wandered too far from home! Click for directions back home.",
            icon: "/notification-icon.png",
            tag: "location-alert",
          });
          
          notification.onclick = function() {
            window.open(getDirectionsUrl(), '_blank');
          };
        }
      });
    }
  }, [getDirectionsUrl]);

  const simulateOutOfRange = () => {
    if (!homeLocation) {
      alert("Please set a home location first.");
      return;
    }
  
    const fakeLocation = {
      latitude: homeLocation.latitude + 0.01,
      longitude: homeLocation.longitude + 0.01,
    };
  
    setCurrentLocation(fakeLocation);
  
    const dist = calculateDistance(
      homeLocation.latitude,
      homeLocation.longitude,
      fakeLocation.latitude,
      fakeLocation.longitude
    );
    setDistance(dist);
  
    setIsOutOfRange(true);
    setShowNotification(true);
    setShowDirections(true);
    showSimpleNotification();
    playSiren();
  };

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
        
        if (outOfRange && !isOutOfRange) {
          setIsOutOfRange(true);
          setShowNotification(true);
          setShowDirections(true);
          showSimpleNotification();
        } else if (!outOfRange && isOutOfRange) {
          stopSiren();
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
  }, [homeLocation, safeRadius, calculateDistance, showSimpleNotification, isOutOfRange, stopSiren, playSiren]);

  useEffect(() => {
    const requestNotificationPermission = () => {
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }
    };

    document.addEventListener('click', requestNotificationPermission, { once: true });
    
    return () => {
      document.removeEventListener('click', requestNotificationPermission);
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <WebsiteNotification
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />

      <Card>
        <Link href='/dashboard'>
          <Button className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Back to dashboard
          </Button>
        </Link>
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

          <div className="space-y-4">
            {homeLocation && (
              <div className="space-y-2">
                <p>
                  Home Location: {homeLocation.latitude.toFixed(6)},{" "}
                  {homeLocation.longitude.toFixed(6)}
                </p>
                {distance && <p>Distance from home: {distance.toFixed(0)} meters</p>}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
              <label className="text-sm text-gray-600">Manual Home Location</label>
                <Input
                  type="text"
                  placeholder="Latitude (e.g., 51.5074)"
                  value={manualLatitude}
                  onChange={(e) => setManualLatitude(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-600">&nbsp;</label>
                <Input
                  type="text"
                  placeholder="Longitude (e.g., -0.1278)"
                  value={manualLongitude}
                  onChange={(e) => setManualLongitude(e.target.value)}
                />
              </div>
            </div>
            <Button 
              onClick={setManualHomeLocation}
              className="w-full flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              Set Manual Home Location
            </Button>
          </div>

          {isOutOfRange && (
            <Alert variant="destructive">
              <Bell className="w-4 h-4" />
              <AlertDescription>
                <div>
                  Person has wandered {distance?.toFixed(0)} meters away from home!
                </div>
                {homeLocation && currentLocation && (
                  <div className="mt-2">
                    <a 
                      href={getDirectionsUrl()} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-white hover:text-gray-200"
                    >
                      <Navigation className="w-4 h-4 mr-1" /> Get directions to home
                    </a>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button onClick={simulateOutOfRange} className="mt-4">
              Simulate Out of Range
            </Button>
            {isOutOfRange && (
              <Button onClick={stopSiren} className="mt-4" variant="destructive">
                Stop Siren
              </Button>
            )}
            {isOutOfRange && !sirenPlaying && (
              <Button onClick={playSiren} className="mt-4 bg-yellow-500 hover:bg-yellow-600">
                Start Siren
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {currentLocation && (
        <Card>
          <CardHeader>
            <CardTitle>
              {showDirections ? "Directions Back Home" : "Location Map"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-96 bg-slate-100 rounded-lg">
              {showDirections && homeLocation ? (
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/directions?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&origin=${currentLocation.latitude},${currentLocation.longitude}&destination=${homeLocation.latitude},${homeLocation.longitude}&mode=walking`}
                  allowFullScreen
                />
              ) : (
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${currentLocation.latitude},${currentLocation.longitude}`}
                  allowFullScreen
                />
              )}
            </div>
            {showDirections && homeLocation && (
              <div className="mt-4">
                <a 
                  href={getDirectionsUrl()} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center w-full p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                >
                  <Navigation className="w-4 h-4 mr-2" /> 
                  Open directions in Google Maps
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LocationTracker;