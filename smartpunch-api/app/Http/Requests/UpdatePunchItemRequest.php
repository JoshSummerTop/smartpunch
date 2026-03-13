<?php

namespace App\Http\Requests;

use App\Enums\Severity;
use App\Enums\Trade;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePunchItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'description' => ['sometimes', 'required', 'string', 'max:2000'],
            'location' => ['nullable', 'string', 'max:255'],
            'trade' => ['sometimes', 'required', Rule::enum(Trade::class)],
            'severity' => ['sometimes', 'required', Rule::enum(Severity::class)],
            'status' => ['sometimes', 'required', 'string'],
            'assigned_to' => ['nullable', 'string', 'max:255'],
            'suggested_action' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
