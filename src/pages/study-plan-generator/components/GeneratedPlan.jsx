import React, { useState } from "react";

const GeneratePlan = () => {
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState({});
  const [slots, setSlots] = useState([]);

  const [currentSubject, setCurrentSubject] = useState("");
  const [currentTopic, setCurrentTopic] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  const handleAddSubject = () => {
    if (currentSubject && !subjects.includes(currentSubject)) {
      setSubjects([...subjects, currentSubject]);
      setTopics({ ...topics, [currentSubject]: [] });
      setCurrentSubject("");
    }
  };

  const handleAddTopic = () => {
    if (currentSubject && currentTopic) {
      const updatedTopics = { ...topics };
      updatedTopics[currentSubject] = [...(updatedTopics[currentSubject] || []), currentTopic];
      setTopics(updatedTopics);
      setCurrentTopic("");
    }
  };

  const handleAddSlot = () => {
    if (currentSubject && currentTopic && currentTime) {
      setSlots([...slots, { subject: currentSubject, topic: currentTopic, time: currentTime }]);
      setCurrentTime("");
    }
  };

  const handleGeneratePlan = () => {
    if (slots.length === 0) {
      alert("❌ Please add at least one time slot!");
      return;
    }

    console.log("Subjects:", subjects);
    console.log("Topics:", topics);
    console.log("Slots:", slots);

    alert(
      `✅ Generated Plan:\n${slots
        .map(slot => `${slot.subject} → ${slot.topic} at ${slot.time}`)
        .join("\n")}`
    );
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <h2>Study Plan Generator</h2>

      {/* Add Subject */}
      <label>Subject: </label>
      <input 
        type="text" 
        value={currentSubject} 
        onChange={(e) => setCurrentSubject(e.target.value)} 
        placeholder="Enter Subject" 
      />
      <button onClick={handleAddSubject}>Add Subject</button>
      <br />
      <small>Added Subjects: {subjects.join(", ") || "None"}</small>

      <hr />

      {/* Add Topic */}
      <label>Topic: </label>
      <input 
        type="text" 
        value={currentTopic} 
        onChange={(e) => setCurrentTopic(e.target.value)} 
        placeholder="Enter Topic" 
      />
      <select 
        value={currentSubject} 
        onChange={(e) => setCurrentSubject(e.target.value)}
      >
        <option value="">--Select Subject--</option>
        {subjects.map(sub => (
          <option key={sub} value={sub}>{sub}</option>
        ))}
      </select>
      <button onClick={handleAddTopic}>Add Topic</button>
      <br />
      <small>
        {subjects.map(sub => (
          <div key={sub}>
            {sub}: {topics[sub]?.join(", ") || "No topics"}
          </div>
        ))}
      </small>

      <hr />

      {/* Add Time Slot */}
      <label>Time: </label>
      <input 
        type="time" 
        value={currentTime} 
        onChange={(e) => setCurrentTime(e.target.value)} 
      />
      <select 
        value={currentSubject} 
        onChange={(e) => setCurrentSubject(e.target.value)}
      >
        <option value="">--Select Subject--</option>
        {subjects.map(sub => (
          <option key={sub} value={sub}>{sub}</option>
        ))}
      </select>
      <select 
        value={currentTopic} 
        onChange={(e) => setCurrentTopic(e.target.value)}
      >
        <option value="">--Select Topic--</option>
        {(topics[currentSubject] || []).map(top => (
          <option key={top} value={top}>{top}</option>
        ))}
      </select>
      <button onClick={handleAddSlot}>Add Slot</button>

      <hr />

      <h3>Current Schedule:</h3>
      <ul>
        {slots.map((slot, idx) => (
          <li key={idx}>
            {slot.subject} → {slot.topic} at {slot.time}
          </li>
        ))}
      </ul>

      <button onClick={handleGeneratePlan} style={{ marginTop: "20px" }}>
        Generate Study Plan
      </button>
    </div>
  );
};

export default GeneratePlan;
