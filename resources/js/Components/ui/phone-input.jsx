import React from "react";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Phone } from "lucide-react";

export default function PhoneInput({
    id = "phone",
    label = "Telepon",
    placeholder = "Masukkan nomor telepon (hanya angka)",
    value,
    onChange,
    error,
    required = false,
    maxLength = 15,
    className = "",
    ...props
}) {
    // Function to handle phone input (only numbers)
    function handlePhoneChange(e) {
        const inputValue = e.target.value;
        // Remove any non-numeric characters
        const numericValue = inputValue.replace(/\D/g, "");
        onChange(numericValue);
    }

    // Function to prevent non-numeric input on keypress
    function handlePhoneKeyPress(e) {
        // Allow: backspace, delete, tab, escape, enter
        if (
            [8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
            // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            (e.keyCode === 65 && e.ctrlKey === true) ||
            (e.keyCode === 67 && e.ctrlKey === true) ||
            (e.keyCode === 86 && e.ctrlKey === true) ||
            (e.keyCode === 88 && e.ctrlKey === true)
        ) {
            return;
        }
        // Ensure that it is a number and stop the keypress
        if (
            (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
            (e.keyCode < 96 || e.keyCode > 105)
        ) {
            e.preventDefault();
        }
    }

    // Format phone number for display (if more than 8 digits)
    function formatPhoneDisplay(phone) {
        if (!phone || phone.length < 8) return phone;

        // Format Indonesian phone numbers
        if (phone.length <= 12) {
            return phone.replace(
                /(\d{4})(\d{4})(\d{4})?/g,
                (match, p1, p2, p3) => {
                    return p3 ? `${p1}-${p2}-${p3}` : `${p1}-${p2}`;
                }
            );
        } else {
            return phone.replace(
                /(\d{4})(\d{4})(\d{4})(\d{3})?/g,
                (match, p1, p2, p3, p4) => {
                    return p4 ? `${p1}-${p2}-${p3}-${p4}` : `${p1}-${p2}-${p3}`;
                }
            );
        }
    }

    return (
        <div className="space-y-2">
            <Label htmlFor={id} className={required ? "required" : ""}>
                {label}
            </Label>
            <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    id={id}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className={`pl-10 ${className}`}
                    placeholder={placeholder}
                    value={value}
                    onChange={handlePhoneChange}
                    onKeyDown={handlePhoneKeyPress}
                    maxLength={maxLength}
                    required={required}
                    {...props}
                />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {value && value.length >= 8 && (
                <p className="text-xs text-muted-foreground">
                    Format: {formatPhoneDisplay(value)}
                </p>
            )}
            {value && value.length > 0 && value.length < 8 && (
                <p className="text-xs text-yellow-600">
                    Nomor telepon harus minimal 8 digit
                </p>
            )}
        </div>
    );
}
