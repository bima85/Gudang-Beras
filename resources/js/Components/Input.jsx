const Input = ({
    label,
    type = "text",
    value,
    onChange,
    error,
    min,
    step,
    className,
}) => (
    <div className={`mb-4 ${className}`}>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
        </label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            min={min}
            step={step}
            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
);

export default Input;
