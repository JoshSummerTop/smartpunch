<?php

namespace Tests\Unit\Enums;

use App\Enums\Trade;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class TradeTest extends TestCase
{
    #[Test]
    public function it_has_fourteen_cases(): void
    {
        $this->assertCount(14, Trade::cases());
    }

    #[Test]
    public function it_has_correct_values(): void
    {
        $expected = [
            'Electrical' => 'electrical',
            'Plumbing' => 'plumbing',
            'Hvac' => 'hvac',
            'Drywall' => 'drywall',
            'Painting' => 'painting',
            'Flooring' => 'flooring',
            'Carpentry' => 'carpentry',
            'Roofing' => 'roofing',
            'Concrete' => 'concrete',
            'Glazing' => 'glazing',
            'Landscaping' => 'landscaping',
            'FireProtection' => 'fire_protection',
            'Insulation' => 'insulation',
            'General' => 'general',
        ];

        foreach ($expected as $caseName => $value) {
            $case = constant("App\Enums\Trade::{$caseName}");
            $this->assertSame($value, $case->value, "Trade::{$caseName} should have value '{$value}'");
        }
    }

    #[Test]
    public function it_returns_correct_labels(): void
    {
        $expected = [
            ['trade' => Trade::Electrical, 'label' => 'Electrical'],
            ['trade' => Trade::Plumbing, 'label' => 'Plumbing'],
            ['trade' => Trade::Hvac, 'label' => 'HVAC'],
            ['trade' => Trade::Drywall, 'label' => 'Drywall'],
            ['trade' => Trade::Painting, 'label' => 'Painting'],
            ['trade' => Trade::Flooring, 'label' => 'Flooring'],
            ['trade' => Trade::Carpentry, 'label' => 'Carpentry'],
            ['trade' => Trade::Roofing, 'label' => 'Roofing'],
            ['trade' => Trade::Concrete, 'label' => 'Concrete'],
            ['trade' => Trade::Glazing, 'label' => 'Glazing'],
            ['trade' => Trade::Landscaping, 'label' => 'Landscaping'],
            ['trade' => Trade::FireProtection, 'label' => 'Fire Protection'],
            ['trade' => Trade::Insulation, 'label' => 'Insulation'],
            ['trade' => Trade::General, 'label' => 'General'],
        ];

        foreach ($expected as $item) {
            $this->assertSame($item['label'], $item['trade']->label(), "{$item['trade']->name} should have label '{$item['label']}'");
        }
    }
}
