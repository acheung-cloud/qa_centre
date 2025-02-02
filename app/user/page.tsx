'use client';

import { useEffect, useState } from "react";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs);

const client = generateClient<Schema>();

interface QAData {
  Question: string;
  AnsOptions: {
    ansOption: string;
    correct: string;
  }[];
  AnsIdx: string[];
}

export default function UserDashboard() {
  const [currentQA, setCurrentQA] = useState<Schema["QACurrent"]["type"] | null>(null);
  const GROUP_ID = "3c31dd6f-93f5-4ea1-9fda-065fabcf14d3";

  useEffect(() => {
    // Subscribe to QACurrent changes
    const sub = client.models.QACurrent.observeQuery({
      filter: { groupId: { eq: GROUP_ID } }
    }).subscribe({
      next: ({ items }) => {
        if (items && items.length > 0) {
          setCurrentQA(items[0]); // Take the first item as current QA
        } else {
          setCurrentQA(null);
        }
      },
      error: (error) => console.error('Subscription error:', error)
    });

    return () => {
      // Cleanup subscription on component unmount
      sub.unsubscribe();
    };
  }, []);

  const qaData = currentQA?.qa ? JSON.parse(currentQA.qa) as QAData : undefined;

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome to QA Centre</h1>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="py-4">
          {currentQA ? (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="space-y-6">
                {/* Question */}
                <div>
                  <h2 className="text-xl font-medium text-gray-900 mb-2">
                    {qaData?.Question || "No question available"}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {currentQA.duration > 0 && (
                      <span>Time Limit: {currentQA.duration}s</span>
                    )}
                    {currentQA.score > 0 && (
                      <span>Score: {currentQA.score}</span>
                    )}
                  </div>
                </div>

                {/* Answer Options */}
                <div className="space-y-3">
                  {qaData?.AnsOptions?.map((option, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        qaData.AnsIdx?.includes(index.toString())
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <p className="text-gray-900">{option.ansOption}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No active question available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
