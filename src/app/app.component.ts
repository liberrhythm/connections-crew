import { Component } from '@angular/core';

import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Connections Crew';
  puzzleFiles: any[] = [];
  selectedPuzzleFileName: string = '';

  // prod env
  puzzleListFile = environment.assetFilePath + 'puzzle-list-file.json';

  ngOnInit() {
    fetch(this.puzzleListFile).then(res => res.json())
      .then(json => {
        this.puzzleFiles = json;
        console.log(this.puzzleFiles);
      });
  }

  // navigateToCreatePuzzle() {

  // }

}
