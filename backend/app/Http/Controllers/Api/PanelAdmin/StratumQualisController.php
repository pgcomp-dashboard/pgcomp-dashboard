<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Http\Controllers\Api\BaseApiResourceController;
use App\Models\BaseModel;
use App\Models\StratumQualis;
use Illuminate\Support\Facades\DB;

class StratumQualisController extends BaseApiResourceController
{
    protected function modelClass(): string|BaseModel
    {
        return StratumQualis::class;
    }

    public function destroy(int $id)
    {
        $stratumQualis = $this->findOrFail($id);
        DB::beginTransaction();

        try {

            if ($stratumQualis->productions()->exists()) {
                DB::rollBack();

                return response()->json([
                    'message' => 'Não é possível deletar este Qualis pois existem produções vinculadas a ele.',
                    'suggestion' => 'Primeiramente atualize ou remova as produções associadas.',
                ], 422);
            }

            $stratumQualis->delete();
            DB::commit();

            return response()->json(['message' => 'Qualis deletado com sucesso']);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Erro ao deletar Qualis',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
