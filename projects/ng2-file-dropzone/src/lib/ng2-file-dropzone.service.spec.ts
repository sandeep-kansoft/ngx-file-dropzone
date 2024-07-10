import { TestBed } from '@angular/core/testing';

import { Ng2FileDropzoneService } from './ng2-file-dropzone.service';

describe('Ng2FileDropzoneService', () => {
  let service: Ng2FileDropzoneService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Ng2FileDropzoneService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
