"use client";
import React, { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Brain, Music, Heart, Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GoogleGenerativeAI } from "@google/generative-ai";

const Page = () => {
  const [activeTab, setActiveTab] = useState("memory");
  const [color, setColor] = useState("red");
  const [brushSize, setBrushSize] = useState(5);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Music Therapy State
  const [musicPlaylist, setMusicPlaylist] = useState([]); // Stores uploaded music
  const [currentTrack, setCurrentTrack] = useState(null); // Currently playing track
  const audioRef = useRef(null); // Reference to the audio element

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");

      const img = new Image();
      img.src = "/colouring image.png";
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
    }
  }, []);


  const [formData, setFormData] = useState({
    hobbies: '',
    interests: '',
    favoriteMusic: '',
    favoritePeople: ''
  });
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateAIPrompt = (data) => {
    return `Generate personalized memory improvement activities for someone with dementia who has the following preferences:
    Hobbies: ${data.hobbies}
    Interests: ${data.interests}
    Favorite Music: ${data.favoriteMusic}
    Important People: ${data.favoritePeople}

    Please provide activities in these exact categories:
    1. Music Therapy Activities
    2. Social Connection Activities
    3. Hobby-Based Activities
    4. Interest-Based Learning Activities

    For each category, list exactly 3 specific activities.
    Format each activity as a simple string.
    Begin each category with a dash and the category name.`;
  };

  // const parseAIResponse = (responseText) => {
  //   try {
  //     // Clean up the response text to ensure it's valid JSON
  //     const jsonStr = responseText.replace(/```json\n?|```/g, '').trim();
  //     const parsed = JSON.parse(jsonStr);
  //     return Object.entries(parsed).map(([category, activities]) => ({
  //       category,
  //       activities: Array.isArray(activities) ? activities : [activities]
  //     }));
  //   } catch (e) {
  //     // If JSON parsing fails, try to structure the text response
  //     const categories = responseText.split(/\d\.\s+/).filter(Boolean);
  //     return categories.map(category => {
  //       const [title, ...activities] = category.split('\n').filter(Boolean);
  //       return {
  //         category: title.trim(),
  //         activities: activities.map(act => act.replace(/^[-•]\s+/, '').trim())
  //       };
  //     });
  //   }
  // };
  // const parseAIResponse = (responseText) => {
  //   try {
  //     // Split the response into categories
  //     const categories = responseText.split(/\d\.\s+/).filter(Boolean);
      
  //     // Transform into the required format
  //     return categories.map(category => {
  //       const lines = category.split('\n').filter(line => line.trim());
  //       const categoryName = lines[0].replace(/^[-•]\s*/, '').trim();
  //       const activities = lines
  //         .slice(1)
  //         .map(line => line.replace(/^[-•]\s*/, '').trim())
  //         .filter(Boolean);

  //       return {
  //         category: categoryName,
  //         activities: activities.slice(0, 3) // Limit to 3 activities per category
  //       };
  //     });
  //   } catch (e) {
  //     console.error('Parsing error:', e);
  //     return [];
  //   }
  // };

  const parseAIResponse = (responseText) => {
    try {
      const lines = responseText.split('\n').filter(line => line.trim());
      
      let currentCategory = '';
      let currentActivities = [];
      const result = [];
      
      lines.forEach(line => {
        if (line.startsWith('-')) {
          if (currentCategory && currentActivities.length) {
            result.push({
              category: currentCategory,
              activities: currentActivities
            });
          }
          currentCategory = line.replace('-', '').trim();
          currentActivities = [];
        } else if (line.trim()) {
          // Remove quotes and trim
          const activity = line.replace(/["]/g, '').trim();
          if (activity) {
            currentActivities.push(activity);
          }
        }
      });
      
      if (currentCategory && currentActivities.length) {
        result.push({
          category: currentCategory,
          activities: currentActivities
        });
      }
      
      return result;
    } catch (e) {
      console.error('Parsing error:', e);
      return [];
    }
  };

  const generatePersonalizedSuggestions = async () => {
    setLoading(true);
    setError('');
    
    try {
      const prompt = generateAIPrompt(formData);
      
      // const { GoogleGenerativeAI } = require("@google/generative-ai");
      const genAI = new GoogleGenerativeAI("AIzaSyC6IKb8_eYclCRNFRSvjABff2GmZc9hHxo");
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
      });
      
      const chatSession = model.startChat({
        generationConfig: {
          temperature: 1,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
          responseMimeType: "text/plain",
        },
      });
      
      const result = await chatSession.sendMessage(prompt);
      const response = result.response.text();
      console.log(response);
      const parsedSuggestions = parseAIResponse(response);
      
      if (parsedSuggestions.length === 0) {
        throw new Error('Failed to parse AI response');
      }
      
      setSuggestions(parsedSuggestions);
    } catch (err) {
      setError('Failed to generate suggestions. Please try again.');
      console.error('AI Generation Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };


  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const eraseDrawing = () => {
    setColor("white");
  };

  // Handle Music Upload
  const handleMusicUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newTrack = {
        id: Date.now(), // Unique ID for the track
        title: file.name, // Use the file name as the title
        src: URL.createObjectURL(file), // Create a URL for the uploaded file
      };
      setMusicPlaylist([...musicPlaylist, newTrack]); // Add the new track to the playlist
    }
  };

  // Play a specific track
  const playTrack = (track) => {
    setCurrentTrack(track);
    if (audioRef.current) {
      audioRef.current.src = track.src;
      audioRef.current.play();
    }
  };

  // Generate memory improvement suggestions
  // const generateSuggestions = () => {
  //   const newSuggestions = [
  //     "Practice mindfulness meditation for 10 minutes daily.",
  //     "Try solving puzzles or crosswords to stimulate your brain.",
  //     "Engage in a hobby like painting or gardening to relax and focus.",
  //     "Listen to your favorite music to boost your mood and memory.",
  //     "Spend quality time with your favorite people to reduce stress.",
  //     "Learn a new skill or language to challenge your brain.",
  //     "Exercise regularly to improve blood flow to the brain.",
  //     "Read books or articles on topics that interest you.",
  //   ];
  //   setSuggestions(newSuggestions);
  // };

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif', padding: '20px', backgroundColor: '#f4f4f9', minHeight: '100vh' }}>
      {/* Title */}
      <h1 style={{ textAlign: 'center', color: '#007BFF', fontSize: '3rem', fontWeight: '600', marginBottom: '20px' }}>Smart Activity Planner</h1>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
        <button
          onClick={() => setActiveTab("memory")}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === "memory" ? '#007BFF' : '#f0f0f0',
            color: activeTab === "memory" ? '#fff' : '#007BFF',
            border: '1px solid #007BFF',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1rem',
            margin: '0 10px',
          }}
        >
          Memory Improvement
        </button>
        <button
          onClick={() => setActiveTab("music")}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === "music" ? '#007BFF' : '#f0f0f0',
            color: activeTab === "music" ? '#fff' : '#007BFF',
            border: '1px solid #007BFF',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1rem',
            margin: '0 10px',
          }}
        >
          Music Therapy
        </button>
        <button
          onClick={() => setActiveTab("coloring")}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === "coloring" ? '#007BFF' : '#f0f0f0',
            color: activeTab === "coloring" ? '#fff' : '#007BFF',
            border: '1px solid #007BFF',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1rem',
            margin: '0 10px',
          }}
        >
          Coloring Therapy
        </button>
      </div>

      {/* Memory Improvement Section */}
      {activeTab === "memory" && (
        // <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', marginBottom: '30px' }}>
        //   <h2 style={{ color: '#007BFF', fontSize: '2rem', fontWeight: '500', marginBottom: '20px' }}>Memory Improvement Activities</h2>
        //   <div style={{ marginBottom: '20px' }}>
        //     <label style={{ fontSize: '1.2rem', color: '#555' }}>Hobbies:</label>
        //     <input
        //       type="text"
        //       value={hobbies}
        //       onChange={(e) => setHobbies(e.target.value)}
        //       style={{ width: '100%', padding: '10px', marginTop: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
        //     />
        //   </div>
        //   <div style={{ marginBottom: '20px' }}>
        //     <label style={{ fontSize: '1.2rem', color: '#555' }}>Interests:</label>
        //     <input
        //       type="text"
        //       value={interests}
        //       onChange={(e) => setInterests(e.target.value)}
        //       style={{ width: '100%', padding: '10px', marginTop: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
        //     />
        //   </div>
        //   <div style={{ marginBottom: '20px' }}>
        //     <label style={{ fontSize: '1.2rem', color: '#555' }}>Favorite Music:</label>
        //     <input
        //       type="text"
        //       value={favoriteMusic}
        //       onChange={(e) => setFavoriteMusic(e.target.value)}
        //       style={{ width: '100%', padding: '10px', marginTop: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
        //     />
        //   </div>
        //   <div style={{ marginBottom: '20px' }}>
        //     <label style={{ fontSize: '1.2rem', color: '#555' }}>Favorite People:</label>
        //     <input
        //       type="text"
        //       value={favoritePeople}
        //       onChange={(e) => setFavoritePeople(e.target.value)}
        //       style={{ width: '100%', padding: '10px', marginTop: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
        //     />
        //   </div>
        //   <button
        //     onClick={generateSuggestions}
        //     style={{
        //       padding: '10px 20px',
        //       backgroundColor: '#007BFF',
        //       color: '#fff',
        //       border: 'none',
        //       borderRadius: '5px',
        //       cursor: 'pointer',
        //       fontSize: '1rem',
        //       width: '100%',
        //     }}
        //   >
        //     Get Suggestions
        //   </button>
        //   {/* Display Suggestions */}
        //   <div style={{ marginTop: '20px' }}>
        //     <h3 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '10px' }}>Suggestions:</h3>
        //     <ul style={{ listStyleType: 'none', padding: 0 }}>
        //       {suggestions.map((suggestion, index) => (
        //         <li key={index} style={{ backgroundColor: '#f9f9f9', margin: '10px 0', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)' }}>
        //           {suggestion}
        //         </li>
        //       ))}
        //     </ul>
        //   </div>
        // </div>
        <div className="max-w-4xl mx-auto p-4">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-blue-600">
              AI-Powered Memory Improvement Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label className="text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Hobbies
                </Label>
                <Input
                  name="hobbies"
                  value={formData.hobbies}
                  onChange={handleInputChange}
                  placeholder="e.g., gardening, painting, reading"
                  className="w-full p-2"
                />
              </div>
  
              <div className="space-y-2">
                <Label className="text-lg flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Interests
                </Label>
                <Input
                  name="interests"
                  value={formData.interests}
                  onChange={handleInputChange}
                  placeholder="e.g., history, nature, cooking"
                  className="w-full p-2"
                />
              </div>
  
              <div className="space-y-2">
                <Label className="text-lg flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Favorite Music
                </Label>
                <Input
                  name="favoriteMusic"
                  value={formData.favoriteMusic}
                  onChange={handleInputChange}
                  placeholder="e.g., classical, jazz, 60s rock"
                  className="w-full p-2"
                />
              </div>
  
              <div className="space-y-2">
                <Label className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Important People
                </Label>
                <Input
                  name="favoritePeople"
                  value={formData.favoritePeople}
                  onChange={handleInputChange}
                  placeholder="e.g., family members, friends"
                  className="w-full p-2"
                />
              </div>
  
              <Button 
                onClick={generatePersonalizedSuggestions}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Generating Personalized Suggestions...' : 'Get Activities'}
              </Button>
            </div>
          </CardContent>
        </Card>
  
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
  
        {suggestions.length > 0 && (
          <div className="space-y-4">
            {suggestions.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-xl text-blue-600">
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.activities.map((activity, actIndex) => (
                      <li key={actIndex} className="bg-gray-50 p-3 rounded-lg shadow-sm hover:bg-gray-100 transition-colors">
                        {activity}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
            
            <Alert className="mt-4 bg-blue-50">
              <AlertDescription>
                These activities are AI-generated suggestions based on personal preferences. Always consult with healthcare professionals before starting new activities. Ensure proper supervision during all activities.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
      )}

      {/* Music Therapy Section */}
      {activeTab === "music" && (
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', marginBottom: '30px' }}>
          <h2 style={{ color: '#007BFF', fontSize: '2rem', fontWeight: '500', marginBottom: '20px' }}>🎵 Music Therapy</h2>
          {/* Upload Music Section */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '1.2rem', color: '#555' }}>Upload Your Music:</label>
            <input
              type="file"
              accept="audio/*"
              onChange={handleMusicUpload}
              style={{ marginLeft: '10px' }}
            />
          </div>
          {/* Music Playlist */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '10px' }}>Playlist</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {musicPlaylist.map((track) => (
                <button
                  key={track.id}
                  onClick={() => playTrack(track)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: currentTrack?.id === track.id ? '#007BFF' : '#f0f0f0',
                    color: currentTrack?.id === track.id ? '#fff' : '#007BFF',
                    border: '1px solid #007BFF',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    textAlign: 'left',
                  }}
                >
                  {track.title}
                </button>
              ))}
            </div>
          </div>
          {/* Audio Player */}
          <audio ref={audioRef} controls style={{ width: '100%', marginTop: '20px' }} />
        </div>
      )}

      {/* Coloring Therapy Section */}
      {activeTab === "coloring" && (
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
          <h2 style={{ color: '#007BFF', fontSize: '2rem', fontWeight: '500', marginBottom: '20px' }}>🎨 Coloring Therapy</h2>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '1.2rem', color: '#555' }}>Brush Size: </label>
            <input
              type="range"
              min="1"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(e.target.value)}
              style={{ width: '200px', marginLeft: '10px' }}
            />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
            {["red", "blue", "green", "yellow", "black", "purple", "orange", "pink"].map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: c,
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                {c}
              </button>
            ))}
            <button
              onClick={eraseDrawing}
              style={{
                padding: '10px 20px',
                backgroundColor: 'gray',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Eraser
            </button>
          </div>
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            style={{ border: '1px solid #ccc', backgroundColor: 'white', cursor: 'crosshair', borderRadius: '10px' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>
      )}
    </div>
  );
};

export default Page;