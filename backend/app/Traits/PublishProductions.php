<?php

namespace App\Traits;

use App\Models\BaseModel;
use App\Models\Production;
use Illuminate\Database\Eloquent\Relations\MorphMany;

/**
 * @mixin BaseModel
 */
trait PublishProductions
{
    private bool $runProductionsUpdate = false;

    public static function bootPublishProductions(): void
    {
        static::updated(function(self $model) {
            if ($model->wasChanged(['stratum_qualis_id', 'last_qualis'])) {
                /* @todo dispatch via Job */
                $model->updateProductions();
            }
        });
    }

    public function updateProductions(): void
    {
        $this->productions()
            ->update($this->only(['stratum_qualis_id', 'last_qualis']));
    }

    public function productions(): MorphMany
    {
        return $this->morphMany(Production::class, 'publisher');
    }
}
