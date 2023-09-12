export class Category {
  category: string;
  difficulty: string;
  words: string[];

  constructor(category: string, difficulty: string, words: string[]) {
    this.category = category;
    this.difficulty = difficulty;
    this.words = words;
  }
}
