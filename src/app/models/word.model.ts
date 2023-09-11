export class Word {
  word: string;
  difficulty: string;
  selected: boolean;

  constructor(word: string, difficulty: string, selected: boolean) {
    this.word = word;
    this.difficulty = difficulty;
    this.selected = selected;
  }
}
