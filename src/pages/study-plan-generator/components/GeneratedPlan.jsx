import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const GeneratedPlan = ({ plan, onEdit, onExport, onSave }) => {
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(() => {
    const savedProgress = localStorage.getItem(`planProgress-${plan.id}`);
    return savedProgress ? new Set(JSON.parse(savedProgress)) : new Set();
  });

  useEffect(() => {
    localStorage.setItem(`planProgress-${plan.id}`, JSON.stringify([...completedTasks]));
  }, [completedTasks, plan.id]);

  const calculateDayProgress = (day) => {
  const dayTasks = day.sessions;
  const completedCount = dayTasks.filter(task => 
    completedTasks.has(`${day.date.toISOString().split('T')[0]}-${task.subject}-${task.topic}`)
  ).length;
  return dayTasks.length > 0 ? Math.round((completedCount / dayTasks.length) * 100) : 0;
};

const calculateWeekProgress = (week) => {
  let completedCount = 0;
  let totalTasks = 0;
  
  for (const day of week.days) {
    const dayTasks = day.sessions;
    totalTasks += dayTasks.length;
    
    const dayCompletedCount = dayTasks.filter(task => 
      completedTasks.has(`${day.date.toISOString().split('T')[0]}-${task.subject}-${task.topic}`)
    ).length;
    
    completedCount += dayCompletedCount;
  }
  
  return totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
};

const handleTaskToggle = (day, session) => {
  const taskId = `${day.date.toISOString().split('T')[0]}-${session.subject}-${session.topic}`;
  const newCompleted = new Set(completedTasks);
  newCompleted.has(taskId) ? newCompleted.delete(taskId) : newCompleted.add(taskId);
  setCompletedTasks(newCompleted);
};

  if (!plan) return null;

  // Group schedule by weeks
  const weeks = [];
  let currentWeek = [];
  let currentWeekStart = null;

  plan.schedule.forEach((day, index) => {
    const date = new Date(day.date);
    const dayOfWeek = date.getDay();
    
    // Start a new week on Monday
    if (dayOfWeek === 1 || index === 0) {
      if (currentWeek.length > 0) {
        weeks.push({
          days: currentWeek,
          startDate: currentWeekStart,
          endDate: currentWeek[currentWeek.length - 1].date
        });
        currentWeek = [];
      }
      currentWeekStart = day.date;
    }
    
    currentWeek.push(day);
    
    // Last item, push the remaining week
    if (index === plan.schedule.length - 1) {
      weeks.push({
        days: currentWeek,
        startDate: currentWeekStart,
        endDate: day.date
      });
    }
  });

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
            <Icon name="Calendar" size={20} className="text-success" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">Your Study Plan</h3>
            <p className="text-sm text-muted-foreground">
              {weeks.length} weeks • {plan.totalHours.toFixed(1)} total study hours
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" iconName="Edit" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="outline" size="sm" iconName="Share" onClick={onExport}>
            Export
          </Button>
          <Button size="sm" iconName="Save" onClick={onSave}>
            Save Plan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-primary/5 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Icon name="Target" size={16} className="text-primary" />
            <span className="text-sm font-medium text-primary">Study Days</span>
          </div>
          <p className="text-2xl font-bold text-primary mt-1">{plan.schedule.length}</p>
        </div>
        <div className="bg-secondary/5 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Icon name="BookOpen" size={16} className="text-secondary" />
            <span className="text-sm font-medium text-secondary">Total Topics</span>
          </div>
          <p className="text-2xl font-bold text-secondary mt-1">
            {Object.values(plan.parameters.topics).flat().length}
          </p>
        </div>
        <div className="bg-accent/5 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Icon name="Clock" size={16} className="text-accent" />
            <span className="text-sm font-medium text-accent">Daily Hours</span>
          </div>
          <p className="text-2xl font-bold text-accent mt-1">
            {plan.parameters.sessionLength / 60}h
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4 overflow-x-auto pb-2">
        {weeks.map((week, index) => {
          const progress = calculateWeekProgress(week);
          return (
            <button
              key={index}
              onClick={() => setSelectedWeek(index)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg border transition-all duration-150 ${
                selectedWeek === index
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="text-sm font-medium">Week {index + 1}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(week.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                {new Date(week.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className="w-full bg-muted rounded-full h-1 mt-1">
                <div 
                  className="bg-primary h-1 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {weeks[selectedWeek] && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-card-foreground">
              Week {selectedWeek + 1}
            </h4>
            <div className="text-sm text-muted-foreground">
              Progress: {calculateWeekProgress(weeks[selectedWeek])}%
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {weeks[selectedWeek].days.map((day, dayIndex) => {
              const progress = calculateDayProgress(day);
              
              return (
                <div key={dayIndex} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-card-foreground">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}
                    </h5>
                    <span className="text-xs text-muted-foreground">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-1">
                    <div
                      className="bg-success h-1 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="space-y-2">
                    {day.sessions.map((session, sessionIndex) => (
                      <div key={sessionIndex} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Icon name="Clock" size={12} className="text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground">
                            {session.startTime}
                          </span>
                        </div>
                        
                        <div
                          className={`p-2 rounded-md border transition-all duration-150 ${
                            completedTasks.has(`${day.date.toISOString().split('T')[0]}-${session.subject}-${session.topic}`)
                              ? 'bg-success/10 border-success/20'
                              : 'bg-muted/50 border-border'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            <button
  onClick={() => handleTaskToggle(day, session)}
  className={`w-4 h-4 rounded border-2 flex items-center justify-center mt-0.5 ${
    completedTasks.has(`${day.date.toISOString().split('T')[0]}-${session.subject}-${session.topic}`)
      ? 'bg-success border-success text-success-foreground'
      : 'border-border hover:border-primary'
  }`}
>
  {completedTasks.has(`${day.date.toISOString().split('T')[0]}-${session.subject}-${session.topic}`) && (
    <Icon name="Check" size={10} />
  )}
</button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <div className={`text-xs font-medium ${session.color} px-2 py-1 rounded-md border inline-block`}>
                                  {session.subject}
                                </div>
                              </div>
                              <p className={`text-sm ${
                                completedTasks.has(`${day.date.toISOString().split('T')[0]}-${session.subject}-${session.topic}`)
                                  ? 'line-through text-muted-foreground'
                                  : 'text-card-foreground'
                              }`}>
                                {session.topic} {session.type === 'review' ? '(Review)' : ''}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs text-muted-foreground">
                                  {session.duration} min
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="Lightbulb" size={16} className="text-warning mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-card-foreground">Study Tip:</p>
              <p className="text-muted-foreground">
                Consistent short study sessions with proper spacing are more effective than long cram sessions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratedPlan;