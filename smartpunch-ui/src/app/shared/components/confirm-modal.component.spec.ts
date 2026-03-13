import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmModalComponent } from './confirm-modal.component';

describe('ConfirmModalComponent', () => {
  let component: ConfirmModalComponent;
  let fixture: ComponentFixture<ConfirmModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be hidden when isOpen is false', () => {
    component.isOpen = false;
    fixture.detectChanges();

    const modal = fixture.nativeElement.querySelector('.fixed');
    expect(modal).toBeNull();
  });

  it('should be visible when isOpen is true', () => {
    component.isOpen = true;
    fixture.detectChanges();

    const modal = fixture.nativeElement.querySelector('.fixed');
    expect(modal).toBeTruthy();
  });

  it('should display the title', () => {
    component.isOpen = true;
    component.title = 'Delete Item';
    fixture.detectChanges();

    const heading = fixture.nativeElement.querySelector('h3');
    expect(heading.textContent?.trim()).toBe('Delete Item');
  });

  it('should display the message', () => {
    component.isOpen = true;
    component.message = 'This action cannot be undone.';
    fixture.detectChanges();

    const paragraph = fixture.nativeElement.querySelector('p');
    expect(paragraph.textContent?.trim()).toBe('This action cannot be undone.');
  });

  it('should display custom confirm button text', () => {
    component.isOpen = true;
    component.confirmText = 'Delete';
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const confirmButton = buttons[1]; // second button is confirm
    expect(confirmButton.textContent?.trim()).toBe('Delete');
  });

  it('should emit "confirmed" when confirm button is clicked', () => {
    component.isOpen = true;
    fixture.detectChanges();

    spyOn(component.confirmed, 'emit');

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const confirmButton = buttons[1];
    confirmButton.click();

    expect(component.confirmed.emit).toHaveBeenCalled();
  });

  it('should emit "cancelled" when cancel button is clicked', () => {
    component.isOpen = true;
    fixture.detectChanges();

    spyOn(component.cancelled, 'emit');

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const cancelButton = buttons[0];
    cancelButton.click();

    expect(component.cancelled.emit).toHaveBeenCalled();
  });

  it('should emit "cancelled" when backdrop overlay is clicked', () => {
    component.isOpen = true;
    fixture.detectChanges();

    spyOn(component.cancelled, 'emit');

    // The backdrop is the div with bg-black/50 class
    const backdrop = fixture.nativeElement.querySelector('.bg-black\\/50');
    backdrop.click();

    expect(component.cancelled.emit).toHaveBeenCalled();
  });

  it('should use default values for title, message, and confirmText', () => {
    expect(component.title).toBe('Confirm');
    expect(component.message).toBe('Are you sure?');
    expect(component.confirmText).toBe('Confirm');
  });
});
