<?php

namespace App\Enums;

/**
 * Lifecycle status of a construction project.
 *
 * Three stages: active work (InProgress), awaiting final sign-off
 * (PendingVerification), and finished (Complete).
 */
enum ProjectStatus: string
{
    case InProgress = 'in_progress';
    case PendingVerification = 'pending_verification';
    case Complete = 'complete';

    /**
     * Get the human-readable label for this status.
     *
     * @return string
     */
    public function label(): string
    {
        return match($this) {
            self::InProgress => 'In Progress',
            self::PendingVerification => 'Pending Verification',
            self::Complete => 'Complete',
        };
    }
}
