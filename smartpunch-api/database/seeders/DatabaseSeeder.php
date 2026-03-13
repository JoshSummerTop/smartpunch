<?php

namespace Database\Seeders;

use App\Enums\ProjectStatus;
use App\Enums\PunchItemStatus;
use App\Enums\Severity;
use App\Enums\Trade;
use App\Models\ActivityLog;
use App\Models\Project;
use App\Models\PunchItem;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $projects = [
            [
                'name' => 'Riverdale Condos Phase 2',
                'address' => '450 Riverdale Ave, Toronto, ON M4J 1A5',
                'client_name' => 'Riverdale Development Corp',
                'target_completion_date' => '2026-06-15',
                'status' => ProjectStatus::InProgress,
            ],
            [
                'name' => 'Highland Park Office Renovation',
                'address' => '1200 Highland Park Blvd, Suite 300',
                'client_name' => 'HP Commercial Properties',
                'target_completion_date' => '2026-04-30',
                'status' => ProjectStatus::InProgress,
            ],
            [
                'name' => 'Cedar Heights Custom Home',
                'address' => '88 Cedar Heights Dr, Oakville, ON L6H 3R2',
                'client_name' => 'Johnson Family',
                'target_completion_date' => '2026-05-20',
                'status' => ProjectStatus::PendingVerification,
            ],
        ];

        foreach ($projects as $projectData) {
            Project::create($projectData);
        }

        $allProjects = Project::all();

        $punchItemsData = [
            // Riverdale Condos
            [
                'project_index' => 0,
                'items' => [
                    ['description' => 'Exposed wiring in Unit 4B laundry room ceiling - junction box cover missing', 'location' => 'Unit 4B - Laundry Room', 'trade' => Trade::Electrical, 'severity' => Severity::Critical, 'status' => PunchItemStatus::Open, 'suggested_action' => 'Install junction box cover and secure all exposed wiring per NEC code requirements'],
                    ['description' => 'Water stain on drywall indicating possible pipe leak behind wall', 'location' => 'Unit 3A - Master Bathroom', 'trade' => Trade::Plumbing, 'severity' => Severity::Major, 'status' => PunchItemStatus::InProgress, 'assigned_to' => 'Mike Reynolds', 'suggested_action' => 'Open wall to inspect for leak source, repair pipe if needed, replace drywall section'],
                    ['description' => 'HVAC duct not properly sealed at register boot - air leakage audible', 'location' => 'Unit 5C - Living Room', 'trade' => Trade::Hvac, 'severity' => Severity::Major, 'status' => PunchItemStatus::Open, 'suggested_action' => 'Seal duct connection at register boot with mastic sealant and verify airflow'],
                    ['description' => 'Paint touch-up needed on hallway trim - visible brush marks and color mismatch', 'location' => '3rd Floor Hallway', 'trade' => Trade::Painting, 'severity' => Severity::Cosmetic, 'status' => PunchItemStatus::Resolved, 'assigned_to' => 'Sarah Chen', 'suggested_action' => 'Sand and repaint trim with matching color using proper technique'],
                    ['description' => 'Floor tile cracked near entrance threshold - possible trip hazard', 'location' => 'Unit 2A - Entry', 'trade' => Trade::Flooring, 'severity' => Severity::Major, 'status' => PunchItemStatus::Open, 'suggested_action' => 'Remove cracked tile, prepare substrate, install matching replacement tile'],
                    ['description' => 'Cabinet door misaligned in kitchen - does not close flush', 'location' => 'Unit 4A - Kitchen', 'trade' => Trade::Carpentry, 'severity' => Severity::Minor, 'status' => PunchItemStatus::Resolved, 'assigned_to' => 'Tom Walsh', 'suggested_action' => 'Adjust cabinet hinges to align door properly'],
                    ['description' => 'Fire sprinkler head painted over during ceiling finish', 'location' => 'Unit 5A - Bedroom 2', 'trade' => Trade::FireProtection, 'severity' => Severity::Critical, 'status' => PunchItemStatus::Open, 'suggested_action' => 'Replace painted sprinkler head with new approved head - painted heads will not activate properly'],
                ],
            ],
            // Highland Park Office
            [
                'project_index' => 1,
                'items' => [
                    ['description' => 'Drywall seam visible along conference room east wall - tape and mud failing', 'location' => 'Conference Room A', 'trade' => Trade::Drywall, 'severity' => Severity::Minor, 'status' => PunchItemStatus::Open, 'suggested_action' => 'Re-tape and mud the seam, sand smooth, and repaint'],
                    ['description' => 'Electrical outlet not working in south wall - breaker trips when loaded', 'location' => 'Open Office Area - South', 'trade' => Trade::Electrical, 'severity' => Severity::Major, 'status' => PunchItemStatus::InProgress, 'assigned_to' => 'Dave Electricals Inc.', 'suggested_action' => 'Check circuit loading and wiring connections, may need dedicated circuit'],
                    ['description' => 'Carpet transition strip loose between hallway and office suite', 'location' => 'Suite 310 Entrance', 'trade' => Trade::Flooring, 'severity' => Severity::Minor, 'status' => PunchItemStatus::Verified, 'suggested_action' => 'Re-secure transition strip with appropriate fasteners'],
                    ['description' => 'Window glazing sealant cracking on north-facing windows', 'location' => 'North Office Wing', 'trade' => Trade::Glazing, 'severity' => Severity::Major, 'status' => PunchItemStatus::Open, 'suggested_action' => 'Remove old sealant, clean surfaces, apply new structural silicone sealant'],
                    ['description' => 'Concrete spalling on parking garage level 2 support column', 'location' => 'Parking Level 2 - Column C4', 'trade' => Trade::Concrete, 'severity' => Severity::Critical, 'status' => PunchItemStatus::InProgress, 'assigned_to' => 'StructureFix Ltd.', 'suggested_action' => 'Assess rebar condition, patch spalled area with structural repair mortar'],
                    ['description' => 'Insulation missing in server room wall cavity', 'location' => 'Server Room - East Wall', 'trade' => Trade::Insulation, 'severity' => Severity::Major, 'status' => PunchItemStatus::Open, 'suggested_action' => 'Install fire-rated mineral wool insulation in wall cavity'],
                ],
            ],
            // Cedar Heights Home
            [
                'project_index' => 2,
                'items' => [
                    ['description' => 'Roof flashing not properly lapped at chimney intersection', 'location' => 'Roof - Chimney Area', 'trade' => Trade::Roofing, 'severity' => Severity::Critical, 'status' => PunchItemStatus::Resolved, 'assigned_to' => 'ABC Roofing', 'suggested_action' => 'Remove and reinstall step flashing with proper overlap and counter-flashing'],
                    ['description' => 'Landscaping grade slopes toward foundation on south side', 'location' => 'South Exterior', 'trade' => Trade::Landscaping, 'severity' => Severity::Major, 'status' => PunchItemStatus::Resolved, 'suggested_action' => 'Re-grade soil to slope away from foundation at minimum 6 inches over 10 feet'],
                    ['description' => 'Interior door not latching properly in guest bedroom', 'location' => 'Guest Bedroom', 'trade' => Trade::Carpentry, 'severity' => Severity::Minor, 'status' => PunchItemStatus::Verified, 'suggested_action' => 'Adjust strike plate position to align with door latch'],
                    ['description' => 'Plumbing access panel in garage not installed', 'location' => 'Garage - West Wall', 'trade' => Trade::Plumbing, 'severity' => Severity::Minor, 'status' => PunchItemStatus::Resolved, 'suggested_action' => 'Install code-required access panel for plumbing shutoff valves'],
                    ['description' => 'Paint drips on hardwood floor near baseboard in living room', 'location' => 'Living Room', 'trade' => Trade::Painting, 'severity' => Severity::Cosmetic, 'status' => PunchItemStatus::Verified, 'suggested_action' => 'Carefully remove paint drips without damaging floor finish'],
                    ['description' => 'GFI outlet in master bath not providing ground fault protection', 'location' => 'Master Bathroom', 'trade' => Trade::Electrical, 'severity' => Severity::Critical, 'status' => PunchItemStatus::Resolved, 'assigned_to' => 'Spark Electric Co.', 'suggested_action' => 'Replace defective GFCI outlet and test protection circuit'],
                    ['description' => 'HVAC return air grille undersized for room volume', 'location' => 'Great Room', 'trade' => Trade::Hvac, 'severity' => Severity::Minor, 'status' => PunchItemStatus::Open, 'suggested_action' => 'Install larger return air grille sized per HVAC load calculation'],
                ],
            ],
        ];

        $itemCounter = [];

        foreach ($punchItemsData as $group) {
            $project = $allProjects[$group['project_index']];
            $projectId = $project->id;
            $itemCounter[$projectId] = $itemCounter[$projectId] ?? 0;

            foreach ($group['items'] as $itemData) {
                $itemCounter[$projectId]++;
                $itemNumber = 'PLI-' . str_pad($itemCounter[$projectId], 3, '0', STR_PAD_LEFT);

                $daysAgo = rand(1, 14);
                $createdAt = now()->subDays($daysAgo);

                $item = new PunchItem();
                $item->project_id = $projectId;
                $item->item_number = $itemNumber;
                $item->description = $itemData['description'];
                $item->location = $itemData['location'];
                $item->trade = $itemData['trade'];
                $item->severity = $itemData['severity'];
                $item->status = $itemData['status'];
                $item->assigned_to = $itemData['assigned_to'] ?? null;
                $item->suggested_action = $itemData['suggested_action'];
                $item->created_at = $createdAt;
                $item->updated_at = $createdAt;
                $item->saveQuietly();

                ActivityLog::create([
                    'punch_item_id' => $item->id,
                    'action' => 'created',
                    'new_value' => $item->description,
                    'performed_by' => 'System',
                    'created_at' => $createdAt,
                ]);

                if ($item->status !== PunchItemStatus::Open) {
                    $transitionDate = $createdAt->addDays(rand(1, 3));

                    if (in_array($item->status, [PunchItemStatus::InProgress, PunchItemStatus::Resolved, PunchItemStatus::Verified])) {
                        ActivityLog::create([
                            'punch_item_id' => $item->id,
                            'action' => 'status_changed',
                            'old_value' => 'open',
                            'new_value' => 'in_progress',
                            'performed_by' => $itemData['assigned_to'] ?? 'System',
                            'created_at' => $transitionDate,
                        ]);
                    }

                    if (in_array($item->status, [PunchItemStatus::Resolved, PunchItemStatus::Verified])) {
                        ActivityLog::create([
                            'punch_item_id' => $item->id,
                            'action' => 'status_changed',
                            'old_value' => 'in_progress',
                            'new_value' => 'resolved',
                            'performed_by' => $itemData['assigned_to'] ?? 'System',
                            'created_at' => $transitionDate->addDay(),
                        ]);
                    }

                    if ($item->status === PunchItemStatus::Verified) {
                        ActivityLog::create([
                            'punch_item_id' => $item->id,
                            'action' => 'status_changed',
                            'old_value' => 'resolved',
                            'new_value' => 'verified',
                            'performed_by' => 'Inspector',
                            'created_at' => $transitionDate->addDays(2),
                        ]);
                    }
                }
            }
        }
    }
}
