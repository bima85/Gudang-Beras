import React from "react";

export default function SupplierManualModal({
    show,
    onClose,
    onSubmit,
    manualSupplier,
    onChange,
}) {
    if (!show) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    onClick={onClose}
                    type="button"
                >
                    &times;
                </button>
                <h3 className="text-lg font-semibold mb-4">
                    Tambah Supplier Manual
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">
                            Nama Supplier
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={manualSupplier.name}
                            onChange={onChange}
                            className="form-input w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">
                            Alamat Supplier
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={manualSupplier.address}
                            onChange={onChange}
                            className="form-input w-full"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">
                            No. Telepon Supplier
                        </label>
                        <input
                            type="text"
                            name="phone"
                            value={manualSupplier.phone}
                            onChange={onChange}
                            className="form-input w-full"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                            onClick={onClose}
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                            onClick={onSubmit}
                        >
                            Simpan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
