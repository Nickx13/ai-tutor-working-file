import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const TimeAvailability = ({ availableSlots, onAddTimeSlot, onRemoveTimeSlot }) => {
  const [newSlot, setNewSlot] = useState({
    day: '',
    start: '',
    end: ''
  });

  const days = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const handleAddSlot = () => {
    if (newSlot.day && newSlot.start && newSlot.end) {
      onAddTimeSlot({ ...newSlot });
      setNewSlot({ day: '', start: '', end: '' });
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Study Availability</h3>
          <p className="text-sm text-muted-foreground">When can you study?</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="Day"
            options={days.map(day => ({ value: day, label: day }))}
            value={newSlot.day}
            onChange={day => setNewSlot(prev => ({ ...prev, day }))}
            placeholder="Select day"
          />
          
          <Input
            type="time"
            label="Start Time"
            value={newSlot.start}
            onChange={e => setNewSlot(prev => ({ ...prev, start: e.target.value }))}
          />
          
          <Input
            type="time"
            label="End Time"
            value={newSlot.end}
            onChange={e => setNewSlot(prev => ({ ...prev, end: e.target.value }))}
          />
          
          <div className="flex items-end">
            <Button 
              onClick={handleAddSlot}
              disabled={!newSlot.day || !newSlot.start || !newSlot.end}
              className="w-full"
            >
              Add
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {availableSlots.map((slot, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <div>
                <span className="font-medium text-card-foreground">{slot.day}</span>
                <span className="ml-2 text-muted-foreground">
                  {slot.start} - {slot.end}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                iconName="Trash2"
                onClick={() => onRemoveTimeSlot(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          
          {availableSlots.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No time slots added yet. Add your available study times above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeAvailability;