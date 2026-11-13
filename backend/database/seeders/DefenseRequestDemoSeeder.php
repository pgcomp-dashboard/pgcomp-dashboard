<?php

namespace Database\Seeders;

use App\Domain\DefenseRequests\DefenseRequestForms;
use App\Enums\DefenseRequestStatus;
use App\Enums\UserRelationType;
use App\Enums\UserType;
use App\Models\Course;
use App\Models\DefenseRequest;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Dados fictícios para demonstrar a solicitação de banca. Nunca roda em produção.
 * Senha de todos: "password".
 *
 *   php artisan db:seed --class=DefenseRequestDemoSeeder
 */
class DefenseRequestDemoSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->isProduction()) {
            $this->command?->warn('DefenseRequestDemoSeeder não roda em produção.');

            return;
        }

        $mestrado = Course::firstOrCreate(['name' => 'Mestrado']);
        $doutorado = Course::firstOrCreate(['name' => 'Doutorado']);

        // forceFill: is_admin/is_approved não são fillable no User.
        $upsert = fn (string $email, array $attributes) => tap(User::firstOrNew(['email' => $email]))
            ->forceFill($attributes + ['email' => $email])
            ->save();
        $find = fn (string $email) => User::where('email', $email)->firstOrFail();

        $professor = function (string $name, string $email, string $lattes) use ($upsert, $find) {
            $upsert($email, [
                'name' => $name,
                'type' => UserType::PROFESSOR,
                'password' => Hash::make('password'),
                'is_approved' => true,
                'lattes_url' => "http://lattes.cnpq.br/{$lattes}",
                'siape' => (int) substr($lattes, -7),
            ]);

            return $find($email);
        };

        $ana = $professor('Ana Beatriz Lima', 'ana.lima@ufba.example', '4127839012345678');
        $carlos = $professor('Carlos Eduardo Souza', 'carlos.souza@ufba.example', '7735120098765432');
        $professor('Fernanda Rocha Almeida', 'fernanda.almeida@ufba.example', '2291837465019283');
        $professor('Gustavo Pinheiro Neves', 'gustavo.neves@ufba.example', '5512093847561029');
        $professor('Helena Martins Costa', 'helena.costa@ufba.example', '8840192736450192');
        $professor('Ricardo Tavares Nunes', 'ricardo.nunes@ufba.example', '3301928374650011');

        $student = function (string $name, string $email, int $registration, Course $course, User $advisor, ?User $coAdvisor = null) use ($upsert, $find) {
            $upsert($email, [
                'name' => $name,
                'type' => UserType::STUDENT,
                'password' => Hash::make('password'),
                'is_approved' => true,
                'registration' => $registration,
                'course_id' => $course->id,
            ]);
            $user = $find($email);
            $advisor->advisedes()->syncWithoutDetaching([$user->id => ['relation_type' => UserRelationType::ADVISOR->value]]);
            $coAdvisor?->coadviseees()->syncWithoutDetaching([$user->id => ['relation_type' => UserRelationType::CO_ADVISOR->value]]);

            return $user;
        };

        $student('Bruno Carvalho Dias', 'bruno.dias@ufba.example', 202310001, $mestrado, $ana, $carlos);
        $student('Juliana Freitas Moura', 'juliana.moura@ufba.example', 202220002, $doutorado, $ana);
        $student('Marcos Vinícius Prado', 'marcos.prado@ufba.example', 202310003, $mestrado, $carlos);

        $upsert('coordenacao@ufba.example', [
            'name' => 'Coordenação PGCOMP',
            'type' => UserType::MANAGER,
            'is_admin' => true,
            'is_approved' => true,
            'password' => Hash::make('password'),
        ]);

        // Uma banca antiga, para os externos aparecerem como sugestão.
        if (! DefenseRequest::exists()) {
            DefenseRequest::create([
                'user_id' => $carlos->id,
                'advisor_user_id' => $carlos->id,
                'type' => 'masters_defense',
                'schema_version' => DefenseRequestForms::VERSION,
                'status' => DefenseRequestStatus::SUBMITTED,
                'submitted_at' => now()->subMonths(3),
                'data' => [
                    'student_name' => 'Egresso de exemplo',
                    'advisor' => $carlos->name,
                    'title' => 'Banca anterior (dado de exemplo)',
                    'member_1' => ['user_id' => null, 'name' => 'Patrícia Gomes Ribeiro', 'affiliation' => 'UFPE', 'lattes' => 'http://lattes.cnpq.br/6620194857302211'],
                    'substitute_1' => ['user_id' => null, 'name' => 'Rodrigo Mendes Farias', 'affiliation' => 'UNICAMP', 'lattes' => 'http://lattes.cnpq.br/9910283746501928'],
                ],
            ]);
        }
    }
}
