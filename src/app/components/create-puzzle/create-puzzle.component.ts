import { Category } from './../../models/category.model';
import { Clipboard } from '@angular/cdk/clipboard';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-create-puzzle',
  templateUrl: './create-puzzle.component.html',
  styleUrls: ['./create-puzzle.component.scss']
})
export class CreatePuzzleComponent {

  newCategoryGroup: FormGroup = new FormGroup({
    newCategoryWords: new FormControl('', [Validators.required]),
    newCategoryName: new FormControl('', [Validators.required]),
    newCategoryDifficulty: new FormControl('', [Validators.required])
  });
  finalCategories: Category[] = [];

  hasColorBeenUsed = new Map([
    ["yellow", false],
    ["green", false],
    ["blue", false],
    ["purple", false]
  ]);

  colorToCSSColorMap = new Map();

  constructor(private _ref: ChangeDetectorRef, private _clipboard: Clipboard) {}

  ngOnInIt() {
    this.colorToCSSColorMap = new Map([
      ["yellow", "lightyellow"],
      ["green", "lightgreen"],
      ["blue", "lightblue"],
      ["purple", "thistle"]
    ]);
    this.resetNewCategory();
  }

  createFinalCategory() {
    let newCategoryWords = this.newCategoryGroup.controls["newCategoryWords"].value.split(",");
    let difficultyColor = this.newCategoryGroup.controls["newCategoryDifficulty"].value;
    let newCategoryDifficulty = this.colorToCSSColorMap.get(difficultyColor)!;
    let finalCategory: Category = new Category(
      this.newCategoryGroup.controls["newCategoryName"].value,
      newCategoryDifficulty,
      newCategoryWords
    );
    console.log(finalCategory);
    this.hasColorBeenUsed.set(difficultyColor, true);
    this.finalCategories.push(finalCategory);
    this.resetNewCategory();
  }

  resetNewCategory() {
    this.newCategoryGroup.reset();
  }

  submitPuzzle() {
    console.log("submit puzzle");
    let finalPuzzle = {
      "categories": this.finalCategories
    };
    this._clipboard.copy(JSON.stringify(finalPuzzle));
  }

}
