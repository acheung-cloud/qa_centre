'use client';

import { useContext, useEffect, useState } from "react";
import { AdminContext } from "./adminContext";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

interface InfoCardProps {
  title: string;
  emptyMessage: string;
  children?: React.ReactNode;
  onEdit?: () => void;
  showEdit?: boolean;
  isLoading?: boolean;
}

const InfoCard: React.FC<InfoCardProps> = ({
  title,
  emptyMessage,
  children,
  onEdit,
  showEdit,
  isLoading
}) => (
  <div className="bg-white rounded-lg shadow">
    <div className="px-4 py-5 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {showEdit && (
          <button
            onClick={onEdit}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            title={isLoading ? "Loading..." : "Edit"}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
        )}
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        children || <p className="text-sm text-gray-500">{emptyMessage}</p>
      )}
    </div>
  </div>
);

interface InfoFieldProps {
  label: string;
  value: string | null | undefined;
  fallback?: string;
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value, fallback = "No information available" }) => (
  <div>
    <h3 className="text-sm font-medium text-gray-500">{label}</h3>
    <p className="mt-1 text-sm text-gray-900">
      {value || fallback}
    </p>
  </div>
);

const Home: React.FC = () => {
  const { selectedGroupId, selectedSessionId, selectedQuestionId } = useContext(AdminContext);
  const [selectedGroup, setSelectedGroup] = useState<Schema["Group"]["type"] | null>(null);
  const [selectedSession, setSelectedSession] = useState<Schema["Session"]["type"] | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<Schema["Question"]["type"] | null>(null);
  const [selectedAnsOptions, setSelectedAnsOptions] = useState<Schema["AnsOption"]["type"][]>([]);
  const [isLoading, setIsLoading] = useState({
    group: false,
    session: false,
    question: false,
    ansOptions: false
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAnsOptionModalOpen, setIsAnsOptionModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newAnsOption, setNewAnsOption] = useState({
    ansOption: '',
    remark: '',
    correct: 'false' as 'true' | 'false'
  });
  const [editedQuestion, setEditedQuestion] = useState({
    question: '',
    remark: '',
    duration: '',
    score: ''
  });

  // Fetch group details when group ID changes
  useEffect(() => {
    async function fetchGroup() {
      if (!selectedGroupId) {
        setSelectedGroup(null);
        return;
      }
      setIsLoading(prev => ({ ...prev, group: true }));
      try {
        const { data } = await client.models.Group.get({ id: selectedGroupId });
        setSelectedGroup(data);
      } catch (error) {
        console.error('Error fetching group:', error);
        setSelectedGroup(null);
      } finally {
        setIsLoading(prev => ({ ...prev, group: false }));
      }
    }
    fetchGroup();
  }, [selectedGroupId]);

  // Fetch session details when session ID changes
  useEffect(() => {
    async function fetchSession() {
      if (!selectedSessionId) {
        setSelectedSession(null);
        return;
      }
      setIsLoading(prev => ({ ...prev, session: true }));
      try {
        const { data } = await client.models.Session.get({ id: selectedSessionId });
        setSelectedSession(data);
      } catch (error) {
        console.error('Error fetching session:', error);
        setSelectedSession(null);
      } finally {
        setIsLoading(prev => ({ ...prev, session: false }));
      }
    }
    fetchSession();
  }, [selectedSessionId]);

  // Fetch question details and answer options when question ID changes
  useEffect(() => {
    async function fetchQuestionAndOptions() {
      if (!selectedQuestionId) {
        setSelectedQuestion(null);
        setSelectedAnsOptions([]);
        return;
      }
      setIsLoading(prev => ({ ...prev, question: true, ansOptions: true }));
      try {
        const { data: question } = await client.models.Question.get({ id: selectedQuestionId });
        setSelectedQuestion(question);
        const ansOptions = await question?.ansOptions();
        setSelectedAnsOptions(ansOptions?.data ?? []);
      } catch (error) {
        console.error('Error fetching question and options:', error);
        setSelectedQuestion(null);
        setSelectedAnsOptions([]);
      } finally {
        setIsLoading(prev => ({ ...prev, question: false, ansOptions: false }));
      }
    }
    fetchQuestionAndOptions();
  }, [selectedQuestionId]);

  const handleUpdateQuestion = async () => {
    if (!selectedQuestion || isUpdating) return;

    setIsUpdating(true);
    try {
      const { data: updatedQuestion } = await client.models.Question.update({
        id: selectedQuestion.id,
        question: editedQuestion.question.trim(),
        remark: editedQuestion.remark.trim() || undefined,
        duration: editedQuestion.duration ? parseInt(editedQuestion.duration) : undefined,
        score: editedQuestion.score ? parseInt(editedQuestion.score) : undefined
      });

      if (updatedQuestion) {
        setSelectedQuestion((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            question: updatedQuestion.question,
            remark: updatedQuestion.remark,
            duration: updatedQuestion.duration,
            score: updatedQuestion.score
          };
        });
        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error('Error updating question:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateAnsOption = async () => {
    if (!selectedQuestion) return;

    setIsUpdating(true);
    try {
      const { data: createdOption } = await client.models.AnsOption.create({
        ansOption: newAnsOption.ansOption,
        remark: newAnsOption.remark,
        correct: newAnsOption.correct,
        status: 'active',
        entityId: selectedQuestion.entityId,
        groupId: selectedQuestion.groupId,
        sessionId: selectedQuestion.sessionId,
        questionId: selectedQuestion.id,
        createdBy: 'system',
        modifiedBy: 'system'
      });

      const { data: question } = await client.models.Question.get({ id: selectedQuestionId });
      setSelectedQuestion(question);
      const ansOptions = await question?.ansOptions();
      setSelectedAnsOptions(ansOptions?.data ?? []);
      setIsAnsOptionModalOpen(false);
      setNewAnsOption({ ansOption: '', remark: '', correct: 'false' });
    } catch (error) {
      console.error('Error creating answer option:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Group Information */}
      <InfoCard
        title={`${selectedGroup ? selectedGroup?.name + "'s description" : "No Group Selected"}`}
        emptyMessage="Select a group to view its information"
        showEdit={!!selectedGroup}
        isLoading={isLoading.group}
      >
        {selectedGroup && (
          <div className="space-y-2">
            <InfoField label="" value={selectedGroup.description} />
          </div>
        )}
      </InfoCard>

      {/* Session Information */}
      <InfoCard
        title={`${selectedSession ? selectedSession?.name + "'s description" : "No Session Selected"}`}
        emptyMessage="Select a session to view its information"
        showEdit={!!selectedSession}
        isLoading={isLoading.session}
      >
        {selectedSession && (
          <div className="space-y-2">
            <InfoField label="" value={selectedSession.description} />
          </div>
        )}
      </InfoCard>

      {/* Question Information */}
      {selectedQuestionId && (
        <InfoCard
          title={selectedQuestion?.question || "Loading..."}
          emptyMessage="Select a question to view its details"
          isLoading={isLoading.question || isLoading.ansOptions}
          showEdit={!!selectedQuestion}
          onEdit={() => {
            if (selectedQuestion) {
              setEditedQuestion({
                question: selectedQuestion.question || '',
                remark: selectedQuestion.remark || '',
                duration: selectedQuestion.duration ? selectedQuestion.duration.toString() : '',
                score: selectedQuestion.score ? selectedQuestion.score.toString() : ''
              });
              setIsEditModalOpen(true);
            }
          }}
        >
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              {selectedQuestion?.duration ? `${selectedQuestion.duration}s` : "No time limit"} . 
              {selectedQuestion?.score ? `Score: ${selectedQuestion.score}` : "No score set"} .
              {selectedQuestion?.remark ? 
                ` ${selectedQuestion.remark}` : 
                <span className="text-gray-400">No remark</span>
              }
            </div>

            {/* Answer Options */}
            {(
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Answer Options:</h4>
                <div className="space-y-2">
                  {selectedAnsOptions.length === 0 ? (
                    <p className="text-sm text-gray-500">No answer options available</p>
                  ) : (
                    selectedAnsOptions.map((ansOption) => (
                      <div
                        key={ansOption.id}
                        className={`p-2 rounded-md ${ansOption.correct === 'true' ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}
                      >
                        <div className="flex items-center">
                          <div className="flex-1">
                            <p className="text-sm text-black">{ansOption.ansOption}</p>
                            {ansOption.remark && (
                              <p className="text-xs text-gray-500 mt-1">{ansOption.remark}</p>
                            )}
                          </div>
                          {ansOption.correct === 'true' && (
                            <span className="text-green-600 text-xs font-medium">Correct</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <button
                  onClick={() => setIsAnsOptionModalOpen(true)}
                  className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Answer Option
                </button>
              </div>
            )}
          </div>
        </InfoCard>
      )}

      {/* Edit Question Modal */}
      {isEditModalOpen && selectedQuestion && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Question</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="question" className="block text-sm font-medium text-gray-700">
                    Question
                  </label>
                  <textarea
                    id="question"
                    value={editedQuestion.question}
                    onChange={(e) => setEditedQuestion(prev => ({ ...prev, question: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    rows={3}
                    disabled={isUpdating}
                  />
                </div>
                <div>
                  <label htmlFor="remark" className="block text-sm font-medium text-gray-700">
                    Remark
                  </label>
                  <textarea
                    id="remark"
                    value={editedQuestion.remark}
                    onChange={(e) => setEditedQuestion(prev => ({ ...prev, remark: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    rows={2}
                    disabled={isUpdating}
                  />
                </div>
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    id="duration"
                    value={editedQuestion.duration}
                    onChange={(e) => setEditedQuestion(prev => ({ ...prev, duration: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    min="0"
                    disabled={isUpdating}
                  />
                </div>
                <div>
                  <label htmlFor="score" className="block text-sm font-medium text-gray-700">
                    Score
                  </label>
                  <input
                    type="number"
                    id="score"
                    value={editedQuestion.score}
                    onChange={(e) => setEditedQuestion(prev => ({ ...prev, score: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    min="0"
                    disabled={isUpdating}
                  />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3 rounded-b-lg">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateQuestion}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                disabled={isUpdating || !editedQuestion.question.trim()}
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Answer Option Modal */}
      {isAnsOptionModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Answer Option</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Answer Option</label>
                <input
                  type="text"
                  value={newAnsOption.ansOption}
                  onChange={(e) => setNewAnsOption(prev => ({ ...prev, ansOption: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Remark</label>
                <input
                  type="text"
                  value={newAnsOption.remark}
                  onChange={(e) => setNewAnsOption(prev => ({ ...prev, remark: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newAnsOption.correct === 'true'}
                  onChange={(e) => setNewAnsOption(prev => ({ ...prev, correct: e.target.checked ? 'true' : 'false' }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">Correct Answer</label>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsAnsOptionModalOpen(false);
                  setNewAnsOption({ ansOption: '', remark: '', correct: 'false' });
                }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAnsOption}
                disabled={isUpdating || !newAnsOption.ansOption.trim()}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
