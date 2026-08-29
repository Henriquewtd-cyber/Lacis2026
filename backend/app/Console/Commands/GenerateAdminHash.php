<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class GenerateAdminHash extends Command
{
    protected $signature = 'admin:hash {senha}';

    protected $description = 'Gera o hash bcrypt de uma senha para colocar em ADMIN_USERS no .env';

    public function handle(): int
    {
        $hash = Hash::make($this->argument('senha'));

        $this->line($hash);

        return self::SUCCESS;
    }
}