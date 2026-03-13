<?php

namespace App\Providers;

use App\Models\PunchItem;
use App\Observers\PunchItemObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        PunchItem::observe(PunchItemObserver::class);
    }
}
