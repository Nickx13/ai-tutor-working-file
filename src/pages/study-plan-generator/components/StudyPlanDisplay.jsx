import React from 'react';
import { useStudyPlan } from '../StudyPlanContext';
import Button from '../../../components/ui/Button';

export default function StudyPlanDisplay() {
  const { plan, completeSession } = useStudyPlan();

  if (!plan) return null;

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const toggleCompletion = (sessionId) => {
    completeSession(sessionId);
  };

  const getSessionTypeClass = (type) => {
    if (type === 'new') return 'bg-blue-100 text-blue-800';
    if (type === 'review') return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">📖 Your Study Plan</h2>

      <div className="space-y-4 max-h-[500px] overflow-y-auto">
        {plan.schedule.map((day, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2">{formatDate(day.date)}</h3>

            {day.sessions.length === 0 ? (
              <p className="text-gray-500 text-sm">No sessions scheduled</p>
            ) : (
              <div className="space-y-2">
                {day.sessions.map(session => (
                  <div
                    key={session.topic + session.subject + session.type}
                    className={`flex items-center justify-between p-3 rounded border ${
                      session.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={session.completed || false}
                        onChange={() => toggleCompletion(session.id)}
                        className="mr-3 h-4 w-4 text-blue-600 rounded"
                        disabled={session.completed}
                      />
                      <div>
                        <span className="font-medium">
                          {session.subject}: {session.topic}
                        </span>
                        <span
                          className={`ml-2 text-xs px-2 py-0.5 rounded ${getSessionTypeClass(session.type)}`}
                        >
                          {session.type === 'new' ? 'New Topic' : 'Review'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
