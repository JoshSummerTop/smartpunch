import { Injectable, signal } from '@angular/core';

/**
 * Represents a single toast notification displayed to the user.
 */
export interface Notification {
  /** Auto-incrementing numeric identifier used for tracking and removal. */
  id: number;
  /** Visual style category of the notification. */
  type: 'success' | 'error' | 'info' | 'warning';
  /** Text content displayed in the toast. */
  message: string;
}

/**
 * Signal-based notification service that manages toast messages.
 * Notifications are added to a reactive signal array and automatically
 * dismissed after 5 seconds.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  /** Counter for generating unique notification IDs. */
  private nextId = 0;
  /** Reactive signal holding the current list of active notifications. */
  notifications = signal<Notification[]>([]);

  /**
   * Displays a success (green) notification.
   * @param message - The message text to display.
   */
  success(message: string): void {
    this.add('success', message);
  }

  /**
   * Displays an error (red) notification.
   * @param message - The message text to display.
   */
  error(message: string): void {
    this.add('error', message);
  }

  /**
   * Displays an informational (blue) notification.
   * @param message - The message text to display.
   */
  info(message: string): void {
    this.add('info', message);
  }

  /**
   * Displays a warning (orange) notification.
   * @param message - The message text to display.
   */
  warning(message: string): void {
    this.add('warning', message);
  }

  /**
   * Removes a notification from the list by its ID.
   * Called automatically after the auto-dismiss timeout or manually by the user.
   * @param id - The notification ID to remove.
   */
  remove(id: number): void {
    this.notifications.update(list => list.filter(n => n.id !== id));
  }

  /**
   * Internal helper that creates a notification, appends it to the signal,
   * and schedules its automatic removal after 5 seconds.
   * @param type - The notification type/style.
   * @param message - The message text to display.
   */
  private add(type: Notification['type'], message: string): void {
    const id = this.nextId++;
    this.notifications.update(list => [...list, { id, type, message }]);
    setTimeout(() => this.remove(id), 5000);
  }
}
