import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from "primeng/fileupload"; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ButtonModule, FileUploadModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Gestion des distinctions FFTA';

  onUpload(event: any) {
    console.log("uploaded");
    for (let file of event.files) {
      console.log(file);
    }
  }
}
