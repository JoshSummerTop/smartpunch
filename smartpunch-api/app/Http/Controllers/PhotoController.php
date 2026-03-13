<?php

namespace App\Http\Controllers;

use App\Models\PunchItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Controller for uploading and serving punch item photos.
 *
 * Accepts base64-encoded photo data, stores it on the public disk, and
 * serves stored photos with appropriate content headers.
 */
class PhotoController extends Controller
{
    /**
     * Upload a base64-encoded photo for a punch item.
     *
     * Supports two types: 'deficiency' (initial issue photo) and 'resolution'
     * (proof of fix). Decodes base64 data and writes to public storage.
     *
     * @param Request   $request   Must contain 'photo' (base64 string) and 'type' (deficiency|resolution).
     * @param PunchItem $punchItem Route-model-bound punch item.
     * @return \Illuminate\Http\JsonResponse {path: string, url: string}
     */
    public function store(Request $request, PunchItem $punchItem)
    {
        $request->validate([
            'photo' => 'required|string',
            'type' => 'required|in:deficiency,resolution',
        ]);

        $photoData = base64_decode($request->input('photo'), true);
        if ($photoData === false) {
            return response()->json(['message' => 'Invalid base64 photo data'], 422);
        }

        $type = $request->input('type');
        $filename = $type === 'resolution' ? 'resolution.jpg' : 'deficiency.jpg';
        $path = "punch-items/{$punchItem->id}/{$filename}";

        Storage::disk('public')->put($path, $photoData);

        $field = $type === 'resolution' ? 'resolution_photo_path' : 'photo_path';
        $punchItem->update([$field => $path]);

        return response()->json([
            'path' => $path,
            'url' => url("api/photos/{$punchItem->id}/{$type}"),
        ]);
    }

    /**
     * Serve a stored photo for a punch item.
     *
     * @param PunchItem $punchItem Route-model-bound punch item.
     * @param string    $type      Photo type: 'deficiency' or 'resolution'.
     * @return \Illuminate\Http\Response JPEG image with 24-hour cache header, or 404.
     */
    public function show(PunchItem $punchItem, string $type)
    {
        if (!in_array($type, ['deficiency', 'resolution'])) {
            abort(404);
        }

        $field = $type === 'resolution' ? 'resolution_photo_path' : 'photo_path';
        $path = $punchItem->$field;

        if (!$path || !Storage::disk('public')->exists($path)) {
            abort(404);
        }

        return response(Storage::disk('public')->get($path))
            ->header('Content-Type', 'image/jpeg')
            ->header('Cache-Control', 'public, max-age=86400');
    }
}
