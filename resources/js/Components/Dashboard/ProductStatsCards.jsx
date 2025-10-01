import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { IconPackage, IconAlertTriangle, IconCheck, IconX } from "@tabler/icons-react";

const ProductStatsCards = ({ stats }) => {
   return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
         <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Total Produk</CardTitle>
               <IconPackage className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold">{stats?.total || 0}</div>
               <p className="text-xs text-muted-foreground">
                  Semua produk terdaftar
               </p>
            </CardContent>
         </Card>

         <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Stok Tersedia</CardTitle>
               <IconCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold text-green-600">{stats?.inStock || 0}</div>
               <p className="text-xs text-muted-foreground">
                  Produk dengan stok baik
               </p>
            </CardContent>
         </Card>

         <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Stok Rendah</CardTitle>
               <IconAlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold text-yellow-600">{stats?.lowStock || 0}</div>
               <p className="text-xs text-muted-foreground">
                  Perlu restock segera
               </p>
            </CardContent>
         </Card>

         <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium">Stok Habis</CardTitle>
               <IconX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold text-red-600">{stats?.outOfStock || 0}</div>
               <p className="text-xs text-muted-foreground">
                  Produk tidak tersedia
               </p>
            </CardContent>
         </Card>
      </div>
   );
};

export default ProductStatsCards;