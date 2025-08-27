import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/ui/Header";
import BottomNavigation from "../../components/ui/BottomNavigation";
import Button from "../../components/ui/Button";
import Icon from "../../components/AppIcon";

// Hooks & Components
import { useStudyParameters } from "./hooks/useStudyParameters";
import SubjectManagement from "./components/SubjectManagement";
import TopicManagement from "./components/TopicManagement";
import TimeAvailability from "./components/TimeAvailability";
import SessionPreferences from "./components/SessionPreferences";

const StudyPlanGenerator = () => {
  const navigate = useNavigate();
  const { 
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
  } = useStudyParameters();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGeneratePlan = () => {
    setIsLoading(true);
    setError(null);

    try {
      const subjectsList = Array.isArray(parameters.subjects)
        ? parameters.subjects.map(s => s.name || s).join(", ") || "None"
        : "None";

      // Read topics from TopicManagement localStorage
      const savedTopics = JSON.parse(localStorage.getItem('selectedTopics') || '[]');
      const topicsList = savedTopics.length > 0 
        ? savedTopics.map(t => t.topic).join(", ") 
        : "None";

      const timeSlotsList = Array.isArray(parameters.availableSlots) && parameters.availableSlots.length > 0
        ? parameters.availableSlots.map(s => `${s.day || "Day"} ${s.start || "00:00"}-${s.end || "00:00"}`).join(", ")
        : "None";

      // Show alert
      alert(
        `✅ Selected Data:\n` +
        `Subjects: ${subjectsList}\n` +
        `Topics: ${topicsList}\n` +
        `Time Slots: ${timeSlotsList}\n` +
        `Session Length: ${parameters.sessionLength || 0} mins\n` +
        `Break Duration: ${parameters.breakDuration || 0} mins\n` +
        `Study Mode: ${parameters.studyMode || "Default"}`
      );

      // Generate the plan
      const newPlan = generatePlan();

      // Add unique ID
      const planWithId = { ...newPlan, id: Date.now().toString() };

      // Save plan to localStorage
      const savedPlans = JSON.parse(localStorage.getItem('studyPlans') || '[]');
      localStorage.setItem('studyPlans', JSON.stringify([...savedPlans, planWithId]));

      // Navigate to StudyPlanPage
      navigate(`/study-plan/${planWithId.id}`);

    } catch (err) {
      console.error("Error generating plan:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-14 pb-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
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
          </div>

          {/* Form Section */}
          {error && <div className="p-4 bg-error/10 border border-error/20 rounded-lg text-sm text-error">{error}</div>}

          <div className="space-y-6">
            <SubjectManagement 
              subjects={parameters.subjects || []}
              onAddSubject={addSubject}
              onRemoveSubject={removeSubject}
              onUpdateSubjectColor={updateSubjectColor}
            />

            <TopicManagement 
              subjects={parameters.subjects || []}
              topics={parameters.topics || []}
              onAddTopic={addTopic}
              onRemoveTopic={removeTopic}
            />

            <TimeAvailability 
              availableSlots={parameters.availableSlots || []}
              onAddTimeSlot={addTimeSlot}
              onRemoveTimeSlot={removeTimeSlot}
            />

            <SessionPreferences 
              sessionLength={parameters.sessionLength || 0}
              breakDuration={parameters.breakDuration || 0}
              studyMode={parameters.studyMode || ""}
              onSessionLengthChange={(value) => updateParameter('sessionLength', parseInt(value))}
              onBreakDurationChange={(value) => updateParameter('breakDuration', parseInt(value))}
              onStudyModeChange={(value) => updateParameter('studyMode', value)}
            />

            <div className="flex justify-center pt-6">
              <Button
                size="lg"
                iconName="Sparkles"
                iconPosition="left"
                onClick={handleGeneratePlan}
                disabled={isLoading}
                className="px-8"
              >
                {isLoading ? 'Creating Your Plan...' : 'Generate Study Plan'}
              </Button>
            </div>
          </div>
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
};

export default StudyPlanGenerator;
