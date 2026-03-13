import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PhotoUploadComponent } from './photo-upload.component';

describe('PhotoUploadComponent', () => {
  let component: PhotoUploadComponent;
  let fixture: ComponentFixture<PhotoUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoUploadComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the desktop drag-and-drop upload area', () => {
    const dropZone = fixture.nativeElement.querySelector('.border-dashed');
    expect(dropZone).toBeTruthy();
  });

  it('should render file inputs that accept only images', () => {
    const inputs: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll('input[type="file"]');
    expect(inputs.length).toBe(2); // camera + gallery
    inputs.forEach(input => {
      expect(input.accept).toBe('image/jpeg,image/png,image/webp');
    });
  });

  it('should not process non-image files', () => {
    spyOn(component.photoSelected, 'emit');

    const nonImageFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    // Call processFile via onFileSelected
    const mockEvent = { target: { files: [nonImageFile] } } as unknown as Event;
    component.onFileSelected(mockEvent);

    // Since processFile rejects non-images, nothing should be emitted synchronously
    expect(component.photoSelected.emit).not.toHaveBeenCalled();
  });

  it('should not process files larger than 10MB', () => {
    spyOn(component.photoSelected, 'emit');

    // Create a file object that reports > 10MB
    const largeFile = new File(['x'], 'big.jpg', { type: 'image/jpeg' });
    Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 });

    const mockEvent = { target: { files: [largeFile] } } as unknown as Event;
    component.onFileSelected(mockEvent);

    expect(component.photoSelected.emit).not.toHaveBeenCalled();
  });

  it('should emit photoSelected with base64 data on valid image file', fakeAsync(() => {
    let emittedValue: any = null;
    component.photoSelected.subscribe((val: any) => emittedValue = val);

    const base64Content = 'data:image/png;base64,iVBORw0KGgoAAAANS';
    const validFile = new File(['pixels'], 'photo.png', { type: 'image/png' });

    // Mock FileReader
    const mockReader = {
      result: base64Content,
      readAsDataURL: function(_file: File) {
        // Simulate async load
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      },
      onload: null as any
    };
    spyOn(window as any, 'FileReader').and.returnValue(mockReader);

    const mockEvent = { target: { files: [validFile] } } as unknown as Event;
    component.onFileSelected(mockEvent);

    tick(1);

    expect(emittedValue).toBeTruthy();
    expect(emittedValue.base64).toBe('iVBORw0KGgoAAAANS');
    expect(emittedValue.mimeType).toBe('image/png');
    expect(emittedValue.preview).toBe(base64Content);
  }));

  it('should set preview signal after valid file upload', fakeAsync(() => {
    const base64Content = 'data:image/jpeg;base64,/9j/4AAQ';
    const validFile = new File(['pixels'], 'photo.jpg', { type: 'image/jpeg' });

    const mockReader = {
      result: base64Content,
      readAsDataURL: function(_file: File) {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      },
      onload: null as any
    };
    spyOn(window as any, 'FileReader').and.returnValue(mockReader);

    const mockEvent = { target: { files: [validFile] } } as unknown as Event;
    component.onFileSelected(mockEvent);

    tick(1);

    expect(component.preview()).toBe(base64Content);
  }));

  it('should show preview image and hide upload area when preview is set', () => {
    component.preview.set('data:image/png;base64,abc');
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('img');
    expect(img).toBeTruthy();
    expect(img.src).toContain('data:image/png;base64,abc');

    const dropZone = fixture.nativeElement.querySelector('.border-dashed');
    expect(dropZone).toBeNull();
  });

  it('should clear preview when clear button is clicked', () => {
    component.preview.set('data:image/png;base64,abc');
    fixture.detectChanges();

    const clearButton = fixture.nativeElement.querySelector('button');
    clearButton.click();
    fixture.detectChanges();

    expect(component.preview()).toBeNull();
    // Upload area should be back
    const dropZone = fixture.nativeElement.querySelector('.border-dashed');
    expect(dropZone).toBeTruthy();
  });

  it('should set isDragging on dragover and reset on dragleave', () => {
    const event = new DragEvent('dragover');
    spyOn(event, 'preventDefault');

    component.onDragOver(event);
    expect(component.isDragging()).toBeTrue();

    const leaveEvent = new DragEvent('dragleave');
    spyOn(leaveEvent, 'preventDefault');

    component.onDragLeave(leaveEvent);
    expect(component.isDragging()).toBeFalse();
  });
});
