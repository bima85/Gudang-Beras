import React from 'react';
import { IconTrash, IconPrinter, IconEye } from '@tabler/icons-react';

export default function ActionButton({ onDelete, onPrint, onDetail }) {
    return (
        <div className="flex gap-1">
            {onDetail && (
                <button
                    className="inline-flex items-center px-2 py-1 bg-blue-100 border border-blue-300 text-blue-600 hover:bg-blue-200 rounded text-xs"
                    title="Detail"
                    onClick={onDetail}
                    type="button"
                >
                    <IconEye size={16} />
                </button>
            )}
            {onPrint && (
                <button
                    className="inline-flex items-center px-2 py-1 bg-green-100 border border-green-300 text-green-600 hover:bg-green-200 rounded text-xs"
                    title="Print"
                    onClick={onPrint}
                    type="button"
                >
                    <IconPrinter size={16} />
                </button>
            )}
            {onDelete && (
                <button
                    className="inline-flex items-center px-2 py-1 bg-rose-100 border border-rose-300 text-rose-500 hover:bg-rose-200 rounded text-xs"
                    title="Hapus"
                    onClick={onDelete}
                    type="button"
                >
                    <IconTrash size={16} />
                </button>
            )}
        </div>
    );
}
