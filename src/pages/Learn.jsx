import React from "react";
import LearnSection from "../components/grow/LearnSection";

export default function Learn() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-light text-white">Grow Knowledge Base</h1>
        <p className="text-white/30 text-sm mt-1">Deficiencies, environmental guides & best practices</p>
      </div>
      <LearnSection />
    </div>
  );
}