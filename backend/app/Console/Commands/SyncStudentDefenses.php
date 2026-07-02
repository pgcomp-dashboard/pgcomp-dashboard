<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class SyncStudentDefenses extends Command
{
    protected $signature = 'students:sync-defenses';
    protected $description = 'Sync defended_at for legacy students based on SIGAA data';

    // Alunos ATIVOS no SIGAA (registrations)
    private array $activeRegistrations = [
        '2026100766', '2023119307', '2023121388', '2026100775', '2023119343',
        '2026100784', '2025113410', '2024127475', '2023100539', '2025115844',
        '2024127484', '2025113447', '2024126763', '2023100510', '2023102551',
        '2024103043', '2025123882', '2023112487', '2026100793', '2024127466',
        '2026100800', '2021108841', '2026116499', '2025124370', '2024127528',
        '2025123980', '2026100837', '2021107746', '2024102153', '2026101020',
        '2024102331', '2023121477', '2026101057', '2023119915', '2024102304',
        '2024108433', '2021113618', '2026101066', '2025110580', '2025110472',
        '2023119970', '2025110599', '2025110623', '2026101093', '2026101128',
        '2024101782', '2026101173', '2023119370', '2024103061', '2025124173',
        '2025109856', '2023125224', '2023120175', '2026115197', '2026102733',
        '2023102613', '2026117431', '2023119399', '2025112539', '2025123766',
        '2024103070', '2026102742', '2025115862', '2025115871', '2025109640',
        '2025123630', '2023119405', '2026102751', '2024126781', '2026102760',
        '2024104345', '2025109892', '2024129040', '2024102289', '2023103719',
        '2026104756', '2025112655', '2026104783', '2026102804', '2025110768',
        '2026102840', '2022102539', '2024126807', '2025130223', '2025110552',
        '2026115230', '2026102985', '2026116238', '2025120352', '2025124280',
        '2026103033', '2026104836', '2026103131', '2026115268', '2026104872',
        '2026110172', '2025110777', '2025125751', '2024102224', '2025115290',
        '2024128740', '2026105029', '2024128759', '2026105074', '2025123828',
        '2026105299', '2019129844', '2022119714', '2025123935', '2025125448',
        '2023119503', '2026105350', '2025118560', '2025110632', '2025115227',
        '2026105397', '2026107506', '2022119429', '2023120943', '2023125233',
        '2023119530', '2025124244', '2025112619', '2026110904',
       
        '2024131315', // Denis Robson — ativo, sem orientador no banco (vinculado manualmente)
        '2024104050', // Murilo Guerreiro Arouca — ativo, sem orientador no banco (vinculado manualmente)
        '2025109936', // Mayki dos Santos Oliveira — ativo, sem orientador no banco (vinculado manualmente)
        // Doutorado
        '2020104365', '2024104102', '2020128090', '2026121523', '2024103419',
        '2025113287', '2026109162', '2021111257', '2025123560', '2020128189',
        '2019101629', '2024118108', '2020104409', '2024126370', '218222089',
        '2019129871', '2024104256', '2020128198', '2022118350', '2021124854',
        '2026102303', '2025115933', '2025123621', '2021107423',
        '2024103670', '2023102631', '2021111266', '2020104454', '2025128207',
        '2022100383', '2021125136', '218221267', '217219134', '2025112341',
        '2025112600', '2024126389', '218219950', '2023119746', '2021125109',
        '2021111337', '2026102330', '2024103508', '2021136499', '2026102789',
        '2025129984', '2026102878', '2025112726', '2024126398', '2024104022',
        '2022123305', '2024103301', '2021136560', '2025112744', '2026102887',
        '2019129880', '2021124540', '2020128115', '2024126413', '2020104552',
        '2019129568', '2025123953', '2024103384', '2019129853',
        '2024108522', '2021111284', '2020128142', '2019109592',
        '2024103769', '2024127887', '2023101607', '2023101616', '2020128124',
        '2022122700', '2023119755', '2025128190', '2019101825', '2021124700',
        '2026109171', '2020128133', '2023102678', '2024104176', '2024126440',
        '2025123579', '2021111300',
    ];

    // Alunos que defenderam com data real (nome => data)
    private array $defenses = [
        'Marcos Vinícius Queiroz de Sant\'Ana Filho' => '2025-11-27',
        'Felipe Rebouças Ferreira Abreu' => '2023-11-28',
        'Gabriela Oliveira Mota da Silva' => '2023-09-28',
        'Victor Martinez Vidal Pereira' => '2022-06-21',
        'Jadna Almeida da Cruz' => '2022-08-24',
        'Amanda Chagas de Oliveira' => '2022-11-28',
        'Diogo Vinícius de Sousa Silva' => '2022-06-09',
        'João Paulo Dias de Almeida' => '2021-05-03',
        'Patrick Herbeth Guimarães Azevedo' => '2020-07-23',
        'Andressa Mirella Filgueiras da Silva' => '2025-03-26',
        'Cleiton Otavio da Exaltação Rocha' => '2025-06-05',
        'Jéssica de Souza Santana' => '2025-06-16',
        'Vítor Alves Barbosa' => '2025-07-21',
        'Marcelo Pereira Barbosa' => '2025-09-15',
        'Fabio Santos dos Santos' => '2025-09-15',
        'Tania Maria Feitosa' => '2025-09-18',
        'Sandro de Carvalho Franco' => '2025-11-05',
        'Silvio José de Queiroz Pereira' => '2025-12-10',
        'Edlane Cristine dos Santos Proencia' => '2025-12-15',
        'Matheus Augusto Oliveira dos Santos' => '2025-12-18',
        'Tadeu Nogueira Costa de Andrade' => '2025-03-27',
        'Larissa Barbosa Leoncio Pinheiro' => '2025-05-16',
        'Lidiany Cerqueira Santos' => '2025-07-21',
        'Bruno Souza Cabral' => '2025-09-15',
        'Jauberth Weyll Abijaude' => '2025-09-30',
        'George Pacheco Pinto' => '2025-11-18',
        'Mayka de Souza Lima' => '2025-12-02',
        'Guilherme Braga Araújo' => '2025-12-12',
        'Taijara Loiola Oliveira de Santana' => '2024-03-01',
        'Kécia Souza Santana Santos' => '2024-05-29',
        'João Victor Alves Barreto' => '2024-09-10',
        'Andréa Leão Jesus Menezes dos Santos' => '2024-09-20',
        'João Victor Gonçalves Ferreira' => '2024-10-25',
        'Joel Machado Pires' => '2026-01-20', // defendeu mas ainda aparece ativo no SIGAA
    ];

    public function handle()
    {
        $this->info('Iniciando sincronização de defesas...');

        $updated = 0;
        $skipped = 0;

        $students = User::whereNull('defended_at')
         ->whereIn('type', ['mestrando', 'doutorando', 'student'])
         ->get();

        foreach ($students as $student) {
            // Se está na lista de ativos, pula
            if (in_array($student->registration, $this->activeRegistrations)) {
                $skipped++;
                continue;
            }

            // Verifica se tem defesa registrada pelo nome
            $defenseDate = null;
            foreach ($this->defenses as $name => $date) {
                similar_text(
                    mb_strtolower($student->name),
                    mb_strtolower($name),
                    $percent
                );
                if ($percent > 80) {
                    $defenseDate = $date;
                    break;
                }
            }

            if ($defenseDate) {
                $student->defended_at = $defenseDate;
            } else {
                // Não está ativo e não tem defesa registrada — marca com data estimada
                $student->defended_at = '2024-12-31';
            }

            $student->save();
            $updated++;
            $this->line("Atualizado: {$student->name} ({$student->registration}) → {$student->defended_at}");
        }

        $this->info("Concluído! Atualizados: {$updated} | Pulados (ativos): {$skipped}");
    }
}