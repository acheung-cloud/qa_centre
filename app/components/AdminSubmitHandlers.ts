'use server';
// use for server actions
import { AuthGetCurrentUserServer, cookiesClient } from "@/utils/amplify-utils";

export const handleQACurrentOpen = async (input: {
    entityId: string;
    groupId: string;
    sessionId: string;
    questionId: string;
    qa: object;
    score: number;
    duration: number;
}): Promise<{ success: boolean; data?: any; errors?: any }> => {
    const user = await AuthGetCurrentUserServer();
    const { data: responseLogs } = await cookiesClient.models.ResponseLog.list();

    if (!user) {
        console.log('User not found');
        return { success: false, errors: 'User not found' };
    }

    const email = user.signInDetails?.loginId;
    const qaStr = JSON.stringify(input.qa);

    try {
        // QACurrent
        const { data, errors } = await cookiesClient.models.QACurrent.update({
            qaStatus: 'opened',
            entityId: input.entityId,
            groupId: input.groupId,
            sessionId: input.sessionId,
            questionId: input.questionId,
            qa: qaStr,
            score: input.score,
            duration: input.duration,
            startTime: new Date().toISOString().split('.')[0] + 'Z',
            modifiedBy: email ?? ''
        });

        if (errors) {
            console.error("Error creating QACurrent:", errors);
            return { success: false, errors };
        } else {
            console.log("QACurrent created:", data);
            return { success: true, data };
        }
    } catch (error) {
        console.log('Update failed, attempting to create QACurrent');
        const { data: newQACurrent, errors: createErrors } = await cookiesClient.models.QACurrent.create({
            qaStatus: 'opened',
            entityId: input.entityId,
            groupId: input.groupId,
            sessionId: input.sessionId,
            questionId: input.questionId,
            qa: qaStr,
            score: input.score,
            duration: input.duration,
            startTime: new Date().toISOString().split('.')[0] + 'Z',
            modifiedBy: email ?? ''
        });
        console.error("Error in handleSubmit", createErrors);
        return { success: false, errors: createErrors };
    }
};

export const handleQACurrentClose = async (input: {
    groupId: string;
}): Promise<{ success: boolean; data?: any; errors?: any }> => {
    const user = await AuthGetCurrentUserServer();
    const { data: responseLogs } = await cookiesClient.models.ResponseLog.list();

    if (!user) {
        console.log('User not found');
        return { success: false, errors: 'User not found' };
    }

    const email = user.signInDetails?.loginId;

    try {
        // QACurrent
        const { data, errors } = await cookiesClient.models.QACurrent.update({
            groupId: input.groupId,
            qaStatus: 'closed'
        });

        if (errors) {
            console.error("Error creating QACurrent:", errors);
            return { success: false, errors };
        } else {
            console.log("QACurrent created:", data);
            return { success: true, data };
        }
    } catch (error) {
        console.error("Error in handleSubmit", error);
        return { success: false, errors: error };
    }
};

export const handleQACurrentClear = async (input: {
    groupId: string;
}): Promise<{ success: boolean; data?: any; errors?: any }> => {
    const user = await AuthGetCurrentUserServer();
    const { data: responseLogs } = await cookiesClient.models.ResponseLog.list();

    if (!user) {
        console.log('User not found');
        return { success: false, errors: 'User not found' };
    }

    const email = user.signInDetails?.loginId;

    try {
        // QACurrent
        const { data, errors } = await cookiesClient.models.QACurrent.update({
            groupId: input.groupId,
            qaStatus: 'cleared'
        });

        if (errors) {
            console.error("Error creating QACurrent:", errors);
            return { success: false, errors };
        } else {
            console.log("QACurrent created:", data);
            return { success: true, data };
        }
    } catch (error) {
        console.error("Error in handleSubmit", error);
        return { success: false, errors: error };
    }
};