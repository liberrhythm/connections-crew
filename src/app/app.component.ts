import { Component } from '@angular/core';

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
  puzzleListFile = '/connections-crew/assets/puzzle-list-file.json';

  // local env
  // puzzleListFile = '/assets/puzzle-list-file.json';

  ngOnInit() {
    fetch(this.puzzleListFile).then(res => res.json())
      .then(json => {
        this.puzzleFiles = json;
        console.log(this.puzzleFiles);
      });
  }

}
