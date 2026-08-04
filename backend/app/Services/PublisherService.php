<?php

namespace App\Services;

use App\Domain\Qualis\ConferenceQualisXLSX;
use App\Domain\Qualis\JournalQualisXLSX;
use App\Enums\PublisherType;
use App\Models\Publishers;
use App\Models\StratumQualis;

use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class PublisherService
{


    /**
     * Create a new publisher.
     *
     * @param array $data
     * @return Publishers
     */
    public function create(array $data): Publishers
    {
        $publisher = Publishers::create($data);
        if (isset($data['issns']) && is_array($data['issns'])) {
            $issnData = collect($data['issns'])
                ->filter()
                ->map(fn($issn) => ['issn' => $issn])
                ->toArray();
            if (count($issnData) > 0) {
                $publisher->issns()->createMany($issnData);
            }
        }
        return $publisher;
    }

    /**
     * Find a publisher by ID.
     *
     * @param int $id
     * @return Publishers
     */
    public function find(int $id): Publishers
    {
        return Publishers::findOrFail($id);
    }




    /**
     * Update a publisher.
     *
     * @param int $id
     * @param array $data
     * @return Publishers
     */
    public function update(int $id, array $data): Publishers
    {
        $publisher = Publishers::findOrFail($id);
        $publisher->update($data);

        // Recalculate is_approved based on stratum_qualis_id
        $hasQualis = !is_null($publisher->stratum_qualis_id);
        if ($publisher->is_approved !== $hasQualis) {
            $publisher->update(['is_approved' => $hasQualis]);
        }

        if (array_key_exists('issns', $data) && is_array($data['issns'])) {
            $publisher->issns()->delete();
            $issnData = collect($data['issns'])
                ->filter()
                ->map(fn($issn) => ['issn' => $issn])
                ->toArray();
            if (count($issnData) > 0) {
                $publisher->issns()->createMany($issnData);
            }
        }

        return $publisher;
    }

    /**
     * Delete a publisher.
     *
     * @param int $id
     * @return bool|null
     */
    public function delete(int $id): ?bool
    {
        $publisher = Publishers::findOrFail($id);
        return $publisher->delete();
    }

    /**
     * Delete all pending (not approved) publishers.
     *
     * @return void
     */
    public function destroyAllPending(): void
    {
        Publishers::onlyPending()->delete();
    }

    public function findByInitials(string $initials): ?Publishers
    {
        return Publishers::where('initials', '=', $initials)->first();
    }

    public function findByIssn(string $issn): ?Publishers
    {
        $cleanIssn = Str::of($issn)->trim()->remove('-')->value();
        return Publishers::whereHas('issns', function($q) use ($cleanIssn) {
            $q->where('issn', '=', $cleanIssn);
        })->first();
    }

    public function listAll(array $params = []): LengthAwarePaginator
    {
        return QueryBuilder::for(Publishers::class)
            ->with(['stratumQualis', 'issns'])
            ->allowedFilters([
                'name', 'initials', 'publisher_type', 'stratum_qualis_id', 'is_approved',
                AllowedFilter::callback('status', function ($query, $value) {
                    if ($value === 'approved') {
                        $query->where('is_approved', true);
                    } elseif ($value === 'pending') {
                        $query->where('is_approved', false);
                    }
                }),
                AllowedFilter::callback('issn', function ($query, $value) {
                    $query->whereHas('issns', function($q) use ($value) {
                        $q->where('issn', 'like', "%{$value}%");
                    });
                }),
                AllowedFilter::callback('search', function ($query, $value) {
                    $query->where(function ($q) use ($value) {
                        $q->where('name', 'like', "%{$value}%")
                          ->orWhere('initials', 'like', "%{$value}%")
                          ->orWhereHas('issns', function ($issnQ) use ($value) {
                              $issnQ->where('issn', 'like', "%{$value}%");
                          });
                    });
                }),
                AllowedFilter::callback('qualis_code', function ($query, $value) {
                    $query->whereHas('stratumQualis', function($q) use ($value) {
                        $q->where('code', $value);
                    });
                })
            ])
            ->allowedSorts(['name', 'initials', 'publisher_type', 'stratum_qualis_id', 'qualis_code'])
            ->paginate($params['per_page'] ?? 15);
    }

    public function importQualis(string $type, string $filePath): array
    {
        $data = match ($type) {
            'conference' => ConferenceQualisXLSX::extractConferenceQualis($filePath),
            'journal' => JournalQualisXLSX::extractJournalQualis($filePath),
        };

        $publisherType = match ($type) {
            'conference' => PublisherType::CONFERENCE,
            'journal' => PublisherType::JOURNAL,
        };

        if (count($data) > 1) {
            foreach ($data as $row) {
                // Determine code based on type
                $code = $row[2];

                $qualisId = StratumQualis::where('type', $publisherType->value)
                    ->where('code', $code)
                    ->first()->id ?? null;

                if ($type === 'conference') {
                    Publishers::updateOrCreate(
                        [
                            'initials' => $row[0],
                            'name' => $row[1]
                        ],
                        [
                            'initials' => $row[0],
                            'name' => $row[1],
                            'stratum_qualis_id' => $qualisId,
                            'publisher_type' => $publisherType->value,
                            'is_approved' => true
                        ]
                    );
                } else {
                    $issn = Str::of($row[0])->trim()->remove('-')->value();

                    $publisher = Publishers::whereHas('issns', function($q) use ($issn) {
                        $q->where('issn', $issn);
                    })->first();

                    if (!$publisher) {
                        $publisher = Publishers::where('name', $row[1])->first();
                    }

                    if ($publisher) {
                        $publisher->update([
                            'name' => $row[1],
                            'stratum_qualis_id' => $qualisId,
                            'publisher_type' => $publisherType->value,
                            'is_approved' => true
                        ]);
                        $publisher->issns()->firstOrCreate(['issn' => $issn]);
                    } else {
                        $publisher = Publishers::create([
                            'name' => $row[1],
                            'stratum_qualis_id' => $qualisId,
                            'publisher_type' => $publisherType->value,
                            'is_approved' => true
                        ]);
                        $publisher->issns()->create(['issn' => $issn]);
                    }
                }
            }

            $typeLabel = $type === 'conference' ? 'Conferências' : 'Revistas';
            return [
                "status" => 200,
                "message" => "Planilha de {$typeLabel} importada com sucesso"
            ];
        }

        return [
            "status" => 404,
            "message" => "Erro ao processar a planilha"
        ];
    }

    public function findPublisherByConferenceName(string $conferenceName, $onlyApproved = false): ?Publishers
    {
        $conferenceName = $this->prepareConferenceName($conferenceName);
        $conferenceAcronym = $this->getConferenceAcronym($conferenceName);
        

        // 1. Tenta encontrar um aprovado primeiro
        $publisher = $this->queryPublisherSearch($conferenceName, $conferenceAcronym, true)->first();

        if(!$publisher) {
            // Se não encontrar, tenta extrair a sigla do nome da conferência e buscar novamente
             if (preg_match('/\(([^)]+)\)/', $conferenceName, $match)) {
                $conferenceAcronym = $match[1];
                $conferenceName = trim(preg_replace('/\(([^)]+)\)/', '', $conferenceName));
            }
            $publisher = $this->queryPublisherSearch($conferenceName, $conferenceAcronym, true)->first();
        }

        // 2. Se não achar, busca em QUALQUER publisher (incluindo pendentes) com o LOCATE bidirecional
        if (!$publisher && !$onlyApproved) {
            $publisher = $this->queryPublisherSearch($conferenceName, $conferenceAcronym, false)->first();
        }

        return $publisher;
    }

    /**
     * Prepara e limpa o nome da conferência removendo ruídos.
     */
    private function prepareConferenceName(string $text): string
    {
        $text = $this->removeYear($text);
        
        $text = trim(preg_replace('/\b(international|ieee|annual)\b/iu', '', $text));

        $text = $this->removeOrdinalNumbers($text);

        $text = $this->removerNumerosExtenso($text);
        
        return $this->correctText($text);
    }

    /**
     * Constrói a query base de busca para evitar código duplicado.
     */
    private function queryPublisherSearch(string $conferenceName, ?string $conferenceAcronym, bool $onlyApproved)
    {
        $query = Publishers::query();

        if ($onlyApproved) {
            $query->onlyApproved();
        }

        return $query->where(function ($q) use ($conferenceName, $conferenceAcronym, $onlyApproved) {
            // O nome do Lattes está contido no nome do banco
            $q->whereLike('name', "%$conferenceName%");

            // procuramos com nome contido apenas se estivermos buscando apenas aprovados, para evitar falsos positivos
            if ($onlyApproved) {
                // O nome do banco está contido no nome do Lattes (LOCATE)
                $q->orWhereRaw('LOCATE(name, ?) > 0', [$conferenceName]);
            }

            if ($conferenceAcronym) {
                $q->orWhere('initials', $conferenceAcronym);
            }

            // Trata casos em que o nome da conferência é apenas a sigla (ex: "SBC", "IEEE")
            $q->orWhere('initials', strtoupper($conferenceName));
        });
    }

    private function removeYear(?string $text): ?string
    {
        if (!$text) {
            return null;
        }

        // Remove 4-digit years (e.g., 2020)
        $text = preg_replace('/(?<!\d)(19|20)\d{2}(?!\d)/', '', $text);

        // Remove shortened years like '20
        $text = preg_replace("/'\d{2}\b/", '', $text);

        return trim(preg_replace('/\s+/', ' ', $text));
    }

    private function removeOrdinalNumbers(string $text): string
    {
        $pattern = '/^\d+(?:º|ª|°|st|nd|rd|th)\.?\s*/ui';
        return preg_replace($pattern, '', $text);
    }

    private function correctText(string $text): string
    {
        // Corrige espaçamento antes de pontuações
        $text = preg_replace('/\s+([,\.\?!])/', '$1', $text);
        
        // Corrige espaçamento depois de pontuações
        $text = preg_replace('/([,\.\?!])(?!\s|$)/', '$1 ', $text);
        
        // Remove espaços duplos gerados
        return trim(preg_replace('/\s+/', ' ', $text));
    }

    private function getConferenceAcronym(string $textoSujo): ?string
    {
        $texto = trim($textoSujo);
        $siglaExtraida = null;

        if (preg_match('/^([A-Z0-9]+)(?:\/[A-Z0-9]+)*\s*[\-\:]\s*(.+)$/i', $texto, $matches)) {
            $siglaExtraida = trim($matches[1]);
        }

        return $siglaExtraida ? mb_strtoupper($siglaExtraida) : null;
    }


    private function removerNumerosExtenso($texto) {
        // CARDINAIS - Português
        $cardinais_pt = [
            "zero","um","uma","dois","duas","tres","três","quatro","cinco","seis","sete",
            "oito","nove","dez","onze","doze","treze","catorze","quatorze","quinze",
            "dezesseis","dezasseis","dezessete","dezoito","dezenove",
            "vinte","trinta","quarenta","cinquenta","sessenta",
            "setenta","oitenta","noventa","cem","cento","duzentos",
            "trezentos","quatrocentos","quinhentos","seiscentos",
            "setecentos","oitocentos","novecentos","mil","milhao","milhão",
            "milhoes","milhões","bilhao","bilhão","bilhoes","bilhões"
        ];

        // ORDINAIS - Português
        $ordinais_pt = [
            "primeiro","primeira","segundo","segunda","terceiro","terceira",
            "quarto","quarta","quinto","quinta","sexto","sexta",
            "setimo","sétimo","setima","sétima","oitavo","oitava",
            "nono","nona","decimo","décimo","decima","décima",
            "vigesimo","vigésimo","vigesima","vigésima",
            "trigesimo","trigésimo","centesimo","centésimo",
            "milesimo","milésimo"
        ];

        // CARDINAIS - Inglês
        $cardinais_en = [
            "zero","one","two","three","four","five","six","seven","eight","nine",
            "ten","eleven","twelve","thirteen","fourteen","fifteen",
            "sixteen","seventeen","eighteen","nineteen",
            "twenty","thirty","forty","fifty","sixty",
            "seventy","eighty","ninety",
            "hundred","thousand","million","billion"
        ];

        // ORDINAIS - Inglês
        $ordinais_en = [
            "first","second","third","fourth","fifth","sixth","seventh",
            "eighth","ninth","tenth","eleventh","twelfth","thirteenth",
            "fourteenth","fifteenth","sixteenth","seventeenth",
            "eighteenth","nineteenth",
            "twentieth","thirtieth","fortieth","fiftieth",
            "sixtieth","seventieth","eightieth","ninetieth",
            "hundredth","thousandth","millionth","billionth"
        ];

        $periods = [
            "annual",
            "monthly",
            "estendido",
            "companion",
        ];

        //Ordinais numeros

        // Junta tudo
        $todos = array_merge(
            $cardinais_pt,
            $ordinais_pt,
            $cardinais_en,
            $ordinais_en,
            $periods
        );
        // Cria regex dinâmica
        $padrao = '/\b(' . implode('|', $todos) . ')\b/iu';

        // Remove do texto
        $texto = preg_replace($padrao, '', $texto);
        $texto = preg_replace('/\b\d+(?:st|nd|rd|th)\b/', '', $texto);
        $texto = preg_replace('/\b(?=[MDCLXVI])M{0,4}(CM|CD|D?C{0,3})(X[CL]|L?X{0,3})(I[XV]|V?I{0,3})\b/iu', '', $texto);

        // Remove espaços duplicados
        return trim(preg_replace('/\s+/', ' ', $texto));
    }

}
