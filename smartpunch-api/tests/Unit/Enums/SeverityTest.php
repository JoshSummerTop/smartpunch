<?php

namespace Tests\Unit\Enums;

use App\Enums\Severity;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class SeverityTest extends TestCase
{
    #[Test]
    public function it_has_four_cases_with_correct_values(): void
    {
        $this->assertSame('critical', Severity::Critical->value);
        $this->assertSame('major', Severity::Major->value);
        $this->assertSame('minor', Severity::Minor->value);
        $this->assertSame('cosmetic', Severity::Cosmetic->value);
        $this->assertCount(4, Severity::cases());
    }

    #[Test]
    public function it_returns_correct_labels(): void
    {
        $this->assertSame('Critical', Severity::Critical->label());
        $this->assertSame('Major', Severity::Major->label());
        $this->assertSame('Minor', Severity::Minor->label());
        $this->assertSame('Cosmetic', Severity::Cosmetic->label());
    }
}
