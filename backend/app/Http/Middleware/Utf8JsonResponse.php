<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Utf8JsonResponse
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($response instanceof JsonResponse && $response->headers->get('content-type') === 'application/json') {
            // 3. Check if the client indicates it accepts UTF‑8
            //    (via Accept-Charset or a charset parameter on Accept)
            $acceptCharset = strtolower($request->header('Accept-Charset', ''));
            $acceptHeader = strtolower($request->header('Accept', ''));

            $wantsUtf8 =
                str_contains($acceptCharset, 'utf-8')
                || preg_match('/charset\s*=\s*utf-8/', $acceptHeader);

            if ($wantsUtf8) {
                // 4. Merge in the JSON_UNESCAPED_UNICODE flag
                $options = $response->getEncodingOptions();
                $response->setEncodingOptions($options | JSON_UNESCAPED_UNICODE);

                // 5. Make absolutely sure the charset header is set
                $response->headers->set('Content-Type', 'application/json; charset=UTF-8');
            }
        }

        return $response;
    }
}
