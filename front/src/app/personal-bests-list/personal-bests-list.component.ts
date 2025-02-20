import { Component } from '@angular/core';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-personal-bests-list',
  imports: [TableModule],
  templateUrl: './personal-bests-list.component.html',
  styleUrl: './personal-bests-list.component.scss'
})
export class PersonalBestsListComponent {

  personalBests: any;

  ngOnInit() {
    // Get personal bests
    fetch('http://localhost:3000/archers/max-score').then((response) => {
      return response.json();
    }
    ).then((data) => {
      this.personalBests = data;
    }
    ).catch((error) => {
      console.error('Error:', error);
    }
    );  
  }
}
