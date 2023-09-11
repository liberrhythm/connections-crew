import { Component, Input } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { Puzzle } from './../../models/puzzle.model';
import { Word } from './../../models/word.model';
import { Category } from './../../models/category.model';

import { MatSnackBar } from '@angular/material/snack-bar';

import { intersection } from 'lodash';

import { environment } from '../../../environment/environment';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent {

  @Input() puzzleFileName: string = '';

  puzzleData: Puzzle | undefined;
  wordArray: Word[] = [];
  selectedWords: Word[] = [];

  guessedCategories: Word[][] = [];
  correctCategories: Category[] = [];

  numMistakesRemaining: number = 4;
  correctAnswersSoFar: number = 0;

  randomSeed: number = 0.6268806904199931; // to be fixed

  colorToEmojiUnicode = {
    "yellow": "&#129000",
    "green": "&#129001",
    "blue": "&#128998",
    "purple": "&#129002"
  };

  colorToEmojiUnicodeMap = new Map([
    ["lightyellow", "🟨"],
    ["lightgreen", "🟩"],
    ["lightblue", "🟦"],
    ["thistle", "🟪"]
  ])

  constructor(private _snackBar: MatSnackBar, private _clipboard: Clipboard) {}

  ngOnChanges() {
    this.puzzleFileName = environment.assetFilePath + this.puzzleFileName;

    fetch(this.puzzleFileName).then(res => res.json())
      .then(json => {
        this.puzzleData = json;

        // reset all data for new puzzle
        this.wordArray = [];
        this.selectedWords = [];
        this.correctCategories = [];
        this.numMistakesRemaining = 4;
        this.correctAnswersSoFar = 0;

        // TODO: clean this up
        this.puzzleData?.categories[0].words.forEach(word => {
          this.wordArray.push(new Word(word, this.puzzleData?.categories[0].difficulty!, false));
        });
        this.puzzleData?.categories[1].words.forEach(word => {
          this.wordArray.push(new Word(word, this.puzzleData?.categories[1].difficulty!, false));
        });
        this.puzzleData?.categories[2].words.forEach(word => {
          this.wordArray.push(new Word(word, this.puzzleData?.categories[2].difficulty!, false));
        });
        this.puzzleData?.categories[3].words.forEach(word => {
          this.wordArray.push(new Word(word, this.puzzleData?.categories[3].difficulty!, false));
        });

        console.log("original");
        console.log(this.wordArray);
        // this.wordArray = this.shuffle(this.wordArray, 0.2521);
        // console.log(this.wordArray);

        console.log("fisher yates");
        this.wordArray = this.fisherYatesShuffle(this.wordArray);
        console.log(this.wordArray);
      });
  }

  toggleTileSelected(word: Word) {
    console.log("toggling tile selected");

    if (!word.selected) {
      if (this.selectedWords.length === 4) {
        console.log("already at 4 selected words");
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
  }

  shuffleWords() {
    console.log("shuffling words");
    // this.wordArray = this.shuffle(this.wordArray, Math.random());
    this.wordArray = this.fisherYatesShuffle(this.wordArray);
  }

  deselectAllWords() {
    console.log("deselecting all words");
    this.selectedWords.forEach(word => {
      word.selected = false;
    });
    this.selectedWords = [];
  }

  submitAnswer() {
    let isAnswerCorrect = false;
    let isAnswerClose = false;

    let currentlySelectedWordsOnly = this.selectedWords.map(word => word.word);
    this.guessedCategories.push(this.selectedWords);
    console.log(this.guessedCategories);

    this.puzzleData?.categories.forEach(category => {
      let categoryIntersection = intersection(currentlySelectedWordsOnly, category.words);

      if (categoryIntersection.length === 4) { // answer is correct
        this.correctAnswersSoFar += 1;
        isAnswerCorrect = true;

        // add to correct categories
        this.correctCategories.push(category);
      }
      else if (categoryIntersection.length === 3) { // answer is close
        console.log("error!");
        isAnswerClose = true;
      }
      else { // answer is not close
        console.log("error!");
      }
    });

    if (!isAnswerCorrect) {
      console.log("answer is incorrect!");
      this.numMistakesRemaining -= 1;

      if (this.numMistakesRemaining === 0) {
        this._snackBar.open("You lost!", "Close", { duration: 3000, verticalPosition: 'top' });
      }
      else if (isAnswerClose) {
        this._snackBar.open("Answer is one away!", "Close", { duration: 3000, verticalPosition: 'top' });
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

      // clean up selectedWords and wordArray
      this.selectedWords.forEach(item1 => {
        this.wordArray.forEach((item2, index2) => {
          if (item1.word === item2.word) this.wordArray.splice(index2, 1);
        });
      });
      this.selectedWords = [];
    }
  }

  formatGuessedCategories() {
    let guessedCategoriesStr = '';
    this.guessedCategories.forEach(guess => {
      guess.forEach(word => {
        // guessedCategoriesStr += this.colorToEmojiUnicode[word.difficulty as keyof typeof this.colorToEmojiUnicode];
        guessedCategoriesStr += this.colorToEmojiUnicodeMap.get(word.difficulty);
      })
      guessedCategoriesStr += '\n';
    });
    return guessedCategoriesStr;
  }

  copyGuessedCategoriesToClipboard() {
    let guessedCategoriesStr = this.formatGuessedCategories();
    console.log(guessedCategoriesStr);
    this._clipboard.copy(guessedCategoriesStr);
  }

  // shuffle implementation w/ seed
  // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  shuffle(array: any[], rand: number) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {

      // Pick a remaining element.
      randomIndex = Math.floor(rand * currentIndex);
      console.log(randomIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
  }

  // shuffle
  // https://bost.ocks.org/mike/shuffle/
  fisherYatesShuffle(array: any[]) {
    var copy = [], n = array.length, i;

    // While there remain elements to shuffle…
    while (n) {

      // Pick a remaining element…
      i = Math.floor(Math.random() * n--);

      // And move it to the new array.
      copy.push(array.splice(i, 1)[0]);
    }

    return copy;
  }

  // random(seed: number) {
  //   var x = Math.sin(seed++) * 10000;
  //   return x - Math.floor(x);
  // }

}
