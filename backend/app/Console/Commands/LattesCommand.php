<?php

namespace App\Console\Commands;

use App\Domain\Lattes\LattesZipXml;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class LattesCommand extends Command
{
    protected $signature = 'load:lattes-files-load';

    protected $description = 'Load Lattes files';

    public function handle(): int
    {
        $files = Storage::files('lattes-xmls');
        foreach ($files as $file) {
            try {
//                $this->info($file);
                $data = LattesZipXml::extractProductions($file);
                $user = $this->getUser($data);
                if (!$user) {
                    continue;
                }
                $user->updateLattes($data);
            } catch (\Throwable $e) {
                $this->error($e->getMessage());
            }
        }


        return 0;
    }

    private function getUser(array $data): ?User
    {
        $user = User::where('lattes_id', $data['lattes_id'])->where('is_protected', false)->first();
        if ($user) {
//            $this->info("Achei {$user->name} pelo lattes_id");
            return $user;
        }

        $user = User::where('lattes_url', 'like', "%{$data['lattes_id']}%")->where('is_protected', false)->first();
        if ($user) {
//            $this->info("Achei {$user->name} pelo lattes_url");
            $user->lattes_id = $data['lattes_id'];
            $user->save();

            return $user;
        }

        $user = User::where('name', 'like', "%{$data['name']}%")->where('is_protected', false)->first();
        if ($user) {
//            $this->info("Achei {$user->name} pelo nome");
            $user->lattes_id = $data['lattes_id'];
            $user->save();

            return $user;
        }
        $this->error("Não achei {$data['name']}");
        return null;
    }
}
