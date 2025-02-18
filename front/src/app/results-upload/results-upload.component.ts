import { Component } from '@angular/core';
import { FileUploadModule } from 'primeng/fileupload';

@Component({
  selector: 'app-results-upload',
  imports: [FileUploadModule],
  templateUrl: './results-upload.component.html',
  styleUrl: './results-upload.component.scss'
})
export class ResultsUploadComponent {
  onUpload(event: any) {
    console.log("uploaded");
    for (let file of event.files) {
      console.log(file);
    }
  }

  onBeforeUpload(event: any) {
    console.log("beforeUpload");
  }

  onSend(event: any) {
    console.log("send");
  }
  
  onError(event: any) {
    console.log(event);
  }
}
