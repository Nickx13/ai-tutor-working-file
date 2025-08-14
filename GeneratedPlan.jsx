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

  const getSubjectColor = (subject) => {
    const colors = {
      'Mathematics': 'bg-blue-100 text-blue-800 border-blue-200',
      'Science': 'bg-green-100 text-green-800 border-green-200',
      'English': 'bg-purple-100 text-purple-800 border-purple-200',
      'Hindi': 'bg-orange-100 text-orange-800 border-orange-200',
      'Social Science': 'bg-red-100 text-red-800 border-red-200',
      'Physics': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Chemistry': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Biology': 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };
    return colors[subject] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const calculateDayProgress = (day) => {
    const dayTasks = day.sessions.flatMap(session => session.tasks);
    const completedCount = dayTasks.filter(task => completedTasks.has(task.id)).length;
    return dayTasks.length > 0 ? Math.round((completedCount / dayTasks.length) * 100) : 0;
  };

  const calculateWeekProgress = (week) => {
    const weekTasks = week.days.flatMap(day => 
      day.sessions.flatMap(session => session.tasks)
    );
    const completedCount = weekTasks.filter(task => completedTasks.has(task.id)).length;
    return weekTasks.length > 0 ? Math.round((completedCount / weekTasks.length) * 100) : 0;
  };

  const studyResources = {
    Mathematics: {
      "Basic Algebra": [
        { type: 'video', title: 'Algebra Basics', url: 'https://www.youtube.com/watch?v=NybHckSEQBI' },
        { type: 'article', title: 'Algebra Introduction', url: 'https://www.khanacademy.org/math/algebra' }
      ],
      "Geometry Problems": [
        { type: 'video', title: 'Geometry Fundamentals', url: 'https://www.youtube.com/watch?v=Gu9J8QrJMF8' }
      ]
    },
    Science: {
      "Basic Concepts": [
        { type: 'video', title: 'Science Basics', url: 'https://www.youtube.com/watch?v=W2hY0U5X7F4' }
      ]
    }
  };

  const handleTaskToggle = (taskId) => {
    const newCompleted = new Set(completedTasks);
    newCompleted.has(taskId) ? newCompleted.delete(taskId) : newCompleted.add(taskId);
    setCompletedTasks(newCompleted);
  };

  if (!plan) return null;

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
              {plan.totalWeeks} weeks • {plan.totalHours} total study hours
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
            <span className="text-sm font-medium text-primary">Target Score</span>
          </div>
          <p className="text-2xl font-bold text-primary mt-1">{plan.targetScore}%</p>
        </div>
        <div className="bg-secondary/5 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Icon name="BookOpen" size={16} className="text-secondary" />
            <span className="text-sm font-medium text-secondary">Subjects</span>
          </div>
          <p className="text-2xl font-bold text-secondary mt-1">{plan.subjects.length}</p>
        </div>
        <div className="bg-accent/5 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Icon name="Clock" size={16} className="text-accent" />
            <span className="text-sm font-medium text-accent">Daily Hours</span>
          </div>
          <p className="text-2xl font-bold text-accent mt-1">{plan.dailyHours}h</p>
        </div>
      </div>

      <div className="flex items-center space-x-4 overflow-x-auto pb-2">
        {plan.weeks.map((week, index) => {
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
              <div className="text-xs text-muted-foreground">{week.dateRange}</div>
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

      {plan.weeks[selectedWeek] && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-card-foreground">
              Week {selectedWeek + 1}: {plan.weeks[selectedWeek].theme}
            </h4>
            <div className="text-sm text-muted-foreground">
              Progress: {calculateWeekProgress(plan.weeks[selectedWeek])}%
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {plan.weeks[selectedWeek].days.map((day, dayIndex) => {
              const progress = calculateDayProgress(day);
              const isRestDay = day.isRestDay;
              
              return (
                <div key={dayIndex} className={`border rounded-lg p-4 space-y-3 ${
                  isRestDay ? 'border-muted bg-muted/20' : 'border-border'
                }`}>
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-card-foreground">
                      {day.name}
                      {isRestDay && (
                        <span className="ml-2 text-xs text-muted-foreground">(Rest Day)</span>
                      )}
                    </h5>
                    <span className="text-xs text-muted-foreground">{day.date}</span>
                  </div>
                  
                  {!isRestDay && (
                    <>
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
                                {session.time}
                              </span>
                              {session.includesBreak && (
                                <span className="text-xs text-muted-foreground">
                                  (includes breaks)
                                </span>
                              )}
                            </div>
                            
                            {session.tasks.map((task, taskIndex) => (
                              <div key={task.id}>
                                <div
                                  className={`p-2 rounded-md border transition-all duration-150 ${
                                    completedTasks.has(task.id)
                                      ? 'bg-success/10 border-success/20'
                                      : 'bg-muted/50 border-border'
                                  }`}
                                >
                                  <div className="flex items-start space-x-2">
                                    <button
                                      onClick={() => handleTaskToggle(task.id)}
                                      className={`w-4 h-4 rounded border-2 flex items-center justify-center mt-0.5 ${
                                        completedTasks.has(task.id)
                                          ? 'bg-success border-success text-success-foreground'
                                          : 'border-border hover:border-primary'
                                      }`}
                                    >
                                      {completedTasks.has(task.id) && <Icon name="Check" size={10} />}
                                    </button>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <div className={`text-xs font-medium ${getSubjectColor(task.subject)} px-2 py-1 rounded-md border inline-block`}>
                                          {task.subject}
                                        </div>
                                        {task.priority === 'high' && (
                                          <Icon name="AlertTriangle" size={12} className="text-error" />
                                        )}
                                      </div>
                                      <p className={`text-sm ${
                                        completedTasks.has(task.id)
                                          ? 'line-through text-muted-foreground'
                                          : 'text-card-foreground'
                                      }`}>
                                        {task.topic}
                                      </p>
                                      <div className="flex items-center space-x-2 mt-1">
                                        <span className="text-xs text-muted-foreground">
                                          {task.duration} min • {task.type}
                                        </span>
                                        {task.resources && (
                                          <Icon name="BookOpen" size={12} className="text-primary" />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {task.breakAfter > 0 && taskIndex < session.tasks.length - 1 && (
                                  <div className="flex items-center justify-center py-1">
                                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                      <Icon name="Coffee" size={12} />
                                      <span>{task.breakAfter} min break</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  
                  {isRestDay && (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <Icon name="Coffee" size={32} className="text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Take a break and recharge!</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Rest is essential for effective learning
                        </p>
                      </div>
                    </div>
                  )}
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
              <p className="font-medium text-card-foreground">Week {selectedWeek + 1} Focus:</p>
              <p className="text-muted-foreground">
                {plan.weeks[selectedWeek]?.tip || "Stay consistent with your study schedule."}
              </p>
            </div>
          </div>
        </div>

        {/* Study Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-primary/5 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Icon name="Target" size={14} className="text-primary" />
              <span className="text-xs font-medium text-primary">High Priority</span>
            </div>
            <p className="text-lg font-bold text-primary">
              {plan.weeks[selectedWeek]?.days.reduce((count, day) =>
                count + day.sessions.reduce((c, s) =>
                  c + s.tasks.filter(t => t.priority === 'high').length, 0
                ), 0
              )} sessions
            </p>
          </div>
          <div className="bg-secondary/5 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Icon name="Clock" size={14} className="text-secondary" />
              <span className="text-xs font-medium text-secondary">Study Time</span>
            </div>
            <p className="text-lg font-bold text-secondary">
              {Math.round(plan.weeks[selectedWeek]?.days.reduce((total, day) =>
                total + day.sessions.reduce((t, s) =>
                  t + s.tasks.reduce((sum, task) => sum + task.duration, 0), 0
                ), 0
              ) / 60)}h this week
            </p>
          </div>
          <div className="bg-accent/5 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Icon name="Coffee" size={14} className="text-accent" />
              <span className="text-xs font-medium text-accent">Rest Days</span>
            </div>
            <p className="text-lg font-bold text-accent">
              {plan.weeks[selectedWeek]?.days.filter(d => d.isRestDay).length} days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratedPlan;