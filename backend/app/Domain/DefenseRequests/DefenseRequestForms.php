<?php

namespace App\Domain\DefenseRequests;

/**
 * POC: os 4 formulários de solicitação de banca do PGCOMP (Google Forms linkados em
 * pgcomp.ufba.br/apoio), com os mesmos campos e a mesma obrigatoriedade.
 *
 * É a única fonte da estrutura: a API devolve este schema, o front monta o wizard
 * (uma etapa por seção) e as respostas são validadas e gravadas a partir dele.
 *
 * Tipos de campo: text, textarea, date (Y-m-d), time (H:i), confirm (caixa "Sim")
 * e member (membro de banca: {user_id?, name, affiliation, lattes}).
 *
 * Diferenças deliberadas do original:
 * - Cada membro de banca é um campo só, com nome, afiliação e Lattes separados
 *   (no Google Form eram "Nome (com afiliação)" + "Link para o Lattes").
 * - Cada vaga diz se pede membro externo, interno ou qualquer um (`kind`), tirado
 *   do rótulo original, para o front sugerir os nomes certos.
 * - "Impactos" fica junto do trabalho, e orientação junto do discente.
 */
class DefenseRequestForms
{
    public const STUDENT = 'Discente e orientação';

    public const WORK = 'Trabalho';

    public const COMMITTEE = 'Banca examinadora';

    public const SCHEDULE = 'Data e horário';

    public const CONFIRMATIONS = 'Confirmações';

    /** Tipo => [nível, etapa]. O front escolhe o tipo a partir do curso do discente. */
    public const TYPE_MATRIX = [
        'masters_qualification' => ['level' => 'mestrado', 'stage' => 'qualification'],
        'masters_defense' => ['level' => 'mestrado', 'stage' => 'defense'],
        'doctoral_qualification' => ['level' => 'doutorado', 'stage' => 'qualification'],
        'doctoral_defense' => ['level' => 'doutorado', 'stage' => 'defense'],
    ];

    public static function all(): array
    {
        $aware = fn (string $what, string $rule) => "Estou ciente de que as informações colocadas por mim neste formulário serão usadas para análise e decisão sobre a composição da banca de {$what}, conforme {$rule}";
        $english = 'Confirmo que o discente enviou para a secretaria (ceapg-ic@ufba.br) a declaração de aprovação no exame de proficiência em língua inglesa.';
        $noPending = 'Confirmo que o discente não possui qualquer pendência curricular para a defesa, e possui anuência da secretaria (ceapg-ic@ufba.br).';
        $alumni = 'Confirmo que solicitei ao aluno(a) o preenchimento do Formulário do Egresso PGCOMP (https://pgcomp.ufba.br/egressos).';
        $affiliations = 'Confirmo que informei a afiliação de todos os membros da banca.';

        return [
            'masters_qualification' => [
                'label' => 'Qualificação de Mestrado',
                'title' => 'Composição de banca de qualificação de mestrado',
                'fields' => [
                    ...self::header(),
                    ...self::work(withImpacts: false),
                    self::member('member_1', 'Membro Titular 1', 'any', true, true),
                    self::member('member_2', 'Membro Titular 2', 'any', true, true),
                    self::member('substitute_1', 'Suplente 1', 'any', false, false),
                    self::member('substitute_2', 'Suplente 2', 'any', false, false),
                    ...self::schedule('Data do exame', 'Horário do exame'),
                    self::confirm('confirm_affiliations', $affiliations, true),
                    self::confirm('confirm_aware', $aware('qualificação de mestrado', 'Artigo 29, Parágrafo 3 do regimento do programa'), true),
                ],
            ],
            'masters_defense' => [
                'label' => 'Defesa de Mestrado',
                'title' => 'Composição de banca de mestrado',
                'fields' => [
                    ...self::header(),
                    ...self::work(withImpacts: true),
                    self::member('member_1', 'Membro Titular Externo', 'external', true, true),
                    self::member('member_2', 'Membro Titular Interno ou Titular Externo 2', 'any', true, true),
                    self::member('member_3', 'Membro Titular Interno ou Titular Externo 3', 'any', false, false),
                    self::member('member_4', 'Membro Titular Interno ou Titular Externo 4', 'any', false, false),
                    self::member('substitute_1', 'Membro Suplente Externo', 'external', true, true),
                    self::member('substitute_2', 'Membro Suplente Interno ou Suplente Externo 2', 'any', true, true),
                    ...self::schedule('Data da defesa', 'Horário da defesa'),
                    self::confirm('confirm_english', $english, true),
                    self::confirm('confirm_no_pending', $noPending, true),
                    self::confirm('confirm_affiliations', $affiliations, false),
                    self::confirm('confirm_alumni_form', $alumni, true),
                    self::confirm('confirm_aware', $aware('mestrado', 'Resolução nº 02/2015-PGCOMP. http://bit.ly/2fZkEC0'), false),
                ],
            ],
            'doctoral_qualification' => [
                'label' => 'Qualificação de Doutorado',
                'title' => 'Composição de banca de qualificação de doutorado',
                'fields' => [
                    ...self::header(),
                    ...self::work(withImpacts: false),
                    self::member('member_1', 'Membro externo 1', 'external', true, true),
                    self::member('member_2', 'Membro interno 1', 'internal', true, true),
                    self::member('substitute_1', 'Suplente do membro externo', 'external', true, true),
                    self::member('substitute_2', 'Suplente do membro interno', 'internal', true, true),
                    ...self::schedule('Data do exame', 'Horário do exame'),
                    self::confirm('confirm_affiliations', $affiliations, true),
                    self::confirm('confirm_aware', $aware('qualificação de doutorado', 'Artigo 28, Parágrafo 3 do regimento do programa'), true),
                ],
            ],
            'doctoral_defense' => [
                'label' => 'Defesa de Doutorado',
                'title' => 'Composição de Banca de Doutorado',
                'fields' => [
                    ...self::header(),
                    ...self::work(withImpacts: true),
                    self::member('member_1', 'Membro Titular Externo 1', 'external', true, true),
                    self::member('member_2', 'Membro Titular Externo 2', 'external', true, true),
                    self::member('member_3', 'Membro Titular Interno 1 ou Titular Externo 3', 'any', true, true),
                    self::member('member_4', 'Membro Titular Interno 2 ou Titular Externo 4', 'any', true, false),
                    self::member('substitute_1', 'Membro Suplente Externo 1', 'external', true, true),
                    self::member('substitute_2', 'Membro Suplente Externo 2', 'external', true, true),
                    self::member('substitute_3', 'Membro Suplente Interno 1 ou Suplente Externo 3', 'any', true, true),
                    self::member('substitute_4', 'Membro Suplente Interno 2 ou Suplente Externo 4', 'any', true, true),
                    ...self::schedule('Data da defesa', 'Horário da defesa'),
                    self::confirm('confirm_english', $english, true),
                    self::confirm('confirm_no_pending', $noPending, true),
                    self::confirm('confirm_affiliations', $affiliations, true),
                    self::confirm('confirm_alumni_form', $alumni, true),
                    self::confirm('confirm_aware', $aware('doutorado', 'Resolução nº 02/2015-PGCOMP. http://bit.ly/2fZkEC0'), true),
                ],
            ],
        ];
    }

    private static function field(string $key, string $label, string $type, bool $required, string $section, array $extra = []): array
    {
        return ['key' => $key, 'label' => $label, 'type' => $type, 'required' => $required, 'section' => $section] + $extra;
    }

    private static function header(): array
    {
        return [
            self::field('student_name', 'Nome do aluno', 'text', true, self::STUDENT),
            self::field('advisor', 'Orientador', 'text', true, self::STUDENT),
            self::field('co_advisor', 'Co-orientador', 'text', false, self::STUDENT),
        ];
    }

    private static function work(bool $withImpacts): array
    {
        $fields = [
            self::field('title', 'Título do trabalho', 'text', true, self::WORK),
            self::field('abstract', 'Resumo do trabalho', 'textarea', true, self::WORK),
        ];
        if ($withImpacts) {
            $fields[] = self::field('impacts', 'Quais os principais impactos deste trabalho (social, tecnológico, científico, ambiental)?', 'textarea', true, self::WORK);
        }

        return $fields;
    }

    /** @param 'external'|'internal'|'any' $kind */
    private static function member(string $key, string $label, string $kind, bool $required, bool $lattesRequired): array
    {
        return self::field($key, $label, 'member', $required, self::COMMITTEE, [
            'kind' => $kind,
            'lattes_required' => $lattesRequired,
            'substitute' => str_starts_with($key, 'substitute_'),
        ]);
    }

    private static function schedule(string $dateLabel, string $timeLabel): array
    {
        return [
            self::field('date', $dateLabel, 'date', true, self::SCHEDULE),
            self::field('time', $timeLabel, 'time', true, self::SCHEDULE),
        ];
    }

    private static function confirm(string $key, string $label, bool $required): array
    {
        return self::field($key, $label, 'confirm', $required, self::CONFIRMATIONS);
    }

    public static function types(): array
    {
        return array_keys(self::all());
    }

    public static function get(string $type): ?array
    {
        return self::all()[$type] ?? null;
    }

    /**
     * Regras de validação do Laravel (prefixadas por "data."). As confirmações são
     * declarações do orientador: quando o discente abre a solicitação, elas ficam de fora.
     */
    public static function rules(string $type, bool $withConfirmations = true): array
    {
        $rules = [];
        foreach (self::get($type)['fields'] ?? [] as $field) {
            $key = 'data.'.$field['key'];
            $base = $field['required'] ? ['required'] : ['nullable'];

            if ($field['type'] === 'confirm' && ! $withConfirmations) {
                continue;
            }

            if ($field['type'] === 'member') {
                $rules[$key] = [...$base, 'array'];
                $rules["$key.name"] = [...$base, 'string', 'max:255'];
                $rules["$key.affiliation"] = [$field['required'] ? 'required' : 'nullable', "required_with:$key.name", 'string', 'max:255'];
                $rules["$key.lattes"] = $field['lattes_required']
                    ? [$field['required'] ? 'required' : 'nullable', "required_with:$key.name", 'url', 'max:500']
                    : ['nullable', 'url', 'max:500'];
                $rules["$key.user_id"] = ['nullable', 'integer', 'exists:users,id'];

                continue;
            }

            $rules[$key] = array_merge($base, match ($field['type']) {
                'text' => ['string', 'max:500'],
                'textarea' => ['string', 'max:10000'],
                'date' => ['date_format:Y-m-d'],
                'time' => ['date_format:H:i'],
                'confirm' => $field['required'] ? ['accepted'] : ['boolean'],
            });
        }

        return $rules;
    }

    /** Nomes legíveis para as mensagens de erro. */
    public static function attributes(string $type): array
    {
        $names = [];
        foreach (self::get($type)['fields'] ?? [] as $field) {
            $names['data.'.$field['key']] = $field['label'];
            if ($field['type'] === 'member') {
                $names["data.{$field['key']}.name"] = "{$field['label']} (nome)";
                $names["data.{$field['key']}.affiliation"] = "{$field['label']} (afiliação)";
                $names["data.{$field['key']}.lattes"] = "{$field['label']} (Lattes)";
            }
        }

        return $names;
    }

    /** Mantém só as chaves do schema (descarta qualquer campo extra enviado). */
    public static function only(string $type, array $data): array
    {
        $result = [];
        foreach (self::get($type)['fields'] ?? [] as $field) {
            $value = $data[$field['key']] ?? null;
            $result[$field['key']] = match ($field['type']) {
                'confirm' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
                'member' => is_array($value) && trim((string) ($value['name'] ?? '')) !== ''
                    ? [
                        'user_id' => isset($value['user_id']) ? (int) $value['user_id'] : null,
                        'name' => trim((string) $value['name']),
                        'affiliation' => trim((string) ($value['affiliation'] ?? '')),
                        'lattes' => ($value['lattes'] ?? null) ?: null,
                    ]
                    : null,
                default => $value,
            };
        }

        return $result;
    }
}
