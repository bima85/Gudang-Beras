import React, { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, router, Link } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Checkbox } from "@/Components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import {
   Table,
   TableHeader,
   TableRow,
   TableHead,
   TableBody,
   TableCell,
} from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import {
   IconCirclePlus,
   IconPencilCog,
   IconTrash,
   IconDatabaseOff,
   IconChevronDown,
   IconChevronRight,
   IconArrowUp,
   IconArrowDown,
   IconArrowsSort,
} from "@tabler/icons-react";
import EmptyState from "@/Components/Dashboard/EmptyState";
import Search from "@/Components/Dashboard/Search";
import Pagination from "@/Components/Dashboard/Pagination";
import { route } from "ziggy-js";
import {
   useReactTable,
   getCoreRowModel,
   getFilteredRowModel,
   getPaginationRowModel,
   getSortedRowModel,
   flexRender,
} from "@tanstack/react-table";

import ProductStatsCards from "@/Components/Dashboard/ProductStatsCards";
import ProductTableSkeleton from "@/Components/Dashboard/ProductTableSkeleton";

function Index({ products, stats, errors }) {
   // Fungsi hapus produk
   const handleDelete = (id, name) => {
      if (confirm(`Yakin ingin menghapus produk "${name}"?`)) {
         router.delete(route("products.destroy", id));
      }
   };

   // State untuk search
   const [search, setSearch] = useState("");
   const [isLoading, setIsLoading] = useState(false);

   // State untuk expanded groups - initialize with all groups expanded
   const [expandedGroups, setExpandedGroups] = useState(() => new Set());

   // Initialize expanded groups when products data changes
   useEffect(() => {
      const newGroups = new Set();
      (products?.data || []).forEach((prod) => {
         const ownerName = prod.supplier?.owner || "";
         if (ownerName !== "") {
            newGroups.add(ownerName);
         }
      });
      setExpandedGroups(newGroups);
   }, [products?.data]);

   // Fungsi handle cari
   const handleSearch = (e) => {
      e.preventDefault();
      setIsLoading(true);
      router.get(route("products.index"), { search }, {
         onFinish: () => setIsLoading(false)
      });
   };

   // Fungsi handle reset
   const handleReset = () => {
      setSearch("");
      setIsLoading(true);
      router.get(route("products.index"), {}, {
         onFinish: () => setIsLoading(false)
      });
   };

   // Prepare data for Tanstack Table with grouping
   const groupedData = useMemo(() => {
      const groups = {};
      const ungrouped = [];

      (products.data || []).forEach((prod) => {
         const ownerName = prod.supplier?.owner || "";
         const groupKey = ownerName;

         // If owner exists, create a group by owner
         if (ownerName !== "") {
            if (!groups[groupKey]) {
               groups[groupKey] = {
                  groupKey,
                  ownerName,
                  products: [],
                  isGroup: true,
                  isExpanded: expandedGroups.has(groupKey),
               };
            }
            groups[groupKey].products.push({
               ...prod,
               categoryName: prod.category?.name || "-",
               subcategoryName: prod.subcategory?.name || "-",
               unitName: prod.unit?.name || "-",
               ownerName: prod.supplier?.owner || "-",
               supplierName: prod.supplier?.name || "-",
            });
         } else {
            // Not grouped
            ungrouped.push({
               ...prod,
               categoryName: prod.category?.name || "-",
               subcategoryName: prod.subcategory?.name || "-",
               unitName: prod.unit?.name || "-",
               ownerName: prod.supplier?.owner || "-",
               supplierName: prod.supplier?.name || "-",
            });
         }
      });

      // Combine grouped and ungrouped data
      const result = [];
      Object.values(groups).forEach((group) => {
         result.push(group); // Group header
         if (group.isExpanded) {
            result.push(...group.products); // Group items only if expanded
         }
      });
      result.push(...ungrouped); // Ungrouped items

      return result;
   }, [products.data, expandedGroups]);

   // Function to toggle group expansion
   const toggleGroupExpansion = (groupKey) => {
      setExpandedGroups(prev => {
         const newSet = new Set(prev);
         if (newSet.has(groupKey)) {
            newSet.delete(groupKey);
         } else {
            newSet.add(groupKey);
         }
         return newSet;
      });
   };

   // Define columns
   const columns = useMemo(
      () => [
         {
            id: "select",
            header: ({ table }) => (
               <Checkbox
                  checked={table.getIsAllPageRowsSelected()}
                  onCheckedChange={(value) =>
                     table.toggleAllPageRowsSelected(!!value)
                  }
                  aria-label="Pilih semua produk"
               />
            ),
            cell: ({ row }) => {
               // Don't show checkbox for group rows
               if (row.original.isGroup) return null;
               return (
                  <Checkbox
                     checked={row.getIsSelected()}
                     onCheckedChange={(value) => row.toggleSelected(!!value)}
                     aria-label={`Pilih produk ${row.original.name}`}
                  />
               );
            },
            enableSorting: false,
            enableColumnFilter: false,
         },
         {
            accessorKey: "barcode",
            header: "Barcode",
            cell: ({ getValue }) => getValue() || "-",
         },
         {
            accessorKey: "supplierName",
            header: "Supplier",
            cell: ({ getValue }) => getValue(),
         },
         {
            accessorKey: "name",
            header: "Nama Produk",
            cell: ({ getValue, row }) => {
               const stock = row.original.stock || 0;
               const minStock = row.original.min_stock || 0;
               const stockStatus = stock <= 0 ? 'out' : stock <= minStock ? 'low' : 'good';
               
               return (
                  <div className="flex items-center gap-2">
                     <span>{getValue() || "-"}</span>
                     {stockStatus === 'out' && (
                        <Badge variant="destructive" className="text-xs">
                           Habis
                        </Badge>
                     )}
                     {stockStatus === 'low' && (
                        <Badge variant="warning" className="text-xs bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                           Stok Rendah
                        </Badge>
                     )}
                     {stockStatus === 'good' && stock > 0 && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 hover:bg-green-100">
                           Tersedia
                        </Badge>
                     )}
                  </div>
               );
            },
         },
         {
            accessorKey: "stock",
            header: "Stok",
            cell: ({ getValue, row }) => {
               const stock = getValue() || 0;
               const minStock = row.original.min_stock || 0;
               const stockStatus = stock <= 0 ? 'text-red-600' : stock <= minStock ? 'text-yellow-600' : 'text-green-600';
               
               return (
                  <span className={`font-medium ${stockStatus}`}>
                     {stock} kg
                  </span>
               );
            },
         },

         {
            accessorKey: "categoryName",
            header: "Kategori",
            cell: ({ getValue }) => (
               <Badge variant="outline" className="text-xs">
                  {getValue()}
               </Badge>
            ),
         },
         {
            accessorKey: "subcategoryName",
            header: "Subkategori",
            cell: ({ getValue }) => getValue(),
         },
         {
            accessorKey: "ownerName",
            header: "Owner",
            cell: ({ getValue }) => getValue(),
         },

         {
            accessorKey: "unitName",
            header: "Satuan",
            cell: ({ getValue }) => getValue(),
         },
         {
            accessorKey: "min_stock",
            header: "Min Stok/Kg",
            cell: ({ getValue }) => getValue() || "-",
         },
         {
            accessorKey: "description",
            header: "Deskripsi",
            cell: ({ getValue }) => getValue() || "-",
         },
         {
            id: "actions",
            header: "Aksi",
            cell: ({ row }) => {
               if (row.original.isGroup) return null; // No actions for group rows
               return (
                  <div className="flex gap-1">
                     <Button variant="ghost" size="sm" asChild className="h-8 px-2">
                        <Link
                           href={route("products.edit", row.original.id)}
                           className="inline-flex items-center gap-1 text-xs hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                           <IconPencilCog size={14} />
                           Edit
                        </Link>
                     </Button>
                     <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs hover:bg-red-50 hover:text-red-600 transition-colors"
                        onClick={() =>
                           handleDelete(row.original.id, row.original.name)
                        }
                     >
                        <IconTrash size={14} />
                        Hapus
                     </Button>
                  </div>
               );
            },
            enableSorting: false,
            enableColumnFilter: false,
         },
      ],
      []
   );

   const table = useReactTable({
      data: groupedData,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      initialState: {
         pagination: {
            pageSize: 15,
         },
         sorting: [
            {
               id: "name",
               desc: false,
            },
         ],
      },
   });

   const selectedRows = table.getFilteredSelectedRowModel().rows.filter(row => !row.original.isGroup);
   const totalProducts = groupedData.filter(item => !item.isGroup).length;
   const handleBulkDelete = () => {
      if (selectedRows.length === 0) return;
      const ids = selectedRows.map((row) => row.original.id);
      if (
         confirm(
            ids.length === totalProducts
               ? "Yakin ingin menghapus SEMUA produk yang sudah diceklist?"
               : `Yakin ingin menghapus ${ids.length} produk yang diceklist?`
         )
      ) {
         router.post(route("products.bulkDestroy"), { ids });
      }
   };

   return (
      <DashboardLayout>
         <div className="min-h-screen p-4 sm:p-6">
            <Head title="Daftar Produk" />

            {/* Stats Cards */}
            <ProductStatsCards stats={stats} />

            <Card className="mb-6">
               <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <CardTitle>Daftar Produk</CardTitle>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                     <Button
                        variant="default"
                        onClick={() =>
                           router.visit(route("products.create"))
                        }
                        className="flex items-center gap-2"
                     >
                        <IconCirclePlus size={16} />
                        Tambah Produk
                     </Button>
                     <form
                        onSubmit={handleSearch}
                        className="flex items-center gap-2"
                     >
                        <Input
                           value={search}
                           onChange={(e) => setSearch(e.target.value)}
                           placeholder="Cari produk..."
                           className="w-48"
                        />
                        <Button type="submit">Cari</Button>
                        <Button
                           className="ml-2"
                           type="button"
                           variant="ghost"
                           onClick={handleReset}
                        >
                           Reset
                        </Button>
                     </form>
                  </div>
               </CardHeader>
               <CardContent>
                  {errors && Object.keys(errors).length > 0 && (
                     <div className="mb-4">
                        {Object.values(errors).map((err, i) => (
                           <div
                              key={i}
                              className="text-sm text-red-600"
                           >
                              {err}
                           </div>
                        ))}
                     </div>
                  )}

                  {isLoading ? (
                     <ProductTableSkeleton />
                  ) : (
                     <div className="rounded-md border">
                        <Table>
                           <TableHeader>
                              {table.getHeaderGroups().map((headerGroup) => (
                                 <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                       <TableHead 
                                          key={header.id}
                                          className={header.column.getCanSort() ? "cursor-pointer select-none hover:bg-muted/50 transition-colors" : ""}
                                          onClick={header.column.getToggleSortingHandler()}
                                       >
                                          <div className="flex items-center gap-2">
                                             {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                   header.column.columnDef.header,
                                                   header.getContext()
                                                )}
                                             {header.column.getCanSort() && (
                                                <div className="flex flex-col">
                                                   {header.column.getIsSorted() === "asc" && (
                                                      <IconArrowUp size={14} className="text-primary" />
                                                   )}
                                                   {header.column.getIsSorted() === "desc" && (
                                                      <IconArrowDown size={14} className="text-primary" />
                                                   )}
                                                   {!header.column.getIsSorted() && (
                                                      <IconArrowsSort size={14} className="text-muted-foreground opacity-50" />
                                                   )}
                                                </div>
                                             )}
                                          </div>
                                       </TableHead>
                                    ))}
                                 </TableRow>
                              ))}
                           </TableHeader>
                           <TableBody>
                              {table.getRowModel().rows?.length ? (
                                 table.getRowModel().rows.map((row) => {
                                    if (row.original.isGroup) {
                                       // Render group header row
                                       return (
                                          <TableRow key={row.id} className="bg-muted/30 hover:bg-muted/40 transition-colors">
                                             <TableCell colSpan={columns.length} className="py-3">
                                                <div
                                                   className="flex items-center gap-2 cursor-pointer hover:bg-muted/60 rounded px-2 py-1 -mx-2 -my-1 transition-colors"
                                                   onClick={() => toggleGroupExpansion(row.original.groupKey)}
                                                >
                                                   {row.original.isExpanded ? (
                                                      <IconChevronDown size={16} className="text-muted-foreground" />
                                                   ) : (
                                                      <IconChevronRight size={16} className="text-muted-foreground" />
                                                   )}
                                                   <Badge variant="secondary" className="text-xs">
                                                      Grup: {row.original.ownerName}
                                                   </Badge>
                                                   <span className="text-sm text-muted-foreground">
                                                      ({row.original.products.length} produk)
                                                   </span>
                                                </div>
                                             </TableCell>
                                          </TableRow>
                                       );
                                    }

                                    // Render regular product row
                                    return (
                                       <TableRow
                                          key={row.id}
                                          data-state={
                                             row.getIsSelected() && "selected"
                                          }
                                          className="hover:bg-muted/50 transition-colors"
                                       >
                                          {row.getVisibleCells().map((cell) => (
                                             <TableCell key={cell.id}>
                                                {flexRender(
                                                   cell.column.columnDef.cell,
                                                   cell.getContext()
                                                )}
                                             </TableCell>
                                          ))}
                                       </TableRow>
                                    );
                                 })
                              ) : (
                                 <TableRow>
                                    <TableCell
                                       colSpan={columns.length}
                                       className="h-24 text-center"
                                    >
                                       <EmptyState
                                          title="Data produk belum ada"
                                          description="Silakan tambahkan produk baru."
                                       />
                                    </TableCell>
                                 </TableRow>
                              )}
                           </TableBody>
                        </Table>
                     </div>
                  )}
               </CardContent>
            </Card>

            {selectedRows.length > 0 && (
               <div className="flex justify-end mb-4">
                  <Button
                     variant="destructive"
                     onClick={handleBulkDelete}
                  >
                     {selectedRows.length === totalProducts
                        ? "Hapus Semua Produk yang Diceklist"
                        : `Hapus ${selectedRows.length} Produk yang Diceklist`}
                  </Button>
               </div>
            )}

            {products.last_page > 1 && (
               <div className="mt-6">
                  <Pagination links={products.links} />
               </div>
            )}
         </div>
      </DashboardLayout>
   );
}

export default Index;
