<?php

namespace Tests\Feature;

use App\Models\Evento;
use App\Services\AdminTokenService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class EventosTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['admin.token_secret' => 'segredo-de-teste']);
        Storage::fake('public');
    }

    private function comToken(): static
    {
        $token = app(AdminTokenService::class)->generate('admin')['token'];
        return $this->withHeader('Authorization', 'Bearer ' . $token);
    }

    private function criarEvento(array $dados = []): Evento
    {
        return Evento::create($dados + [
            'titulo'    => 'Encontro de Dirigentes',
            'resumo'    => 'Debate sobre cultura nas cidades.',
            'data'      => '2026-11-25',
            'horario'   => '9h às 17h',
            'local'     => 'Auditório',
            'publicado' => true,
        ]);
    }

    public function test_lista_publica_traz_so_publicados_no_formato_do_frontend(): void
    {
        $this->criarEvento(['titulo' => 'Depois', 'data' => '2026-12-01']);
        $this->criarEvento(['titulo' => 'Antes', 'data' => '2026-11-01']);
        $this->criarEvento(['titulo' => 'Rascunho', 'publicado' => false]);
        $resposta = $this->getJson('/api/eventos');
        $resposta->assertOk()
            ->assertJsonCount(2)
            ->assertJsonPath('0.titulo', 'Antes')
            ->assertJsonPath('1.titulo', 'Depois')
            ->assertJsonPath('0.data', '2026-11-01')
            ->assertJsonPath('0.imagemUrl', null);
        $this->assertSame(
            ['id', 'titulo', 'resumo', 'data', 'horario', 'local', 'imagemUrl', 'videoUrl', 'link'],
            array_keys($resposta->json(0))
        );
    }

    public function test_detalhe_publico_de_rascunho_retorna_404(): void
    {
        $rascunho = $this->criarEvento(['publicado' => false]);
        $this->getJson("/api/eventos/{$rascunho->id}")->assertNotFound();
        $this->getJson('/api/eventos/999')->assertNotFound();
    }

    public function test_rotas_de_admin_exigem_token(): void
    {
        $this->postJson('/api/eventos', ['titulo' => 'X', 'data' => '2026-11-25'])->assertUnauthorized();
        $this->getJson('/api/admin/eventos')->assertUnauthorized();
        $this->assertDatabaseCount('eventos', 0);
    }

    public function test_admin_cria_evento_com_imagem_como_rascunho(): void
    {
        $resposta = $this->comToken()->post('/api/eventos', [
            'titulo'    => 'Oficina de projetos',
            'data'      => '2026-11-21',
            'horario'   => '14h',
            'video_url' => 'https://www.youtube.com/watch?v=abc',
            'imagem'    => UploadedFile::fake()->image('capa.jpg', 800, 600),
        ], ['Accept' => 'application/json']);
        $resposta->assertCreated()
            ->assertJsonPath('titulo', 'Oficina de projetos')
            ->assertJsonPath('publicado', false)
            ->assertJsonPath('videoUrl', 'https://www.youtube.com/watch?v=abc');
        $evento = Evento::first();
        $this->assertNotNull($evento->imagem);
        Storage::disk('public')->assertExists($evento->imagem);
        $this->assertNotNull($resposta->json('imagemUrl'));
    }

    public function test_validacao_recusa_dados_invalidos_com_mensagens_em_portugues(): void
    {
        $this->comToken()->postJson('/api/eventos', [
            'data' => '25/11/2026',
            'link' => 'nao-e-url',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['titulo', 'data', 'link'])
            ->assertJsonPath('errors.titulo.0', 'O campo título é obrigatório.');
        $this->assertDatabaseCount('eventos', 0);
    }

    public function test_edicao_por_post_com_method_put_troca_a_imagem(): void
    {
        Storage::disk('public')->put('eventos/antiga.webp', 'x');
        $evento = $this->criarEvento(['imagem' => 'eventos/antiga.webp']);
        $this->comToken()->post("/api/eventos/{$evento->id}", [
            '_method'   => 'PUT',
            'titulo'    => 'Novo título',
            'publicado' => '0',
            'imagem'    => UploadedFile::fake()->image('nova.png'),
        ], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('titulo', 'Novo título')
            ->assertJsonPath('publicado', false)
            ->assertJsonPath('data', '2026-11-25');
        $evento->refresh();
        Storage::disk('public')->assertMissing('eventos/antiga.webp');
        Storage::disk('public')->assertExists($evento->imagem);
    }

    public function test_edicao_remove_a_imagem_quando_pedido(): void
    {
        Storage::disk('public')->put('eventos/capa.webp', 'x');
        $evento = $this->criarEvento(['imagem' => 'eventos/capa.webp']);
        $this->comToken()->putJson("/api/eventos/{$evento->id}", ['imagem_remover' => true])
            ->assertOk()
            ->assertJsonPath('imagemUrl', null);
        Storage::disk('public')->assertMissing('eventos/capa.webp');
    }

    public function test_exclusao_apaga_evento_e_imagem(): void
    {
        Storage::disk('public')->put('eventos/capa.webp', 'x');
        $evento = $this->criarEvento(['imagem' => 'eventos/capa.webp']);
        $this->comToken()->deleteJson("/api/eventos/{$evento->id}")->assertNoContent();
        $this->assertDatabaseCount('eventos', 0);
        Storage::disk('public')->assertMissing('eventos/capa.webp');
        $this->comToken()->deleteJson("/api/eventos/{$evento->id}")->assertNotFound();
    }
}
