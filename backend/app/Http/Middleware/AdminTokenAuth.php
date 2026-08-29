<?php

namespace App\Http\Middleware;

use App\Services\AdminTokenService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminTokenAuth
{
    public function __construct(private AdminTokenService $tokens)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        $payload = $this->tokens->validate($token);

        if (! $payload) {
            return response()->json([
                'message' => 'Token ausente, inválido ou expirado.',
            ], 401);
        }

        // Disponível nos controllers via $request->attributes->get('admin_name')
        $request->attributes->set('admin_name', $payload['name']);

        return $next($request);
    }
}