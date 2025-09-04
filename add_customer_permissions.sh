#!/bin/bash

# Script untuk menambahkan permission checks ke CustomerController
# Jalankan dengan: bash add_customer_permissions.sh

cd "$(dirname "$0")"

echo "Adding permission checks to CustomerController..."

# Backup original file
cp app/Http/Controllers/Apps/CustomerController.php app/Http/Controllers/Apps/CustomerController.php.backup

# Create temporary file with permission checks
cat > temp_customer_controller.php << 'EOF'
<?php

namespace App\Http\Controllers\Apps;

use Inertia\Inertia;
use App\Models\Customer;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('customers-access')) {
            abort(403, 'Unauthorized');
        }

        //get customers
        $customers = Customer::when(request()->search, function ($customers) {
            $customers = $customers->where('name', 'like', '%' . request()->search . '%');
        })->latest()->paginate(5);

        //return inertia
        return Inertia::render('Dashboard/Customers/Index', [
            'customers' => $customers,
            'filters' => request()->only('search'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('customers-create')) {
            abort(403, 'Unauthorized');
        }

        //return inertia
        return Inertia::render('Dashboard/Customers/Create');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('customers-create')) {
            abort(403, 'Unauthorized');
        }

        //validate request
        $request->validate([
            'name'     => 'required',
            'email'    => 'required|email|unique:customers',
            'phone'    => 'required',
            'address'  => 'required',
        ]);

        //create customer
        Customer::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'phone'    => $request->phone,
            'address'  => $request->address,
        ]);

        //redirect
        return to_route('customers.index')->with('success', 'Data berhasil disimpan!');
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Customer  $customer
     * @return \Inertia\Response
     */
    public function edit(Customer $customer)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('customers-edit')) {
            abort(403, 'Unauthorized');
        }

        //return inertia
        return Inertia::render('Dashboard/Customers/Edit', [
            'customer' => $customer,
        ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Customer  $customer
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Customer $customer)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('customers-edit')) {
            abort(403, 'Unauthorized');
        }

        //validate request
        $request->validate([
            'name'     => 'required',
            'email'    => 'required|email|unique:customers,email,' . $customer->id,
            'phone'    => 'required',
            'address'  => 'required',
        ]);

        //update customer
        $customer->update([
            'name'     => $request->name,
            'email'    => $request->email,
            'phone'    => $request->phone,
            'address'  => $request->address,
        ]);

        //redirect
        return to_route('customers.index')->with('success', 'Data berhasil diubah!');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('customers-delete')) {
            abort(403, 'Unauthorized');
        }

        //get customer
        $customer = Customer::findOrFail($id);

        //delete customer
        $customer->delete();

        //redirect
        return back()->with('success', 'Data berhasil dihapus!');
    }
}
EOF

# Replace original file
mv temp_customer_controller.php app/Http/Controllers/Apps/CustomerController.php

echo "Permission checks added to CustomerController successfully!"
echo "Backup saved as CustomerController.php.backup"
