<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Categorias do formulário do Google usado antes do módulo (nomes mantidos
     * como no original). Ficam na migration porque o deploy não roda seeders.
     */
    private const CATEGORIES = [
        'Doutorado sanduíche',
        'Apresentação de artigo científico no exterior',
        'Visita técnica no exterior',
        'Projeto de Pesquisa com instituição estrangeira',
        'Intercâmbio Científico',
        'Cooperação/parceria internacional',
        'Pós-doutorado no exterior',
        'Doutorado no exterior',
        'Mestrado sanduíche',
        'Professor Visitante no exterior',
        'Professor Estrangeiro Visitante no Brasil',
        'Aluno do PGCOMP Estrangeiro no Brasil',
        'Orientação de aluno estrangeiro no Brasil',
        'Orientação de aluno no exterior',
        'Palestra no exterior',
        'Coorientação de aluno estrangeiro no Brasil',
        'Missão científica',
        'Coorientação de aluno no exterior',
        'Consultoria no exterior',
        'Prêmio internacional',
        'Orientação em cotutela',
        'Estágio no exterior',
        'Outro',
    ];

    public function up(): void
    {
        Schema::create('internationalization_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        $now = now();
        DB::table('internationalization_categories')->insert(array_map(
            fn (string $name) => ['name' => $name, 'created_at' => $now, 'updated_at' => $now],
            self::CATEGORIES,
        ));
    }

    public function down(): void
    {
        Schema::dropIfExists('internationalization_categories');
    }
};
