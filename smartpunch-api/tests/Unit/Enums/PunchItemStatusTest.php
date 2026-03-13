<?php

namespace Tests\Unit\Enums;

use App\Enums\PunchItemStatus;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class PunchItemStatusTest extends TestCase
{
    #[Test]
    public function it_has_four_cases_with_correct_values(): void
    {
        $this->assertSame('open', PunchItemStatus::Open->value);
        $this->assertSame('in_progress', PunchItemStatus::InProgress->value);
        $this->assertSame('resolved', PunchItemStatus::Resolved->value);
        $this->assertSame('verified', PunchItemStatus::Verified->value);
        $this->assertCount(4, PunchItemStatus::cases());
    }

    #[Test]
    public function it_returns_correct_labels(): void
    {
        $this->assertSame('Open', PunchItemStatus::Open->label());
        $this->assertSame('In Progress', PunchItemStatus::InProgress->label());
        $this->assertSame('Resolved', PunchItemStatus::Resolved->label());
        $this->assertSame('Verified', PunchItemStatus::Verified->label());
    }

    #[Test]
    public function open_allows_transitions_to_in_progress_and_resolved(): void
    {
        $allowed = PunchItemStatus::Open->allowedTransitions();

        $this->assertCount(2, $allowed);
        $this->assertContains(PunchItemStatus::InProgress, $allowed);
        $this->assertContains(PunchItemStatus::Resolved, $allowed);
    }

    #[Test]
    public function in_progress_allows_transitions_to_open_and_resolved(): void
    {
        $allowed = PunchItemStatus::InProgress->allowedTransitions();

        $this->assertCount(2, $allowed);
        $this->assertContains(PunchItemStatus::Open, $allowed);
        $this->assertContains(PunchItemStatus::Resolved, $allowed);
    }

    #[Test]
    public function resolved_allows_transitions_to_in_progress_and_verified(): void
    {
        $allowed = PunchItemStatus::Resolved->allowedTransitions();

        $this->assertCount(2, $allowed);
        $this->assertContains(PunchItemStatus::InProgress, $allowed);
        $this->assertContains(PunchItemStatus::Verified, $allowed);
    }

    #[Test]
    public function verified_allows_transition_to_resolved_only(): void
    {
        $allowed = PunchItemStatus::Verified->allowedTransitions();

        $this->assertCount(1, $allowed);
        $this->assertContains(PunchItemStatus::Resolved, $allowed);
    }

    #[Test]
    public function can_transition_to_returns_true_for_valid_transitions(): void
    {
        $this->assertTrue(PunchItemStatus::Open->canTransitionTo(PunchItemStatus::InProgress));
        $this->assertTrue(PunchItemStatus::Open->canTransitionTo(PunchItemStatus::Resolved));
        $this->assertTrue(PunchItemStatus::InProgress->canTransitionTo(PunchItemStatus::Open));
        $this->assertTrue(PunchItemStatus::InProgress->canTransitionTo(PunchItemStatus::Resolved));
        $this->assertTrue(PunchItemStatus::Resolved->canTransitionTo(PunchItemStatus::InProgress));
        $this->assertTrue(PunchItemStatus::Resolved->canTransitionTo(PunchItemStatus::Verified));
        $this->assertTrue(PunchItemStatus::Verified->canTransitionTo(PunchItemStatus::Resolved));
    }

    #[Test]
    public function can_transition_to_returns_false_for_invalid_transitions(): void
    {
        $this->assertFalse(PunchItemStatus::Open->canTransitionTo(PunchItemStatus::Verified));
        $this->assertFalse(PunchItemStatus::Open->canTransitionTo(PunchItemStatus::Open));
        $this->assertFalse(PunchItemStatus::InProgress->canTransitionTo(PunchItemStatus::InProgress));
        $this->assertFalse(PunchItemStatus::InProgress->canTransitionTo(PunchItemStatus::Verified));
        $this->assertFalse(PunchItemStatus::Resolved->canTransitionTo(PunchItemStatus::Open));
        $this->assertFalse(PunchItemStatus::Resolved->canTransitionTo(PunchItemStatus::Resolved));
        $this->assertFalse(PunchItemStatus::Verified->canTransitionTo(PunchItemStatus::Open));
        $this->assertFalse(PunchItemStatus::Verified->canTransitionTo(PunchItemStatus::InProgress));
        $this->assertFalse(PunchItemStatus::Verified->canTransitionTo(PunchItemStatus::Verified));
    }
}
