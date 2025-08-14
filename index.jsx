import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import BottomNavigation from '../../components/ui/BottomNavigation';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import ExamDetailsCard from './components/ExamDetailsCard';
import SubjectsCard from './components/SubjectsCard';
import AvailabilityCard from './components/AvailabilityCard';
import GeneratedPlan from './components/GeneratedPlan';
import LoadingAnimation from './components/LoadingAnimation';

const StudyPlanGenerator = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('form');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExistingPlans, setShowExistingPlans] = useState(false);
  const [formData, setFormData] = useState({
    class: '',
    examDate: '',
    targetScore: 85,
    subjects: [],
    subjectPriorities: {},
    availableTimeSlots: [],
    dailyStudyHours: 3,
    sessionDuration: 60,
    breakDuration: 10
  });
  const [errors, setErrors] = useState({});
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [existingPlans, setExistingPlans] = useState([]);

  // Load saved plans on mount
  useEffect(() => {
    const savedPlans = JSON.parse(localStorage.getItem('studyPlans') || '[]');
    setExistingPlans(savedPlans);
  }, []);

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.class) newErrors.class = 'Please select your class';
    if (!formData.examDate) newErrors.examDate = 'Please select a valid exam date';
    if (!formData.subjects || formData.subjects.length === 0) {
      newErrors.subjects = 'Please select at least one subject to study';
    }
    if (!formData.availableTimeSlots || formData.availableTimeSlots.length === 0) {
      newErrors.availableTimeSlots = 'Please select at least one available time slot';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function for date formatting with validation
  const formatDate = (date) => {
    if (!date || isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get the actual date range from today to exam date
  const getDateRange = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const examDate = new Date(formData.examDate);
    examDate.setHours(0, 0, 0, 0);
    
    // Validate exam date
    if (isNaN(examDate)) {
      throw new Error("Invalid exam date format");
    }
    
    if (examDate < today) {
      throw new Error("Exam date must be in the future");
    }
    
    // Calculate total days (inclusive of today)
    const totalDays = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24)) + 1;
    
    // Create array of dates from today to exam date
    const dates = [];
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    // Group dates into calendar weeks (Monday to Sunday)
    const weeks = [];
    let currentWeek = [];
    
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      
      // Start a new week on Monday
      if (currentWeek.length === 0 || date.getDay() === 1) {
        if (currentWeek.length > 0) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      }
      
      currentWeek.push(date);
    }
    
    // Add the last week if it has dates
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }
    
    return { dates, weeks, totalDays };
  };

  // Enhanced distributeStudyTime with proper allocation
  const distributeStudyTime = (subjects, priorities, totalMinutes, sessionDuration) => {
    const priorityWeights = { high: 3, medium: 2, low: 1 };
    const subjectData = subjects.map(subject => {
      const priority = priorities[subject] || 'medium';
      const weight = priorityWeights[priority];
      return { subject, priority, weight };
    });
    const totalWeight = subjectData.reduce((sum, data) => sum + data.weight, 0);

    // Handle edge case where total weight is 0
    if (totalWeight === 0) {
      const equalMinutes = totalMinutes / subjects.length;
      return subjectData.map(data => ({
        ...data,
        minutes: Math.round(equalMinutes),
        totalSessions: Math.ceil(equalMinutes / sessionDuration),
        sessionsPerWeek: 0
      }));
    }

    return subjectData.map(data => {
      const baseMinutes = (data.weight / totalWeight) * totalMinutes;
      
      // Calculate minimum time based on subject's fair share
      const fairShare = totalMinutes / subjects.length;
      const minPercentage = data.priority === 'low' ? 0.15 :
                           data.priority === 'medium' ? 0.20 : 0.25;
      const minMinutes = fairShare * minPercentage;
      
      const minutes = Math.max(minMinutes, baseMinutes);
      const totalSessions = Math.ceil(minutes / sessionDuration);
      return {
        ...data,
        minutes: Math.round(minutes),
        totalSessions,
        sessionsPerWeek: 0
      };
    });
  };

  // Dynamic topic generation with proper variety
  const getTopicForSubject = (subject, weekIndex, sessionIndex, weekFocus) => {
    const topicSets = {
      'Mathematics': {
        foundation: ['Number Systems', 'Basic Algebra', 'Geometry Fundamentals', 'Fractions & Decimals', 'Percentages', 'Ratios & Proportions'],
        practice: ['Algebraic Expressions', 'Linear Equations', 'Coordinate Geometry', 'Mensuration', 'Data Handling', 'Probability'],
        review: ['Previous Year Problems', 'Mock Test Practice', 'Formula Revision', 'Speed Practice', 'Error Analysis', 'Final Review']
      },
      'Science': {
        foundation: ['Matter & Its Properties', 'Atomic Structure', 'Living Organisms', 'Motion & Forces', 'Light & Sound', 'Natural Resources'],
        practice: ['Chemical Reactions', 'Life Processes', 'Electricity & Magnetism', 'Heredity & Evolution', 'Control & Coordination', 'Environmental Science'],
        review: ['Diagram Practice', 'Experiment Review', 'Important Definitions', 'Concept Connections', 'Practice Papers', 'Quick Revision']
      },
      'English': {
        foundation: ['Grammar Basics', 'Parts of Speech', 'Sentence Structure', 'Vocabulary Building', 'Reading Skills', 'Comprehension'],
        practice: ['Essay Writing', 'Letter Writing', 'Story Writing', 'Poem Analysis', 'Grammar Exercises', 'Speaking Practice'],
        review: ['Writing Practice', 'Grammar Review', 'Literature Revision', 'Sample Papers', 'Error Correction', 'Final Polish']
      },
      'Hindi': {
        foundation: ['व्याकरण मूल बातें', 'वर्ण व शब्द', 'वाक्य रचना', 'संज्ञा व सर्वनाम', 'विशेषण व क्रिया', 'काव्य परिचय'],
        practice: ['निबंध लेखन', 'पत्र लेखन', 'कहानी लेखन', 'कविता व्याख्या', 'व्याकरण अभ्यास', 'गद्य अभ्यास'],
        review: ['लेखन अभ्यास', 'व्याकरण दोहराव', 'साहित्य दोहराव', 'प्रश्न पत्र अभ्यास', 'त्रुटि सुधार', 'अंतिम तैयारी']
      },
      'Social Science': {
        foundation: ['History Basics', 'Geography Fundamentals', 'Civics Introduction', 'Economics Basics', 'Map Skills', 'Timeline Study'],
        practice: ['Historical Analysis', 'Geographical Concepts', 'Political Processes', 'Economic Systems', 'Case Studies', 'Current Affairs'],
        review: ['Important Dates', 'Map Practice', 'Constitution Review', 'Economic Concepts', 'Sample Questions', 'Comprehensive Review']
      },
      'Physics': {
        foundation: ['Motion in Straight Line', 'Force & Newton\'s Laws', 'Work Energy Power', 'Sound Waves', 'Light Properties', 'Electricity Basics'],
        practice: ['Numerical Problems', 'Graph Analysis', 'Experimental Methods', 'Formula Applications', 'Conceptual Questions', 'Problem Solving'],
        review: ['Formula Sheet', 'Numerical Practice', 'Concept Integration', 'Previous Papers', 'Quick Calculations', 'Final Prep']
      },
      'Chemistry': {
        foundation: ['Atoms & Molecules', 'Chemical Bonding', 'Acids Bases Salts', 'Metals & Non-metals', 'Periodic Classification', 'Chemical Reactions'],
        practice: ['Equation Balancing', 'Stoichiometry', 'Lab Experiments', 'Chemical Properties', 'Reaction Mechanisms', 'Problem Solving'],
        review: ['Formula Revision', 'Reaction Summary', 'Important Compounds', 'Lab Techniques', 'Sample Problems', 'Concept Review']
      },
      'Biology': {
        foundation: ['Cell Structure', 'Life Processes', 'Reproduction', 'Heredity Basics', 'Evolution Introduction', 'Environmental Biology'],
        practice: ['Diagram Drawing', 'Process Explanation', 'Classification', 'Life Cycle Studies', 'Ecosystem Analysis', 'Case Studies'],
        review: ['Diagram Practice', 'Process Summary', 'Classification Review', 'Important Terms', 'System Integration', 'Final Review']
      }
    };

    const subjectTopics = topicSets[subject] || {
      foundation: ['Basic Concepts', 'Fundamentals', 'Introduction'],
      practice: ['Practice Problems', 'Applications', 'Exercises'],
      review: ['Revision', 'Practice Tests', 'Summary']
    };

    const focusTopics = subjectTopics[weekFocus] || subjectTopics.foundation;
    const topicIndex = (weekIndex * 2 + sessionIndex) % focusTopics.length;
    return focusTopics[topicIndex];
  };

  // Create balanced subject schedule for the week
  const createWeeklySubjectSchedule = (subjectDistribution, studyDays) => {
    const schedule = Array(studyDays).fill(null).map(() => []);
    // Sort subjects by priority and total sessions
    const sortedSubjects = [...subjectDistribution].sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.sessionsPerWeek - a.sessionsPerWeek;
    });

    // Distribute subjects across days
    let currentDay = 0;
    sortedSubjects.forEach(subject => {
      for (let session = 0; session < subject.sessionsPerWeek; session++) {
        schedule[currentDay].push(subject);
        currentDay = (currentDay + 1) % studyDays;
      }
    });

    // Balance the load across days with less aggressive redistribution
    const totalSessions = sortedSubjects.reduce((sum, s) => sum + s.sessionsPerWeek, 0);
    const minSessionsPerDay = Math.floor(totalSessions / studyDays);
    const extraSessions = totalSessions % studyDays;
    
    // First, ensure each day has at least minSessionsPerDay
    for (let day = 0; day < schedule.length; day++) {
      while (schedule[day].length < minSessionsPerDay && sortedSubjects.some(s => s.sessionsPerWeek > 0)) {
        // Find a subject that still has sessions to distribute
        const subjectIndex = sortedSubjects.findIndex(s => s.sessionsPerWeek > 0);
        if (subjectIndex >= 0) {
          schedule[day].push(sortedSubjects[subjectIndex]);
          sortedSubjects[subjectIndex].sessionsPerWeek--;
        }
      }
    }
    
    // Then distribute extra sessions (if any)
    for (let i = 0; i < extraSessions; i++) {
      if (i < schedule.length) {
        // Find a subject that still has sessions to distribute
        const subjectIndex = sortedSubjects.findIndex(s => s.sessionsPerWeek > 0);
        if (subjectIndex >= 0) {
          schedule[i].push(sortedSubjects[subjectIndex]);
          sortedSubjects[subjectIndex].sessionsPerWeek--;
        }
      }
    }

    return schedule;
  };

  // Helper function for session type
  const getSessionType = (weekFocus, sessionIndex) => {
    if (weekFocus === 'review') return 'Review';
    if (weekFocus === 'foundation') return sessionIndex % 3 === 0 ? 'Theory' : 'Practice';
    return sessionIndex % 2 === 0 ? 'Problem Solving' : 'Application';
  };

  // Improved time slot management
  const getTimeForSlot = (slotId) => {
    const slotTimes = {
      'early-morning': '5:00 AM - 7:00 AM',
      'morning': '7:00 AM - 10:00 AM',
      'late-morning': '10:00 AM - 12:00 PM',
      'afternoon': '12:00 PM - 4:00 PM',
      'evening': '4:00 PM - 7:00 PM',
      'night': '7:00 PM - 10:00 PM'
    };
    return slotTimes[slotId] || '4:00 PM - 7:00 PM';
  };

  // Convert time string to minutes since midnight
  const timeToMinutes = (timeStr) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (modifier === 'PM' && hours < 12) {
      hours += 12;
    }
    if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return hours * 60 + minutes;
  };

  // Enhanced week generation with proper time distribution
  const generateWeekDays = (
    weekDates,
    subjectDistribution,
    weekIndex,
    totalWeeks,
    availableTimeSlots,
    sessionDuration,
    dailyStudyHours,
    breakDuration,
    totalStudyDays // Pass total study days to calculate week focus correctly
  ) => {
    const days = [];
    
    // Calculate sessions per subject per week
    subjectDistribution.forEach(subject => {
      const weeklyMinutes = (subject.minutes / totalWeeks);
      subject.sessionsPerWeek = Math.max(1, Math.round(weeklyMinutes / sessionDuration));
    });

    // Create subject rotation schedule for the week
    const weeklySubjectSchedule = createWeeklySubjectSchedule(subjectDistribution, weekDates.length);

    for (let dayIndex = 0; dayIndex < weekDates.length; dayIndex++) {
      const dayDate = weekDates[dayIndex];
      const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Sunday is rest day
      if (dayDate.getDay() === 0) {
        days.push({
          name: dayName,
          date: formatDate(dayDate),
          sessions: [],
          isRestDay: true
        });
        continue;
      }

      // Calculate sessions for this day
      const dailyMinutes = dailyStudyHours * 60;
      const maxSessionsPerDay = Math.floor(dailyMinutes / (sessionDuration + breakDuration));
      // Get subjects for this day
      const daySubjects = weeklySubjectSchedule[dayIndex] || [];
      const sessions = [];
      let currentSessionIndex = 0;

      // Determine week focus based on the actual position in the study period
      // Calculate the day's position in the overall study period
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      const dayPosition = Math.ceil((dayDate - startDate) / (1000 * 60 * 60 * 24));
      const weekFocus = dayPosition < totalStudyDays * 0.3 ? 'foundation' :
                       dayPosition < totalStudyDays * 0.7 ? 'practice' : 'review';

      // Distribute sessions across available time slots
      const slotsPerDay = Math.min(availableTimeSlots.length, Math.ceil(maxSessionsPerDay / 2));
      for (let slotIndex = 0; slotIndex < slotsPerDay && currentSessionIndex < maxSessionsPerDay; slotIndex++) {
        const slot = availableTimeSlots[slotIndex % availableTimeSlots.length];
        const slotSessions = [];
        
        // Calculate how many sessions can fit in this time slot
        const slotTime = getTimeForSlot(slot);
        const [startTimeStr, endTimeStr] = slotTime.split(' - ');
        const startTimeMinutes = timeToMinutes(startTimeStr);
        const endTimeMinutes = timeToMinutes(endTimeStr);
        const slotDuration = endTimeMinutes - startTimeMinutes;
        
        // Calculate max sessions that can fit in this slot
        const sessionTime = sessionDuration + breakDuration;
        const maxSessionsInSlot = Math.floor(slotDuration / sessionTime);
        
        // Use the minimum of what's available and what's needed
        const sessionsInSlot = Math.min(
          maxSessionsInSlot,
          maxSessionsPerDay - currentSessionIndex,
          daySubjects.length - currentSessionIndex
        );
        
        for (let i = 0; i < sessionsInSlot; i++) {
          if (currentSessionIndex >= daySubjects.length) break;
          const subject = daySubjects[currentSessionIndex];
          const sessionTask = {
            id: `${subject.subject}-${weekIndex}-${dayIndex}-${currentSessionIndex}-${Date.now()}`,
            subject: subject.subject,
            topic: getTopicForSubject(subject.subject, weekIndex, currentSessionIndex, weekFocus),
            duration: sessionDuration,
            type: getSessionType(weekFocus, currentSessionIndex),
            priority: subject.priority,
            resources: true,
            breakAfter: i < sessionsInSlot - 1 ? breakDuration : 0
          };
          slotSessions.push(sessionTask);
          currentSessionIndex++;
        }

        if (slotSessions.length > 0) {
          sessions.push({
            time: getTimeForSlot(slot),
            tasks: slotSessions,
            includesBreak: slotSessions.some(task => task.breakAfter > 0)
          });
        }
      }

      days.push({
        name: dayName,
        date: formatDate(dayDate),
        sessions,
        isRestDay: false
      });
    }

    return days;
  };

  // Updated main generation function
  const generateStudyPlan = (formData) => {
    // Get the actual date range
    const { dates, weeks, totalDays } = getDateRange();
    
    // Calculate total weeks (based on actual calendar weeks)
    const totalWeeks = Math.min(weeks.length, 16);
    
    // Calculate total study time (only on study days)
    const studyDays = dates.filter(date => date.getDay() !== 0).length; // Exclude Sundays
    const totalStudyMinutes = studyDays * formData.dailyStudyHours * 60;

    // Distribute study time among subjects
    const subjectDistribution = distributeStudyTime(
      formData.subjects,
      formData.subjectPriorities,
      totalStudyMinutes,
      formData.sessionDuration
    );

    // Calculate actual total hours
    const actualTotalHours = Math.round(studyDays * formData.dailyStudyHours);

    const plan = {
      id: Date.now(),
      name: `Class ${formData.class} Study Plan`,
      examDate: formData.examDate,
      targetScore: formData.targetScore,
      subjects: formData.subjects,
      subjectPriorities: formData.subjectPriorities,
      dailyHours: formData.dailyStudyHours,
      sessionDuration: formData.sessionDuration,
      breakDuration: formData.breakDuration,
      totalWeeks: totalWeeks,
      totalHours: actualTotalHours,
      weeks: []
    };

    // Determine week focus with proper handling for short study periods
    const foundationWeeks = Math.max(1, Math.floor(totalWeeks * 0.3));
    const practiceWeeks = Math.max(1, Math.floor(totalWeeks * 0.4));
    const reviewWeeks = Math.max(1, totalWeeks - foundationWeeks - practiceWeeks);
    
    // Generate weeks
    for (let weekIndex = 0; weekIndex < totalWeeks; weekIndex++) {
      const weekDates = weeks[weekIndex];
      
      // Determine week focus with proper handling for short study periods
      let weekFocus, weekTheme, weekTip;
      if (weekIndex < foundationWeeks) {
        weekFocus = 'foundation';
        weekTheme = 'Foundation Building';
        weekTip = 'Focus on understanding concepts clearly. Take detailed notes.';
      } else if (weekIndex < foundationWeeks + practiceWeeks) {
        weekFocus = 'practice';
        weekTheme = 'Practice & Application';
        weekTip = 'Practice problems regularly. Apply what you\'ve learned.';
      } else {
        weekFocus = 'review';
        weekTheme = 'Review & Exam Prep';
        weekTip = 'Review all topics. Take mock tests and identify weak areas.';
      }
      
      const weekStart = weekDates[0];
      const weekEnd = weekDates[weekDates.length - 1];
      
      const weekData = {
        weekNumber: weekIndex + 1,
        dateRange: `${formatDate(weekStart)} - ${formatDate(weekEnd)}`,
        theme: weekTheme,
        tip: weekTip,
        days: generateWeekDays(
          weekDates,
          subjectDistribution,
          weekIndex,
          totalWeeks,
          formData.availableTimeSlots,
          formData.sessionDuration,
          formData.dailyStudyHours,
          formData.breakDuration,
          studyDays // Pass total study days
        )
      };

      plan.weeks.push(weekData);
    }

    return plan;
  };

  const handleAnimationComplete = () => {
    console.log("Loading animation complete.");
  };

  const handleGeneratePlan = () => {
    if (!validateForm()) {
      return;
    }
    
    setIsGenerating(true);
    setCurrentStep('generating');

    // Use setTimeout to allow UI to update
    setTimeout(() => {
      try {
        const plan = generateStudyPlan(formData);
        setGeneratedPlan(plan);
        setCurrentStep('plan');
      } catch (error) {
        console.error('Error generating plan:', error);
        
        let errorMessage = 'Failed to generate plan. Please try again.';
        if (error.message.includes("Invalid exam date")) {
          errorMessage = 'Please select a valid exam date in the future.';
          setErrors({ examDate: 'Please select a valid exam date in the future.' });
        } else if (error.message.includes("Exam date must be in the future")) {
          errorMessage = 'Exam date must be in the future.';
          setErrors({ examDate: 'Exam date must be in the future.' });
        }
        
        setErrors({ general: errorMessage });
        setCurrentStep('form');
      } finally {
        setIsGenerating(false);
      }
    }, 1600);
  };

  const handleEditPlan = () => {
    setCurrentStep('form');
  };

  const handleExportPlan = () => {
    if (!generatedPlan) return;
    const data = JSON.stringify(generatedPlan, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-plan-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSavePlan = () => {
    if (!generatedPlan) return;
    try {
      const updatedPlans = existingPlans.map(plan => ({ ...plan, isActive: false }));
      updatedPlans.push({
        ...generatedPlan,
        isActive: true,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('studyPlans', JSON.stringify(updatedPlans));
      setExistingPlans(updatedPlans);
      alert('Study plan saved successfully!');
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Failed to save study plan');
    }
  };

  const handleExistingPlanClick = (plan) => {
    setGeneratedPlan(plan);
    setCurrentStep('plan');
    setShowExistingPlans(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-14 pb-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/home-dashboard')}
                className="w-10 h-10 rounded-lg border border-border hover:bg-muted flex items-center justify-center transition-colors duration-150"
              >
                <Icon name="ArrowLeft" size={20} className="text-muted-foreground" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Study Plan Generator</h1>
                <p className="text-sm text-muted-foreground">Create your personalized study schedule</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              iconName="History"
              onClick={() => setShowExistingPlans(true)}
            >
              My Plans
            </Button>
          </div>

          {/* Form Steps */}
          {currentStep === 'form' && (
            <div className="space-y-6">
              {errors.general && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
                  <p className="text-sm text-error">{errors.general}</p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <ExamDetailsCard
                    formData={formData}
                    onFormChange={handleFormChange}
                    errors={errors}
                  />
                  <SubjectsCard
                    formData={formData}
                    onFormChange={handleFormChange}
                    errors={errors}
                  />
                </div>
                <div className="space-y-6">
                  <AvailabilityCard
                    formData={formData}
                    onFormChange={handleFormChange}
                    errors={errors}
                  />
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex justify-center pt-6">
                <Button
                  size="lg"
                  iconName="Sparkles"
                  iconPosition="left"
                  onClick={handleGeneratePlan}
                  disabled={isGenerating}
                  className="px-8"
                >
                  Generate My Study Plan
                </Button>
              </div>
            </div>
          )}

          {/* Loading Animation */}
          {currentStep === 'generating' && (
            <div className="flex justify-center items-center py-12">
              <LoadingAnimation 
                isVisible={true} 
                onAnimationComplete={handleAnimationComplete} 
              />
            </div>
          )}

          {/* Generated Plan */}
          {currentStep === 'plan' && generatedPlan && (
            <GeneratedPlan
              plan={generatedPlan}
              onEdit={handleEditPlan}
              onExport={handleExportPlan}
              onSave={handleSavePlan}
            />
          )}
        </div>
      </main>

      {/* Existing Plans Modal */}
      {showExistingPlans && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-200 p-4">
          <div className="bg-card rounded-xl shadow-elevated w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-card-foreground">My Study Plans</h2>
              <button
                onClick={() => setShowExistingPlans(false)}
                className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors duration-150"
              >
                <Icon name="X" size={16} className="text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              {existingPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="border border-border rounded-lg p-4 hover:border-primary/50 cursor-pointer transition-all duration-150"
                  onClick={() => handleExistingPlanClick(plan)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-card-foreground">{plan.name}</h3>
                    {plan.isActive && (
                      <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-md border border-success/20">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>📅 Exam: {new Date(plan.examDate).toLocaleDateString()}</span>
                      <span>📚 {plan.subjects?.length || 0} subjects</span>
                      <span>🗓️ Weeks: {plan.totalWeeks || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
              {existingPlans.length === 0 && (
                <div className="text-center py-8">
                  <Icon name="Calendar" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No study plans found</p>
                  <p className="text-sm text-muted-foreground">Create your first plan to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <BottomNavigation />
      <FloatingActionButton />
    </div>
  );
};

export default StudyPlanGenerator;