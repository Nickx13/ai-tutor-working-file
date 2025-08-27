import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const StudyPlanPage = () => {
  const { id } = useParams(); // get the plan ID from URL
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    const savedPlans = JSON.parse(localStorage.getItem('studyPlans') || '[]');
    const currentPlan = savedPlans.find(p => p.id === id);
    setPlan(currentPlan);
  }, [id]);

  if (!plan) return <p className="text-center mt-10">Plan not found.</p>;

  return (
    <div className="min-h-screen bg-background p-6">
      <h1 className="text-2xl font-bold mb-4">Study Plan: {plan.name || "Untitled"}</h1>

      <div className="space-y-4">
        <div>
          <strong>Subjects:</strong> {plan.parameters?.subjects.map(s => s.name).join(", ")}
        </div>
        <div>
          <strong>Topics:</strong> {plan.parameters?.topics.map(t => t.topic || t.name).join(", ")}
        </div>
        <div>
          <strong>Time Slots:</strong> {plan.parameters?.availableSlots.map(s => `${s.day} ${s.start}-${s.end}`).join(", ")}
        </div>
        <div>
          <strong>Session Length:</strong> {plan.parameters?.sessionLength} mins
        </div>
        <div>
          <strong>Break Duration:</strong> {plan.parameters?.breakDuration} mins
        </div>
        <div>
          <strong>Study Mode:</strong> {plan.parameters?.studyMode}
        </div>
      </div>

      {/* You can also display the scheduled sessions */}
      <h2 className="text-xl font-semibold mt-6">Scheduled Sessions</h2>
      <ul className="list-disc ml-6 mt-2">
        {plan.schedule?.map((session, idx) => (
          <li key={idx}>
            {session.subject?.name} - {session.topic?.topic || session.topic?.name} on {new Date(session.date).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudyPlanPage;
