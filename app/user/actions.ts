'use server';
// use for server actions
import { AuthGetCurrentUserServer, cookiesClient } from "@/utils/amplify-utils";

export const handleSubmitAnswerSrv = async (input: {
  groupId: string;
  participantId: string;
  qaRecord: string;
  selAnsOptionIds: string[];
}): Promise<{ success: boolean; data?: any; errors?: string[] }> => {
  const user = await AuthGetCurrentUserServer();

  if (!user) {
    console.log('User not found');
    return { success: false, errors: ['User not found'] };
  }

  try {
    const email = user.signInDetails?.loginId;

    // Get QA Current 
    const { data: qaCurrent } = await cookiesClient.models.QACurrent.get({groupId: input.groupId});
    if (!qaCurrent) {
      console.log('QA Current not found');
      return { success: false, errors: ['QA Current not found'] };
    }
    // Get the question
    const { data: question, errors: getQErrors } = await cookiesClient.models.Question.get({id: qaCurrent.questionId});
    if (!question) {
      console.log('Question not found. ', getQErrors);
      return { success: false, errors: getQErrors?.map(err => err.message) };
    }
    // Get Answers
    const { data: ansOptions, errors: getAOErrors } = await question.ansOptions();
    if (!ansOptions) {
      console.log('Answers not found');
      return { success: false, errors: ['Answers not found'] };
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

    //sk1 sessionId#questionId#participantId
    const sk1 = `${qaCurrent.sessionId}#${qaCurrent.questionId}#${input.participantId}`;
    //sk2 participantId#sessionId#questionId
    const sk2 = `${input.participantId}#${qaCurrent.sessionId}#${qaCurrent.questionId}`;

    const { data, errors: createRespErrors } = await cookiesClient.models.ResponseLog.create({
      sk1: sk1,
      sk2: sk2,
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

    if (createRespErrors) {
      if (createRespErrors.length >= 1 && createRespErrors[0].errorType === 'DynamoDB:ConditionalCheckFailedException') {
        console.log('Response log already exists');
        return { success: false, errors: ['Response already exists'] };
      }
      console.error("Error creating response log:", createRespErrors);
      return { success: false, errors: createRespErrors.map(err => err.message) };
    } else {
      console.log("Response log created:", data);
      return { success: true };
    }
  } catch (error) {
    console.error("Error in handleSubmit", error);
    return { success: false, errors: ["Error catched"] };
  }
};