import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, Output, ViewChild } from '@angular/core';
import { Ng2FileDropzoneService, RejectedFile } from './ng2-file-dropzone.service';
import { coerceBooleanProperty, coerceNumberProperty } from './ng2-file-dropzone.helper';


export interface Ng2DropzoneChangeEvent {
  source: Ng2FileDropzoneComponent;
  addedFiles: File[];
  rejectedFiles: RejectedFile[];
}

@Component({
  selector: 'ng2-file-dropzone, [ng2-file-dropzone]',
  standalone: true,
  imports: [],
  templateUrl:'./ng2-file-dropzone.component.html',
  styleUrl: './ng2-file-dropzone.component.scss'
})
export class Ng2FileDropzoneComponent {
 constructor(private ng2service: Ng2FileDropzoneService){
  console.log('loadding....', this.ng2service.title)
 }
 /** A template reference to the native file input element. */
 @ViewChild('fileInput', { static: true }) _fileInput!: ElementRef;

 /** Emitted when any files were added or rejected. */
 @Output() readonly change = new EventEmitter<Ng2DropzoneChangeEvent>();

 /** Set the accepted file types. Defaults to '*'. */
 @Input() accept = '*';

 /** Disable any user interaction with the component. */
 @Input()
 @HostBinding('class.ngx-dz-disabled')
 get disabled(): boolean {
   return this._disabled;
 }
 set disabled(value: boolean) {
   this._disabled = coerceBooleanProperty(value);

   if (this._isHovered) {
     this._isHovered = false;
   }
 }
 private _disabled = false;

 /** Allow the selection of multiple files. */
 @Input()
 get multiple(): boolean {
   return this._multiple;
 }
 set multiple(value: boolean) {
   this._multiple = coerceBooleanProperty(value);
 }
 private _multiple = true;

 /** Set the maximum size a single file may have. */
 @Input()
 get maxFileSize(): number {
   return this._maxFileSize;
 }
 set maxFileSize(value: number) {
   this._maxFileSize = coerceNumberProperty(value);
 }
 private _maxFileSize!: number;

 /** Allow the dropzone container to expand vertically. */
 @Input()
 @HostBinding('class.expandable')
 get expandable(): boolean {
   return this._expandable;
 }
 set expandable(value: boolean) {
   this._expandable = coerceBooleanProperty(value);
 }
 private _expandable: boolean = false;

 /** Open the file selector on click. */
 @Input()
 @HostBinding('class.unclickable')
 get disableClick(): boolean {
   return this._disableClick;
 }
 set disableClick(value: boolean) {
   this._disableClick = coerceBooleanProperty(value);
 }
 private _disableClick = false;

 /** Allow dropping directories. */
 @Input()
 get processDirectoryDrop(): boolean {
   return this._processDirectoryDrop;
 }
 set processDirectoryDrop(value: boolean) {
   this._processDirectoryDrop = coerceBooleanProperty(value);
 }
 private _processDirectoryDrop = false;

 /** Expose the id, aria-label, aria-labelledby and aria-describedby of the native file input for proper accessibility. */
 @Input() id!: string;
 @Input('aria-label') ariaLabel!: string;
 @Input('aria-labelledby') ariaLabelledby!: string;
 @Input('aria-describedby') ariaDescribedBy!: string;

 @HostBinding('class.ngx-dz-hovered')
 _isHovered = false;

 /** Show the native OS file explorer to select files. */
 @HostListener('click')
 _onClick() {
   if (!this.disableClick) {
     this.showFileSelector();
   }
 }

 @HostListener('dragover', ['$event'])
 _onDragOver(event : DragEvent) {
   if (this.disabled) {
     return;
   }

   this.preventDefault(event);
   this._isHovered = true;
 }

 @HostListener('dragleave')
 _onDragLeave() {
   this._isHovered = false;
 }

 @HostListener('drop', ['$event'])
 _onDrop(event: DragEvent) {
   if (this.disabled) {
     return;
   }

   this.preventDefault(event);
   this._isHovered = false;
    const dataTransfer = event.dataTransfer;
    if(dataTransfer){
   // if processDirectoryDrop is not enabled or webkitGetAsEntry is not supported we handle the drop as usual
   if (!this.processDirectoryDrop || !DataTransferItem.prototype.webkitGetAsEntry) {
    this.handleFileDrop(dataTransfer.files);

  // if processDirectoryDrop is enabled and webkitGetAsEntry is supported we can extract files from a dropped directory
  } else {
    const droppedItems = Array.from(dataTransfer.items);

    if (droppedItems.length > 0) {
      const droppedFiles: File[] = [];
      const droppedDirectories = [];

      // seperate dropped files from dropped directories for easier handling
      for (let i = 0; i < droppedItems.length; i++) {
        const entry : FileSystemEntry | null = droppedItems[i].webkitGetAsEntry();
        if (entry && entry.isFile) {
          droppedFiles.push(event.dataTransfer.files[i]);
        } else if (entry && entry.isDirectory) {
          droppedDirectories.push(entry);
        }
      }

      // create a DataTransfer
      const droppedFilesList = new DataTransfer();
      droppedFiles.forEach((droppedFile) => {
        droppedFilesList.items.add(droppedFile);
      });

      // if no directory is dropped we are done and can call handleFileDrop
      if (!droppedDirectories.length && droppedFilesList.items.length) {
        this.handleFileDrop(droppedFilesList.files);
      }

      // if directories are dropped we extract the files from these directories one-by-one and add it to droppedFilesList
      if (droppedDirectories.length) {
        const extractFilesFromDirectoryCalls = [];

        for (const droppedDirectory of droppedDirectories) {
          extractFilesFromDirectoryCalls.push(this.extractFilesFromDirectory(droppedDirectory));
        }

        // wait for all directories to be proccessed to add the extracted files afterwards
        Promise.all(extractFilesFromDirectoryCalls).then((allExtractedFiles: any[]) => {
          allExtractedFiles.reduce((a, b) => [...a, ...b]).forEach((extractedFile: File) => {
            droppedFilesList.items.add(extractedFile);
          });

          this.handleFileDrop(droppedFilesList.files);
        });
      }
    }
  }
    }

 }

 private extractFilesFromDirectory(directory : any) {
   async function getFileFromFileEntry(fileEntry: any) {
     try {
       return await new Promise((resolve, reject) => fileEntry.file(resolve, reject));
     } catch (err) {
       console.log('Error converting a fileEntry to a File: ', err);
       return err;
     }
   }

   return new Promise((resolve, reject) => {
     const files: File[] = [];

     const dirReader = directory.createReader();

     // we need this to be a recursion because of this issue: https://bugs.chromium.org/p/chromium/issues/detail?id=514087
     const readEntries = () => {
       dirReader.readEntries(async(dirItems: any) => {
         if (!dirItems.length) {
           resolve(files);
         } else {
           const fileEntries = dirItems.filter((dirItem: any) => dirItem.isFile);

           for (const fileEntry of fileEntries) {
             const file: any = await getFileFromFileEntry(fileEntry);
             files.push(file);
           }

           readEntries();
         }
       });
     };
     readEntries();
   });
 }

 showFileSelector() {
   if (!this.disabled) {
     (this._fileInput.nativeElement as HTMLInputElement).click();
   }
 }

 _onFilesSelected(event : any) {
   const files: FileList = event.target.files;
   this.handleFileDrop(files);

   // Reset the native file input element to allow selecting the same file again
   this._fileInput.nativeElement.value = '';

   // fix(#32): Prevent the default event behaviour which caused the change event to emit twice.
   this.preventDefault(event);
 }

 private handleFileDrop(files: FileList) {
   const result = this.ng2service.parseFileList(files, this.accept, this.maxFileSize, this.multiple);

   this.change.next({
     addedFiles: result.addedFiles,
     rejectedFiles: result.rejectedFiles,
     source: this
   });
 }

 private preventDefault(event: DragEvent) {
   event.preventDefault();
   event.stopPropagation();
 }
}
