import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const TopicManagement = ({ subjects, topics, onAddTopic, onRemoveTopic }) => {
  const [newTopic, setNewTopic] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.name || '');

  if (subjects.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="text-center py-8 text-muted-foreground">
          Please add a subject first to start adding topics
        </div>
      </div>
    );
  }

  const handleAddTopic = () => {
    if (newTopic.trim() !== '' && selectedSubject) {
      onAddTopic(selectedSubject, newTopic.trim());
      setNewTopic('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTopic();
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Topics</h3>
          <p className="text-sm text-muted-foreground">Add topics as you cover them in class</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Subject"
            options={subjects.map(subject => ({ value: subject.name, label: subject.name }))}
            value={selectedSubject}
            onChange={setSelectedSubject}
          />
          
          <div className="md:col-span-2">
            <Input
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add new topic (e.g., Linear Equations)"
              label="New Topic"
            />
          </div>
        </div>
        
        <Button 
          onClick={handleAddTopic}
          disabled={!selectedSubject || !newTopic.trim()}
          className="w-full md:w-auto"
        >
          Add Topic
        </Button>

        <div className="space-y-4">
          {subjects.map(subject => {
            const subjectTopics = topics[subject.name] || [];
            if (subjectTopics.length === 0) return null;
            
            return (
              <div key={subject.name} className="border-t pt-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${subject.color.split(' ')[0]}`} />
                  <h4 className="font-medium text-card-foreground">{subject.name}</h4>
                </div>
                <div className="space-y-2">
                  {subjectTopics.map((topic, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                    >
                      <span className="text-card-foreground">{topic}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="Trash2"
                        onClick={() => onRemoveTopic(subject.name, topic)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          
          {Object.values(topics).flat().length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              No topics added yet. Add topics for your subjects above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicManagement;