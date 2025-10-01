import React from "react";

const ProductTableSkeleton = () => {
   return (
      <div className="animate-pulse">
         {/* Header skeleton */}
         <div className="h-12 bg-muted rounded mb-4"></div>
         
         {/* Table skeleton */}
         <div className="border rounded-md">
            {/* Table header */}
            <div className="h-12 bg-muted/30 border-b"></div>
            
            {/* Table rows */}
            {Array.from({ length: 6 }).map((_, index) => (
               <div key={index} className="h-16 border-b last:border-b-0 flex items-center px-4 gap-4">
                  <div className="w-4 h-4 bg-muted/50 rounded"></div>
                  <div className="w-24 h-4 bg-muted/50 rounded"></div>
                  <div className="w-32 h-4 bg-muted/50 rounded"></div>
                  <div className="w-40 h-4 bg-muted/50 rounded"></div>
                  <div className="w-20 h-4 bg-muted/50 rounded"></div>
                  <div className="w-24 h-4 bg-muted/50 rounded"></div>
                  <div className="w-16 h-4 bg-muted/50 rounded"></div>
                  <div className="w-20 h-4 bg-muted/50 rounded"></div>
                  <div className="w-16 h-4 bg-muted/50 rounded"></div>
                  <div className="w-24 h-4 bg-muted/50 rounded"></div>
               </div>
            ))}
         </div>
      </div>
   );
};

export default ProductTableSkeleton;