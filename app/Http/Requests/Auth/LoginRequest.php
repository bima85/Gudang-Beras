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
            'email' => ['required', 'string', 'email'],
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
            'email' => $this->input('email'),
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

        $attempt = Auth::attempt($this->only('email', 'password'), $this->boolean('remember'));

        \Illuminate\Support\Facades\Log::info('LoginRequest::authenticate result', ['attempt' => $attempt]);

        if (! $attempt) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
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
        return Str::transliterate(Str::lower($this->string('email')) . '|' . $this->ip());
    }
}
