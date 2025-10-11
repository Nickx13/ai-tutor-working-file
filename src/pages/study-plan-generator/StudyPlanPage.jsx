import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/ui/Header";
import BottomNavigation from "../../components/ui/BottomNavigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

const StudyPlanPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const savedPlans = JSON.parse(localStorage.getItem("studyPlans") || "[]");
    const selectedPlan = savedPlans.find((p) => p.id === id);
    setPlan(selectedPlan || null);

    if (selectedPlan) {
      // Convert plan data into calendar events
      const generatedEvents = [];

      // Example: Use today's date as a base
      const startDate = new Date();
      let currentDate = new Date(startDate);

      // Loop through subjects and create events per day
      if (selectedPlan.subjects && selectedPlan.subjects.length > 0) {
        selectedPlan.subjects.forEach((subject, i) => {
          const subjectName = subject.name || subject;
          const eventDate = new Date(currentDate);
          generatedEvents.push({
            title: `📘 ${subjectName}`,
            start: eventDate.toISOString().split("T")[0],
          });
          currentDate.setDate(currentDate.getDate() + 1); // move to next day
        });
      }

      // Add topics as events (after subjects)
      if (selectedPlan.topics && selectedPlan.topics.length > 0) {
        selectedPlan.topics.forEach((topic) => {
          const eventDate = new Date(currentDate);
          generatedEvents.push({
            title: `🧩 ${topic.topic || topic}`,
            start: eventDate.toISOString().split("T")[0],
          });
          currentDate.setDate(currentDate.getDate() + 1);
        });
      }

      setEvents(generatedEvents);
    }
  }, [id]);

  if (!plan) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Plan Not Found</h1>
        <button
          onClick={() => navigate("/study-plan-generator")}
          className="text-primary underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  const formattedDate = new Date(parseInt(plan.id)).toLocaleString();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-14 pb-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/study-plan-generator")}
                className="w-10 h-10 rounded-lg border border-border hover:bg-muted flex items-center justify-center transition-colors duration-150"
              >
                ←
              </button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Your Monthly Study Plan</h1>
                <p className="text-sm text-muted-foreground">
                  Created on {formattedDate}
                </p>
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              padding: "20px",
            }}
          >
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              height="80vh"
              events={events}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "",
              }}
              eventDisplay="block"
              eventColor="#007bff"
              eventTextColor="#fff"
            />
          </div>
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
};

export default StudyPlanPage;
