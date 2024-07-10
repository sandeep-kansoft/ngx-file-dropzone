import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import {  Ng2DropzoneChangeEvent, Ng2FileDropzoneComponent, Ng2FileDropzoneService } from 'ng2-file-dropzone';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, Ng2FileDropzoneComponent],
  providers: [Ng2FileDropzoneComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ngx-file-dropzone';
  filesList:  any[] = [];
  constructor(private ng2service : Ng2FileDropzoneService, private  sanitizer: DomSanitizer){}
  getFileList(event: Ng2DropzoneChangeEvent){
   if(event.addedFiles && event.addedFiles.length){
    event.addedFiles.forEach((file)=>{
      let extensionType = this.getFileExtension(file.name);
      if(extensionType == 'image' || extensionType ==  'pdf' ){ 
        this.ng2service.readFile(file).then(img => setTimeout(() =>{
          this.filesList.push({...file, previewURL: img, extension: extensionType})
        }))
        .catch(err => console.error(err));
      }
      else if(extensionType == 'video'){
        const videoSrc = URL.createObjectURL(file);
        const sanitizedVideoSrc = this.sanitizer.bypassSecurityTrustUrl(videoSrc);
        this.filesList.push({...file, previewURL: sanitizedVideoSrc, extension: extensionType})
      }
      else{
        this.filesList.push({...file, previewURL: '', extension: extensionType})
      }
    })
   } 
  }
  
  getFileExtension(filename: string): string {
    let imageExtensions: Array<string> = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'];
    let videoExtensions: Array<string>  = ['mp4', 'webm', 'ogg', 'avi', 'mov'];
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    if (imageExtensions.includes(extension)) {
      return 'image';
    } else if (videoExtensions.includes(extension)) {
      return 'video';
    } else if (extension === 'pdf') {
      return 'pdf';
    } else if (extension === 'csv') {
      return 'csv';
    } else {
      return 'unsupported';
    }
  }
}
