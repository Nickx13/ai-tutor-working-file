import { useState, useEffect } from 'react';

// Default color options for subjects
const DEFAULT_COLORS = [
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-green-100 text-green-800 border-green-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-orange-100 text-orange-800 border-orange-200',
  'bg-red-100 text-red-800 border-red-200',
  'bg-indigo-100 text-indigo-800 border-indigo-200',
  'bg-yellow-100 text-yellow-800 border-yellow-200',
  'bg-emerald-100 text-emerald-800 border-emerald-200'
];

// Get a random default color
const getRandomDefaultColor = () => {
  return DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
};

// Generate study plan based on parameters
const generateStudyPlan = (parameters) => {
  const topicsWithDates = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Process each subject's topics
  Object.entries(parameters.topics).forEach(([subject, topics]) => {
    topics.forEach(topic => {
      const subjectObj = parameters.subjects.find(s => s.name === subject);
      const color = subjectObj?.color || getRandomDefaultColor();
      
      // Add initial coverage (today)
      topicsWithDates.push({
        subject,
        topic,
        date: new Date(today),
        type: 'new',
        color
      });
      
      // Add review sessions (1 day, 3 days, 7 days later)
      [1, 3, 7].forEach(days => {
        const reviewDate = new Date(today);
        reviewDate.setDate(today.getDate() + days);
        
        topicsWithDates.push({
          subject,
          topic,
          date: reviewDate,
          type: 'review',
          color
        });
      });
    });
  });
  
  // Generate the schedule
  const schedule = [];
  
  // Create a 14-day rolling schedule
  for (let i = 0; i < 14; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);
    const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Find available time slots for this day
    const availableSlots = parameters.availableSlots.filter(
      slot => slot.day === dayOfWeek
    );
    
    if (availableSlots.length > 0) {
      // Create sessions for this day
      const sessions = [];
      const usedTopics = new Set();
      
      // Process each available time slot
      for (const slot of availableSlots) {
        // Calculate available minutes
        const [startHour, startMin] = slot.start.split(':').map(Number);
        const [endHour, endMin] = slot.end.split(':').map(Number);
        let availableMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
        
        // Add sessions until we run out of time
        let currentTime = new Date(currentDate);
        currentTime.setHours(startHour, startMin);
        
        while (availableMinutes >= parameters.sessionLength) {
          // Find next topic to schedule
          const dateString = currentDate.toISOString().split('T')[0];
          const nextTopic = findNextTopic(topicsWithDates, usedTopics, dateString);
          
          if (!nextTopic) break;
          
          // Create session
          sessions.push({
            subject: nextTopic.subject,
            topic: nextTopic.topic,
            startTime: currentTime.toTimeString().substring(0, 5),
            duration: parameters.sessionLength,
            type: nextTopic.type,
            color: nextTopic.color
          });
          
          // Update time and available minutes
          currentTime.setMinutes(currentTime.getMinutes() + parameters.sessionLength + parameters.breakDuration);
          availableMinutes -= (parameters.sessionLength + parameters.breakDuration);
          usedTopics.add(`${nextTopic.subject}-${nextTopic.topic}-${nextTopic.type}`);
        }
      }
      
      if (sessions.length > 0) {
        schedule.push({
          date: currentDate,
          dayOfWeek,
          sessions
        });
      }
    }
  }
  
  // Calculate total hours
  const totalHours = schedule.reduce((total, day) => {
    return total + (day.sessions.length * parameters.sessionLength / 60);
  }, 0);
  
  return {
    id: Date.now().toString(),
    name: `Study Plan ${new Date().toLocaleDateString()}`,
    parameters,
    schedule,
    totalHours,
    createdAt: new Date()
  };
};

// Find the next topic to schedule
const findNextTopic = (topics, usedTopics, targetDate) => {
  // Find topics for today
  const todayTopics = topics.filter(topic => {
    const topicDate = topic.date.toISOString().split('T')[0];
    return topicDate === targetDate && 
           !usedTopics.has(`${topic.subject}-${topic.topic}-${topic.type}`);
  });
  
  if (todayTopics.length > 0) {
    return todayTopics[0];
  }
  
  // If no topics for today, find earliest upcoming topic
  const upcomingTopics = topics.filter(topic => {
    const topicDate = topic.date.toISOString().split('T')[0];
    return topicDate > targetDate && 
           !usedTopics.has(`${topic.subject}-${topic.topic}-${topic.type}`);
  });
  
  // Sort by date (earliest first)
  upcomingTopics.sort((a, b) => a.date - b.date);
  
  return upcomingTopics[0] || null;
};

export const useStudyParameters = () => {
  const [parameters, setParameters] = useState(() => {
    const savedParams = localStorage.getItem('studyParameters');
    return savedParams 
      ? JSON.parse(savedParams) 
      : {
          subjects: [],
          topics: {},
          availableSlots: [],
          sessionLength: 45,
          breakDuration: 10,
          studyMode: 'regular'
        };
  });
  
  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('studyParameters', JSON.stringify(parameters));
  }, [parameters]);
  
  const updateParameter = (key, value) => {
    setParameters(prev => ({ ...prev, [key]: value }));
  };
  
  const addSubject = (subject) => {
    if (!parameters.subjects.some(s => s.name === subject)) {
      setParameters(prev => ({
        ...prev,
        subjects: [...prev.subjects, { 
          name: subject, 
          color: getRandomDefaultColor() 
        }]
      }));
    }
  };
  
  const removeSubject = (subjectName) => {
    setParameters(prev => {
      const newSubjects = prev.subjects.filter(s => s.name !== subjectName);
      const newTopics = { ...prev.topics };
      delete newTopics[subjectName];
      
      return {
        ...prev,
        subjects: newSubjects,
        topics: newTopics
      };
    });
  };
  
  const updateSubjectColor = (subjectName, colorClass) => {
    setParameters(prev => ({
      ...prev,
      subjects: prev.subjects.map(subject => 
        subject.name === subjectName 
          ? { ...subject, color: colorClass } 
          : subject
      )
    }));
  };
  
  const addTopic = (subject, topic) => {
    setParameters(prev => ({
      ...prev,
      topics: {
        ...prev.topics,
        [subject]: [...(prev.topics[subject] || []), topic]
      }
    }));
  };
  
  const removeTopic = (subject, topic) => {
    setParameters(prev => ({
      ...prev,
      topics: {
        ...prev.topics,
        [subject]: (prev.topics[subject] || []).filter(t => t !== topic)
      }
    }));
  };
  
  const addTimeSlot = (slot) => {
    setParameters(prev => ({
      ...prev,
      availableSlots: [...prev.availableSlots, slot]
    }));
  };
  
  const removeTimeSlot = (index) => {
    setParameters(prev => ({
      ...prev,
      availableSlots: prev.availableSlots.filter((_, i) => i !== index)
    }));
  };
  
  const generatePlan = () => {
    if (parameters.subjects.length === 0) {
      throw new Error('Please add at least one subject');
    }
    
    if (Object.values(parameters.topics).flat().length === 0) {
      throw new Error('Please add at least one topic');
    }
    
    if (parameters.availableSlots.length === 0) {
      throw new Error('Please add your available study times');
    }
    
    return generateStudyPlan(parameters);
  };
  
  return {
    parameters,
    updateParameter,
    addSubject,
    removeSubject,
    updateSubjectColor,
    addTopic,
    removeTopic,
    addTimeSlot,
    removeTimeSlot,
    generatePlan
  };
};