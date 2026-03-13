import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a success notification', () => {
    service.success('Operation succeeded');
    const notifications = service.notifications();
    expect(notifications.length).toBe(1);
    expect(notifications[0].type).toBe('success');
    expect(notifications[0].message).toBe('Operation succeeded');
  });

  it('should add an error notification', () => {
    service.error('Something went wrong');
    const notifications = service.notifications();
    expect(notifications.length).toBe(1);
    expect(notifications[0].type).toBe('error');
    expect(notifications[0].message).toBe('Something went wrong');
  });

  it('should add an info notification', () => {
    service.info('FYI');
    const notifications = service.notifications();
    expect(notifications.length).toBe(1);
    expect(notifications[0].type).toBe('info');
    expect(notifications[0].message).toBe('FYI');
  });

  it('should add a warning notification', () => {
    service.warning('Be careful');
    const notifications = service.notifications();
    expect(notifications.length).toBe(1);
    expect(notifications[0].type).toBe('warning');
    expect(notifications[0].message).toBe('Be careful');
  });

  it('should assign unique incrementing IDs', () => {
    service.success('First');
    service.error('Second');
    const notifications = service.notifications();
    expect(notifications[0].id).toBe(0);
    expect(notifications[1].id).toBe(1);
  });

  it('should auto-dismiss after 5 seconds', fakeAsync(() => {
    service.success('Will vanish');
    expect(service.notifications().length).toBe(1);

    tick(4999);
    expect(service.notifications().length).toBe(1);

    tick(1);
    expect(service.notifications().length).toBe(0);
  }));

  it('should auto-dismiss multiple notifications independently', fakeAsync(() => {
    service.success('First');
    tick(2000);
    service.error('Second');

    expect(service.notifications().length).toBe(2);

    tick(3000); // 5s after first
    expect(service.notifications().length).toBe(1);
    expect(service.notifications()[0].message).toBe('Second');

    tick(2000); // 5s after second
    expect(service.notifications().length).toBe(0);
  }));

  it('should remove a notification by id', () => {
    service.success('First');
    service.error('Second');
    const id = service.notifications()[0].id;

    service.remove(id);

    const remaining = service.notifications();
    expect(remaining.length).toBe(1);
    expect(remaining[0].message).toBe('Second');
  });

  it('should not throw when removing a non-existent id', () => {
    service.success('Only one');
    expect(() => service.remove(999)).not.toThrow();
    expect(service.notifications().length).toBe(1);
  });
});
