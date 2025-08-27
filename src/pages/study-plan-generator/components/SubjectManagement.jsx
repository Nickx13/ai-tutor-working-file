import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select'; 
import data from '../hooks/data.json';  // <-- import your JSON

const SubjectManagement = ({ subjects, onRemoveSubject, onUpdateSubjectColor, onAddSubject }) => {
  const [showColorPicker, setShowColorPicker] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');

  const handleAddSubject = () => {
    if (selectedSubject && !subjects.find(s => s.name === selectedSubject)) {
      onAddSubject(selectedSubject); // pass the subject name back to parent
      setSelectedSubject('');
    }
  };

  const handleColorSelect = (subjectName, colorClass) => {
    onUpdateSubjectColor(subjectName, colorClass);
    setShowColorPicker(null);
  };

  // Extract subject list from data.json
  const availableSubjects = Object.keys(data);

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" 
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Subjects</h3>
          <p className="text-sm text-muted-foreground">Select & manage your study subjects</p>
        </div>
      </div>

      {/* Subject Dropdown */}
      <div className="flex gap-2">
        <Select
          value={selectedSubject}
          onChange={(val) => setSelectedSubject(val)}
          options={availableSubjects.map((subj) => ({
            value: subj,
            label: subj
          }))}
          placeholder="Select subject"
        />
        <Button onClick={handleAddSubject}>Add</Button>
      </div>

      {/* Subject List */}
      <div className="space-y-2">
        {subjects.map((subject, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${subject.color.split(' ')[0]}`} />
              <span className="font-medium text-card-foreground">{subject.name}</span>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                iconName="Palette"
                onClick={() => setShowColorPicker(showColorPicker === subject.name ? null : subject.name)}
              >
                Change Color
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                iconName="Trash2"
                onClick={() => onRemoveSubject(subject.name)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}

        {/* Color Picker */}
        {showColorPicker && (
          <div className="p-4 bg-muted/50 rounded-lg mt-2">
            <p className="text-sm font-medium text-card-foreground mb-2">
              Choose color for {showColorPicker}
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                'bg-blue-100', 'bg-green-100', 'bg-purple-100', 'bg-orange-100',
                'bg-red-100', 'bg-indigo-100', 'bg-yellow-100', 'bg-emerald-100'
              ].map(color => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 ${
                    subjects.find(s => s.name === showColorPicker)?.color?.startsWith(color) 
                      ? 'border-primary' 
                      : 'border-transparent'
                  } ${color}`}
                  onClick={() => handleColorSelect(
                    showColorPicker, 
                    `${color} text-${color.replace('bg-', '').replace('-100', '')}-800 border-${color.replace('bg-', '').replace('-100', '')}-200`
                  )}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}

        {subjects.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            No subjects selected yet. Pick one from dropdown above.
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectManagement;
