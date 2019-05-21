const slackMessage = require('./slack_message');

const actionsWithExamples = [
  {
    short: true,
    value: 'who is remote',
  },
  {
    short: true,
    value: 'who is sick',
  },
  {
    short: true,
    value: 'who is on vacation',
  },
];

test('Do we have any examples of Actions', () => {
  expect(slackMessage.actionExamples()).toEqual(actionsWithExamples);
});

test('Do we have properties required for Slack', () => {
  const action = slackMessage.actionExamples();
  expect(action[0].short).toBe(true);
});
