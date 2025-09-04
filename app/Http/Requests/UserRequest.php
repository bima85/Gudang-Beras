<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserRequest extends FormRequest
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
     */
    public function rules(): array
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
        ];

        // Jika create, password wajib. Jika update, password opsional.
        if ($this->isMethod('post')) {
            $rules['password'] = ['required', 'string', 'min:6'];
        } elseif ($this->isMethod('put') || $this->isMethod('patch')) {
            $rules['password'] = ['nullable', 'string', 'min:6'];
        }

        // Role/permission
        $rules['selectedRoles'] = ['required', 'array'];

        return $rules;
    }
}
