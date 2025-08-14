import React from 'react';
import Select from '../../../components/ui/Select';

const sessionLengthOptions = [
  { value: 25, label: '25 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '60 minutes' },
  { value: 90, label: '90 minutes' }
];

const breakDurationOptions = [
  { value: 5, label: '5 minutes' },
  { value: 10, label: '10 minutes' },
  { value: 15, label: '15 minutes' }
];

const studyModeOptions = [
  { value: 'regular', label: 'Regular studying (ongoing)' },
  { value: 'exam', label: 'Exam preparation' }
];

const SessionPreferences = ({ 
  sessionLength, 
  breakDuration, 
  studyMode,
  onSessionLengthChange,
  onBreakDurationChange,
  onStudyModeChange
}) => {
  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Session Preferences</h3>
          <p className="text-sm text-muted-foreground">Customize your study sessions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Select
          label="Session Length"
          options={sessionLengthOptions}
          value={sessionLength}
          onChange={onSessionLengthChange}
        />
        
        <Select
          label="Break Duration"
          options={breakDurationOptions}
          value={breakDuration}
          onChange={onBreakDurationChange}
        />
        
        <Select
          label="Study Mode"
          options={studyModeOptions}
          value={studyMode}
          onChange={onStudyModeChange}
        />
      </div>
    </div>
  );
};

export default SessionPreferences;