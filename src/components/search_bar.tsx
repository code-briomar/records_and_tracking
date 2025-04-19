import { Input } from "@heroui/input";
import { SearchIcon } from "lucide-react";
import { search_data } from "./search_data.ts";
import { useState } from "react";
import {Modal, ModalBody, ModalContent, ModalHeader, Divider, useDisclosure} from "@heroui/react";
import {Link} from "@heroui/link";

export const CustomSearchBar = () => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filteredResults, setFilteredResults] = useState<any[]>([]);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const handleValueChange = (value: string) => {
        setSearchTerm(value);

        if (value.length > 0) {
            const results = search_data.filter(item => {
                const searchValue = value.toLowerCase();

                // Check if the page name or any of the page items or description match the search value
                return (
                    item.page.toLowerCase().includes(searchValue) ||
                    item.page_items.some(pageItem =>
                        pageItem.toLowerCase().includes(searchValue)
                    ) ||
                    (item.description && item.description.toLowerCase().includes(searchValue))
                );
            });

            setFilteredResults(results);
            onOpen(); // Open the modal when there are results
        } else {
            setFilteredResults([]);
            onOpenChange(); // Close modal if input is cleared
        }
    };

    return (
        <>
        {!isOpen && (
            <Input
                onValueChange={handleValueChange}
                isClearable
                classNames={{
                    label: "text-black/50 dark:text-white/90",
                    input: [
                        "bg-transparent",
                        "text-black/90 dark:text-white/90",
                        "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                    ],
                    innerWrapper: "bg-transparent",
                    inputWrapper: [
                        "shadow-md",
                        "bg-default-200/50",
                        "dark:bg-default/60",
                        "backdrop-blur-xl",
                        "backdrop-saturate-200",
                        "hover:bg-default-200/70",
                        "dark:hover:bg-default/70",
                        "group-data-[focus=true]:bg-default-200/50",
                        "dark:group-data-[focus=true]:bg-default/60",
                        "!cursor-text",
                    ],
                }}
                value={searchTerm}
                placeholder="Type to search..."
                radius="lg"
                startContent={
                    <SearchIcon className="text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
                }
            />
        )}



            <Modal
                className={"h-3/4 min-w-[1200px]"}
            backdrop="blur"
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">Search Results</ModalHeader>
                <ModalBody className={"overflow-y-scroll"}>
                    <div className={"absolute w-1/3"}>
                        <Input
                            autoFocus={true}
                            onValueChange={handleValueChange}
                            value={searchTerm}
                            isClearable
                            classNames={{
                                label: "text-black/50 dark:text-white/90",
                                input: [
                                    "bg-transparent",
                                    "text-black/90 dark:text-white/90",
                                    "placeholder:text-default-700/50 dark:placeholder:text-white/60",
                                ],
                                innerWrapper: "bg-transparent",
                                inputWrapper: [
                                    "shadow-md",
                                    "bg-default-200/50",
                                    "dark:bg-default/60",
                                    "backdrop-blur-xl",
                                    "backdrop-saturate-200",
                                    "hover:bg-default-200/70",
                                    "dark:hover:bg-default/70",
                                    "group-data-[focus=true]:bg-default-200/50",
                                    "dark:group-data-[focus=true]:bg-default/60",
                                    "!cursor-text",
                                ],
                            }}
                            placeholder="Type to search..."
                            radius="lg"
                            startContent={
                                <SearchIcon className="text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
                            }
                        />
                    </div>
                    {filteredResults.length > 0 ? (
                        <div className={"mt-[50px] flex flex-col space-y-5"}>
                            {filteredResults.map((item, index) => (
                                <div key={index}>
                                    <h1 className={"text-3xl font-semibold capitalize"}>{item.page}</h1>
                                    <p className={"text-lg px-2 py-2"}>
                                    </p>

                                    <Link href={"javascript:void(0)"}>
                                    {item.page_items.join(", ")}
                                    </Link>
                                    <Divider className="my-4" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No results found.</p>
                    )}
                </ModalBody>{" "}
                {/* ✅ Form & buttons are passed here */}
            </ModalContent>
        </Modal>

        </>
    );
};