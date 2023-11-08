export type timerType = {
  test_id: string;
  user_id: string;
};

export const testSessions = new Map<timerType, Date>();

console.log(testSessions);
