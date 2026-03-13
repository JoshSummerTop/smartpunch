<?php

namespace App\Http\Requests;

use App\Enums\PunchItemStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BulkStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'item_ids' => ['required', 'array', 'min:1'],
            'item_ids.*' => ['required', 'uuid', 'exists:punch_items,id'],
            'status' => ['required', Rule::enum(PunchItemStatus::class)],
        ];
    }
}
