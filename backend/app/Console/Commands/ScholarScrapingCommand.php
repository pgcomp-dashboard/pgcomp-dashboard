<?php

namespace App\Console\Commands;

use App\Models\Conference;
use App\Models\Journal;
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

class ScholarScrapingCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'scraping:scholar-productions-scraping';

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

        foreach (['Ricardo Rios'] as $ufba_teacher) {
            $this->getOutput()->info('Tentando buscar dados do professor ' . $ufba_teacher . "... \n");

            $name_queries = $this->getNameQueriesFromTeacherName($ufba_teacher);
            $is_ufba_teacher = FALSE;

            foreach ($name_queries as $name_query) {
                print_r('request 1');
                $authors_list = $this->getAuthorsByQuery($name_query);
                $author_page_url = NULL;

                foreach ($authors_list as $author) {
                    print_r('request 2');
                    $author_page_url = $this->getAuthorPageUrl($author);

                    if (!$author_page_url) {
                        continue;
                    }

                    $is_ufba_teacher = TRUE;
                    break;
                }

                if ($is_ufba_teacher) {
                    $this->getOutput()->info("\nBuscando artigos do professor " . $ufba_teacher . "\n");
                    print_r('request 3');
                    $this->saveTeacherArticles($author_page_url);
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

    private function getProxy() {
        $proxyIp = '52.67.10.183';
        $proxyPort = '80';
        return "http://{$proxyIp}:{$proxyPort}";
    }

    private function getClient() {
        return new Client([
            'proxy' => $this->getProxy(),
            'timeout' => 0,
            // 'verify' => storage_path('cacert.pem'),
            'connect_timeout' => 0,
            'headers' => [
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept-Language' => 'en-US,en;q=0.9',
                'Referer' => 'https://scholar.google.com/',
            ],
        ]);
    }

    /**
     * @throws \GuzzleHttp\Exception\GuzzleException
     */
    protected function getAuthorsByQuery($string): DOMQuery
    {
        $client = $this->getClient();
        $query = str_replace(' ', '+', $string);
        $url = 'https://scholar.google.com/citations?hl=en&view_op=search_authors&mauthors=' . $query;
        $html = $client->get($url);

        return html5qp($html->getBody()->getContents())->find('.gs_scl');
    }

    protected function getAuthorPageDomQuery($query): DOMQuery
    {
        $client = $this->getClient();
        $url = 'https://scholar.google.com' . $query;
        $html = $client->get($url);

        return html5qp($html->getBody()->getContents());
    }

    private function isUfbaTeacher(DOMQuery $author_dom)
    {
        $description = $author_dom->find('.gsc_prf_il');

        if ($description && str_contains(strtolower($description->text()), 'ufba')) {
            return TRUE;
        }

        return FALSE;
    }

    private function getNameQueriesFromTeacherName($teacher_name)
    {
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

    private function getAuthorPageUrl($author_div)
    {
        $profile_link = $author_div->find('h3.gs_ai_name a');

        if (!$profile_link->length) {
            return FALSE;
        }

        $author_page_dom = $this->getAuthorPageDomQuery($profile_link->attr('href'));

        if ($this->isUfbaTeacher($author_page_dom)) {
            return $profile_link->attr('href');
        }

        return FALSE;
    }

    private function saveTeacherArticles($author_url)
    {
        $proxy_server = $this->getProxy();
        $client = PantherClient::createChromeClient(null, ['--no-sandbox', '--disable-dev-shm-usage', 
        '--headless', '--remote-debugging-port=9222', "--proxy-server={$proxy_server}"]);
        $page_url = 'https://scholar.google.com' . $author_url;

        print_r($page_url);

        $client->request('GET', $page_url);
        $crawler = $client->waitFor('#gsc_bpf');

        $show_more_button = $client->getCrawler()->filter('#gsc_bpf_more');

        if ($show_more_button->count() > 0) {
            print_r("\n\nBotão de show more encontrado\n\n");
            $show_more_button->click();
            print_r("\n\nClique no botão show more executado. Aguardando 5 segundos...\n\n");
            sleep(5);
        }

        $form_action = $author_url . '&view_op=list_works';
        $production_found = 0;
        $production_not_found = 0;
        $crawler->filterXPath("//form[@action='{$form_action}']")->each(function (Crawler $row) 
            use (&$production_found, &$production_not_found) {
            $rows_on_node = $row->filter('table tr')->count();
            if ($rows_on_node > 0) {
                $row->filter('table tr')->each(function (Crawler $table_row) use (&$production_found, &$production_not_found) {
                    if ($table_row->filter('td')->count()) {
                        $citation_href = $table_row->filter('td')->filter('a')->attr('href');
                        $article = $this->getArticleData($citation_href);

                        if ($article === 'get_error') {
                            print_r("Produções encontradas: " . $production_found);
                            print_r("Produções não encontradas: " . $production_not_found);
                            die;
                        }

                        if (isset($article['Journal']) || isset($article['Source']) || isset($article['Publisher'])) {
                            $param = isset($article['Journal']) ? 'Journal' : (isset($article['Source']) ? 'Source' : 'Publisher');
                            $journal_query = Journal::where('name', 'LIKE', '%' . $article[$param])->first();
                            if ($journal_query) {
                                $production_found += 1;
                                print_r("\n\n{$param} encontrado: "  . $journal_query->name . "\n\n");
                            } else {
                                $production_not_found += 1;
                                print_r("\n\n{$param}  não encontrado: "  . $article[$param] . "\n\n");
                            }
                        } else if (isset($article['Conference'])) {
                            $journal_query = Conference::where('name', 'LIKE', '%' . $article['Conference'])->first();
                            if ($journal_query) {
                                $production_found += 1;
                                print_r("\n\Conference encontrado: "  . $journal_query->name . "\n\n");
                            } else {
                                $production_not_found += 1;
                                print_r("\n\Conference não encontrado: "  . $article['Conference'] . "\n\n");
                            }
                        } else {
                            $production_not_found += 1;
                            print_r("\n\n Artigo não processado: " . $citation_href . "\n\n");
                        }
                    }
                });
            }
        });

        print_r("Produções encontradas: " . $production_found);
        print_r("Produções não encontradas: " . $production_not_found);
    }

    private function getArticleData($article_url)
    {
        $page_url = 'https://scholar.google.com' . $article_url;
        try {
            $client = $this->getClient();
            $html = $client->get($page_url);
            $article_data = [];
    
            $dom = html5qp($html->getBody()->getContents());
    
            $dom->find('.gs_scl')->each(function ($idx, $dom_element) use (&$article_data) {
                $div = qp($dom_element);
                $field = $div->find('.gsc_oci_field')->text();
                $value = $div->find('.gsc_oci_value')->text();
    
                if (!empty($field) && !empty($value)) {
                    $article_data[trim($field)] = trim($value);
                }
            });
    
            return $article_data;
        } catch(\Exception $e) {
            return 'get_error';
        }
    }
}
