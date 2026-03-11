export interface Skill<TInput = string, TOutput = string> {
  name: string;
  description: string;
  execute(input: TInput): Promise<TOutput> | TOutput;
}
