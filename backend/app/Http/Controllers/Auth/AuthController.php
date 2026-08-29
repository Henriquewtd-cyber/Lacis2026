<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\AdminTokenService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function __construct(private AdminTokenService $tokens)
    {
    }

    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Dados inválidos.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $name = $request->input('name');
        $password = $request->input('password');

        // Verifica o nome do administrador
        if (strtolower($name) !== strtolower(env('ADMIN_NAME'))) {
            return response()->json([
                'message' => 'Nome ou senha incorretos.',
            ], 401);
        }

        // Verifica a senha usando o hash armazenado no .env
        if (!Hash::check($password, env('ADMIN_PASSWORD'))) {
            return response()->json([
                'message' => 'Nome ou senha incorretos.',
            ], 401);
        }

        $result = $this->tokens->generate(env('ADMIN_NAME'));

        return response()->json([
            'token' => $result['token'],
            'token_type' => 'Bearer',
            'expires_at' => $result['expires_at']->toIso8601String(),
            'user' => [
                'name' => env('ADMIN_NAME'),
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'name' => $request->attributes->get('admin_name'),
        ]);
    }
}
