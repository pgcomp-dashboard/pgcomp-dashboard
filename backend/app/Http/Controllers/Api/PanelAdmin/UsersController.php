<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Http\Controllers\Api\BaseApiResourceController;
use App\Models\User;
use App\Enums\UserType;
use App\Models\BaseModel;
use App\Http\Responses;
use Illuminate\Http\Request;

class UsersController extends BaseApiResourceController {

    const ANYUSER = "user";
    private string $userType;
    private string $exceptionMessage;
    private array $localFilter;

    function __construct(string $type = self::ANYUSER, string $errorMessage = "Invalid user" , array $filter = [])
    {
        $this->userType = $type;
        $this->exceptionMessage = $errorMessage;
        $this->localFilter = $filter;
    }

    protected function modelClass(): string|BaseModel
    {
        return User::class;
    }

    public function index(Request $request)
    {
        $request->validate([
            'page' => 'int|min:1',
            'per_page' => 'int|min:1|max:100',
            'order_by' => 'string',
            'dir' => 'string|in:asc,desc',
            'filters' => 'array',
            'filters.*.field' => 'string|required',
            'filters.*.value' => 'required',
            'filters.*.operator' => 'string|in:in,not in,like,not like,=,!=',
        ]);

        $query = $this->modelClass()::query();

        $model = $this->newModelInstance();

        $orderBy = $request->input('order_by');
        if ($orderBy && $model->canSortBy($orderBy)) {
            $query->orderBy($orderBy, $request->input('dir', 'asc'));
        }

        $extendedFilter = $request->input('filters', []);
        if(!empty($this->localFilter)) {
            $extendedFilter[] = $this->localFilter;
        }
        $this->applyFilters($query, $extendedFilter);

        return $query->paginate($request->input('per_page'));
    }

    public function store(Request $request)
    {
        $this->checkUserTypeError($request->input('type'));
        return parent::store($request);
    }

    protected function findOrFail(int $id, array $columns = ['*']): BaseModel
    {
        $user = $this->modelClass()::findOrFail($id, $columns);
        $this->checkUserTypeError($user->type->value);
        return $user;
    }

    private function checkUserTypeError(string $foundedType){
        if($foundedType != $this->userType && $this->userType != self::ANYUSER){
            //TODO personalizar exception
            abort(response()->json($this->exceptionMessage, 400));
        }
    }
}
