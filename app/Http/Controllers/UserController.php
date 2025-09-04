<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Requests\UserRequest;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\Controller;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // get all users data
        $users = User::query()
            ->with('roles')
            ->when(request()->search, fn($query) => $query->where('name', 'like', '%' . request()->search . '%'))
            ->select('id', 'name', 'avatar', 'email')
            ->latest()
            ->paginate(7)
            ->withQueryString();

        // render view
        return Inertia::render('Dashboard/Users/Index', [
            'users' => $users
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // get all role data
        $roles = Role::query()
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        // render view
        return Inertia::render('Dashboard/Users/Create', [
            'roles' => $roles
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(UserRequest $request)
    {
        // create new user data
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
        ]);

        // assign role to user
        $user->assignRole($request->selectedRoles);

        // assign purchases-access dan transactions-access permission jika dicentang
        if ($request->has('purchasesAccess') && $request->purchasesAccess) {
            $user->givePermissionTo('purchases-access');
        }
        if ($request->has('transactionsAccess') && $request->transactionsAccess) {
            $user->givePermissionTo('transactions-access');
        }

        // render view
        return to_route('users.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        // get all role data
        $roles = Role::query()
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        // load relationship
        $user->load(['roles' => fn($query) => $query->select('id', 'name'), 'roles.permissions' => fn($query) => $query->select('id', 'name')]);

        // render view
        return Inertia::render('Dashboard/Users/Edit', [
            'roles' => $roles,
            'user' => $user
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UserRequest $request, User $user)
    {
        // check if user send request password
        if ($request->password)
            // update user data password
            $user->update([
                'password' => bcrypt($request->password),
            ]);

        // update user data name
        $user->update([
            'name' => $request->name,
        ]);

        // assign role to user
        $user->syncRoles($request->selectedRoles);

        // sync purchases-access dan transactions-access permissions
        $permissions = [];
        if ($request->has('purchasesAccess') && $request->purchasesAccess) {
            $permissions[] = 'purchases-access';
        }
        if ($request->has('transactionsAccess') && $request->transactionsAccess) {
            $permissions[] = 'transactions-access';
        }
        // Only sync permissions when the request explicitly contains permission flags
        // (prevents accidentally removing existing permissions when Edit form doesn't send them)
        if ($request->hasAny(['purchasesAccess', 'transactionsAccess'])) {
            $user->syncPermissions($permissions);
        }

        // render view
        return to_route('users.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $ids = explode(',', $id);

        if (count($ids) > 0)
            User::whereIn('id', $ids)->delete();
        else
            User::findOrFail($id)->delete();

        // render view
        return back();
    }
}
