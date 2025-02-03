// src/components/admin/AdminFeatures.tsx
import React from "react";
import CompetitionForm from "./competition-form";
import CompetitionDisplay from "./competition-display";
import BetForm from "./bet-form";
import BetDisplay from "./bet-display";
import PriceFeedDisplay from "./price-feed-display";
import { ErrorBoundary } from "../common/error-boundary";
import PoolDisplay from "./pool-display";

const AdminFeatures: React.FC = () => {
  return (
    <div className="p-4 bg-white">
      <h1 className="text-2xl font-bold mb-4">Admin Features</h1>

      <div className="grid gap-4">
        <ErrorBoundary>
          <div className="border p-4 bg-gray-50">
            <PriceFeedDisplay />
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="border p-4 bg-gray-50">
            <CompetitionForm />
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="border p-4 bg-gray-50">
            <CompetitionDisplay />
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="border p-4 bg-gray-50">
            <BetForm />
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="border p-4 bg-gray-50">
            <BetDisplay />
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="border p-4 bg-gray-50">
            <PoolDisplay />
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default AdminFeatures;