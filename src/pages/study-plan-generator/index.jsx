import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BottomNavigation from '../../components/ui/BottomNavigation';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

// Our simplified components
import { useStudyParameters } from './hooks/useStudyParameters';
import SubjectManagement from './components/SubjectManagement';
import TopicManagement from './components/TopicManagement';
import TimeAvailability from './components/TimeAvailability';
import SessionPreferences from './components/SessionPreferences';
import GeneratedPlan from './components/GeneratedPlan';

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
  
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showExistingPlans, setShowExistingPlans] = useState(false);

  // Mock existing plans (will connect to localStorage in real implementation)
  const existingPlans = JSON.parse(localStorage.getItem('studyPlans') || '[]');

  const handleGeneratePlan = () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // ✅ Debugging: log everything the user selected
      console.log("📌 Current Parameters:", parameters);

      alert(
        `✅ Selected Data:\n` +
        `Subjects: ${parameters.subjects.map(s => s.name).join(", ") || "None"}\n` +
        `Topics: ${parameters.topics.map(t => t.topic).join(", ") || "None"}\n` +
        `Time Slots: ${
          parameters.availableSlots.length > 0
            ? parameters.availableSlots.map(s => `${s.day} ${s.start}-${s.end}`).join(", ")
            : "None"
        }\n` +
        `Session Length: ${parameters.sessionLength} mins\n` +
        `Break Duration: ${parameters.breakDuration} mins\n` +
        `Study Mode: ${parameters.studyMode}`
      );

      // Generate the plan (from hook)
      const newPlan = generatePlan();
      setPlan(newPlan);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setPlan(null);
  };

  const handleSave = () => {
    // Save to localStorage
    const savedPlans = JSON.parse(localStorage.getItem('studyPlans') || '[]');
    localStorage.setItem('studyPlans', JSON.stringify([...savedPlans, plan]));
    
    alert('Plan saved successfully!');
  };

  const handleExport = () => {
    // Export as JSON
    const exportData = {
      ...plan,
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `study-plan-${plan.id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleExistingPlanClick = (plan) => {
    setPlan(plan);
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

          {/* Form Section */}
          {!plan && (
            <div className="space-y-6">
              {error && (
                <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
                  <p className="text-sm text-error">{error}</p>
                </div>
              )}
              
              <SubjectManagement 
                subjects={parameters.subjects}
                onAddSubject={addSubject}
                onRemoveSubject={removeSubject}
                onUpdateSubjectColor={updateSubjectColor}
              />
              
              <TopicManagement 
                subjects={parameters.subjects}
                topics={parameters.topics}
                onAddTopic={addTopic}
                onRemoveTopic={removeTopic}
              />
              
              <TimeAvailability 
                availableSlots={parameters.availableSlots}
                onAddTimeSlot={addTimeSlot}
                onRemoveTimeSlot={removeTimeSlot}
              />
              
              <SessionPreferences 
                sessionLength={parameters.sessionLength}
                breakDuration={parameters.breakDuration}
                studyMode={parameters.studyMode}
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
          )}

          {/* Generated Plan */}
          {plan && (
            <GeneratedPlan 
              plan={plan} 
              onEdit={handleEdit}
              onSave={handleSave}
              onExport={handleExport}
            />
          )}
        </div>
      </main>

      {/* Existing Plans Modal */}
      {showExistingPlans && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
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
              {existingPlans.length > 0 ? (
                existingPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="border border-border rounded-lg p-4 hover:border-primary/50 cursor-pointer transition-all duration-150"
                    onClick={() => handleExistingPlanClick(plan)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-card-foreground">{plan.name}</h3>
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md border border-primary/20">
                        {new Date(plan.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>📅 {plan.schedule.length} days</span>
                        <span>📚 {Object.values(plan.parameters.topics).flat().length} topics</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Study Hours</span>
                            <span className="text-card-foreground font-medium">
                              {plan.totalHours.toFixed(1)}h
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: '0%' }} // Would calculate based on completed tasks
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
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
    </div>
  );
};

export default StudyPlanGenerator;
