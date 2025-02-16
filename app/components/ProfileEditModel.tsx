'use client';

import { useState } from 'react';
import { generateClient } from "aws-amplify/api";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

interface NameInputModalProps {
    userId: string;
    email: string;
    onComplete: () => void;
}

export default function NameInputModal({ userId, email, onComplete }: NameInputModalProps) {
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Please enter your name');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Try to create the user first
            const { data: createdUser, errors: createErrors } = await client.models.User.create({
                id: userId,
                email: email,
                name: name.trim(),
                status: 'active',
                loginDT: new Date().toISOString()
            });

            if (createErrors) {
                // If creation fails because user exists, try updating instead
                if (createErrors[0]?.errorType === 'DynamoDB:ConditionalCheckFailedException') {
                    const { errors: updateErrors } = await client.models.User.update({
                        id: userId,
                        email: email,
                        name: name.trim(),
                        loginDT: new Date().toISOString()
                    });

                    if (updateErrors) {
                        setError('Failed to save name. Please try again.');
                        return;
                    }
                } else {
                    setError('Failed to create user. Please try again.');
                    return;
                }
            }

            onComplete();
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            setError('An unexpected error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4 text-black">Welcome! Please enter your name</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Your Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Enter your name"
                            required
                        />
                    </div>
                    {error && (
                        <div className="mb-4 text-sm text-red-600">
                            {error}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm disabled:opacity-50"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Name'}
                    </button>
                </form>
            </div>
        </div>
    );
}