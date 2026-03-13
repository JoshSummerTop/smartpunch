<?php

namespace App\Enums;

/**
 * Status of an individual punch list item, with state-machine transitions.
 *
 * Allowed transitions form a directed graph:
 *   Open -> InProgress | Resolved
 *   InProgress -> Open | Resolved
 *   Resolved -> InProgress | Verified
 *   Verified -> Resolved
 */
enum PunchItemStatus: string
{
    case Open = 'open';
    case InProgress = 'in_progress';
    case Resolved = 'resolved';
    case Verified = 'verified';

    /**
     * Get the human-readable label for this status.
     *
     * @return string
     */
    public function label(): string
    {
        return match($this) {
            self::Open => 'Open',
            self::InProgress => 'In Progress',
            self::Resolved => 'Resolved',
            self::Verified => 'Verified',
        };
    }

    /**
     * Get the statuses this status is allowed to transition to.
     *
     * @return list<self>
     */
    public function allowedTransitions(): array
    {
        return match($this) {
            self::Open => [self::InProgress, self::Resolved],
            self::InProgress => [self::Open, self::Resolved],
            self::Resolved => [self::InProgress, self::Verified],
            self::Verified => [self::Resolved],
        };
    }

    /**
     * Check whether transitioning to the given status is permitted.
     *
     * @param self $status The target status to transition to.
     * @return bool
     */
    public function canTransitionTo(self $status): bool
    {
        return in_array($status, $this->allowedTransitions());
    }
}
