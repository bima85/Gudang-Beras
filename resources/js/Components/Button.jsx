import { Link } from "@inertiajs/react";
import React from "react";
import { useForm } from "@inertiajs/react";
import Swal from "sweetalert2";

// Tambahkan children agar konten di antara <Button>...</Button> bisa muncul
const Button = ({
    type = "button",
    label,
    className,
    onClick,
    disabled,
    icon,
    url,
    children,
}) => {
    const { delete: destroy } = useForm();

    const handleDelete = (e) => {
        e.preventDefault();
        if (!url) return;
        Swal.fire({
            title: "Apakah kamu yakin ingin menghapus data ini ?",
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Ya, tolong hapus!",
            cancelButtonText: "Tidak",
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(url);
                Swal.fire({
                    title: "Success!",
                    text: "Data berhasil dihapus!",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                });
            }
        });
    };

    if (type === "delete") {
        return (
            <button
                type="button"
                onClick={handleDelete}
                className={`px-4 py-2 rounded-md ${className} ${
                    disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={disabled}
            >
                {icon} {label || children}
            </button>
        );
    }
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`px-4 py-2 rounded-md ${className} ${
                disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
            {icon} {label || children}
        </button>
    );
};

export default Button;
