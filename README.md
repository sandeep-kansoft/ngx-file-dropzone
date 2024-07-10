# ngx-dropzone

A lightweight and highly customizable Angular dropzone component for file uploads.  
Compatible with Angular 18 LATEST.

<img src="_images/default.png">

<img src="_images/default_dropped.png">

For a demo see [DEMO](https://ngx-dropzone.stackblitz.io). And the [CODE for the demo](https://stackblitz.com/edit/ngx-dropzone).

## Install

```
$ npm install --save ng2-file-dropzone
```

## Usage


```html
<!-- in app.component.html -->
<ngx-dropzone (change)="onSelect($event)">
	<ngx-dropzone-label>Drop it, baby!</ngx-dropzone-label>
</ngx-dropzone>
```

```js
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

```

You can also use special preview components to preview images or videos:

```html
<h6>Angular drag and drop file uploader supported for v18</h6>

<div class="container mt-4">
    <div class="row py-3">
        @for(file of filesList;track file){
        <div class="col-12 col-md-6 col-lg-3 mb-3 ms-3">
            <div class="img-container">
                <ng-container [ngSwitch]="file.extension">
                    <img *ngSwitchCase="'image'" [src]="file.previewURL" alt="Image Preview" width="300">
                    <video *ngSwitchCase="'video'" controls class="video" width="280">
                        <source [src]="file.previewURL" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                    <embed *ngSwitchCase="'pdf'" [src]="file.previewURL" width="600" height="500"
                        type="application/pdf">
                    <div *ngSwitchCase="'csv'">File: {{file.name}}</div>
                    <div *ngSwitchDefault>Unsupported file type: {{file.name}}</div>
                </ng-container>
            </div>
        </div>
        }
        <div class="col-12 col-md-6 col-lg-3">
            <div class="upload-product-btn">
                <ng2-file-dropzone (change)="getFileList($event)">
                    <div class="mb-0 text-center upload-image-icon-container">
                        <div>
                            <p class="mb-0 text-center cs-product-upload-text"><span><span class="cs-upload-text">Click
                                        to upload</span> or drag and drop </span></p>
                        </div>
                    </div>
                </ng2-file-dropzone>
            </div>
        </div>
    </div>
</div>
```
## Component documentation

#### ng2-file-dropzone

This component is the actual dropzone container. It contains the label and any file previews.
It has an event listener for file drops and you can also click it to open the native file explorer for selection.

Use it as a stand-alone component `<ng2-file-dropzone></ng2-file-dropzone>` or by adding it as an attribute to a custom `div` (`<div class="custom-dropzone" ng2-file-dropzone></div>`).
It will add the classes `ngx-dz-hovered` and `ngx-dz-disabled` to its host element if necessary. You could override the styling of these effects if you like to.

This component has the following Input properties:

* `[multiple]`: Allow the selection of multiple files at once. Defaults to `true`.
* `accept`: Set the accepted file types (as for a native file element). Defaults to `'*'`. Example: `accept="image/jpeg,image/jpg,image/png,image/gif"`
* `[maxFileSize]`: Set the maximum size a single file may have, in *bytes*. Defaults to `undefined`.
* `[disabled]`: Disable any user interaction with the component. Defaults to `false`.
* `[expandable]`: Allow the dropzone container to expand vertically as the number of previewed files increases. Defaults to `false` which means that it will allow for horizontal scrolling.
* `[disableClick]`: Prevent the file selector from opening when clicking the dropzone.
* `[id], [aria-label], [aria-labelledby]`, `[aria-describedby]`: Forward the accessibility properties to the file input element.
* `[processDirectoryDrop]`: Enable extracting files from dropped directories. Defaults to `false`.

It has the following Output event:

* `(change)`: Emitted when any files were added or rejected. It returns a `NgxDropzoneChangeEvent` with the properties `source: NgxDropzoneComponent`, `addedFiles: File[]` and `rejectedFiles: RejectedFile[]`.

The `RejectedFile` extends the native File and adds an optional reason property to tell you why the file was rejected. Its value will be either `'type'` for the wrong acceptance type, `size` if it exceeds the maximum file size or `no_multiple` if multiple is set to false and more than one file is provided.

If you'd like to show the native file selector programmatically then do it as follows:

```html
<ng2-file-dropzone #drop></ng2-file-dropzone>
<button (click)="drop.showFileSelector()">Open</button>
```

This component has the following Input properties:

* `[file]`: The dropped file to preview.
* `[removable]`: Allow the user to remove files. Required to allow keyboard interaction and show the remove badge on hover.

It has the following Output event:

* `(removed)`: Emitted when the element should be removed (either by clicking the remove badge or by pressing backspace/delete keys). Returns the file from the Input property.

## Licence

[MIT Licence](https://github.com/sandeep-kansoft/ngx-file-dropzone/blob/main/LICENSE)

