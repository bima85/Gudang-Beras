import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, router } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Badge } from "@/Components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/Components/ui/table";
import {
   useReactTable,
   getCoreRowModel,
   getFilteredRowModel,
   getPaginationRowModel,
   getSortedRowModel,
   flexRender,
   createColumnHelper,
} from "@tanstack/react-table";
import {
   Warehouse,
   Building,
   Package,
   Search,
   ArrowUpDown,
   ArrowUp,
   ArrowDown,
   Eye,
   RefreshCw
} from "lucide-react";
import axios from "axios";
import Modal from "@/Components/Modal";

const StockManagement = ({
   warehouseStocks = [],
   storeStocks = [],
   warehouses = [],
   tokos = [],
   filters = {}
}) => {
   const [activeTab, setActiveTab] = useState("warehouse");
   const [globalFilter, setGlobalFilter] = useState("");
   const [selectedWarehouse, setSelectedWarehouse] = useState(filters.warehouse_id || "all");
   const [selectedToko, setSelectedToko] = useState(filters.toko_id || "all");
   const [loading, setLoading] = useState(false);
   const [showDetailsModal, setShowDetailsModal] = useState(false);
   const [selectedStock, setSelectedStock] = useState(null);

   // Warehouse stocks table setup
   const warehouseColumnHelper = createColumnHelper();

   const warehouseColumns = useMemo(() => [
      warehouseColumnHelper.accessor((row) => row.product?.code || '-', {
         id: "product_code",
         header: ({ column }) => (
            <Button
               variant="ghost"
               onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
               className="h-auto p-0 font-semibold"
            >
               Kode Produk
               {column.getIsSorted() === "asc" ? (
                  <ArrowUp className="ml-2 h-4 w-4" />
               ) : column.getIsSorted() === "desc" ? (
                  <ArrowDown className="ml-2 h-4 w-4" />
               ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4" />
               )}
            </Button>
         ),
         cell: ({ getValue }) => (
            <div className="font-medium text-sm">{getValue()}</div>
         ),
      }),
      warehouseColumnHelper.accessor((row) => row.product?.name || '-', {
         id: "product_name",
         header: ({ column }) => (
            <Button
               variant="ghost"
               onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
               className="h-auto p-0 font-semibold"
            >
               Nama Produk
               {column.getIsSorted() === "asc" ? (
                  <ArrowUp className="ml-2 h-4 w-4" />
               ) : column.getIsSorted() === "desc" ? (
                  <ArrowDown className="ml-2 h-4 w-4" />
               ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4" />
               )}
            </Button>
         ),
         cell: ({ getValue }) => (
            <div className="font-medium">{getValue()}</div>
         ),
      }),
      warehouseColumnHelper.accessor((row) => row.warehouse?.name || '-', {
         id: "warehouse_name",
         header: "Gudang",
         cell: ({ getValue }) => (
            <Badge variant="outline" className="text-xs">
               <Warehouse className="w-3 h-3 mr-1" />
               {getValue()}
            </Badge>
         ),
      }),
      warehouseColumnHelper.accessor("qty_in_kg", {
         header: ({ column }) => (
            <Button
               variant="ghost"
               onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
               className="h-auto p-0 font-semibold"
            >
               Stok (Kg)
               {column.getIsSorted() === "asc" ? (
                  <ArrowUp className="ml-2 h-4 w-4" />
               ) : column.getIsSorted() === "desc" ? (
                  <ArrowDown className="ml-2 h-4 w-4" />
               ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4" />
               )}
            </Button>
         ),
         cell: ({ getValue }) => {
            const value = getValue();
            const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
            return (
               <div className="text-right font-semibold text-green-600">
                  {numValue.toLocaleString("id-ID", {
                     minimumFractionDigits: 0,
                     maximumFractionDigits: 2,
                  })} kg
               </div>
            );
         },
      }),
      warehouseColumnHelper.accessor("updated_at", {
         header: ({ column }) => (
            <Button
               variant="ghost"
               onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
               className="h-auto p-0 font-semibold"
            >
               Terakhir Update
               {column.getIsSorted() === "asc" ? (
                  <ArrowUp className="ml-2 h-4 w-4" />
               ) : column.getIsSorted() === "desc" ? (
                  <ArrowDown className="ml-2 h-4 w-4" />
               ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4" />
               )}
            </Button>
         ),
         cell: ({ getValue }) => (
            <div className="text-sm text-muted-foreground">
               {new Date(getValue()).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
               })}
            </div>
         ),
      }),
      warehouseColumnHelper.display({
         id: "actions",
         header: "Aksi",
         cell: ({ row }) => (
            <Button
               variant="outline"
               size="sm"
               onClick={() => handleViewDetails(row.original, "warehouse")}
            >
               <Eye className="w-4 h-4 mr-2" />
               Lihat
            </Button>
         ),
      }),
   ], []);

   // Store stocks table setup
   const storeColumnHelper = createColumnHelper();

   const storeColumns = useMemo(() => [
      storeColumnHelper.accessor((row) => row.product?.code || '-', {
         id: "store_product_code",
         header: ({ column }) => (
            <Button
               variant="ghost"
               onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
               className="h-auto p-0 font-semibold"
            >
               Kode Produk
               {column.getIsSorted() === "asc" ? (
                  <ArrowUp className="ml-2 h-4 w-4" />
               ) : column.getIsSorted() === "desc" ? (
                  <ArrowDown className="ml-2 h-4 w-4" />
               ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4" />
               )}
            </Button>
         ),
         cell: ({ getValue }) => (
            <div className="font-medium text-sm">{getValue()}</div>
         ),
      }),
      storeColumnHelper.accessor((row) => row.product?.name || '-', {
         id: "store_product_name",
         header: ({ column }) => (
            <Button
               variant="ghost"
               onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
               className="h-auto p-0 font-semibold"
            >
               Nama Produk
               {column.getIsSorted() === "asc" ? (
                  <ArrowUp className="ml-2 h-4 w-4" />
               ) : column.getIsSorted() === "desc" ? (
                  <ArrowDown className="ml-2 h-4 w-4" />
               ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4" />
               )}
            </Button>
         ),
         cell: ({ getValue }) => (
            <div className="font-medium">{getValue()}</div>
         ),
      }),
      storeColumnHelper.accessor((row) => row.toko?.name || '-', {
         id: "store_toko_name",
         header: "Toko",
         cell: ({ getValue }) => (
            <Badge variant="outline" className="text-xs">
               <Building className="w-3 h-3 mr-1" />
               {getValue()}
            </Badge>
         ),
      }),
      storeColumnHelper.accessor("qty_in_kg", {
         header: ({ column }) => (
            <Button
               variant="ghost"
               onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
               className="h-auto p-0 font-semibold"
            >
               Stok (Kg)
               {column.getIsSorted() === "asc" ? (
                  <ArrowUp className="ml-2 h-4 w-4" />
               ) : column.getIsSorted() === "desc" ? (
                  <ArrowDown className="ml-2 h-4 w-4" />
               ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4" />
               )}
            </Button>
         ),
         cell: ({ getValue }) => {
            const value = getValue();
            const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
            return (
               <div className="text-right font-semibold text-blue-600">
                  {numValue.toLocaleString("id-ID", {
                     minimumFractionDigits: 0,
                     maximumFractionDigits: 2,
                  })} kg
               </div>
            );
         },
      }),
      storeColumnHelper.accessor("updated_at", {
         header: ({ column }) => (
            <Button
               variant="ghost"
               onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
               className="h-auto p-0 font-semibold"
            >
               Terakhir Update
               {column.getIsSorted() === "asc" ? (
                  <ArrowUp className="ml-2 h-4 w-4" />
               ) : column.getIsSorted() === "desc" ? (
                  <ArrowDown className="ml-2 h-4 w-4" />
               ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4" />
               )}
            </Button>
         ),
         cell: ({ getValue }) => (
            <div className="text-sm text-muted-foreground">
               {new Date(getValue()).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
               })}
            </div>
         ),
      }),
      storeColumnHelper.display({
         id: "actions",
         header: "Aksi",
         cell: ({ row }) => (
            <Button
               variant="outline"
               size="sm"
               onClick={() => handleViewDetails(row.original, "store")}
            >
               <Eye className="w-4 h-4 mr-2" />
               Lihat
            </Button>
         ),
      }),
   ], []);

   // Warehouse table
   const warehouseTable = useReactTable({
      data: warehouseStocks,
      columns: warehouseColumns,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      globalFilterFn: "includesString",
      initialState: {
         pagination: {
            pageSize: 25,
         },
      },
   });

   // Store table
   const storeTable = useReactTable({
      data: storeStocks,
      columns: storeColumns,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      globalFilterFn: "includesString",
      initialState: {
         pagination: {
            pageSize: 25,
         },
      },
   });

   // Update global filter for active table
   useEffect(() => {
      if (activeTab === "warehouse") {
         warehouseTable.setGlobalFilter(globalFilter);
      } else {
         storeTable.setGlobalFilter(globalFilter);
      }
   }, [globalFilter, activeTab, warehouseTable, storeTable]);

   const handleFilterChange = () => {
      setLoading(true);
      const params = {
         search: globalFilter,
      };

      if (activeTab === "warehouse" && selectedWarehouse && selectedWarehouse !== "all") {
         params.warehouse_id = selectedWarehouse;
      } else if (activeTab === "store" && selectedToko && selectedToko !== "all") {
         params.toko_id = selectedToko;
      }

      router.get("/dashboard/stocks/management", params, {
         preserveState: true,
         onFinish: () => setLoading(false),
      });
   };

   const handleViewDetails = (stock, type) => {
      setSelectedStock({ ...stock, type });
      setShowDetailsModal(true);
   };

   const handleRefresh = () => {
      setLoading(true);
      router.reload({
         onFinish: () => setLoading(false),
      });
   };

   return (
      <DashboardLayout>
         <Head title="Manajemen Stok" />

         <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
               <div>
                  <h1 className="text-3xl font-bold tracking-tight">Manajemen Stok</h1>
                  <p className="text-muted-foreground">
                     Pantau dan kelola stok gudang dan toko
                  </p>
               </div>
               <Button onClick={handleRefresh} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
               </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium">Total Produk Gudang</CardTitle>
                     <Warehouse className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">{warehouseStocks.length}</div>
                     <p className="text-xs text-muted-foreground">
                        produk dengan stok
                     </p>
                  </CardContent>
               </Card>
               <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium">Total Stok Gudang</CardTitle>
                     <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">
                        {warehouseStocks
                           .reduce((sum, stock) => sum + (parseFloat(stock.qty_in_kg) || 0), 0)
                           .toLocaleString("id-ID", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 1,
                           })} kg
                     </div>
                     <p className="text-xs text-muted-foreground">
                        total berat gudang
                     </p>
                  </CardContent>
               </Card>
               <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium">Total Produk Toko</CardTitle>
                     <Building className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">{storeStocks.length}</div>
                     <p className="text-xs text-muted-foreground">
                        produk dengan stok
                     </p>
                  </CardContent>
               </Card>
               <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium">Total Stok Toko</CardTitle>
                     <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold">
                        {storeStocks
                           .reduce((sum, stock) => sum + (parseFloat(stock.qty_in_kg) || 0), 0)
                           .toLocaleString("id-ID", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 1,
                           })} kg
                     </div>
                     <p className="text-xs text-muted-foreground">
                        total berat toko
                     </p>
                  </CardContent>
               </Card>
            </div>

            {/* Filters */}
            <Card>
               <CardHeader>
                  <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="flex flex-col md:flex-row gap-4">
                     <div className="flex-1">
                        <Label htmlFor="search" className="text-sm font-medium">
                           Cari Produk
                        </Label>
                        <div className="relative">
                           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                           <Input
                              id="search"
                              placeholder="Cari berdasarkan nama atau kode produk..."
                              value={globalFilter}
                              onChange={(e) => setGlobalFilter(e.target.value)}
                              className="pl-10"
                           />
                        </div>
                     </div>
                     {activeTab === "warehouse" ? (
                        <div className="w-full md:w-64">
                           <Label htmlFor="warehouse" className="text-sm font-medium">
                              Gudang
                           </Label>
                           <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                              <SelectTrigger>
                                 <SelectValue placeholder="Semua Gudang" />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="all">Semua Gudang</SelectItem>
                                 {warehouses.map((warehouse) => (
                                    <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                       {warehouse.name}
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                        </div>
                     ) : (
                        <div className="w-full md:w-64">
                           <Label htmlFor="toko" className="text-sm font-medium">
                              Toko
                           </Label>
                           <Select value={selectedToko} onValueChange={setSelectedToko}>
                              <SelectTrigger>
                                 <SelectValue placeholder="Semua Toko" />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="all">Semua Toko</SelectItem>
                                 {tokos.map((toko) => (
                                    <SelectItem key={toko.id} value={toko.id.toString()}>
                                       {toko.name}
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                        </div>
                     )}
                     <div className="flex items-end">
                        <Button onClick={handleFilterChange} disabled={loading}>
                           {loading ? (
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                           ) : (
                              <Search className="w-4 h-4 mr-2" />
                           )}
                           Terapkan Filter
                        </Button>
                     </div>
                  </div>
               </CardContent>
            </Card>

            {/* Stock Tables */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
               <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="warehouse" className="flex items-center gap-2">
                     <Warehouse className="w-4 h-4" />
                     Stok Gudang
                  </TabsTrigger>
                  <TabsTrigger value="store" className="flex items-center gap-2">
                     <Building className="w-4 h-4" />
                     Stok Toko
                  </TabsTrigger>
               </TabsList>

               <TabsContent value="warehouse" className="space-y-4">
                  <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Warehouse className="w-5 h-5" />
                           Stok Gudang
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <ScrollArea className="h-[600px] w-full rounded-md border">
                           <Table>
                              <TableHeader>
                                 {warehouseTable.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                       {headerGroup.headers.map((header) => (
                                          <TableHead key={header.id}>
                                             {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                   header.column.columnDef.header,
                                                   header.getContext()
                                                )}
                                          </TableHead>
                                       ))}
                                    </TableRow>
                                 ))}
                              </TableHeader>
                              <TableBody>
                                 {warehouseTable.getRowModel().rows?.length ? (
                                    warehouseTable.getRowModel().rows.map((row) => (
                                       <TableRow key={row.id}>
                                          {row.getVisibleCells().map((cell) => (
                                             <TableCell key={cell.id}>
                                                {flexRender(
                                                   cell.column.columnDef.cell,
                                                   cell.getContext()
                                                )}
                                             </TableCell>
                                          ))}
                                       </TableRow>
                                    ))
                                 ) : (
                                    <TableRow>
                                       <TableCell
                                          colSpan={warehouseColumns.length}
                                          className="h-24 text-center"
                                       >
                                          Tidak ada data stok gudang.
                                       </TableCell>
                                    </TableRow>
                                 )}
                              </TableBody>
                           </Table>
                        </ScrollArea>

                        {/* Pagination */}
                        <div className="flex items-center justify-between space-x-2 py-4">
                           <div className="flex-1 text-sm text-muted-foreground">
                              Menampilkan {warehouseTable.getFilteredSelectedRowModel().rows.length} dari{" "}
                              {warehouseTable.getFilteredRowModel().rows.length} produk
                           </div>
                           <div className="flex items-center space-x-2">
                              <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => warehouseTable.previousPage()}
                                 disabled={!warehouseTable.getCanPreviousPage()}
                              >
                                 Previous
                              </Button>
                              <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => warehouseTable.nextPage()}
                                 disabled={!warehouseTable.getCanNextPage()}
                              >
                                 Next
                              </Button>
                           </div>
                        </div>
                     </CardContent>
                  </Card>
               </TabsContent>

               <TabsContent value="store" className="space-y-4">
                  <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Building className="w-5 h-5" />
                           Stok Toko
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <ScrollArea className="h-[600px] w-full rounded-md border">
                           <Table>
                              <TableHeader>
                                 {storeTable.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                       {headerGroup.headers.map((header) => (
                                          <TableHead key={header.id}>
                                             {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                   header.column.columnDef.header,
                                                   header.getContext()
                                                )}
                                          </TableHead>
                                       ))}
                                    </TableRow>
                                 ))}
                              </TableHeader>
                              <TableBody>
                                 {storeTable.getRowModel().rows?.length ? (
                                    storeTable.getRowModel().rows.map((row) => (
                                       <TableRow key={row.id}>
                                          {row.getVisibleCells().map((cell) => (
                                             <TableCell key={cell.id}>
                                                {flexRender(
                                                   cell.column.columnDef.cell,
                                                   cell.getContext()
                                                )}
                                             </TableCell>
                                          ))}
                                       </TableRow>
                                    ))
                                 ) : (
                                    <TableRow>
                                       <TableCell
                                          colSpan={storeColumns.length}
                                          className="h-24 text-center"
                                       >
                                          Tidak ada data stok toko.
                                       </TableCell>
                                    </TableRow>
                                 )}
                              </TableBody>
                           </Table>
                        </ScrollArea>

                        {/* Pagination */}
                        <div className="flex items-center justify-between space-x-2 py-4">
                           <div className="flex-1 text-sm text-muted-foreground">
                              Menampilkan {storeTable.getFilteredSelectedRowModel().rows.length} dari{" "}
                              {storeTable.getFilteredRowModel().rows.length} produk
                           </div>
                           <div className="flex items-center space-x-2">
                              <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => storeTable.previousPage()}
                                 disabled={!storeTable.getCanPreviousPage()}
                              >
                                 Previous
                              </Button>
                              <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => storeTable.nextPage()}
                                 disabled={!storeTable.getCanNextPage()}
                              >
                                 Next
                              </Button>
                           </div>
                        </div>
                     </CardContent>
                  </Card>
               </TabsContent>
            </Tabs>

            {/* Stock Details Modal */}
            <Modal show={showDetailsModal} onClose={() => setShowDetailsModal(false)} maxWidth="lg">
               <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                     <h2 className="text-xl font-semibold">Detail Stok</h2>
                     <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDetailsModal(false)}
                     >
                        ✕
                     </Button>
                  </div>

                  {selectedStock && (
                     <div className="space-y-4">
                        {/* Stock Type Badge */}
                        <div className="flex items-center gap-2 mb-4">
                           {selectedStock.type === "warehouse" ? (
                              <Badge variant="outline" className="text-xs">
                                 <Warehouse className="w-3 h-3 mr-1" />
                                 Stok Gudang
                              </Badge>
                           ) : (
                              <Badge variant="outline" className="text-xs">
                                 <Building className="w-3 h-3 mr-1" />
                                 Stok Toko
                              </Badge>
                           )}
                        </div>

                        {/* Product Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                              <Label className="text-sm font-medium">Kode Produk</Label>
                              <p className="text-sm text-muted-foreground">
                                 {selectedStock.product?.code || '-'}
                              </p>
                           </div>
                           <div>
                              <Label className="text-sm font-medium">Nama Produk</Label>
                              <p className="text-sm text-muted-foreground">
                                 {selectedStock.product?.name || '-'}
                              </p>
                           </div>
                        </div>

                        {/* Location Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {selectedStock.type === "warehouse" ? (
                              <div>
                                 <Label className="text-sm font-medium">Gudang</Label>
                                 <p className="text-sm text-muted-foreground">
                                    {selectedStock.warehouse?.name || '-'}
                                 </p>
                              </div>
                           ) : (
                              <div>
                                 <Label className="text-sm font-medium">Toko</Label>
                                 <p className="text-sm text-muted-foreground">
                                    {selectedStock.toko?.name || '-'}
                                 </p>
                              </div>
                           )}
                           <div>
                              <Label className="text-sm font-medium">Stok (Kg)</Label>
                              <p className="text-sm font-semibold text-green-600">
                                 {selectedStock.qty_in_kg?.toLocaleString("id-ID", {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 2,
                                 })} kg
                              </p>
                           </div>
                        </div>

                        {/* Additional Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                              <Label className="text-sm font-medium">Terakhir Update</Label>
                              <p className="text-sm text-muted-foreground">
                                 {new Date(selectedStock.updated_at).toLocaleDateString("id-ID", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                 })}
                              </p>
                           </div>
                           {selectedStock.updatedBy && (
                              <div>
                                 <Label className="text-sm font-medium">Diupdate Oleh</Label>
                                 <p className="text-sm text-muted-foreground">
                                    {selectedStock.updatedBy.name}
                                 </p>
                              </div>
                           )}
                        </div>

                        {/* Additional stock information */}
                        {selectedStock.type === "warehouse" && (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                              <div>
                                 <Label className="text-sm font-medium">Stok Minimum</Label>
                                 <p className="text-sm text-muted-foreground">
                                    {selectedStock.min_stock || 'Tidak ditentukan'}
                                 </p>
                              </div>
                              <div>
                                 <Label className="text-sm font-medium">Status</Label>
                                 <Badge variant={selectedStock.qty_in_kg > (selectedStock.min_stock || 0) ? "default" : "destructive"}>
                                    {selectedStock.qty_in_kg > (selectedStock.min_stock || 0) ? "Normal" : "Stok Rendah"}
                                 </Badge>
                              </div>
                           </div>
                        )}
                     </div>
                  )}
               </div>
            </Modal>
         </div>
      </DashboardLayout>
   );
};

export default StockManagement;