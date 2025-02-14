"use client";
import Image from 'next/image';
import { useState, useEffect, useRef } from "react";


const RemindersPage = () => {
  // Reminders State
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState("");
  const [time, setTime] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [image, setImage] = useState(null);

  // Hydration State
  const [waterIntake, setWaterIntake] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2000); // Default goal in milliliters
  const [hydrationHistory, setHydrationHistory] = useState([]);
  const [hydrationReminders, setHydrationReminders] = useState([]); // Times for hydration reminders
  const [newHydrationTime, setNewHydrationTime] = useState("");

  // Notification State
  const [notification, setNotification] = useState(null);

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  // Load reminders, hydration history, and reminders from localStorage
  useEffect(() => {
    const storedReminders = localStorage.getItem("reminders");
    const storedHydrationHistory = localStorage.getItem("hydrationHistory");
    const storedDailyGoal = localStorage.getItem("dailyGoal");
    const storedHydrationReminders = localStorage.getItem("hydrationReminders");

    if (storedReminders) {
      setReminders(JSON.parse(storedReminders));
    }
    if (storedHydrationHistory) {
      setHydrationHistory(JSON.parse(storedHydrationHistory));
    }
    if (storedDailyGoal) {
      setDailyGoal(JSON.parse(storedDailyGoal));
    }
    if (storedHydrationReminders) {
      setHydrationReminders(JSON.parse(storedHydrationReminders));
    }
  }, []);

  // Save reminders, hydration history, and reminders to localStorage
  const saveReminders = (updatedReminders) => {
    setReminders(updatedReminders);
    localStorage.setItem("reminders", JSON.stringify(updatedReminders));
  };

  const saveHydrationHistory = (updatedHistory) => {
    setHydrationHistory(updatedHistory);
    localStorage.setItem("hydrationHistory", JSON.stringify(updatedHistory));
  };

  const saveDailyGoal = (goal) => {
    setDailyGoal(goal);
    localStorage.setItem("dailyGoal", JSON.stringify(goal));
  };

  const saveHydrationReminders = (updatedReminders) => {
    setHydrationReminders(updatedReminders);
    localStorage.setItem("hydrationReminders", JSON.stringify(updatedReminders));
  };

  // Start Recording Voice
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunks.current = [];
      setRecordingTime(new Date().toLocaleTimeString()); // Store recording start time

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        if (audioChunks.current.length > 0) {
          const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
          const url = URL.createObjectURL(audioBlob);
          setAudioURL(url);
        }
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      showNotification("Microphone access is required for voice recording.");
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  // Handle Image Upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  // Add Reminder
  const addReminder = () => {
    if (!newReminder.trim() || !time) {
      showNotification("Please enter a reminder and time!");
      return;
    }

    const newRemind = {
      id: Date.now(),
      text: newReminder,
      time,
      audio: audioURL,
      image,
      recordedAt: recordingTime, // Store recording time
    };

    const updatedReminders = [...reminders, newRemind];
    saveReminders(updatedReminders);

    // Reset Fields
    setNewReminder("");
    setTime("");
    setAudioURL(null);
    setImage(null);
    setRecordingTime(null);
  };

  // Add Water Intake
  const addWaterIntake = (amount) => {
    const newEntry = {
      id: Date.now(),
      amount,
      time: new Date().toLocaleTimeString(),
    };

    const updatedHistory = [...hydrationHistory, newEntry];
    saveHydrationHistory(updatedHistory);

    // Update total water intake
    setWaterIntake((prev) => prev + amount);
  };

  // Reset Daily Hydration
  const resetDailyHydration = () => {
    setWaterIntake(0);
    setHydrationHistory([]);
    localStorage.removeItem("hydrationHistory");
  };

  // Add Hydration Reminder Time
  const addHydrationReminder = () => {
    if (!newHydrationTime) {
      showNotification("Please enter a time for the reminder!");
      return;
    }

    const newReminder = {
      id: Date.now(),
      time: newHydrationTime,
    };

    const updatedReminders = [...hydrationReminders, newReminder];
    saveHydrationReminders(updatedReminders);

    // Reset Field
    setNewHydrationTime("");
  };

  // Delete Hydration Reminder
  const deleteHydrationReminder = (id) => {
    const updatedReminders = hydrationReminders.filter((reminder) => reminder.id !== id);
    saveHydrationReminders(updatedReminders);
  };

  // Calculate hydration progress
  const hydrationProgress = (waterIntake / dailyGoal) * 100;

  // Function to play buzzer first, then voice note
  const playAudioWithBuzzer = (audioSrc) => {
    if (!audioSrc) return;

    const buzzerSound = new Audio("/buzzer.mp3"); // Ensure you have a buzzer.mp3 file in your public folder
    const voiceNote = new Audio(audioSrc);

    // Play buzzer first, then play the voice note after buzzer ends
    buzzerSound.play().then(() => {
      buzzerSound.onended = () => {
        voiceNote.play().catch((error) => console.error("Error playing voice note:", error));
      };
    }).catch((error) => console.error("Error playing buzzer:", error));
  };

  // Show Notification
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000); // Hide notification after 3 seconds
  };

  // Auto Play Reminder at Specified Time
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;

      // Check hydration reminders
      hydrationReminders.forEach((reminder) => {
        if (reminder.time === currentTime) {
          const message = "Its time to drink water! Please drink 250ml now."; // Fixed 250ml suggestion
          showNotification(message);

          // Speak the reminder
          const speech = new SpeechSynthesisUtterance(message);
          window.speechSynthesis.speak(speech);
        }
      });

      // Check regular reminders
      reminders.forEach((reminder) => {
        if (reminder.time === currentTime) {
          showNotification(`Reminder: ${reminder.text}`);
          if (reminder.audio) {
            playAudioWithBuzzer(reminder.audio); // Automatically play the reminder audio
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [reminders, hydrationReminders]);

  // Delete Reminder
  const deleteReminder = (id) => {
    const updatedReminders = reminders.filter((reminder) => reminder.id !== id);
    saveReminders(updatedReminders);
  };

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"} p-6 transition-colors duration-300`}>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
          {notification}
        </div>
      )}

      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6">
        {/* Reminders Section */}
        <div className={`${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"} shadow-lg rounded-lg p-6 w-full md:w-1/2 transition-colors duration-300`}>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Reminders</h1>
            <button onClick={toggleDarkMode} className="p-2 rounded-lg bg-gray-200 text-black hover:bg-gray-300 transition-colors duration-200">
              {darkMode ? "🌞" : "🌙"}
            </button>
          </div>

          {/* Input Fields */}
          <div className="flex flex-col space-y-4">
            <input
              type="text"
              value={newReminder}
              onChange={(e) => setNewReminder(e.target.value)}
              className={`w-full p-3 border ${darkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white text-black"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200`}
              placeholder="Enter your reminder..."
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={`w-full p-3 border ${darkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white text-black"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200`}
            />
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            {image && <Image src={image} alt="Medicine" className="h-32 w-32 object-cover rounded-lg mt-2 mx-auto" width={300} height={300} />}

            {/* Recording Buttons */}
            <div className="flex items-center space-x-2">
              {recording ? (
                <button onClick={stopRecording} className="bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition-colors duration-200">
                  Stop Recording
                </button>
              ) : (
                <button onClick={startRecording} className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-colors duration-200">
                  Record Voice
                </button>
              )}
            </div>

            {recordingTime && <p className="text-sm text-gray-400">Recording started at: {recordingTime}</p>}

            <button onClick={addReminder} className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors duration-200">
              Add Reminder
            </button>
          </div>

          {/* Display Reminders */}
          <ul className="mt-6 space-y-4">
            {reminders.map((reminder) => (
              <li key={reminder.id} className={`${darkMode ? "bg-gray-700" : "bg-gray-200"} p-4 rounded-lg flex flex-col space-y-3 transition-colors duration-300`}>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-lg">{reminder.text}</span>
                    <span className="text-sm text-gray-400"> ({reminder.time})</span>
                  </div>
                  <button onClick={() => deleteReminder(reminder.id)} className="text-red-500 text-lg hover:text-red-600 transition-colors duration-200">
                    ✕
                  </button>
                </div>

                {reminder.image && <Image src={reminder.image} alt="Medicine" className="h-40 w-40 object-cover rounded-lg mx-auto" width={300} height={300} />}
                {reminder.audio && (
                  <button onClick={() => playAudioWithBuzzer(reminder.audio)} className="bg-gray-800 text-white p-2 rounded-lg w-full hover:bg-gray-900 transition-colors duration-200">
                    🔊 Play Voice Note
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Hydration Cycle Section */}
        <div className={`${darkMode ? "bg-gray-800 text-white" : "bg-white text-black"} shadow-lg rounded-lg p-6 w-full md:w-1/2 transition-colors duration-300`}>
          <h1 className="text-2xl font-bold mb-6">Hydration Cycle</h1>

          {/* Daily Goal Input */}
          <div className="flex flex-col space-y-4">
            <label className="text-sm font-semibold">Daily Goal (ml):</label>
            <input
              type="number"
              value={dailyGoal}
              onChange={(e) => saveDailyGoal(Number(e.target.value))}
              className={`w-full p-3 border ${darkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white text-black"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200`}
            />
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-500 h-4 rounded-full"
                style={{ width: `${hydrationProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {waterIntake}ml / {dailyGoal}ml
            </p>
          </div>

          {/* Add Water Intake */}
          <div className="mt-6 flex flex-col space-y-4">
            <label className="text-sm font-semibold">Add Water Intake (ml):</label>
            <div className="flex space-x-2">
              <button
                onClick={() => addWaterIntake(250)}
                className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                +250ml
              </button>
              <button
                onClick={() => addWaterIntake(500)}
                className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                +500ml
              </button>
            </div>
          </div>

          {/* Hydration Reminders */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-4">Hydration Reminders</h2>
            <div className="flex flex-col space-y-4">
              <input
                type="time"
                value={newHydrationTime}
                onChange={(e) => setNewHydrationTime(e.target.value)}
                className={`w-full p-3 border ${darkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white text-black"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200`}
              />
              <button
                onClick={addHydrationReminder}
                className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                Add Reminder Time
              </button>
            </div>
            <ul className="mt-4 space-y-2">
              {hydrationReminders.map((reminder) => (
                <li key={reminder.id} className={`${darkMode ? "bg-gray-700" : "bg-gray-200"} p-3 rounded-lg flex justify-between items-center`}>
                  <span>{reminder.time}</span>
                  <button onClick={() => deleteHydrationReminder(reminder.id)} className="text-red-500 text-lg hover:text-red-600 transition-colors duration-200">
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetDailyHydration}
            className="mt-6 bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition-colors duration-200 w-full"
          >
            Reset Daily Hydration
          </button>
        </div>
      </div>
    </div>
  );
};

export default RemindersPage;