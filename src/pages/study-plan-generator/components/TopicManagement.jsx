import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import topicSets from '../hooks/data.json';

const TopicManagement = ({ subjects }) => {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.name || '');
  const [selectedCategory, setSelectedCategory] = useState('foundation');
  const [selectedTopic, setSelectedTopic] = useState('');

  const [savedTopics, setSavedTopics] = useState(() => {
    const stored = localStorage.getItem('selectedTopics');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('selectedTopics', JSON.stringify(savedTopics));
  }, [savedTopics]);

  const categoryOptions = Object.keys(topicSets[selectedSubject] || {}).map(cat => ({
    value: cat,
    label: cat.charAt(0).toUpperCase() + cat.slice(1)
  }));

  const topicOptions =
    topicSets[selectedSubject]?.[selectedCategory]?.map(topic => ({
      value: topic,
      label: topic
    })) || [];

  const handleAddTopic = () => {
    if (selectedTopic && selectedSubject && selectedCategory) {
      const newEntry = { subject: selectedSubject, category: selectedCategory, topic: selectedTopic };

      const exists = savedTopics.some(
        t => t.subject === newEntry.subject && t.category === newEntry.category && t.topic === newEntry.topic
      );

      if (!exists) setSavedTopics([...savedTopics, newEntry]);
      setSelectedTopic('');
    }
  };

  const handleRemoveTopic = (index) => {
    setSavedTopics(savedTopics.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Topics</h3>
          <p className="text-sm text-muted-foreground">Select topics from JSON data</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Subject"
            options={subjects.map(subject => ({ value: subject.name, label: subject.name }))}
            value={selectedSubject}
            onChange={(value) => {
              setSelectedSubject(value);
              setSelectedCategory('foundation');
              setSelectedTopic('');
            }}
          />
          <Select
            label="Category"
            options={categoryOptions}
            value={selectedCategory}
            onChange={(value) => {
              setSelectedCategory(value);
              setSelectedTopic('');
            }}
          />
          <Select
            label="Topic"
            options={topicOptions}
            value={selectedTopic}
            onChange={setSelectedTopic}
            disabled={topicOptions.length === 0}
          />
        </div>

        <Button
          onClick={handleAddTopic}
          disabled={!selectedSubject || !selectedCategory || !selectedTopic}
          className="w-full md:w-auto"
        >
          Add Topic
        </Button>
      </div>

      <div className="space-y-2">
        {savedTopics.length > 0 ? (
          savedTopics.map((t, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
              <span className="text-sm font-medium">
                {t.subject} → {t.category} → <span className="text-primary">{t.topic}</span>
              </span>
              <Button size="sm" variant="ghost" onClick={() => handleRemoveTopic(index)}>
                Remove
              </Button>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No topics selected yet.</p>
        )}
      </div>
    </div>
  );
};

export default TopicManagement;
