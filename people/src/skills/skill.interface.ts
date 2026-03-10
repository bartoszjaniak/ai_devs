export interface Skill {
  name: string;
  description: string;
  execute(input: string): Promise<string>;
}
