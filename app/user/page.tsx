'use client';

import { useEffect, useState } from "react";
// Amplify Libraries
import { generateClient } from "aws-amplify/api";
import type { Schema } from "@/amplify/data/resource";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";
// Models
import ProfileEditModel from '../components/ProfileEditModel';
// Server components
import { handleSubmitAnswerSrv } from "./actions";

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
  const [subQaCur, setSubQaCur] = useState<any>(null);
  const [selAnsId, setSelAnsId] = useState<number | null>(null);
  const [selAnsOptionId, setSelAnsOptionId] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<QAData["AnsOptions"]>([]);
  const [participants, setParticipants] = useState<Array<Schema["Participant"]["type"]> | null>(null);
  const [selGroupId, setSelGroupId] = useState<string>("");
  const [selParticipantId, setSelParticipantId] = useState<string>("");
  const [loginUserEmail, setLoginUserEmail] = useState<string>("");
  const [loginUserId, setLoginUserId] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<Schema["User"]["type"] | null>(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [participantGroups, setParticipantGroups] = useState<Map<string, Schema["Group"]["type"]>>(new Map());
  const [joinBtnLabel, setJoinBtnLabel] = useState("Join Now");



  // Page start
  useEffect(() => {
    // Fetch user and participants
    fetchUserAndParticipants();
  }, []);

  useEffect(() => {
    return () => {
      unsubscribeResponseLog();
    };
  }, []);

  useEffect(() => {
    if (subQaCur === null) {
      setJoinBtnLabel('Join Now');
    } else {
      setJoinBtnLabel('Leave');
    }
  }, [subQaCur]);

  useEffect(() => {
    if (currentQA?.qaStatus === 'cleared') {
      setErrorMessage(null);
      setIsSubmitted(false);
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

  useEffect(() => {
    // new update of Participants
    if (participants !== null && participants.length > 0) {
      handleGroupSelByParti(participants[0].id)
    } else {
      handleGroupSelByParti('');
    }
  }, [participants]);

  // Fetch user and participants
  const fetchUserAndParticipants = async () => {
    try {
      const userId = (await getCurrentUser()).userId;
      const { tokens } = await fetchAuthSession();
      const email = tokens?.idToken?.payload?.email as string;
      setLoginUserId(userId);
      setLoginUserEmail(email);

      const { data: userData, errors: userErrors } = await client.models.User.get({
        id: userId
      });

      if (userErrors) {
        console.error("Error fetching user:", userErrors);
        return;
      }

      setCurrentUser(userData);


      if (!userData || !userData.name) {
        // Show name input modal if user hasn't set their name
        setShowProfileEdit(true);
      }
      else {
        // Fetch participants with their groups
        const { data: participantsData, errors: participantErrors } = await userData.participants();
        if (participantErrors) {
          console.error("Error fetching participants:", participantErrors);
          return;
        }

        // Fetch group information for each participant
        const groupsMap = new Map();
        if (participantsData) {
          for (const participant of participantsData) {
            const { data: groupData, errors: groupErrors } = await participant.group();
            if (groupErrors) {
              console.error("Error fetching group:", groupErrors);
              continue;
            }
            if (groupData) {
              groupsMap.set(participant.id, groupData);
            }
          }
          setParticipantGroups(groupsMap);
          setParticipants(participantsData);

        }
      }
    } catch (error) {
      console.error("Error in fetchUserAndParticipants:", error);
    }
  };

  const unsubscribeResponseLog = () => {
    // Unsubscribe from previous subscription
    if (subQaCur) {
      subQaCur.unsubscribe();
      setSubQaCur(null);
    }
  };

  const subscribeToQACurrent = () => {
    const groupId = selGroupId;
    if (!groupId || groupId === '') return;
    // Unsubscribe from previous subscription
    unsubscribeResponseLog();
    // Subscribe to QACurrent changes
    console.log("Subscribing to QACurrent changes. Group ID:", groupId);
    const curSub = client.models.QACurrent.observeQuery({
      filter: { groupId: { eq: groupId } }
    }).subscribe({
      next: ({ items }) => {
        if (items && items.length > 0) {
          const qaCurrent = items[0];
          setCurrentQA(items[0]); // Take the first item as current QA
        } else {
          setCurrentQA(null);
        }
      },
      error: (error) => console.error('Subscription error:', error)
    });
    setSubQaCur(curSub);
  };


  const handleAnswerSelect = (index: number) => {
    setSelAnsId(index);
    setSelAnsOptionId(shuffledOptions[index].ansOptionId);
    console.log("Selected answer options: ", shuffledOptions);
    console.log("Selected answer option idx: ", index);
  };


  const handleSubmit = async () => {
    if (selAnsId === null) return;
    setIsSubmitted(true);
    setErrorMessage(null);
    const selAnsOptionIds = [selAnsOptionId];

    const qaData = currentQA?.qa ? JSON.parse(currentQA.qa) as QAData : undefined;

    try {
      const { success, data, errors } = await handleSubmitAnswerSrv({
        groupId: selGroupId,
        participantId: selParticipantId,
        qaRecord: JSON.stringify(qaData),
        selAnsOptionIds: selAnsOptionIds
      });
      if (errors) {
        setErrorMessage("Not accepted: " + errors.join(', '));
        setIsSubmitted(false);
      }
    } catch (error) {
      console.error("Error in handleSubmit", error);
      setErrorMessage("An error occurred while submitting your answer");
      setIsSubmitted(false);
    }
  };

  const handleGroupSelByParti = (participantId: string) => {
    if (participantId) {
      const groupId = participantGroups.get(participantId)?.id ?? "";
      setSelGroupId(groupId);
      setSelParticipantId(participantId);
    }
  }

  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Hey, {currentUser?.name}</h1>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        <div className="py-4">
          {/* Participant Selection Dropdown */}
          <div className="flex items-center space-x-2 mb-4">
            <select
              id="participant"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={selParticipantId}
              disabled={subQaCur !== null || participants === null || participants.length === 0}
              onChange={(e) => {
                const participantId = e.target.value;
                handleGroupSelByParti(participantId);
              }}
            >
              {participants !== null && participants.length > 0 &&
               participants.map((participant) => (
                <option key={participant.id} value={participant.id}>
                  {participantGroups.get(participant.id)?.name || 'Loading...'}
                </option>
              ))}
              {participants !== null && participants.length === 0 && (
                <option value="" className="text-red-500">No registered courses</option>
              )}
              {participants === null && (
                <option value="" className="text-gray-500">Loading...</option>
              )}
            </select>
            <button
              type="button"
              disabled={selParticipantId === ''}
              className="px-4 w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => {
                if (subQaCur === null) {
                  subscribeToQACurrent();
                } else {
                  unsubscribeResponseLog();
                }
              }}
            >
              {joinBtnLabel}
            </button>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="space-y-6">
              {currentQA ? (
                currentQA.qaStatus === 'opened' ? (
                  <>
                    {/* Question */}
                    <div>
                      <h2 className="text-xl font-medium text-gray-900 mb-2">
                        {JSON.parse(currentQA.qa)?.Question || "No question available"}
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
                      disabled={isSubmitted || selAnsId === null || errorMessage !== null}
                    >
                      Submit
                    </button>

                    {/* Error Message */}
                    {errorMessage && (
                      <div className="mt-2 text-sm text-red-600">
                        {errorMessage}
                      </div>
                    )}
                  </>

                ) : currentQA?.qaStatus ?? 'stopped' === 'stopped' ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Result page will be displayed here</p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">{subQaCur !== null?'Waiting for new question ...':'Join a group to start the QA'}</p>
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">{subQaCur !== null?'Waiting for new question ...':'Join a group to start the QA'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {showProfileEdit && (
        <ProfileEditModel
          userId={loginUserId}
          email={loginUserEmail}
          onComplete={() => {
            setShowProfileEdit(false);
            // Refresh user data
            fetchUserAndParticipants();
          }}
        />
      )}
    </div>
  );
}
