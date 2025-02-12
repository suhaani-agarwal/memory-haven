"use client"
import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Sun, Moon, Mic, Send, Calendar, Settings, Bell, 
  ChevronRight, X, Camera, Music, User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";





const MemoryJournalApp = () => {
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState('journal');
  const [showNotification, setShowNotification] = useState(false);

  const tabs = [
    { id: 'journal', label: 'Journal', icon: Calendar },
    { id: 'dashboard', label: 'Dashboard', icon: ChevronRight },
    { id: 'notifications', label: 'Reminders', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 min-h-screen text-slate-900 dark:text-white transition-colors duration-300">
        {/* Navigation */}
        <nav className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-semibold">Memory Journal</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowNotification(true)}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors relative"
              >
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full" />
              </button>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Tab Navigation */}
        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-b">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex overflow-x-auto">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-500'
                      : 'border-transparent hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {activeTab === 'journal' && (
              <motion.div
                key="journal"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <JournalEntry />
              </motion.div>
            )}
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Dashboard />
              </motion.div>
            )}
            {activeTab === 'notifications' && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <NotificationsPanel />
              </motion.div>
            )}
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SettingsPanel isDarkMode={isDarkMode} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Notification Pop-up */}
        <AnimatePresence>
          {showNotification && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 max-w-sm"
            >
              <Alert className="bg-white dark:bg-slate-800 shadow-lg">
                <div className="flex justify-between items-start">
                  <AlertDescription>
                    <h3 className="font-semibold mb-1">Memory Flashback</h3>
                    <p>You enjoyed listening to jazz music yesterday. Would you like to play those songs again?</p>
                    <div className="mt-3 flex gap-2">
                      <button className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600">
                        Play Music
                      </button>
                      <button className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-full text-sm">
                        Later
                      </button>
                    </div>
                  </AlertDescription>
                  <button
                    onClick={() => setShowNotification(false)}
                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};



const JournalEntry = () => {
    const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();


  const [entry, setEntry] = useState("");
  const [mood, setMood] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const searchParams = useSearchParams();
const userId = searchParams.get("userId");

  // Audio recording states
  const [audioURL, setAudioURL] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Convert base64 to file
  const base64ToFile = (base64String, filename) => {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Convert audio URL to file
  const audioURLToFile = async (audioURL) => {
    const response = await fetch(audioURL);
    const blob = await response.blob();
    return new File([blob], 'audio.wav', { type: 'audio/wav' });
  };


  // Open Camera
  const openCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  // Capture Image
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL("image/png");
      setCapturedImage(imageData);
      closeCamera();
    }
  };

  // Close Camera
  const closeCamera = () => {
    setIsCameraOpen(false);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      // Start Recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
      };

      mediaRecorder.start();
    } else {
      // Stop Recording
      mediaRecorderRef.current?.stop();
    }

    setIsRecording(!isRecording);
  };

  

  const handleMemoryUpload = async () => {
    if (!session?.user?.id || !entry) {
      toast({
        title: "Error",
        description: "Please write something in your journal entry",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);

      // Prepare files
      let imageFile = null;
      let audioFile = null;

      if (capturedImage) {
        imageFile = base64ToFile(capturedImage, 'image.png');
      }

      if (audioURL) {
        audioFile = await audioURLToFile(audioURL);
      }

      // Create FormData
      const formData = new FormData();
      formData.append('text', entry);
      if (mood) formData.append('mood', mood);
      if (imageFile) formData.append('image', imageFile);
      if (audioFile) formData.append('audio', audioFile);

      // Send to API
      const response = await fetch('/api/memories', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload memory');
      }

      // Reset form
      setEntry("");
      setMood(null);
      setCapturedImage(null);
      setAudioURL(null);

      toast({
        title: "Success",
        description: "Memory saved successfully!",
      });

    } catch (error) {
      console.error('Error uploading memory:', error);
      toast({
        title: "Error",
        description: "Failed to save memory. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const moods = [
    { emoji: "😀", label: "Happy" },
    { emoji: "😐", label: "Neutral" },
    { emoji: "😢", label: "Sad" },
  ];

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Today's Memory</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mood Selection */}
        <div className="flex justify-center gap-4">
          {moods.map(({ emoji, label }) => (
            <motion.button
              key={label}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMood(label)}
              className={`text-3xl p-3 rounded-full transition-colors ${
                mood === label ? "bg-blue-100 dark:bg-slate-700" : ""
              }`}
              aria-label={`Set mood to ${label}`}
            >
              {emoji}
            </motion.button>
          ))}
        </div>

        {/* Display Captured Image */}
        {capturedImage && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Memory Image:</h3>
            <img src={capturedImage} alt="Captured" className="w-full max-w-sm rounded-lg shadow-md" />
          </div>
        )}

        {/* Display Recorded Audio */}
        {audioURL && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Memory Audio:</h3>
            <audio controls>
              <source src={audioURL} type="audio/wav" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
        

        {/* Journal Entry Text */}
        <div className="relative">
          <textarea
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="Describe this memory..."
            className="w-full h-40 p-4 text-lg rounded-lg border bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full bg-blue-100 dark:bg-slate-700 hover:bg-blue-200 dark:hover:bg-slate-600"
              onClick={openCamera}
            >
              <Camera className="w-6 h-6" />
            </motion.button>
            {/* Microphone Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-full ${
                isRecording ? "bg-red-500 text-white" : "bg-blue-100 dark:bg-slate-700"
              } hover:bg-blue-200 dark:hover:bg-slate-600`}
              onClick={toggleRecording}
            >
              <Mic className="w-6 h-6" />
            </motion.button>
            <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
      onClick={handleMemoryUpload}
      disabled={isSubmitting || !entry}
    >
      {isSubmitting ? (
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <Send className="w-6 h-6" />
      )}
    </motion.button>
          </div>
        </div>


        
      </CardContent>

      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50">
          <video ref={videoRef} autoPlay className="w-full max-w-md rounded-md" />
          <canvas ref={canvasRef} className="hidden" width={640} height={480} />
          <div className="mt-4 flex gap-4">
            <button
              onClick={captureImage}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Capture
            </button>
            <button
              onClick={closeCamera}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};

// const Dashboard = () => {
//   const [memories, setMemories] = useState([]);
//   useEffect(() => {
//     const fetchMemories = async () => {
//       const res = await fetch("/api/memories");
//       const data = await res.json();
//       setMemories(data);
//     };
//     fetchMemories();
//   }, []);
//   const recentEntries = [
//     {
//       date: 'Today',
//       summary: 'Enjoyed a peaceful morning walk in the park, followed by coffee with Sarah.',
//       mood: '😀'
//     },
//     {
//       date: 'Yesterday',
//       summary: 'Listened to favorite jazz music and worked on the puzzle.',
//       mood: '😐'
//     }
//   ];

//   const flashbacks = [
//     {
//       title: 'Photo Memory',
//       description: 'Remember this photo from the park last week?',
//       type: 'photo'
//     },
//     {
//       title: 'Music Memory',
//       description: 'You enjoyed these jazz songs yesterday.',
//       type: 'music'
//     }
//   ];

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Calendar className="w-6 h-6" />
//             Recent Memories
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="space-y-4"
//           >
//             {recentEntries.map((entry, index) => (
//               <motion.div
//                 key={index}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.1 }}
//                 className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800"
//               >
//                 <div className="flex justify-between items-start mb-2">
//                   <span className="font-medium">{entry.date}</span>
//                   <span className="text-2xl">{entry.mood}</span>
//                 </div>
//                 <p className="text-slate-600 dark:text-slate-300">{entry.summary}</p>
//               </motion.div>
//             ))}
//           </motion.div>
//         </CardContent>
//       </Card>
      
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Bell className="w-6 h-6" />
//             Memory Flashbacks
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             className="space-y-4"
//           >
//             {flashbacks.map((flashback, index) => (
//               <motion.div
//                 key={index}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.1 }}
//                 className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800"
//               >
//                 <div className="flex items-start gap-3">
//                   {flashback.type === 'photo' ? (
//                     <Camera className="w-6 h-6 text-blue-500" />
//                   ) : (
//                     <Music className="w-6 h-6 text-blue-500" />
//                   )}
//                   <div>
//                     <h3 className="font-medium mb-1">{flashback.title}</h3>
//                     <p className="text-slate-600 dark:text-slate-300">{flashback.description}</p>
//                   </div>
//                 </div>
//               </motion.div>
//             ))}
//           </motion.div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

const Dashboard = () => {
    const [memories, setMemories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      const fetchMemories = async () => {
        try {
          const res = await fetch("/api/memories");
          if (!res.ok) throw new Error("Failed to fetch memories");
          const data = await res.json();
          setMemories(data);
        } catch (error) {
          console.error("Error fetching memories:", error);
        } finally {
          setIsLoading(false);
        }
      };
  
      fetchMemories();
    }, []);
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Recent Memories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {memories.map((memory, index) => (
                  <motion.div
                    key={memory.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">
                        {new Date(memory.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{memory.text}</p>
                    {memory.imageUrl && (
                      <img
                        src={memory.imageUrl}
                        alt="Memory"
                        className="mt-2 rounded-lg max-h-40 object-cover"
                      />
                    )}
                    {memory.audioUrl && (
                      <audio controls className="mt-2 w-full">
                        <source src={memory.audioUrl} type="audio/wav" />
                        Your browser does not support the audio element.
                      </audio>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

const NotificationsPanel = () => {
  const notifications = [
    {
      title: 'Memory Flashback',
      description: 'You visited the park with Sarah yesterday. Would you like to plan another visit?',
      time: '2 hours ago',
      type: 'suggestion'
    },
    {
      title: 'Daily Reminder',
      description: 'Time to take your evening medication.',
      time: '5 hours ago',
      type: 'reminder'
    }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {notifications.map((notification, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold mb-1">{notification.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-3">{notification.description}</p>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm hover:bg-blue-600"
                    >
                      Take Action
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-full text-sm"
                    >
                      Dismiss
                    </motion.button>
                  </div>
                </div>
                <span className="text-sm text-slate-500">{notification.time}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

const SettingsPanel = ({ isDarkMode }) => {
  const [settings, setSettings] = useState({
    reminderFrequency: 'medium',
    voiceSummaries: true,
    theme: isDarkMode ? 'dark' : 'light',
    fontSize: 'medium'
  });

  const frequencies = [
    { value: 'low', label: 'Few (1-2 daily)' },
    { value: 'medium', label: 'Medium (3-5 daily)' },
    { value: 'high', label: 'Frequent (6-8 daily)' }
  ];

  const fontSizes = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' }
  ];

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reminder Frequency */}
          <div className="space-y-2">
            <label className="block text-lg font-medium">Reminder Frequency</label>
            <div className="grid grid-cols-3 gap-3">
              {frequencies.map(({ value, label }) => (
                <motion.button
                  key={value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSettingChange('reminderFrequency', value)}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    settings.reminderFrequency === value
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Voice Summaries */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Voice Summaries</h3>
              <p className="text-slate-600 dark:text-slate-300">Enable AI voice reading of your memories</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSettingChange('voiceSummaries', !settings.voiceSummaries)}
              className={`w-14 h-8 rounded-full p-1 transition-colors ${
                settings.voiceSummaries ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <motion.div
                layout
                className={`w-6 h-6 rounded-full bg-white shadow-sm`}
                animate={{ x: settings.voiceSummaries ? 24 : 0 }}
              />
            </motion.button>
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <label className="block text-lg font-medium">Font Size</label>
            <div className="grid grid-cols-3 gap-3">
              {fontSizes.map(({ value, label }) => (
                <motion.button
                  key={value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSettingChange('fontSize', value)}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    settings.fontSize === value
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Save Preferences
          </motion.button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemoryJournalApp;