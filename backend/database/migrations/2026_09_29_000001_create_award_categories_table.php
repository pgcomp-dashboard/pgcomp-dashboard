<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Categorias do formulário do Google usado antes do módulo de prêmios
     * (nomes mantidos como no original). Ficam na migration porque o deploy
     * não roda seeders.
     */
    private const CATEGORIES = [
        'Keynote Speaker',
        'Palestrante Convidado',
        'Distinguished paper',
        'Best paper',
        '2nd Best Paper',
        '3rd Best Paper',
        'Menção Honrosa',
        'Distinção Científica',
        'Melhor Revisor',
        'Revisor Destaque',
        'Finalista CTD',
        'Vencedor CTD',
        '2nd lugar CTD',
        '3rd lugar CTD',
        'Outstand Reviwer',
        'Grant for Researcher',
        'Melhor Ferramenta',
        '2nd Melhor Ferramenta',
        '3rd Melhor Ferramenta',
        'Best talk',
        '2nd Best talk',
        '3rd Best Talk',
        'Pesquisador Homenageado',
        'Vencedor de Concurso de Iniciação Científica',
        '2nd lugar de Concurso de Iniciação Científica',
        '3rd lugar de Concurso de Iniciação Científica',
        'Research Award',
        'Most Influencial Paper Award',
        'Most Active Research',
        'Bolsa de Produtividade em Pesquisa',
        'Best work award',
        'Melhor tese de doutorado',
        '2nd melhor tese de doutorado',
        '3rd melhor tese de doutorado',
        'Melhor dissertação de mestrado',
        '2nd melhor dissertação de mestrado',
        '3rd melhor dissertação de mestrado',
        'Best Student Paper Award',
        '2nd Best Student Paper Award',
        '3rd Best Student Paper Award',
        'Membro de Academia de Ciências',
        'Finalista do prêmio de melhor (iniciação científica/mestrado/doutorado/etc.)',
    ];

    public function up(): void
    {
        Schema::create('award_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        $now = now();
        DB::table('award_categories')->insert(array_map(
            fn (string $name) => ['name' => $name, 'created_at' => $now, 'updated_at' => $now],
            self::CATEGORIES,
        ));
    }

    public function down(): void
    {
        Schema::dropIfExists('award_categories');
    }
};
