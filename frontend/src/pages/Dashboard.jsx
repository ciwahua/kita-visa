import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import documentData from "../data/documentContract.json";

import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/layout/Sidebar";

import OverviewHeader from "../components/dashboard/OverviewHeader";
import ProgressTracker from "../components/dashboard/ProgressTracker";
import TaskCard from "../components/dashboard/TaskCard";
import VisaChat from "../components/dashboard/VisaChat";

import { analyzeTextGapsWithAI } from "../services/aiService";

// =====================
// Helpers (task engine)
// =====================
const generateTaskTitle = (field) => {
  const titles = {
    passportNumber:      "Upload Passport",
    admissionLetter:     "Upload Admission Letter",
    financialProof:      "Upload Financial Proof",
    accommodationProof:  "Upload Accommodation Proof",
    employmentOffer:     "Upload Employment Offer Letter",
    workContract:        "Upload Work Contract",
    companyDetails:      "Upload Company Registration",
    employerDetails:     "Upload Employer Details",
    workPermit:          "Upload Work Permit",
    proofOfRelationship: "Upload Proof of Relationship",
    sponsorVisa:         "Upload Sponsor's Visa",
    returnTicket:        "Upload Return Ticket",
    healthInsurance:     "Upload Health Insurance",
    offerType:           "Clarify Offer Type",
    otherDocuments:      "Upload Supporting Document"
  };
  return titles[field] || `Upload ${field}`;
};

const generateTasksFromGaps = (gaps = []) => {
  if (!Array.isArray(gaps)) return [];
  return gaps.map((gap, index) => ({
    id: `T${index + 1}`,
    title: generateTaskTitle(gap.field),
    description: gap.message,
    linkedGap: gap.field,
    status: gap.status || "pending",
    type: gap.field === "offerType" ? "input" : undefined
  }));
};

// =====================
// Dashboard
// =====================
export default function Dashboard() {
  const location = useLocation();
  const aiData = location.state;
  const [gaps, setGaps] = useState(
    aiData?.gaps || documentData?.gaps || []
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dashboardInput, setDashboardInput] = useState("");

  const tasks = generateTasksFromGaps(gaps);

  const completedTasks = tasks.filter(
    (t) => t.status === "completed"
  ).length;

  const progress =
    tasks.length === 0
      ? 0
      : Math.round((completedTasks / tasks.length) * 100);

  const handleDashboardAnalyze = async () => {
    if (!dashboardInput) {
      console.warn("No input for analysis");
      return;
    }

    try {
      setIsAnalyzing(true);
      const res = await analyzeTextGapsWithAI(dashboardInput);
      setGaps(res?.gaps || []);
      setDashboardInput("");
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div>
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar />

        <main className="dashboard-main">

          <OverviewHeader data={documentData} />


          <div className="dashboard-grid">

            {/* LEFT */}
            <div className="left-panel">
                <ProgressTracker tasks={tasks} progress={progress} />
                <br/>
                <VisaChat />
            </div>

            {/* RIGHT */}
            <div className="right-panel">

              <div className="section-title">
                <h2>Action Required</h2>
                <p>Complete these tasks to proceed with your application</p>
              </div>

              <TaskCard
              tasks={tasks}
              gaps={gaps}
              setGaps={setGaps}
              visaType={aiData?.recommendation?.[0]}
              input={aiData?.input}
            />

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}