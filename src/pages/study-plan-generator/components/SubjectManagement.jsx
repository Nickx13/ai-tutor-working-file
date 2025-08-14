import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const SubjectManagement = ({ subjects, onAddSubject, onRemoveSubject, onUpdateSubjectColor }) => {
  const [newSubject, setNewSubject] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(null);

  const handleAddSubject = () => {
    if (newSubject.trim() !== '') {
      onAddSubject(newSubject.trim());
      setNewSubject('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddSubject();
    }
  };

  const handleColorSelect = (subjectName, colorClass) => {
    onUpdateSubjectColor(subjectName, colorClass);
    setShowColorPicker(null);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Subjects</h3>
          <p className="text-sm text-muted-foreground">Manage your study subjects</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add new subject (e.g., Mathematics)"
          />
          <Button onClick={handleAddSubject}>Add</Button>
        </div>

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
                    onClick={() => handleColorSelect(showColorPicker, `${color} text-${color.replace('bg-', '').replace('-100', '')}-800 border-${color.replace('bg-', '').replace('-100', '')}-200`)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
          
          {subjects.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No subjects added yet. Add your first subject above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectManagement;