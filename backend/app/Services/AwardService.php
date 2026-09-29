<?php

namespace App\Services;

use App\Models\Award;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AwardService
{
    private const ATTACHMENTS_DIR = 'award-attachments';

    public function create(array $data, int $userId, ?UploadedFile $attachment): Award
    {
        $winners = $data['winners'];
        unset($data['winners']);

        $data['user_id'] = $userId;
        $data['award_category_id'] = (int) $data['award_category_id'];

        if ($attachment) {
            $data['attachment_path'] = $attachment->store(self::ATTACHMENTS_DIR);
            $data['attachment_name'] = $attachment->getClientOriginalName();
        }

        return DB::transaction(function () use ($data, $winners) {
            $award = Award::create($data);
            $award->winners()->createMany($winners);

            return $award->load('category', 'user', 'winners');
        });
    }

    public function update(Award $award, array $data, ?UploadedFile $attachment, bool $removeAttachment): Award
    {
        $winners = $data['winners'];
        unset($data['winners']);

        if ($attachment) {
            $this->deleteAttachment($award);
            $data['attachment_path'] = $attachment->store(self::ATTACHMENTS_DIR);
            $data['attachment_name'] = $attachment->getClientOriginalName();
        } elseif ($removeAttachment) {
            $this->deleteAttachment($award);
            $data['attachment_path'] = null;
            $data['attachment_name'] = null;
        }

        return DB::transaction(function () use ($award, $data, $winners) {
            $award->update($data);
            $award->winners()->delete();
            $award->winners()->createMany($winners);

            return $award->load('category', 'user', 'winners');
        });
    }

    public function delete(Award $award): void
    {
        $this->deleteAttachment($award);
        $award->delete();
    }

    public function download(Award $award)
    {
        if (! $award->attachment_path || ! Storage::exists($award->attachment_path)) {
            return response()->json(['message' => 'Arquivo não encontrado'], 404);
        }

        return Storage::download($award->attachment_path, $award->attachment_name);
    }

    private function deleteAttachment(Award $award): void
    {
        if ($award->attachment_path) {
            Storage::delete($award->attachment_path);
        }
    }
}
