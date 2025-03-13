import { Component, Injectable } from '@angular/core';
import { FileUploadModule } from 'primeng/fileupload';

@Component({
  selector: 'app-results-upload',
  imports: [FileUploadModule],
  templateUrl: './results-upload.component.html',
  styleUrl: './results-upload.component.scss'
})
@Injectable({
  providedIn: 'root',
})
export class ResultsUploadComponent {

}
