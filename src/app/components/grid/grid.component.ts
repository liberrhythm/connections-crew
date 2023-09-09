import { Category } from './../../models/category.model';
import { Component } from '@angular/core';
import { Puzzle } from 'src/app/models/puzzle.model';
import { Word } from 'src/app/models/word.model';

import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent {

  currentDate: string = new Date().toISOString().slice(0, 10);
  puzzleFile: string = '';
  puzzleData: Puzzle | undefined;
  wordArray: Word[] = [];
  selectedWords: Word[] = [];
  correctCategories: Category[] = [];

  numMistakesRemaining: number = 4;
  correctAnswersSoFar: number = 0;

  constructor(private _snackBar: MatSnackBar) {}

  ngOnInit() {
    console.log(this.currentDate);

    // prod env
    // this.puzzleFile = '/connections-crew/assets/' + this.currentDate + '.json';

    // local env
    this.puzzleFile = '/assets/' + this.currentDate + '.json';

    fetch(this.puzzleFile).then(res => res.json())
      .then(json => {
        this.puzzleData = json;
        console.log(this.puzzleData);

        // this.wordArray = ([] as any[]).concat(
        //   this.puzzleData?.categories[0].words,
        //   this.puzzleData?.categories[1].words,
        //   this.puzzleData?.categories[2].words,
        //   this.puzzleData?.categories[3].words
        // );

        // clean this up
        this.puzzleData?.categories[0].words.forEach(word => {
          this.wordArray.push(new Word(word, false));
        });
        this.puzzleData?.categories[1].words.forEach(word => {
          this.wordArray.push(new Word(word, false));
        });
        this.puzzleData?.categories[2].words.forEach(word => {
          this.wordArray.push(new Word(word, false));
        });
        this.puzzleData?.categories[3].words.forEach(word => {
          this.wordArray.push(new Word(word, false));
        });

        console.log(this.wordArray);
        this.wordArray = this.shuffle(this.wordArray);
        console.log(this.wordArray);
      });
  }

  toggleTileSelected(word: Word) {
    console.log("toggling tile selected");

    if (!word.selected) {
      if (this.selectedWords.length === 4) {
        console.log("already at 4 selected words");
        console.log(this.selectedWords);
        return;
      }
      word.selected = true;
      this.selectedWords.push(word);
    }
    else {
      word.selected = false;
      this.selectedWords.forEach((item, index) => {
        if(item.word === word.word) this.selectedWords.splice(index, 1);
      });
    }

    console.log(this.selectedWords);
  }

  shuffleWords() {
    console.log("shuffling words");
    this.shuffle(this.wordArray);
  }

  deselectAllWords() {
    console.log("deselecting all words");
    this.selectedWords.forEach(word => {
      word.selected = false;
    });
    this.selectedWords = [];
    console.log(this.selectedWords);
  }

  submitAnswer() {
    let isAnswerCorrect = false;
    this.puzzleData?.categories.forEach(category => {
      let doesAnswerMatch = this.selectedWords.every(item => category.words.includes(item.word))
        && category.words.every(item => this.selectedWords.map(word => word.word).includes(item));
      if (doesAnswerMatch) {
        this.correctAnswersSoFar += 1;
        isAnswerCorrect = true;

        // add to correct categories
        this.correctCategories.push(category);
      }
      else {
        console.log("error!");
      }
    });

    console.log(this.correctCategories);

    if (!isAnswerCorrect) {
      console.log("answer is incorrect!");
      this.numMistakesRemaining -= 1;

      if (this.numMistakesRemaining === 0) {
        this._snackBar.open("You lost!", "Close", { duration: 3000, verticalPosition: 'top' });
      }
      else {
        this._snackBar.open("Answer is wrong!", "Close", { duration: 3000, verticalPosition: 'top' });
      }
    }
    else {
      console.log("answer is correct!");

      if (this.correctAnswersSoFar === 4) {
        this._snackBar.open("You won!", "Close", { duration: 3000, verticalPosition: 'top' });
      }
      else {
        this._snackBar.open("Answer is correct!", "Close", { duration: 3000, verticalPosition: 'top' });
      }

      // add to correctCategories
      this.correctCategories.push();

      // clean up selectedWords and wordArray
      this.selectedWords.forEach(item1 => {
        this.wordArray.forEach((item2, index2) => {
          if (item1.word === item2.word) this.wordArray.splice(index2, 1);
        });
      });
      this.selectedWords = [];
    }
  }

  // shuffle implementation:
  // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  shuffle(array: any[]) {
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {

      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
  }

}
