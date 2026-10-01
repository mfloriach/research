export type LlmAnswerInput = {
  query: string;
};

export type LlmAnswer = {
  answer: string;
  model: string;
};

export interface LlmProvider {
  generateAnswer(input: LlmAnswerInput): Promise<LlmAnswer>;
}
