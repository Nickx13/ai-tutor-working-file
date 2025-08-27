// src/pages/study-plan-generator/StudyPlanContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  subjects: [],
  topics: [],
  scheduledSessions: [],
  completedSessions: [],
  preferences: {
    sessionLength: 45,
    breakDuration: 10,
    studyMode: 'regular'
  }
};

// Action types
const ACTIONS = {
  ADD_SUBJECT: 'ADD_SUBJECT',
  ADD_TOPIC: 'ADD_TOPIC',
  SCHEDULE_TOPIC: 'SCHEDULE_TOPIC',
  COMPLETE_SESSION: 'COMPLETE_SESSION',
};

// Reducer
function studyPlanReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD_SUBJECT:
      return { ...state, subjects: [...state.subjects, action.payload] };

    case ACTIONS.ADD_TOPIC:
      return { ...state, topics: [...state.topics, action.payload] };

    case ACTIONS.SCHEDULE_TOPIC:
      const { topic, subject } = action.payload;
      const topicDate = new Date();
      const newSessions = [
        { id: `session-${topic.id}-initial`, topic, subject, type: 'initial', date: topicDate, completed: false },
        { id: `session-${topic.id}-review1`, topic, subject, type: 'review', reviewNumber: 1, date: addDays(topicDate, 1), completed: false },
        { id: `session-${topic.id}-review2`, topic, subject, type: 'review', reviewNumber: 2, date: addDays(topicDate, 3), completed: false },
        { id: `session-${topic.id}-review3`, topic, subject, type: 'review', reviewNumber: 3, date: addDays(topicDate, 7), completed: false },
      ];
      return { ...state, scheduledSessions: [...state.scheduledSessions, ...newSessions] };

    case ACTIONS.COMPLETE_SESSION:
      return {
        ...state,
        scheduledSessions: state.scheduledSessions.map(s =>
          s.id === action.payload.sessionId ? { ...s, completed: true } : s
        ),
        completedSessions: [...state.completedSessions, action.payload]
      };

    default:
      return state;
  }
}

// Utility
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Context
const StudyPlanContext = createContext();

export function StudyPlanProvider({ children }) {
  const [state, dispatch] = useReducer(studyPlanReducer, initialState, (initial) => {
    try {
      const saved = localStorage.getItem('studyPlanState');
      return saved ? JSON.parse(saved) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    localStorage.setItem('studyPlanState', JSON.stringify(state));
  }, [state]);

  const addSubject = (subject) => dispatch({ type: ACTIONS.ADD_SUBJECT, payload: subject });
  const addTopic = (topic) => dispatch({ type: ACTIONS.ADD_TOPIC, payload: topic });
  const scheduleTopic = (topic, subject) => dispatch({ type: ACTIONS.SCHEDULE_TOPIC, payload: { topic, subject } });
  const completeSession = (sessionId) => dispatch({ type: ACTIONS.COMPLETE_SESSION, payload: { sessionId } });

  return (
    <StudyPlanContext.Provider value={{ ...state, addSubject, addTopic, scheduleTopic, completeSession }}>
      {children}
    </StudyPlanContext.Provider>
  );
}

export function useStudyPlan() {
  const context = useContext(StudyPlanContext);
  if (!context) throw new Error('useStudyPlan must be used within StudyPlanProvider');
  return context;
}
