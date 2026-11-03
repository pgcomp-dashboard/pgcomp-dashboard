<?php

use Illuminate\Support\Facades\DB;

$applyChanges = true;

$mappings = [
    [
        'recipient_type' => 'professor',
        'canonical' => 'Ivan do Carmo Machado',
        'aliases' => ['Ivan Machado'],
    ],
    [
        'recipient_type' => 'professor',
        'canonical' => 'Manoel Gomes de Mendonça Neto',
        'aliases' => ['Manoel Mendonça', 'Manoel Gomes de Mendonca Neto'],
    ],
    [
        'recipient_type' => 'professor',
        'canonical' => 'Daniela Barreiro Claro',
        'aliases' => ['Daniela Claro'],
    ],
    [
        'recipient_type' => 'professor',
        'canonical' => 'Eduardo Santana de Almeida',
        'aliases' => ['Eduardo Almeida'],
    ],
    [
        'recipient_type' => 'professor',
        'canonical' => 'Leobino Nascimento Sampaio',
        'aliases' => ['Leobino Sampaio'],
    ],
    [
        'recipient_type' => 'professor',
        'canonical' => 'Vaninha Vieira',
        'aliases' => ['Vaninha Viera'],
    ],
    [
        'recipient_type' => 'professor',
        'canonical' => 'Christina Von Flach Garcia Chavez',
        'aliases' => ['Christina Chavez', 'Christina von Flach'],
    ],
    [
        'recipient_type' => 'professor',
        'canonical' => 'Rita Suzana Pitangueira Maciel',
        'aliases' => ['Rita Suzana Maciel'],
    ],
    [
        'recipient_type' => 'professor',
        'canonical' => 'Luciano Rebouças de Oliveira',
        'aliases' => ['Luciano Rebouças', 'Luciano Oliveira'],
    ],
    [
        'recipient_type' => 'professor',
        'canonical' => 'Marcos Ennes Barreto',
        'aliases' => ['Marcos Barreto'],
    ],
    [
        'recipient_type' => 'professor',
        'canonical' => 'Rafael Augusto de Melo',
        'aliases' => ['Rafael Melo'],
    ],
    [
        'recipient_type' => 'professor',
        'canonical' => 'Frederico Araújo Durão',
        'aliases' => ['Frederico Durão'],
    ],
    [
        'recipient_type' => 'professor',
        'canonical' => 'Maycon Leone M Peixoto',
        'aliases' => ['Maycon Peixoto'],
    ],
    [
        'recipient_type' => 'professor',
        'canonical' => 'Rodrigo O. Spínola',
        'aliases' => ['Rodrigo Spínola'],
    ],
    [
        'recipient_type' => 'professor',
        'canonical' => 'Antônio Lopes Apolinário Junior',
        'aliases' => ['Antonio Lopes Apolinario Junior'],
    ],
    [
        'recipient_type' => 'professor',
        'canonical' => 'Cássio Vinicius Serafim Prazeres',
        'aliases' => ['Cássio Prazeres'],
    ],
    [
        'recipient_type' => 'professor',
        'canonical' => "Cláudio Sant'Anna",
        'aliases' => ['Claudio Sant\'Anna', 'Cláudio SantAnna'],
    ],
    [
        'recipient_type' => 'professor',
        'canonical' => 'Ecivaldo de Souza Matos',
        'aliases' => ['Ecivaldo Matos'],
    ],
    [
        'recipient_type' => 'professor',
        'canonical' => 'Fabíola Gonçalves Pereira Greve',
        'aliases' => ['Fabiola Greve'],
    ],
    [
        'recipient_type' => 'professor',
        'canonical' => 'George Marconi de Araújo Lima',
        'aliases' => ['George Marconi de Araujo Lima'],
    ],
    [
        'recipient_type' => 'student',
        'canonical' => 'Vítor Alves Barbosa',
        'aliases' => ['Vítor Barbosa'],
    ],
    [
        'recipient_type' => 'student',
        'canonical' => 'Emmanuel Sávio Freire',
        'aliases' => ['Sávio Freire'],
    ],
    [
        'recipient_type' => 'student',
        'canonical' => 'Nicolli Rios Alves',
        'aliases' => ['Nicolli Rios'],
    ],
    [
        'recipient_type' => 'student',
        'canonical' => 'Joselito Mota',
        'aliases' => ['Joselito Mota Júnior'],
    ],
];

$normalize = static fn (string $name): string => mb_strtolower(trim($name));
$plans = [];
$conflicts = [];

foreach ($mappings as $mapping) {
    $names = array_values(array_unique(array_merge(
        [$mapping['canonical']],
        $mapping['aliases'],
    )));
    $normalizedNames = array_map($normalize, $names);

    $matchedWinners = DB::table('award_winners')
        ->where('recipient_type', $mapping['recipient_type'])
        ->get(['id', 'award_id', 'user_id', 'name'])
        ->filter(
            static fn ($winner): bool => in_array(
                $normalize($winner->name),
                $normalizedNames,
                true,
            ),
        );

    foreach ($matchedWinners->groupBy('award_id') as $awardId => $awardWinners) {
        $winnerIds = $awardWinners->pluck('id')->all();
        $userIds = $awardWinners->pluck('user_id')->filter()->unique()->values();

        if ($userIds->count() > 1) {
            $conflicts[] = [
                'recipient_type' => $mapping['recipient_type'],
                'canonical' => $mapping['canonical'],
                'award_id' => $awardId,
                'winner_ids' => $winnerIds,
                'user_ids' => $userIds->all(),
            ];
            continue;
        }

        $survivor = $awardWinners->first(
            static fn ($winner): bool => $winner->name === $mapping['canonical'],
        ) ?? $awardWinners->sortBy('id')->first();

        $plans[] = [
            'recipient_type' => $mapping['recipient_type'],
            'canonical' => $mapping['canonical'],
            'award_id' => $awardId,
            'survivor_id' => $survivor->id,
            'user_id' => $userIds->first(),
            'duplicate_ids' => array_values(array_diff($winnerIds, [$survivor->id])),
            'matched_names' => $awardWinners->pluck('name')->unique()->values()->all(),
        ];
    }
}

echo 'Plano de mesclagem de vencedores de prêmios' . PHP_EOL;
echo 'Modo: ' . ($applyChanges ? 'APLICAR' : 'SIMULAÇÃO (nenhuma alteração será feita)') . PHP_EOL;

foreach ($plans as $plan) {
    echo sprintf(
        "- %s [%s], prêmio #%s: %s => %s; manter linha #%s, remover %d duplicata(s)%s\n",
        $plan['recipient_type'],
        $plan['canonical'],
        $plan['award_id'],
        implode(' / ', $plan['matched_names']),
        $plan['canonical'],
        $plan['survivor_id'],
        count($plan['duplicate_ids']),
        $plan['user_id'] ? '; user_id=' . $plan['user_id'] : '',
    );
}

if ($conflicts !== []) {
    echo PHP_EOL . 'CONFLITOS: o mesmo prêmio tem linhas vinculadas a usuários diferentes. Nenhuma mesclagem será aplicada:' . PHP_EOL;
    foreach ($conflicts as $conflict) {
        echo json_encode($conflict, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . PHP_EOL;
    }
}

if (!$applyChanges) {
    echo PHP_EOL . 'Revise o plano. Para aplicar, altere $applyChanges para true e execute novamente.' . PHP_EOL;
    return;
}

if ($conflicts !== []) {
    throw new RuntimeException('Há conflitos de user_id; resolva-os manualmente antes de aplicar.');
}

DB::transaction(static function () use ($plans): void {
    foreach ($plans as $plan) {
        DB::table('award_winners')
            ->where('id', $plan['survivor_id'])
            ->update([
                'name' => $plan['canonical'],
                'user_id' => $plan['user_id'],
                'updated_at' => now(),
            ]);

        if ($plan['duplicate_ids'] !== []) {
            DB::table('award_winners')
                ->whereIn('id', $plan['duplicate_ids'])
                ->delete();
        }
    }
});

echo PHP_EOL . 'Mesclagem concluída. As relações com cada prêmio foram preservadas.' . PHP_EOL;
