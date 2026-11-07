<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Uma tabela para os 4 tipos de solicitação de banca. As respostas ficam em JSON,
     * conforme o schema de App\Domain\DefenseRequests\DefenseRequestForms
     * (`schema_version` diz com qual versão do formulário foram gravadas).
     *
     * Fluxo: o discente abre (awaiting_advisor) e o orientador revisa e envia
     * (submitted); o orientador também pode abrir direto (submitted).
     * Arquivar é soft delete (`deleted_at`): sai da regra de duplicata e pode ser restaurado.
     */
    public function up(): void
    {
        Schema::create('defense_requests', function (Blueprint $table) {
            $table->id();
            // Quem abriu a solicitação (discente ou orientador).
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('student_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('advisor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('type', 40)->index();
            $table->json('data');
            $table->unsignedSmallInteger('schema_version');
            // Sem padrão: todo registro nasce por uma transição (App\Enums\DefenseRequestStatus).
            $table->string('status', 20);
            $table->timestamp('submitted_at')->nullable();
            $table->foreignId('archived_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            // Regra "uma em andamento por discente e tipo" (DefenseRequestWorkflow).
            $table->index(['student_user_id', 'type', 'deleted_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('defense_requests');
    }
};
