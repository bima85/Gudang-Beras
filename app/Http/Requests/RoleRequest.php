<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;

class RoleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'selectedPermission' => 'required|array',
            'selectedPermission.*' => 'exists:permissions,id',
        ];
    }

    /**
     * Log validation failures for debugging during development.
     */
    protected function failedValidation(Validator $validator)
    {
        try {
            $debugPath = storage_path('logs/role_request_failed_validation.log');
            $data = [
                'timestamp' => now()->toDateTimeString(),
                'input' => $this->all(),
                'errors' => $validator->errors()->toArray(),
            ];
            file_put_contents($debugPath, print_r($data, true));
        } catch (\Throwable $e) {
            // ignore write errors
        }

        parent::failedValidation($validator);
    }
}
