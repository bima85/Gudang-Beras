import React, { useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import {
    IconChevronDown,
    IconCircle,
    IconCircleFilled,
} from "@tabler/icons-react";

export default function InputSelect({
    selected,
    data,
    setSelected,
    label,
    errors,
    placeholder,
    multiple = false,
    searchable = false,
    displayKey = "name",
}) {
    const [search, setSearch] = useState("");

    const filteredData = Array.isArray(data)
        ? data.filter(
              (item) =>
                  item &&
                  item[displayKey] &&
                  typeof item[displayKey] === "string" &&
                  item[displayKey].toLowerCase().includes(search.toLowerCase())
          )
        : [];

    const getDisplayValue = (item) => {
        if (!item) return "";
        if (
            typeof item === "object" &&
            item.hasOwnProperty(displayKey) &&
            typeof item[displayKey] === "string"
        )
            return item[displayKey];
        return "";
    };

    return (
        <div className="flex flex-col gap-2">
            <label className="text-gray-600 text-sm">{label}</label>
            <Listbox
                value={selected || null}
                onChange={setSelected}
                multiple={multiple}
                by="id"
            >
                <Listbox.Button
                    className={
                        "w-full px-3 py-1.5 border text-sm rounded-md focus:outline-none focus:ring-0 flex justify-between items-center gap-8 bg-white text-gray-700 focus:border-gray-200 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:focus:border-gray-700 dark:border-gray-800"
                    }
                >
                    {multiple
                        ? Array.isArray(selected) && selected.length > 0
                            ? selected.map(getDisplayValue).join(", ")
                            : placeholder
                        : getDisplayValue(selected) || placeholder}
                    <IconChevronDown size={20} strokeWidth={1.5} />
                </Listbox.Button>
                <Transition
                    as={React.Fragment}
                    enter="transition ease-out duration-150"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                >
                    <Listbox.Options
                        className={
                            "p-4 border rounded-lg flex flex-col gap-2 bg-gray-100 dark:border-gray-900 dark:bg-gray-950 origin-top"
                        }
                    >
                        {searchable && (
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search..."
                                className="w-full px-3 py-1.5 mb-2 text-sm border rounded-md bg-white text-gray-700 border-gray-200 focus:outline-none focus:border-gray-300 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800 dark:focus:border-gray-700"
                            />
                        )}
                        {filteredData.map((item) => (
                            <Listbox.Option key={item.id} value={item}>
                                {({ selected }) => (
                                    <div className="text-sm cursor-pointer px-3 py-1.5 rounded-lg flex items-center gap-2 bg-white text-gray-700 hover:bg-gray-200 border dark:bg-gray-900 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 ">
                                        {selected ? (
                                            <IconCircleFilled
                                                size={15}
                                                strokeWidth={1.5}
                                                className="text-teal-500"
                                            />
                                        ) : (
                                            <IconCircle
                                                size={15}
                                                strokeWidth={1.5}
                                            />
                                        )}
                                        {getDisplayValue(item)}
                                    </div>
                                )}
                            </Listbox.Option>
                        ))}
                    </Listbox.Options>
                </Transition>
            </Listbox>
            {errors && (
                <small className="text-xs text-red-500">
                    {Array.isArray(errors) ? errors.join(", ") : errors}
                </small>
            )}
        </div>
    );
}
