<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * CORS middleware with origin whitelist and wildcard fallback.
 *
 * Checks the request Origin against a whitelist (localhost:4200 and FRONTEND_URL).
 * Whitelisted origins receive a specific Access-Control-Allow-Origin header.
 * Non-whitelisted or missing origins fall back to a wildcard (*) policy to
 * support development and unknown clients.
 */
class CorsMiddleware
{
    /**
     * Handle an incoming request, attaching CORS headers to the response.
     *
     * @param Request $request
     * @param Closure $next
     * @return \Illuminate\Http\Response|\Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next)
    {
        $allowedOrigins = array_filter([
            'http://localhost:4200',
            env('FRONTEND_URL'),
        ]);

        $origin = $request->header('Origin');

        // Whitelisted origins get a specific CORS header with max-age caching.
        if ($origin && in_array($origin, $allowedOrigins)) {
            $headers = [
                'Access-Control-Allow-Origin' => $origin,
                'Access-Control-Allow-Methods' => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
                'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With, Accept',
                'Access-Control-Max-Age' => '86400',
            ];

            if ($request->isMethod('OPTIONS')) {
                return response('', 204, $headers);
            }

            $response = $next($request);

            foreach ($headers as $key => $value) {
                $response->headers->set($key, $value);
            }

            return $response;
        }

        // Wildcard fallback for non-whitelisted or missing origins.
        if ($request->isMethod('OPTIONS')) {
            return response('', 204, [
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Methods' => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
                'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With, Accept',
            ]);
        }

        $response = $next($request);
        $response->headers->set('Access-Control-Allow-Origin', '*');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');

        return $response;
    }
}
