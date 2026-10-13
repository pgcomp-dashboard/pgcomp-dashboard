<?php

namespace App\Services;

use App\Models\Award;
use App\Models\AwardCategory;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AwardService
{
    private const ATTACHMENTS_DIR = 'award-attachments';

    public function create(array $data, int $userId, ?UploadedFile $attachment): Award
    {
        $winners = $this->resolveWinnerUsers($data['winners']);
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
        $winners = $this->resolveWinnerUsers($data['winners']);
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

    public function import(array $records, int $ownerId): array
    {
        $categoryIds = AwardCategory::query()
            ->whereIn('name', array_unique(array_column($records, 'award_category_name')))
            ->pluck('id', 'name');

        $allWinners = [];
        foreach ($records as $awardIndex => $record) {
            foreach ($record['winners'] as $winner) {
                $allWinners[] = [
                    ...$winner,
                    'award_index' => $awardIndex + 1,
                ];
            }
        }

        $resolvedWinners = $this->resolveWinnerUsers($allWinners);
        $importedAwards = 0;
        $linkedWinners = 0;
        $unlinkedWinners = [];

        DB::transaction(function () use (
            $records,
            $ownerId,
            $categoryIds,
            $resolvedWinners,
            &$importedAwards,
            &$linkedWinners,
            &$unlinkedWinners,
        ) {
            $winnerOffset = 0;
            foreach ($records as $record) {
                $award = Award::create([
                    'user_id' => $ownerId,
                    'year' => $record['year'],
                    'scope' => $record['scope'],
                    'award_category_id' => $categoryIds[$record['award_category_name']],
                    'description' => $record['description'],
                    'url' => $record['url'] ?? null,
                ]);

                $winners = array_slice(
                    $resolvedWinners,
                    $winnerOffset,
                    count($record['winners']),
                );
                $award->winners()->createMany(array_map(function (array $winner) {
                    unset($winner['award_index']);

                    return $winner;
                }, $winners));
                $winnerOffset += count($record['winners']);
                $importedAwards++;

                foreach ($winners as $winner) {
                    if ($winner['user_id'] !== null) {
                        $linkedWinners++;
                    } else {
                        $unlinkedWinners[] = [
                            'award_index' => $winner['award_index'],
                            'name' => $winner['name'],
                            'recipient_type' => $winner['recipient_type'],
                        ];
                    }
                }
            }
        });

        return [
            'imported_count' => $importedAwards,
            'linked_winners_count' => $linkedWinners,
            'unlinked_winners' => $unlinkedWinners,
        ];
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

    private function resolveWinnerUsers(array $winners): array
    {
        $names = array_values(array_unique(array_map(
            fn (array $winner) => mb_strtolower(trim($winner['name'])),
            $winners,
        )));
        $usersByNameAndType = [];

        if ($names !== []) {
            User::query()
                ->whereIn('type', ['professor', 'student'])
                ->whereIn(DB::raw('LOWER(TRIM(name))'), $names)
                ->get(['id', 'name', 'type'])
                ->each(function (User $user) use (&$usersByNameAndType) {
                    $key = $user->type->value . "\0" . mb_strtolower(trim($user->name));
                    $usersByNameAndType[$key][] = $user->id;
                });
        }

        return array_map(function (array $winner) use ($usersByNameAndType) {
            $userType = $winner['recipient_type'];
            $key = $userType . "\0" . mb_strtolower(trim($winner['name']));
            $matches = $usersByNameAndType[$key] ?? [];

            $winner['user_id'] = count($matches) === 1 ? $matches[0] : null;
            return $winner;
        }, $winners);
    }
}
