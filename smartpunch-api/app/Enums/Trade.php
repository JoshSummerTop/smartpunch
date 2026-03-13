<?php

namespace App\Enums;

/**
 * Construction trade responsible for a punch list item.
 *
 * Covers 14 standard trades (electrical, plumbing, HVAC, etc.) plus a
 * catch-all "General" category.
 */
enum Trade: string
{
    case Electrical = 'electrical';
    case Plumbing = 'plumbing';
    case Hvac = 'hvac';
    case Drywall = 'drywall';
    case Painting = 'painting';
    case Flooring = 'flooring';
    case Carpentry = 'carpentry';
    case Roofing = 'roofing';
    case Concrete = 'concrete';
    case Glazing = 'glazing';
    case Landscaping = 'landscaping';
    case FireProtection = 'fire_protection';
    case Insulation = 'insulation';
    case General = 'general';

    /**
     * Get the human-readable label for this trade.
     *
     * @return string
     */
    public function label(): string
    {
        return match($this) {
            self::Electrical => 'Electrical',
            self::Plumbing => 'Plumbing',
            self::Hvac => 'HVAC',
            self::Drywall => 'Drywall',
            self::Painting => 'Painting',
            self::Flooring => 'Flooring',
            self::Carpentry => 'Carpentry',
            self::Roofing => 'Roofing',
            self::Concrete => 'Concrete',
            self::Glazing => 'Glazing',
            self::Landscaping => 'Landscaping',
            self::FireProtection => 'Fire Protection',
            self::Insulation => 'Insulation',
            self::General => 'General',
        };
    }
}
