<?php

namespace App\Domain\Sigaa;

use Exception;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\GuzzleException;
use Log;
use QueryPath\DOMQuery;

abstract class BaseScraping
{
    abstract public function scrapingByCourse(int $courseId): array;

    /**
     * @throws Exception
     */
    protected function getDOMQuery(string $url, array $queryParams = []): DOMQuery
    {
        $httpClient = new Client();
        try {
            $response = $httpClient->get($url, ['query' => $queryParams]);
        } catch (GuzzleException $e) {
            Log::error('Erro ao buscar dados.', func_get_args());
            Log::error($e);
            throw new Exception('Não foi possível buscar os dados');
        }
        $html = $response->getBody()->getContents();

        return html5qp($html);
    }

    protected function getSiapeId(string $text): ?int
    {
        $url = parse_url($text);
        $query = explode('&', $url['query']);

        $params = [];
        foreach ($query as $item) {
            [$key, $value] = explode('=', $item);
            $params[$key] = $value;
        }

        if (!empty($params['siape'])) {
            return (int)$params['siape'];
        }

        return null;
    }
}
