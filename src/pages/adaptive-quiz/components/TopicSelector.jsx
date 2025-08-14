import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { csvQuestionService } from '../services/csvQuestionService';

const TopicSelector = ({ onStartQuiz }) => {
    // Remove default values - start with empty strings
    const [selectedClass, setSelectedClass] = useState('6');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedTopics, setSelectedTopics] = useState([]); // Changed to array for multiple selection
    const [selectedDifficulty, setSelectedDifficulty] = useState('');
    const [availableTopics, setAvailableTopics] = useState([]);
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [loading, setLoading] = useState(false);

    const classes = [
        { id: '6', name: 'Class 6' },
        { id: '7', name: 'Class 7' },
        { id: '8', name: 'Class 8' },
        { id: '9', name: 'Class 9' },
        { id: '10', name: 'Class 10' },
        { id: '11', name: 'Class 11' },
        { id: '12', name: 'Class 12' }
    ];

    const difficulties = [
        { id: 'easy', name: 'Easy', description: 'Basic concepts', color: 'text-success', xpMultiplier: 1 },
        { id: 'medium', name: 'Medium', description: 'Standard level', color: 'text-warning', xpMultiplier: 1.5 },
        { id: 'hard', name: 'Hard', description: 'Advanced concepts', color: 'text-error', xpMultiplier: 2 }
    ];

    // Load subjects when class changes
    useEffect(() => {
        const updateSubjects = async () => {
            try {
                if (!selectedClass) {
                    setAvailableSubjects([]);
                    return;
                }
                setLoading(true);
                await csvQuestionService.loadQuestions();
                const subjects = csvQuestionService.getSubjects(selectedClass);
                setAvailableSubjects(subjects);
                setSelectedSubject('');
                setSelectedTopics([]);
                setAvailableTopics([]);
            } catch (error) {
                console.error('Error getting subjects:', error);
                setAvailableSubjects([]);
            } finally {
                setLoading(false);
            }
        };

        updateSubjects();
    }, [selectedClass]);

    // Load topics when subject or class changes - but only if both are selected
    useEffect(() => {
        const updateTopics = async () => {
            try {
                setLoading(true);
                await csvQuestionService.loadQuestions();
                const topics = csvQuestionService.getTopics(selectedSubject, selectedClass);
                setAvailableTopics(topics);
                setSelectedTopics([]); // Reset selected topics when class/subject changes
            } catch (error) {
                console.error('Error getting topics:', error);
                setAvailableTopics([]);
            } finally {
                setLoading(false);
            }
        };

        // Only load topics if both subject and class are selected
        if (selectedSubject && selectedClass) {
            updateTopics();
        } else {
            setAvailableTopics([]);
            setSelectedTopics([]);
        }
    }, [selectedSubject, selectedClass]);

    // Handle topic selection/deselection
    const handleTopicToggle = (topicId) => {
        setSelectedTopics(prev => {
            if (prev.includes(topicId)) {
                return prev.filter(id => id !== topicId);
            } else {
                return [...prev, topicId];
            }
        });
    };

    // Select all topics
    const handleSelectAllTopics = () => {
        const allTopicIds = availableTopics.map(topic => topic.id);
        setSelectedTopics(allTopicIds);
    };

    // Clear all selected topics
    const handleClearAllTopics = () => {
        setSelectedTopics([]);
    };

    const selectedTopicsData = availableTopics.filter(t => selectedTopics.includes(t.id));
    const selectedDifficultyData = difficulties.find(d => d.id === selectedDifficulty);

    const totalQuestions = selectedTopicsData.reduce((sum, topic) => sum + topic.questions, 0);
    const baseXP = selectedTopicsData.reduce((sum, topic) => sum + topic.xp, 0);
    const estimatedXP = selectedDifficultyData ? Math.floor(baseXP * selectedDifficultyData.xpMultiplier) : 0;

    const handleStartQuiz = () => {
        if (!selectedClass) {
            alert('Please select a class first!');
            return;
        }
        if (!selectedSubject) {
            alert('Please select a subject first!');
            return;
        }
        if (selectedTopics.length === 0) {
            alert('Please select at least one topic first!');
            return;
        }
        if (!selectedDifficulty) {
            alert('Please select a difficulty level first!');
            return;
        }

        onStartQuiz({
            class: selectedClass,
            subject: selectedSubject,
            topics: selectedTopics,
            difficulty: selectedDifficulty,
            estimatedQuestions: totalQuestions,
            estimatedXP
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">Adaptive Quiz</h1>
                <p className="text-muted-foreground">Choose your topics and start learning!</p>
            </div>

            {/* Class Selection */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Icon name="GraduationCap" size={24} />
                    Select Class
                </h2>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {classes.map(cls => (
                        <button
                            key={cls.id}
                            onClick={() => setSelectedClass(cls.id)}
                            className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                                selectedClass === cls.id
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-card text-card-foreground border-border hover:bg-muted/50'
                            }`}
                        >
                            {cls.name}
                        </button>
                    ))}
                </div>
                {!selectedClass && (
                    <p className="text-sm text-muted-foreground">Please select a class to continue</p>
                )}
            </div>

            {/* Subject Selection */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Icon name="BookOpen" size={24} />
                    Select Subject
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {availableSubjects.map(subject => (
                        <button
                            key={subject.id}
                            onClick={() => setSelectedSubject(subject.id)}
                            disabled={!selectedClass}
                            className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                                !selectedClass 
                                    ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground border-border'
                                    : selectedSubject === subject.id
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-card text-card-foreground border-border hover:bg-muted/50'
                            }`}
                        >
                            <Icon name={subject.icon || "BookOpen"} size={24} />
                            <span className="text-sm font-medium">{subject.name}</span>
                        </button>
                    ))}
                </div>
                {!selectedSubject && selectedClass && (
                    <p className="text-sm text-muted-foreground">Please select a subject to continue</p>
                )}
            </div>

            {/* Topic Selection */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Icon name="Target" size={24} />
                        Select Topics
                        {selectedTopics.length > 0 && (
                            <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-sm">
                                {selectedTopics.length} selected
                            </span>
                        )}
                    </h2>
                    {availableTopics.length > 0 && (
                        <div className="flex gap-2">
                            <button
                                onClick={handleSelectAllTopics}
                                className="text-sm px-3 py-1 rounded border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                                Select All
                            </button>
                            <button
                                onClick={handleClearAllTopics}
                                className="text-sm px-3 py-1 rounded border border-border text-muted-foreground hover:bg-muted transition-colors"
                            >
                                Clear All
                            </button>
                        </div>
                    )}
                </div>
                
                {!selectedClass || !selectedSubject ? (
                    <div className="text-center py-8 border border-dashed border-border rounded-lg">
                        <Icon name="Target" size={48} className="mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Select class and subject first to see available topics</p>
                    </div>
                ) : loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading topics...</p>
                    </div>
                ) : availableTopics.length === 0 ? (
                    <div className="text-center py-8">
                        <Icon name="AlertCircle" size={48} className="mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground mb-2">No topics found for {selectedSubject}</p>
                        <p className="text-sm text-muted-foreground">Check your CSV file has questions for this subject</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {availableTopics.map(topic => {
                            const isSelected = selectedTopics.includes(topic.id);
                            return (
                                <button
                                    key={topic.id}
                                    onClick={() => handleTopicToggle(topic.id)}
                                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-center relative ${
                                        isSelected
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-card text-card-foreground border-border hover:bg-muted/50'
                                    }`}
                                >
                                    {isSelected && (
                                        <div className="absolute top-2 right-2">
                                            <Icon name="Check" size={16} className="text-primary-foreground" />
                                        </div>
                                    )}
                                    <h3 className="font-medium pr-6">{topic.name}</h3>
                                </button>
                            );
                        })}
                    </div>
                )}
                {selectedClass && selectedSubject && selectedTopics.length === 0 && availableTopics.length > 0 && (
                    <p className="text-sm text-muted-foreground">Please select at least one topic to continue</p>
                )}
            </div>

            {/* Difficulty Selection */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Icon name="Zap" size={24} />
                    Select Difficulty
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {difficulties.map(difficulty => (
                        <button
                            key={difficulty.id}
                            onClick={() => setSelectedDifficulty(difficulty.id)}
                            disabled={selectedTopics.length === 0}
                            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                                selectedTopics.length === 0
                                    ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground border-border'
                                    : selectedDifficulty === difficulty.id
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-card text-card-foreground border-border hover:bg-muted/50'
                            }`}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">{difficulty.name}</span>
                                <span className={`text-sm ${difficulty.color}`}>
                                    {difficulty.xpMultiplier}x XP
                                </span>
                            </div>
                            <p className="text-sm opacity-75">{difficulty.description}</p>
                        </button>
                    ))}
                </div>
                {selectedTopics.length > 0 && !selectedDifficulty && (
                    <p className="text-sm text-muted-foreground">Please select a difficulty level to continue</p>
                )}
            </div>

            {/* Quiz Preview */}
            {selectedClass && selectedSubject && selectedTopics.length > 0 && selectedDifficulty && (
                <div className="bg-card rounded-lg p-6 border">
                    <h3 className="text-lg font-semibold mb-4">Quiz Preview</h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <span className="text-sm text-muted-foreground">Class:</span>
                            <p className="font-medium">{selectedClass}</p>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground">Subject:</span>
                            <p className="font-medium">{selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)}</p>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground">Topics:</span>
                            <div className="font-medium">
                                {selectedTopicsData.map(topic => (
                                    <span key={topic.id} className="inline-block bg-muted px-2 py-1 rounded text-xs mr-1 mb-1">
                                        {topic.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground">Difficulty:</span>
                            <p className="font-medium">{selectedDifficultyData.name}</p>
                        </div>
                    </div>
                    
                    <Button 
                        onClick={handleStartQuiz}
                        className="w-full"
                        size="lg"
                    >
                        Start Quiz ({selectedTopics.length} topic{selectedTopics.length > 1 ? 's' : ''})
                    </Button>
                </div>
            )}

            {(!selectedClass || !selectedSubject || selectedTopics.length === 0 || !selectedDifficulty) && (
                <div className="text-center py-8 border border-dashed border-border rounded-lg">
                    <Icon name="Target" size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Complete all selections above to start your quiz</p>
                    <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                        <p className={selectedClass ? 'text-green-600' : ''}>
                            {selectedClass ? '✓' : '○'} Class selected
                        </p>
                        <p className={selectedSubject ? 'text-green-600' : ''}>
                            {selectedSubject ? '✓' : '○'} Subject selected
                        </p>
                        <p className={selectedTopics.length > 0 ? 'text-green-600' : ''}>
                            {selectedTopics.length > 0 ? '✓' : '○'} Topic{selectedTopics.length > 1 ? 's' : ''} selected ({selectedTopics.length})
                        </p>
                        <p className={selectedDifficulty ? 'text-green-600' : ''}>
                            {selectedDifficulty ? '✓' : '○'} Difficulty selected
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TopicSelector;
