'use server';
// use for server actions
import { AuthGetCurrentUserServer, cookiesClient } from "@/utils/amplify-utils";

export const handleSubmitAnswerSrv = async (input: {
  groupId: string;
  participantId: string;
  qaRecord: string;
  selAnsOptionIds: string[];
}): Promise<{ success: boolean; data?: any; errors?: any }> => {
  const user = await AuthGetCurrentUserServer();

  if (!user) {
    console.log('User not found');
    return { success: false, errors: 'User not found' };
  }

  try {
    const email = user.signInDetails?.loginId;

    // Get QA Current 
    const { data: qaCurrent } = await cookiesClient.models.QACurrent.get({groupId: input.groupId});
    if (!qaCurrent) {
      console.log('QA Current not found');
      return { success: false, errors: 'QA Current not found' };
    }
    // Get the question
    const { data: question } = await cookiesClient.models.Question.get({id: qaCurrent.questionId});
    if (!question) {
      console.log('Question not found');
      return { success: false, errors: 'Question not found' };
    }
    // Get Answers
    const { data: ansOptions } = await question.ansOptions();
    if (!ansOptions) {
      console.log('Answers not found');
      return { success: false, errors: 'Answers not found' };
    }

    // Get the response time
    const startTime = new Date(qaCurrent.startTime);
    const endTime = new Date();
    const responseTimeInSec = (endTime.getTime() - startTime.getTime()) / 1000;

    // Calculate score
    const maxScore = qaCurrent.score;
    const totalCorrect = ansOptions.filter(ans => ans.correct === 'true').length;
    const correctNum = ansOptions.filter(
      ans => input.selAnsOptionIds.includes(ans.id) 
      && ans.correct === 'true'
    ).length;
    const score = (correctNum / totalCorrect) * maxScore;
    const correctPercent = (correctNum / totalCorrect) * 100;

    const { data, errors } = await cookiesClient.models.ResponseLog.create({
      entityId: qaCurrent.entityId || "",
      groupId: input.groupId,
      sessionId: qaCurrent.sessionId || "",
      questionId: qaCurrent.questionId || "",
      participantId: input.participantId || "",
      userId: user.userId,
      email: email ?? "",
      responseTime: responseTimeInSec,
      correctPercent: correctPercent,
      score: score,
      scoreMax: maxScore,
      createdBy: email,
      qaRecord: input.qaRecord,
    });

    if (errors) {
      console.error("Error creating response log:", errors);
      return { success: false, errors: errors };
    } else {
      console.log("Response log created:", data);
      return { success: true };
    }
  } catch (error) {
    console.error("Error in handleSubmit", error);
    return { success: false, errors: error };
  }
};