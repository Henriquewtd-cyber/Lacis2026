<?php

namespace App\Services;

use Illuminate\Support\Carbon;

/**
 * Token stateless: nome + expiração + assinatura HMAC, tudo em base64url,
 * sem gravar nada no banco. Validar = recalcular a assinatura e comparar.
 *
 * Formato: {payload_base64url}.{assinatura_base64url}
 */
class AdminTokenService
{
    public function generate(string $name): array
    {
        $expiresAt = now()->addMinutes((int) config('admin.token_expiration_minutes'));

        $payload = [
            'name' => $name,
            'exp' => $expiresAt->timestamp,
        ];

        $payloadEncoded = $this->base64UrlEncode(json_encode($payload));
        $signature = $this->sign($payloadEncoded);

        return [
            'token' => "{$payloadEncoded}.{$signature}",
            'expires_at' => $expiresAt,
        ];
    }

    /**
     * Retorna o payload (['name' => ..., 'exp' => ...]) se o token for
     * válido e ainda não tiver expirado, ou null caso contrário.
     */
    public function validate(?string $token): ?array
    {
        if (! $token || substr_count($token, '.') !== 1) {
            return null;
        }

        [$payloadEncoded, $signature] = explode('.', $token, 2);

        $expectedSignature = $this->sign($payloadEncoded);

        if (! hash_equals($expectedSignature, $signature)) {
            return null;
        }

        $payload = json_decode($this->base64UrlDecode($payloadEncoded), true);

        if (! is_array($payload) || ! isset($payload['name'], $payload['exp'])) {
            return null;
        }

        if (Carbon::createFromTimestamp($payload['exp'])->isPast()) {
            return null;
        }

        return $payload;
    }

    private function sign(string $payloadEncoded): string
    {
        return $this->base64UrlEncode(
            hash_hmac('sha256', $payloadEncoded, (string) config('admin.token_secret'), true)
        );
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }

    private function base64UrlDecode(string $value): string
    {
        return base64_decode(strtr($value, '-_', '+/'));
    }
}