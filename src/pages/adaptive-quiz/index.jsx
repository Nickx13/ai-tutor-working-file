import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BottomNavigation from '../../components/ui/BottomNavigation';
import FloatingActionButton from '../../components/ui/FloatingActionButton';
import QuizHeader from './components/QuizHeader';
import TopicSelector from './components/TopicSelector';
import QuizQuestion from './components/QuizQuestion';
import QuizResults from './components/QuizResults';
import PauseModal from './components/PauseModal';
import StreakNotification from './components/StreakNotification';
import { csvQuestionService } from './services/csvQuestionService';

const AdaptiveQuiz = () => {
  const navigate = useNavigate();
  const [quizState, setQuizState] = useState('selection');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(1800);
  const [isPaused, setIsPaused] = useState(false);
  const [quizConfig, setQuizConfig] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [streakNotification, setStreakNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // Load questions when component mounts
  useEffect(() => {
    const initializeQuestions = async () => {
      try {
        setLoading(true);
        await csvQuestionService.loadQuestions();
      } catch (error) {
        console.error('Failed to load questions:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeQuestions();
  }, []);

  // Timer effect
  useEffect(() => {
    let interval;
    if (quizState === 'active' && !isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleQuizComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizState, isPaused, timeRemaining]);

  const handleStartQuiz = async (config) => {
    try {
      setLoading(true);
      
      const selectedQuestions = csvQuestionService.getQuestions({
        class: config.class,
        subject: config.subject,
        topics: config.topics, 
        difficulty: config.difficulty,
        limit: 20
      });


      if (selectedQuestions.length === 0) {
        alert('No questions found for this selection.');
        return;
      }

      setQuestions(selectedQuestions);
      setQuizConfig(config);
      setQuizState('active');
      setCurrentQuestion(0);
      setUserAnswers([]);
      setTimeRemaining(selectedQuestions.length * 120);
    } catch (error) {
      console.error('Error starting quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer) => {
    if (selectedAnswer) return;

    setSelectedAnswer(answer);
    const question = questions[currentQuestion];
    const isCorrect = answer === question.correctAnswer;

    const newAnswer = {
      questionId: question.id,
      selectedAnswer: answer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      timeSpent: (questions.length * 120) - timeRemaining,
      topic: question.topic
    };

    setUserAnswers(prev => [...prev, newAnswer]);

    setTimeout(() => {
      setShowResult(true);
      if (isCorrect) {
        const consecutiveCorrect = userAnswers.filter(a => a.isCorrect).length + 1;
        if (consecutiveCorrect > 1) {
          setStreakNotification({
            show: true,
            message: `${consecutiveCorrect} in a row! 🔥`,
            type: 'success'
          });
        }
      }
    }, 500);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = () => {
    const correctAnswers = userAnswers.filter(a => a.isCorrect).length;
    const accuracy = Math.round((correctAnswers / userAnswers.length) * 100);
    const xpEarned = Math.floor(correctAnswers * 20 * (quizConfig?.difficulty === 'hard' ? 2 : quizConfig?.difficulty === 'medium' ? 1.5 : 1));

    // Calculate topic breakdown
    const topicBreakdown = {};
    userAnswers.forEach(answer => {
      if (!topicBreakdown[answer.topic]) {
        topicBreakdown[answer.topic] = { correct: 0, total: 0 };
      }
      topicBreakdown[answer.topic].total++;
      if (answer.isCorrect) {
        topicBreakdown[answer.topic].correct++;
      }
    });

    const topicBreakdownArray = Object.entries(topicBreakdown).map(([topic, data]) => ({
      name: topic.charAt(0).toUpperCase() + topic.slice(1),
      correct: data.correct,
      total: data.total,
      accuracy: Math.round((data.correct / data.total) * 100)
    }));

    const results = {
      score: correctAnswers,
      totalQuestions: questions.length,
      correctAnswers,
      timeSpent: (questions.length * 120) - timeRemaining,
      xpEarned,
      accuracy,
      topicBreakdown: topicBreakdownArray,
      recommendations: [
        { title: "Keep Practicing", description: "Continue with more quizzes to improve your skills" }
      ],
      previousAttempts: [
        { date: "2025-01-15", score: 85, xp: 170 },
        { date: "2025-01-10", score: 70, xp: 140 }
      ],
      leaderboard: [
        { name: "Priya Sharma", score: 95, xp: 1250, isCurrentUser: false },
        { name: "Arjun Patel", score: 90, xp: 1180, isCurrentUser: false },
        { name: "You", score: accuracy, xp: xpEarned, isCurrentUser: true },
        { name: "Sneha Reddy", score: 85, xp: 1050, isCurrentUser: false },
        { name: "Rahul Kumar", score: 80, xp: 980, isCurrentUser: false }
      ]
    };

    setQuizState('results');
  };

  const handlePause = () => {
    setIsPaused(true);
    setQuizState('paused');
  };

  const handleResume = () => {
    setIsPaused(false);
    setQuizState('active');
  };

  const handleExit = () => {
    navigate('/home-dashboard');
  };

  const handleRetakeQuiz = () => {
    setQuizState('active');
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setUserAnswers([]);
    setTimeRemaining(questions.length * 120);
  };

  const handleNewQuiz = () => {
    setQuizState('selection');
    setQuizConfig(null);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setUserAnswers([]);
  };

  const closeStreakNotification = () => {
    setStreakNotification({ show: false, message: '', type: 'success' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header className="sticky top-0 z-10" />
      
      <main className="pb-20 pt-20">
        {quizState === 'selection' && (
          <TopicSelector onStartQuiz={handleStartQuiz} />
        )}

        {quizState === 'active' && questions.length > 0 && (
          <>
            <QuizHeader
              currentQuestion={currentQuestion + 1}
              totalQuestions={questions.length}
              timeRemaining={timeRemaining}
              onPause={handlePause}
              onExit={handleExit}
              isPaused={isPaused}
            />
            <QuizQuestion
              question={questions[currentQuestion]}
              onAnswer={handleAnswer}
              showResult={showResult}
              selectedAnswer={selectedAnswer}
              correctAnswer={questions[currentQuestion]?.correctAnswer}
              explanation={questions[currentQuestion]?.explanation}
              onNext={handleNextQuestion}
              isLastQuestion={currentQuestion === questions.length - 1}
            />
          </>
        )}

        {quizState === 'results' && (
          <QuizResults
            results={{
              score: userAnswers.filter(a => a.isCorrect).length,
              totalQuestions: questions.length,
              correctAnswers: userAnswers.filter(a => a.isCorrect).length,
              timeSpent: (questions.length * 120) - timeRemaining,
              xpEarned: Math.floor(userAnswers.filter(a => a.isCorrect).length * 20 * (quizConfig?.difficulty === 'hard' ? 2 : quizConfig?.difficulty === 'medium' ? 1.5 : 1)),
              accuracy: Math.round((userAnswers.filter(a => a.isCorrect).length / userAnswers.length) * 100),
              topicBreakdown: Object.entries(userAnswers.reduce((acc, answer) => {
                if (!acc[answer.topic]) acc[answer.topic] = { correct: 0, total: 0 };
                acc[answer.topic].total++;
                if (answer.isCorrect) acc[answer.topic].correct++;
                return acc;
              }, {})).map(([topic, data]) => ({
                name: topic.charAt(0).toUpperCase() + topic.slice(1),
                correct: data.correct,
                total: data.total,
                accuracy: Math.round((data.correct / data.total) * 100)
              })),
              recommendations: [{ title: "Keep Practicing", description: "Continue with more quizzes" }],
              previousAttempts: [],
              leaderboard: []
            }}
            onRetakeQuiz={handleRetakeQuiz}
            onNewQuiz={handleNewQuiz}
          />
        )}
      </main>

      <PauseModal
        isOpen={quizState === 'paused'}
        onResume={handleResume}
        onExit={handleExit}
        timeRemaining={timeRemaining}
        currentQuestion={currentQuestion + 1}
        totalQuestions={questions.length}
      />

      <StreakNotification
        show={streakNotification.show}
        message={streakNotification.message}
        type={streakNotification.type}
        onClose={closeStreakNotification}
      />

      <BottomNavigation />
    </div>
  );
};

export default AdaptiveQuiz;
