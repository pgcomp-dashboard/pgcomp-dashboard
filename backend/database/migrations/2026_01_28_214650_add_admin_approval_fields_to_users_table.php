<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Status da solicitação (Default: null)
            $table->string('admin_status')->nullable()->default(null);

            // Data da solicitação para controle
            $table->timestamp('admin_requested_at')->nullable();

            // Foreign key para saber QUAL admin aprovou (Auditoria)
            $table->foreignId('approved_by_id')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['admin_status', 'admin_requested_at', 'approved_by_id']);
        });
    }
};
