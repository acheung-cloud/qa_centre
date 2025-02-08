import {
  type ClientSchema,
  a,
  defineData,
  defineFunction
} from '@aws-amplify/backend';

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/

const schema = a.schema({

  Status: a.enum(['active', 'inactive']),
  QAStatus: a.enum(['opened', 'closed', 'cleared']),
  
  Entity: a.model({
    status: a.ref('Status'),
    groups: a.hasMany('Group', 'entityId'),    
    name: a.string(),
    createdBy: a.string(),
    modifiedBy: a.string(),
  }),

  Group: a.model({
    status: a.ref('Status'),
    entityId: a.string(),
    entity: a.belongsTo('Entity', 'entityId'),
    sessions: a.hasMany('Session', 'groupId'),
    participants: a.hasMany('Participant', 'groupId'),
    name: a.string(),
    description: a.string(),
    createdBy: a.string(),
    modifiedBy: a.string(),
  }),

  Session: a.model({
    status: a.ref('Status'),
    group: a.belongsTo('Group', 'groupId'),
    questions: a.hasMany('Question', 'sessionId'),
    sessionScores: a.hasMany('SessionScore', 'sessionId'),
    responseLogs: a.hasMany('ResponseLog', 'sessionId'),
    entityId: a.string(),
    groupId: a.string(),
    name: a.string(),
    description: a.string(),
    createdBy: a.string(),
    modifiedBy: a.string(),
  }),

  Question: a.model({
    status: a.ref('Status'),
    session: a.belongsTo('Session', 'sessionId'),
    ansOptions: a.hasMany('AnsOption', 'questionId'),
    responseLogs: a.hasMany('ResponseLog', 'questionId'),
    entityId: a.string(),
    groupId: a.string(),
    sessionId: a.string(),
    question: a.string(),
    remark: a.string(),
    score: a.integer(),
    duration: a.integer(),
    order: a.integer(),
    createdBy: a.string(),
    modifiedBy: a.string(),
  }),

  AnsOption: a.model({
    status: a.ref('Status'),
    entityId: a.string(),
    question: a.belongsTo('Question', 'questionId'),
    groupId: a.string(),
    sessionId: a.string(),
    questionId: a.string(),
    ansOption: a.string(),
    correct: a.string(),
    createdBy: a.string(),
    modifiedBy: a.string(),
  }),

  QACurrent: a.model({
    qaStatus: a.ref('QAStatus'),
    entityId: a.string(),
    groupId: a.string().required(),
    sessionId: a.string().required(),
    questionId: a.string().required(),
    qa: a.string().required(),  // For storing the QA JSON object
    score: a.integer().required(),
    duration: a.integer().required(),
    modifiedBy: a.string().required(),
  })
  .identifier(['groupId']),

  User: a.model({
    status: a.ref('Status'),
    participants: a.hasMany('Participant', 'userId'),
    name: a.string(),
    email: a.string(),
    loginDT: a.datetime(),
    modifiedBy: a.string(),
    modifiedAt: a.datetime(),
  }),

  Participant: a.model({
    status: a.ref('Status'),
    user: a.belongsTo('User', 'userId'),
    group: a.belongsTo('Group', 'groupId'),
    responseLogs: a.hasMany('ResponseLog', 'participantId'),
    sessionScores: a.hasMany('SessionScore', 'participantId'),
    entityId: a.string(),
    groupId: a.string(),
    userId: a.string(),
    email: a.string(),
    registerDT: a.datetime(),
    loginDT: a.datetime(),
    createdBy: a.string(),
    modifiedBy: a.string(),
  }),

  ResponseLog: a.model({
    question: a.belongsTo('Question', 'questionId'),
    session: a.belongsTo('Session', 'sessionId'),
    participant: a.belongsTo('Participant', 'participantId'),
    entityId: a.string(),
    groupId: a.string(),
    sessionId: a.string(),
    userId: a.string(),
    participantId: a.string(),
    email: a.string(),
    questionId: a.string(),
    responseTime: a.integer(),
    correctPercent: a.integer(),
    score: a.integer(),
    scoreMax: a.integer(),
    qaRecord: a.string(),
  }),

  SessionScore: a.model({
    participant: a.belongsTo('Participant', 'participantId'),
    session: a.belongsTo('Session', 'sessionId'),
    entityId: a.string(),
    groupId: a.string(),
    sessionId: a.string(),
    participantId: a.string(),
    email: a.string(),
    score: a.integer(),
  }),

  QALog: a.model({
    entityId: a.string(),
    groupId: a.string(),
    sessionId: a.string(),
    questionId: a.string(),
    groupName: a.string(),
    sessionName: a.string(),
    sectionDescription: a.string(),
    question: a.string(),
    beginDT: a.datetime(),
    endDT: a.datetime(),
    partiTotal: a.integer(),
    partiResNum: a.integer(),
  }),

  OpLog: a.model({
    entityId: a.string(),
    category: a.string(),
    opCode: a.integer(),
    opDesc: a.string(),
  }),

}).authorization((allow) => [allow.authenticated(), allow.publicApiKey()]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
      description: "API key for public access"
    }
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
