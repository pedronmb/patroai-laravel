<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AvailableModel extends Model
{
    protected $table = 'available_models';

    protected $fillable = [
        'slug',
        'display_name',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
}
