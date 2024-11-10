<?php

namespace App\Console\Commands;

use App\Models\Conference;
use App\Models\StratumQualis;
use App\Models\User;
use GuzzleHttp\Client;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use QueryPath\DOMQuery;
use Symfony\Component\Panther\Client as PantherClient;
use Symfony\Component\Panther\DomCrawler\Crawler;

class ConferenceScrapingCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'scholar:productions-scraping';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Extrai dados de produções do Google Scholar dos professores';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->getOutput()->info('Coletando dados do Google Scholar...');
        $ufba_teachers = User::where('type', '=', 'professor')->get()->pluck('name');
        $not_found_teachers = [];

        foreach($ufba_teachers as $ufba_teacher) {
            $this->getOutput()->info('Tentando buscar dados do professor ' . $ufba_teacher . "... \n");

            $name_queries = $this->getNameQueriesFromTeacherName($ufba_teacher);
            $is_ufba_teacher = FALSE;
    
            foreach ($name_queries as $name_query) {
                $authors_list = $this->getAuthorsByQuery($name_query);    

                foreach ($authors_list as $author) {
                    $profile_link = $author->find('h3.gs_ai_name a');
                    
                    if (!$profile_link->length) {
                        continue;
                    }

                    $author_page_dom = $this->getAuthorPageDomQuery($profile_link->attr('href'));
                    
                    if ($this->isUfbaTeacher($author_page_dom)) {
                        $is_ufba_teacher = TRUE;
                        break;
                    }
                }

                if ($is_ufba_teacher){
                    $this->getOutput()->info("\nBuscando artigos do professor " . $ufba_teacher . "\n");
                    $this->saveTeacherArticles($author_page_dom);
                    break;
                }
            }

            if (!$is_ufba_teacher) {
                array_push($not_found_teachers, $ufba_teacher);
            }

            continue;
        }
        
        print_r("\nProfessores não encontrados \n");
        print_r(join(" ", $not_found_teachers));
        print_r("\n\n");

        return 0;
    }

    /**
     * @throws \GuzzleHttp\Exception\GuzzleException
     */
    protected function getAuthorsByQuery($string): DOMQuery
    {
        $client = new Client();
        $query = str_replace(' ', '+', $string);
        $url = 'https://scholar.google.com/citations?hl=en&view_op=search_authors&mauthors=' . $query;
        $html = $client->get($url);

        return html5qp($html->getBody()->getContents())->find('.gs_scl');
    }

    protected function getAuthorPageDomQuery($query): DOMQuery
    {
        $client = new Client();
        $url = 'https://scholar.google.com' . $query;
        $html = $client->get($url);

        return html5qp($html->getBody()->getContents());
    }

    private function isUfbaTeacher(DOMQuery $author_dom) {
        $description = $author_dom->find('.gsc_prf_il');
        
        if ($description && str_contains(strtolower($description->text()), 'ufba')) {
            return TRUE;
        }

        return FALSE;
    }   

    private function getNameQueriesFromTeacherName($teacher_name) {
        $combinations = [$teacher_name];

        $name_parts = explode(' ', $teacher_name);

        if (count($name_parts) <= 2) {
            return $combinations;
        }

        $first_name = $name_parts[0];

         for ($i = 1; $i < count($name_parts); $i++) {
            if (in_array(strtolower($name_parts[$i]), ["de", "do", "da", "dos", "das"])) {
                continue;
            }

            $query = $first_name . ' ' . $name_parts[$i];
            $combinations[] = $query;
        }

        return $combinations;
    }

    private function saveTeacherArticles($teacher_page_dom) {
        $client = PantherClient::createChromeClient();
    }
}
