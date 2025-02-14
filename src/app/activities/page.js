"use client";
import React, { useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import Image from 'next/image';

const Page = () => {
  const [family, setFamily] = useState([]);
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [image, setImage] = useState(null);
  const [voice, setVoice] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [matchedMember, setMatchedMember] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [dbError, setDbError] = useState(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.ssdMobilenetv1.loadFromUri("/models/ssd_mobilenetv1");
        await faceapi.nets.faceLandmark68Net.loadFromUri("/models/face_landmark_68");
        await faceapi.nets.faceRecognitionNet.loadFromUri("/models/face_recognition");
        console.log("Models Loaded Successfully");
        setModelsLoaded(true);
      } catch (error) {
        console.error("Error loading FaceAPI models:", error);
        setMatchedMember("Error loading models. Please check the console for details.");
      }
    };
    loadModels();
  }, []);



  // Initialize IndexedDB
  useEffect(() => {
    const initDB = async () => {
      const dbName = 'FamilyGalleryDB';
      const request = indexedDB.open(dbName, 1);

      request.onerror = (event) => {
        console.error("Database error:", event.target.error);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('familyMembers')) {
          db.createObjectStore('familyMembers', { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = (event) => {
        const db = event.target.result;
        loadFamilyMembers(db);
      };
    };

    initDB();
  }, []);

  // // Load family members from IndexedDB
  // const loadFamilyMembers = async (db) => {
  //   const transaction = db.transaction(['familyMembers'], 'readonly');
  //   const store = transaction.objectStore('familyMembers');
  //   const request = store.getAll();

  //   request.onsuccess = () => {
  //     setFamily(request.result);
  //   };

  //   request.onerror = (event) => {
  //     console.error("Error loading family members:", event.target.error);
  //   };
  // };


  // In your loadFamilyMembers function
const loadFamilyMembers = (db) => {
  setIsLoading(true);
  try {
    const transaction = db.transaction(['familyMembers'], 'readonly');
    const store = transaction.objectStore('familyMembers');
    const request = store.getAll();

    request.onsuccess = () => {
      const result = Array.isArray(request.result) ? request.result : [];
      console.log("Loaded family members:", result);
      setFamily(result);
      setIsLoading(false);
      setDbError(null);
    };

    request.onerror = (event) => {
      console.error("Error loading family members:", event.target.error);
      setFamily([]);
      setIsLoading(false);
      setDbError("Failed to load family members");
    };
  } catch (error) {
    console.error("Transaction error:", error);
    setFamily([]);
    setIsLoading(false);
    setDbError("Failed to access database");
  }
};

  // Save family member to IndexedDB
  const saveFamilyMember = async (member) => {
    const db = await openDB();
    const transaction = db.transaction(['familyMembers'], 'readwrite');
    const store = transaction.objectStore('familyMembers');
    
    try {
      await store.add(member);
      const allMembers = await store.getAll();
      setFamily(allMembers);
    } catch (error) {
      console.error("Error saving family member:", error);
    }
  };

  // Helper function to open DB connection
  const openDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('FamilyGalleryDB', 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  };


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVoice(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addFamilyMember = async () => {
    if (name && relationship && image && voice) {
      const newMember = {
        name,
        relationship,
        image,
        voice,
        dateAdded: new Date().toISOString()
      };

      await saveFamilyMember(newMember);
      
      // Reset form
      setName("");
      setRelationship("");
      setImage(null);
      setVoice(null);

      // Optional: Switch to gallery tab after adding
      setActiveTab("gallery");
    }
  };

  const startCamera = async () => {
    try {
      setIsCameraOn(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Unable to access the camera. Please ensure permissions are granted.");
    }
  };

  const captureImage = () => {
    if (!videoRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const capturedDataUrl = canvas.toDataURL("image/png");
    setCapturedImage(capturedDataUrl);
  };

  const matchFace = async () => {
    if (!modelsLoaded) {
      console.warn("Models are not loaded yet.");
      setMatchedMember("Models are not loaded yet. Please wait.");
      return;
    }

    if (!capturedImage || family.length === 0) {
      console.warn("No captured image or family members to compare");
      setMatchedMember("No captured image or family members to compare.");
      return;
    }

    setIsLoading(true); // Start loading

    try {
      const img = await faceapi.fetchImage(capturedImage);
      console.log("Captured image loaded for face detection");

      const capturedDetections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
      console.log("Captured face detections:", capturedDetections);

      if (!capturedDetections) {
        console.warn("No face detected in captured image.");
        setMatchedMember("No face detected.");
        setIsLoading(false); // Stop loading
        return;
      }

      const labeledDescriptors = await Promise.all(
        family.map(async (member) => {
          const storedImage = await faceapi.fetchImage(member.image);
          console.log(`Loaded stored image for ${member.name}`);

          const storedDetections = await faceapi.detectSingleFace(storedImage).withFaceLandmarks().withFaceDescriptor();
          console.log(`Stored face detections for ${member.name}:`, storedDetections);

          return storedDetections ? { descriptor: storedDetections.descriptor, member } : null;
        })
      );

      const bestMatch = labeledDescriptors.reduce((best, current) => {
        if (!current) return best;
        const distance = faceapi.euclideanDistance(capturedDetections.descriptor, current.descriptor);
        console.log(`Distance to ${current.member.name}:`, distance);
        return distance < 0.5 && (best === null || distance < best.distance) ? { distance, member: current.member } : best;
      }, null);

      if (bestMatch) {
        console.log(`Best match: ${bestMatch.member.name} with distance ${bestMatch.distance}`);
        setMatchedMember(bestMatch.member.name); // Store the matched member's name
        setActiveTab("gallery"); // Switch to gallery tab
        setIsLoading(false); // Stop loading
      } else {
        console.log("No match found.");
        setMatchedMember("The face doesn't match with anything in the gallery.");
        setIsLoading(false); // Stop loading
      }
    } catch (error) {
      console.error("Error in face matching:", error);
      setMatchedMember("Error matching face. Please try again.");
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif', padding: '20px', background: 'linear-gradient(135deg, #f4f4f9, #e0e0f0)', minHeight: '100vh', textAlign: 'center' }}>
      <h1 style={{ color: '#007BFF', marginBottom: '20px', fontSize: '2.5rem', fontWeight: '600' }}>My Family</h1>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', gap: '10px' }}>
        <button
          onClick={() => setActiveTab("info")}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === "info" ? '#007BFF' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
          }}
        >
          My Family Info
        </button>
        <button
          onClick={() => setActiveTab("gallery")}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === "gallery" ? '#007BFF' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
          }}
        >
          Gallery
        </button>
        <button
          onClick={() => setActiveTab("recognition")}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === "recognition" ? '#007BFF' : '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
          }}
        >
          Facial Recognition
        </button>
      </div>

      {/* My Family Info Tab */}
      {activeTab === "info" && (
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ color: '#333', marginBottom: '20px', fontSize: '1.8rem', fontWeight: '500' }}>Introduce Your Family</h2>
          <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ddd' }}/>
          <input type="text" placeholder="Relationship" value={relationship} onChange={(e) => setRelationship(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ddd' }}/>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', color: '#555' }}>Upload Image:</label>
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ width: '100%', marginBottom: '20px' }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', color: '#555' }}>Upload Voice Note:</label>
            <input type="file" accept="audio/*" onChange={handleVoiceChange} style={{ width: '100%', marginBottom: '20px' }} />
          </div>
          <button onClick={addFamilyMember} style={{ padding: '10px 20px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', transition: 'background-color 0.3s', width: '100%' }}>Add Member</button>
        </div>
      )}

     

      {/* Gallery Tab */}
{activeTab === "gallery" && (
  <div>
    <h2 style={{ color: '#007BFF', marginTop: '20px', fontSize: '1.8rem', fontWeight: '500' }}>Family Gallery</h2>
    {/* Add loading state */}
    {isLoading && <p>Loading family members...</p>}
    
    {/* Add error state */}
    {dbError && (
      <div style={{ color: 'red', margin: '20px 0' }}>
        Error loading family members: {dbError}
      </div>
    )}
    
    {/* Show message if no family members */}
    {Array.isArray(family) && family.length === 0 && (
      <p style={{ margin: '20px 0', color: '#666' }}>
        No family members added yet. Add some from the Family Info tab!
      </p>
    )}
    
    {/* Gallery grid */}
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
      {Array.isArray(family) && family.map((member, index) => (
        <div 
          key={member.id || index} 
          id={`member-${member.name}`} 
          style={{ 
            backgroundColor: '#fff', 
            padding: '15px', 
            borderRadius: '10px', 
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', 
            textAlign: 'center', 
            width: matchedMember === member.name ? '250px' : '200px',
            transform: matchedMember === member.name ? 'scale(1.1)' : 'scale(1)',
            transition: 'transform 0.3s, width 0.3s',
            border: matchedMember === member.name ? '2px solid #007BFF' : 'none'
          }}
        >
          <Image 
            src={member.image} 
            alt={member.name} 
            width={300}
            height={500}
            style={{ 
              width: '100%', 
              height: '150px', 
              borderRadius: '10px', 
              objectFit: 'cover' 
            }} 
          />
          <h3 style={{ 
            marginTop: '10px', 
            color: '#333', 
            fontSize: '1.2rem', 
            fontWeight: '500' 
          }}>
            {member.name}
          </h3>
          <p style={{ 
            color: '#777', 
            fontSize: '0.9rem' 
          }}>
            {member.relationship}
          </p>
          <audio 
            controls 
            src={member.voice} 
            style={{ 
              marginTop: '10px', 
              width: '100%' 
            }} 
          />
        </div>
      ))}
    </div>
  </div>
)}

      {/* Facial Recognition Tab */}
      {activeTab === "recognition" && (
        <div>
          <h2 style={{ color: '#007BFF', marginTop: '20px', fontSize: '1.8rem', fontWeight: '500' }}>Face Recognition</h2>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', maxWidth: '500px', margin: '0 auto' }}>
            <video ref={videoRef} autoPlay style={{ width: '100%', display: isCameraOn ? 'block' : 'none', borderRadius: '10px' }}></video>
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
            {capturedImage && <Image src={capturedImage} alt="Captured" width={300} height={500} style={{ width: '100%', marginTop: '10px', borderRadius: '10px' }} />}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
              <button onClick={startCamera} style={{ padding: '10px 20px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', transition: 'background-color 0.3s' }}>Turn On Camera</button>
              <button onClick={captureImage} style={{ padding: '10px 20px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', transition: 'background-color 0.3s' }}>Capture Image</button>
              <button onClick={matchFace} style={{ padding: '10px 20px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', transition: 'background-color 0.3s' }}>Match Face</button>
            </div>
            {matchedMember && <p style={{ marginTop: '10px', color: '#333', fontSize: '1rem' }}>{matchedMember}</p>}
          </div>
        </div>
      )}

      {/* Loading Screen */}
      {isLoading && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ fontSize: '1.5rem', color: '#007BFF' }}>Loading...</div>
        </div>
      )}
    </div>
  );
};

export default Page;