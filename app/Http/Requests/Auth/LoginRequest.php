<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        return [
            // Accept a generic "login" field which can be email or username
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
            // role can be provided by the client, but allow null for test flows / legacy clients
            'role' => ['nullable', 'string', 'in:Toko,Gudang'], // Validate role
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        // Log attempt for debugging in test environments
        \Illuminate\Support\Facades\Log::info('LoginRequest::authenticate called', [
            'login' => $this->input('login'),
            'remember' => $this->boolean('remember'),
        ]);

        // Debug: log session driver and session id at the time of authenticate
        try {
            \Illuminate\Support\Facades\Log::info('LoginRequest::authenticate session debug', [
                'driver' => config('session.driver'),
                'session_id' => $this->hasSession() ? $this->session()->getId() : null,
                'session_keys' => $this->hasSession() ? array_keys($this->session()->all()) : null,
                'cookies' => isset($_COOKIE) ? array_keys($_COOKIE) : null,
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('LoginRequest::authenticate: failed to log session debug', ['error' => $e->getMessage()]);
        }


        // Try authenticating by email first (safe). If that fails, perform
        // manual lookups by name and, if present, username to avoid SQL
        // errors when the 'username' column does not exist.
        $login = $this->input('login');
        $password = $this->input('password');

        $attempt = false;

        // 1) Try the standard Laravel attempt by email
        if (Auth::attempt(['email' => $login, 'password' => $password], $this->boolean('remember'))) {
            $attempt = true;
        } else {
            // 2) Manual lookup: try name -> username (only if column exists) -> email (already tried)
            try {
                $userModel = \App\Models\User::where('name', $login)->first();

                // If not found by name, check username column existence and try
                if (! $userModel && \Illuminate\Support\Facades\Schema::hasColumn('users', 'username')) {
                    $userModel = \App\Models\User::where('username', $login)->first();
                }

                // As a last resort, try email again via manual lookup (covers case-insensitive or trimmed values)
                if (! $userModel) {
                    $userModel = \App\Models\User::where('email', $login)->first();
                }

                if ($userModel && \Illuminate\Support\Facades\Hash::check($password, $userModel->password)) {
                    Auth::login($userModel, $this->boolean('remember'));
                    $attempt = true;
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('LoginRequest::authenticate manual lookup failed', ['error' => $e->getMessage()]);
            }
        }

        \Illuminate\Support\Facades\Log::info('LoginRequest::authenticate result', ['attempt' => $attempt]);

        if (! $attempt) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'login' => trans('auth.failed'),
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        // Use the provided login (email or username) as part of throttle key
        return Str::transliterate(Str::lower($this->string('login')) . '|' . $this->ip());
    }
}
