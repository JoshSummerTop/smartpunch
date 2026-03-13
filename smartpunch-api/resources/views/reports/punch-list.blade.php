<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Punch List Report - {{ $project->name }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #333; margin: 20px; }
        h1 { color: #1E3A5F; font-size: 20px; border-bottom: 2px solid #1E3A5F; padding-bottom: 8px; }
        h2 { color: #1E3A5F; font-size: 14px; margin-top: 20px; }
        .header { margin-bottom: 20px; }
        .meta { color: #666; margin-bottom: 4px; }
        .stats { display: flex; margin: 15px 0; }
        .stat-box { background: #f0f4f8; padding: 10px; margin-right: 10px; border-radius: 4px; text-align: center; width: 120px; display: inline-block; }
        .stat-value { font-size: 22px; font-weight: bold; color: #1E3A5F; }
        .stat-label { font-size: 9px; color: #666; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10px; }
        th { background: #1E3A5F; color: white; padding: 6px 8px; text-align: left; }
        td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; }
        tr:nth-child(even) { background: #f8fafc; }
        .badge { padding: 2px 6px; border-radius: 3px; font-size: 9px; font-weight: bold; color: white; }
        .severity-critical { background: #DC2626; }
        .severity-major { background: #EA580C; }
        .severity-minor { background: #EAB308; color: #333; }
        .severity-cosmetic { background: #3B82F6; }
        .status-open { background: #DC2626; }
        .status-in_progress { background: #F59E0B; color: #333; }
        .status-resolved { background: #16A34A; }
        .status-verified { background: #166534; }
        .footer { margin-top: 30px; text-align: center; color: #999; font-size: 9px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Punch List Report</h1>
        <div class="meta"><strong>Project:</strong> {{ $project->name }}</div>
        <div class="meta"><strong>Address:</strong> {{ $project->address ?? 'N/A' }}</div>
        <div class="meta"><strong>Client:</strong> {{ $project->client_name ?? 'N/A' }}</div>
        <div class="meta"><strong>Target Completion:</strong> {{ $project->target_completion_date?->format('F j, Y') ?? 'N/A' }}</div>
        <div class="meta"><strong>Generated:</strong> {{ $generatedAt }}</div>
    </div>

    <div class="stats">
        <div class="stat-box">
            <div class="stat-value">{{ $items->count() }}</div>
            <div class="stat-label">Total Items</div>
        </div>
        <div class="stat-box">
            <div class="stat-value">{{ $items->where('status', \App\Enums\PunchItemStatus::Open)->count() }}</div>
            <div class="stat-label">Open</div>
        </div>
        <div class="stat-box">
            <div class="stat-value">{{ $items->whereIn('status', [\App\Enums\PunchItemStatus::Resolved, \App\Enums\PunchItemStatus::Verified])->count() }}</div>
            <div class="stat-label">Resolved</div>
        </div>
        <div class="stat-box">
            @php
                $total = $items->count();
                $resolved = $items->whereIn('status', [\App\Enums\PunchItemStatus::Resolved, \App\Enums\PunchItemStatus::Verified])->count();
                $pct = $total > 0 ? round(($resolved / $total) * 100, 1) : 0;
            @endphp
            <div class="stat-value">{{ $pct }}%</div>
            <div class="stat-label">Complete</div>
        </div>
    </div>

    <h2>All Punch Items</h2>
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Description</th>
                <th>Location</th>
                <th>Trade</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Assigned To</th>
            </tr>
        </thead>
        <tbody>
            @foreach($items as $item)
            <tr>
                <td>{{ $item->item_number }}</td>
                <td>{{ $item->description }}</td>
                <td>{{ $item->location ?? '-' }}</td>
                <td>{{ $item->trade->label() }}</td>
                <td><span class="badge severity-{{ $item->severity->value }}">{{ $item->severity->label() }}</span></td>
                <td><span class="badge status-{{ $item->status->value }}">{{ $item->status->label() }}</span></td>
                <td>{{ $item->assigned_to ?? '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        SmartPunch — AI-Powered Punch List Management | Generated {{ $generatedAt }}
    </div>
</body>
</html>
