<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AnalyzeImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'image' => ['required', 'string'],
            'mime_type' => ['required', 'string', 'in:image/jpeg,image/png,image/webp,image/gif'],
            'location' => ['nullable', 'string', 'max:255'],
        ];
    }
}
