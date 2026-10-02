<?php

namespace App\Services;

use App\Enums\InternationalizationFileSlot;
use App\Models\InternationalizationAction;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class InternationalizationService
{
    private const FILES_DIR = 'internationalization-files';

    /** @param array<string, UploadedFile> $files indexados pelo slot */
    public function create(array $data, int $userId, array $files): InternationalizationAction
    {
        $data['user_id'] = $userId;

        return DB::transaction(function () use ($data, $files) {
            $action = InternationalizationAction::create($data);
            $this->storeFiles($action, $files);

            return $this->fresh($action);
        });
    }

    /**
     * @param array<string, UploadedFile> $files indexados pelo slot
     * @param string[] $removeSlots slots a esvaziar sem novo upload
     */
    public function update(InternationalizationAction $action, array $data, array $files, array $removeSlots): InternationalizationAction
    {
        return DB::transaction(function () use ($action, $data, $files, $removeSlots) {
            $action->update($data);

            foreach ($removeSlots as $slot) {
                if (! isset($files[$slot])) {
                    $this->deleteFile($action, $slot);
                }
            }
            $this->storeFiles($action, $files);

            return $this->fresh($action);
        });
    }

    public function delete(InternationalizationAction $action): void
    {
        foreach ($action->files as $file) {
            Storage::delete($file->path);
        }
        $action->delete();
    }

    public function download(InternationalizationAction $action, string $slot)
    {
        $file = InternationalizationFileSlot::tryFrom($slot)
            ? $action->files()->where('slot', $slot)->first()
            : null;

        if (! $file || ! Storage::exists($file->path)) {
            return response()->json(['message' => 'Arquivo não encontrado'], 404);
        }

        return Storage::download($file->path, $file->name);
    }

    private function storeFiles(InternationalizationAction $action, array $files): void
    {
        foreach ($files as $slot => $upload) {
            $this->deleteFile($action, $slot);
            $action->files()->create([
                'slot' => $slot,
                'path' => $upload->store(self::FILES_DIR),
                'name' => $upload->getClientOriginalName(),
            ]);
        }
    }

    private function deleteFile(InternationalizationAction $action, string $slot): void
    {
        $existing = $action->files()->where('slot', $slot)->first();
        if ($existing) {
            Storage::delete($existing->path);
            $existing->delete();
        }
    }

    private function fresh(InternationalizationAction $action): InternationalizationAction
    {
        return $action->load('category', 'user', 'files');
    }
}
