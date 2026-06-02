<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\User;
use App\Enums\UserType;
use App\Http\Resources\UserResource;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class AdminLattesController extends Controller
{
    /**
     * List professors who have uploaded XML files.
     */
    public function index(Request $request)
    {
        $users = User::whereNotNull('lattes_xml_path')
            ->professors() // Using existing scope
            ->orderBy('lattes_xml_uploaded_at', 'desc')
            ->paginate($request->input('per_page', 15));

        return UserResource::collection($users);
    }

    /**
     * Download a specific user's XML file.
     */
    public function download(int $userId)
    {
        $user = User::findOrFail($userId);

        if (!$user->lattes_xml_path || !Storage::exists($user->lattes_xml_path)) {
            return response()->json(['message' => 'Arquivo não encontrado'], 404);
        }

        $mimeType = Storage::mimeType($user->lattes_xml_path);

        // Try to get extension from the stored path first
        $extension = pathinfo($user->lattes_xml_path, PATHINFO_EXTENSION);

        // Fallback or override based on detected mime type if extension is missing or ambiguous
        if (empty($extension) || $extension === 'tmp') {
            $extension = ($mimeType === 'application/zip') ? 'zip' : 'xml';
        }

        return Storage::download(
            $user->lattes_xml_path,
            "lattes_{$user->id}.{$extension}"
        );
    }
}
