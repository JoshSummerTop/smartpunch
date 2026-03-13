<?php

namespace App\Enums;

/**
 * Severity level of a punch list deficiency.
 *
 * Ordered from most to least urgent: Critical, Major, Minor, Cosmetic.
 */
enum Severity: string
{
    case Critical = 'critical';
    case Major = 'major';
    case Minor = 'minor';
    case Cosmetic = 'cosmetic';

    /**
     * Get the human-readable label for this severity level.
     *
     * @return string
     */
    public function label(): string
    {
        return match($this) {
            self::Critical => 'Critical',
            self::Major => 'Major',
            self::Minor => 'Minor',
            self::Cosmetic => 'Cosmetic',
        };
    }
}
