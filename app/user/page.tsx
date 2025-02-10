'use client';

import { useEffect, useState } from "react";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";

import { handleSubmitAnswerSrv } from "../components/UserSubmitHandlers";

Amplify.configure(outputs);

const client = generateClient<Schema>();

interface QAData {
  Question: string;
  AnsOptions: {
    ansOption: string;
    ansOptionId: string;
  }[];
  AnsIdx: string[];
}

export default function UserDashboard() {

  const [currentQA, setCurrentQA] = useState<Schema["QACurrent"]["type"] | null>(null);
  const [selAnsId, setSelAnsId] = useState<number | null>(null);
  const [selAnsOptionId, setSelAnsOptionId] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<QAData["AnsOptions"]>([]);

  useEffect(() => {
    // Subscribe to QACurrent changes
    const groupId = process.env.NEXT_PUBLIC_GROUP_ID ?? "";
    console.log("Subscribing to QACurrent changes. Group ID:", groupId);
    const sub = client.models.QACurrent.observeQuery({
      filter: { groupId: { eq: groupId } }
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

  useEffect(() => {
    if (currentQA?.qaStatus === 'cleared') {
      setCurrentQA(null);
    }
  }, [currentQA]);

  useEffect(() => {
    if (currentQA?.qa) {
      const qaData = JSON.parse(currentQA.qa) as QAData;
      const shuffled = [...qaData.AnsOptions].sort(() => Math.random() - 0.5);
      setShuffledOptions(shuffled);
    } else {
      setShuffledOptions([]);
    }
  }, [currentQA]);

  const qaData = currentQA?.qa ? JSON.parse(currentQA.qa) as QAData : undefined;

  const handleAnswerSelect = (index: number) => {
    setSelAnsId(index);
    setSelAnsOptionId(shuffledOptions[index].ansOptionId);
    console.log("Selected answer options: ", shuffledOptions);
    console.log("Selected answer option idx: ", index);
  };


  const handleSubmit = async () => {
    if (selAnsId === null || !qaData) return;
    setIsSubmitted(true);
    setErrorMessage(null);
    const selAnsOptionIds = [selAnsOptionId];
    
    try {
      const { success, data, errors } = await handleSubmitAnswerSrv({
        groupId: process.env.LISTEN_GROUP_ID ?? "",
        participantId: 'Participant1',
        qaRecord: JSON.stringify(qaData),
        selAnsOptionIds: selAnsOptionIds
      });
      if (errors) {
        setErrorMessage("Response not accepted. You've already responded to this question");
        setIsSubmitted(false);
      }
    } catch (error) {
      console.error("Error in handleSubmit", error);
      setErrorMessage("An error occurred while submitting your answer");
      setIsSubmitted(false);
    }
  };

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome to QA Centre</h1>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="py-4">
          {currentQA ? (
            currentQA.qaStatus === 'opened' ? (
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
                    {shuffledOptions.map((option, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border cursor-pointer ${selAnsId === index
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                          } ${isSubmitted ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => !isSubmitted && handleAnswerSelect(index)}
                      >
                        <p className="text-gray-900">{option.ansOption}</p>
                      </div>
                    ))}
                  </div>

                  {/* Submit Button */}
                  <button
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSubmit}
                    disabled={isSubmitted || selAnsId === null}
                  >
                    Submit
                  </button>
                  
                  {/* Error Message */}
                  {errorMessage && (
                    <div className="mt-2 text-sm text-red-600">
                      {errorMessage}
                    </div>
                  )}
                </div>
              </div>
            ) : currentQA?.qaStatus ?? 'stopped' === 'stopped' ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Result page will be displayed here</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No active question available</p>
              </div>
            )
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
