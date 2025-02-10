'use client';

import React from 'react';

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

export default InfoCard;
