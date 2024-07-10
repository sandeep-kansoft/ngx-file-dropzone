import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ng2FileDropzoneComponent } from './ng2-file-dropzone.component';

describe('Ng2FileDropzoneComponent', () => {
  let component: Ng2FileDropzoneComponent;
  let fixture: ComponentFixture<Ng2FileDropzoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ng2FileDropzoneComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Ng2FileDropzoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
