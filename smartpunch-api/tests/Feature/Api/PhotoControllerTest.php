<?php

namespace Tests\Feature\Api;

use App\Models\Project;
use App\Models\PunchItem;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PhotoControllerTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    private function createPunchItem(): PunchItem
    {
        $project = Project::factory()->create();
        return PunchItem::factory()->create(['project_id' => $project->id]);
    }

    public function test_upload_deficiency_photo(): void
    {
        $item = $this->createPunchItem();
        $photoData = base64_encode('fake-jpeg-binary-data');

        $response = $this->postJson("/api/photos/{$item->id}", [
            'photo' => $photoData,
            'type' => 'deficiency',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['path', 'url']);

        $path = $response->json('path');
        Storage::disk('public')->assertExists($path);

        $this->assertDatabaseHas('punch_items', [
            'id' => $item->id,
            'photo_path' => $path,
        ]);
    }

    public function test_upload_resolution_photo(): void
    {
        $item = $this->createPunchItem();
        $photoData = base64_encode('fake-resolution-photo-data');

        $response = $this->postJson("/api/photos/{$item->id}", [
            'photo' => $photoData,
            'type' => 'resolution',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['path', 'url']);

        $path = $response->json('path');
        Storage::disk('public')->assertExists($path);

        $this->assertDatabaseHas('punch_items', [
            'id' => $item->id,
            'resolution_photo_path' => $path,
        ]);
    }

    public function test_serve_photo_returns_image(): void
    {
        $item = $this->createPunchItem();
        $photoContent = 'fake-jpeg-binary-data';
        $path = "punch-items/{$item->id}/deficiency.jpg";

        Storage::disk('public')->put($path, $photoContent);
        $item->update(['photo_path' => $path]);

        $response = $this->get("/api/photos/{$item->id}/deficiency");

        $response->assertStatus(200)
            ->assertHeader('Content-Type', 'image/jpeg');
    }

    public function test_serve_photo_404_when_no_photo_exists(): void
    {
        $item = $this->createPunchItem();

        $response = $this->get("/api/photos/{$item->id}/deficiency");

        $response->assertStatus(404);
    }

    public function test_verify_file_actually_stored(): void
    {
        $item = $this->createPunchItem();
        $rawContent = 'specific-binary-content-for-verification';
        $photoData = base64_encode($rawContent);

        $response = $this->postJson("/api/photos/{$item->id}", [
            'photo' => $photoData,
            'type' => 'deficiency',
        ]);

        $response->assertStatus(200);
        $path = $response->json('path');

        $storedContent = Storage::disk('public')->get($path);
        $this->assertEquals($rawContent, $storedContent);
    }
}
