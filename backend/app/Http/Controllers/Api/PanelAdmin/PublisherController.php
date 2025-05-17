<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Http\Controllers\Api\BaseApiResourceController;
use App\Models\BaseModel;
use App\Models\Publishers;
use Illuminate\Http\Request;

class PublisherController extends BaseApiResourceController
{
    protected $selectColumns = [
        'publishers.id',
        'publishers.initials',
        'publishers.name',
        'publishers.publisher_type',
        'publishers.issn',
        'publishers.percentile',
        'publishers.update_date',
        'publishers.tentative_date',
        'publishers.logs',
        'publishers.stratum_qualis_id',
        'publishers.created_at',
        'publishers.updated_at'
    ];

    protected function modelClass(): string|BaseModel
    {
        return Publishers::class;
    }

    public function index(Request $request)
    {
        // Determine if we're on journals or conferences route
        $routeName = $request->route()->getName();
        
        if (str_contains($routeName, 'journals')) {
            $this->journalQuery();
        } else {
            $this->conferenceQuery();
        }
        
        return $this->query->paginate();
    }
    
    public function journalQuery()
    {
        $this->query = $this->newBaseQuery()
            ->select($this->selectColumns)
            ->where('publishers.publisher_type', '=', 'journal');
    }

    public function conferenceQuery()
    {
        $this->query = $this->newBaseQuery()
            ->select($this->selectColumns)
            ->where('publishers.publisher_type', '=', 'conference');
    }
}
