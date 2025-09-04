const InputSelect = ({
    label,
    data = [],
    selected,
    setSelected,
    placeholder = "Pilih...",
    displayKey,
    error,
    className,
}) => {
    const value = selected?.id ? String(selected.id) : "";

    return (
        <div className={`mb-4 ${className || ""}`}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </label>
            <select
                value={value}
                onChange={(e) => {
                    const selectedOption = data.find(
                        (d) => String(d.id) === e.target.value
                    );
                    setSelected(selectedOption || null);
                }}
                className={`mt-1 block w-full border rounded-md shadow-sm 
                    ${
                        error
                            ? "border-red-500 focus:border-red-500"
                            : "border-gray-300 dark:border-gray-700"
                    }
                    dark:bg-gray-900 dark:text-white focus:ring focus:ring-indigo-200 focus:ring-opacity-50`}
            >
                <option value="">{placeholder}</option>
                {data.map((item) => (
                    <option key={item.id} value={String(item.id)}>
                        {item[displayKey] || item.label || item.value}
                    </option>
                ))}
            </select>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
};

export default InputSelect;
