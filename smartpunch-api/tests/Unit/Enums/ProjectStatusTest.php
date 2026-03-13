<?php

namespace Tests\Unit\Enums;

use App\Enums\ProjectStatus;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ProjectStatusTest extends TestCase
{
    #[Test]
    public function it_has_three_cases_with_correct_values(): void
    {
        $this->assertSame('in_progress', ProjectStatus::InProgress->value);
        $this->assertSame('pending_verification', ProjectStatus::PendingVerification->value);
        $this->assertSame('complete', ProjectStatus::Complete->value);
        $this->assertCount(3, ProjectStatus::cases());
    }

    #[Test]
    public function it_returns_correct_labels(): void
    {
        $this->assertSame('In Progress', ProjectStatus::InProgress->label());
        $this->assertSame('Pending Verification', ProjectStatus::PendingVerification->label());
        $this->assertSame('Complete', ProjectStatus::Complete->label());
    }
}
