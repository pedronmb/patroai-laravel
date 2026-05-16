<?php

namespace Database\Seeders;

use App\Models\AvailableModel;
use Illuminate\Database\Seeder;

class AvailableModelSeeder extends Seeder
{
    public function run(): void
    {
        AvailableModel::firstOrCreate(
            ['slug' => 'llama3.1'],
            [
                'display_name' => 'Llama 3.1',
                'is_active' => true,
                'sort_order' => 0,
            ]
        );
    }
}
