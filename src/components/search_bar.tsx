import { Input } from "@heroui/input";
import {
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { useFormik } from "formik";
import { SearchIcon } from "lucide-react";
import { useState } from "react";
import { queryDataWithAI } from "../services/ai_functions.ts";
import AIResponseCard from "./ai_response_card.tsx";

export const CustomSearchBar = () => {
  // const [searchTerm, setSearchTerm] = useState<string>("");
  // const [filteredResults, setFilteredResults] = useState<any[]>([]);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [ai_response, setAIResponse] = useState<any>(null);

  const [loadingAIResponse, setLoadingAIResponse] = useState(false);

  // const handleValueChange = async (value: string) => {
  //   setSearchTerm(value);

  //   if (value.length > 0) {
  //     const results = search_data.filter((item) => {
  //       const searchValue = value.toLowerCase();

  //       // Check if the page name or any of the page items or description match the search value
  //       return (
  //         item.page.toLowerCase().includes(searchValue) ||
  //         item.page_items.some((pageItem) =>
  //           pageItem.toLowerCase().includes(searchValue)
  //         ) ||
  //         (item.description &&
  //           item.description.toLowerCase().includes(searchValue))
  //       );
  //     });

  //     setFilteredResults(results);
  //     onOpen(); // Open the modal when there are results
  //   } else {
  //     setFilteredResults([]);
  //     //onOpenChange(); // Close modal if input is cleared
  //   }
  // };

  const formik = useFormik({
    initialValues: {
      searchTerm: "",
    },
    onSubmit: async (values) => {
      setLoadingAIResponse(true);
      // Query the whole dataset
      const response = await queryDataWithAI(values.searchTerm);

      console.log("AI Response:", ai_response);
      // Response:
      //   {
      //     "data": {
      //         "concise": "Your next court hearing is on April 25th.",
      //         "longer": "The next step in your case involves a Judgement, which is required by April 25th, 2025 at 3:30 PM.  This is currently with the Investigation Unit.",
      //         "notification": {
      //             "title": "Upcoming Judgement",
      //             "content": "Hello!  A Judgement is needed for your case by April 25th.  It's currently being handled by the Investigation Unit.",
      //             "deadline": "2025-04-25T15:30:00",
      //             "submitted_at": "2025-04-12T11:00:00",
      //             "location": "Investigation Unit",
      //             "signature_required_by": "Clerk B"
      //         }
      //     },
      //     "status": 200,
      //     "statusText": "",
      //     "headers": {
      //         "content-length": "307",
      //         "content-type": "application/json; charset=utf-8"
      //     },
      //     "config": {
      //         "transitional": {
      //             "silentJSONParsing": true,
      //             "forcedJSONParsing": true,
      //             "clarifyTimeoutError": false
      //         },
      //         "adapter": [
      //             "xhr",
      //             "http",
      //             "fetch"
      //         ],
      //         "transformRequest": [
      //             null
      //         ],
      //         "transformResponse": [
      //             null
      //         ],
      //         "timeout": 0,
      //         "xsrfCookieName": "XSRF-TOKEN",
      //         "xsrfHeaderName": "X-XSRF-TOKEN",
      //         "maxContentLength": -1,
      //         "maxBodyLength": -1,
      //         "env": {},
      //         "headers": {
      //             "Accept": "application/json, text/plain, */*",
      //             "Content-Type": "application/json"
      //         },
      //         "method": "post",
      //         "url": "https://google-gemini-proxy-for-chatflow.onrender.com/interpret-files",
      //         "data": "{\"query\":\"When is my next court hearing?\",\"data\":[{\"file_id\":1,\"case_number\":\"case_document_01\",\"purpose\":\"Ruling\",\"uploaded_by\":2,\"current_location\":\"Court Registry\",\"notes\":\"Initial document submitted. Harambee spirit in evidence!\",\"date_recieved\":\"2025-04-10 09:30:00\",\"required_on\":\"2025-04-20 17:00:00\",\"required_on_signature\":\"Signed by Clerk A\",\"date_returned\":null,\"date_returned_signature\":null,\"deleted\":false},{\"file_id\":2,\"case_number\":\"case_document_02\",\"purpose\":\"Judgement\",\"uploaded_by\":2,\"current_location\":\"Investigation Unit\",\"notes\":\"Further evidence gathered in Kisumu.\",\"date_recieved\":\"2025-04-12 11:00:00\",\"required_on\":\"2025-04-25 15:30:00\",\"required_on_signature\":\"Signed by Clerk B\",\"date_returned\":null,\"date_returned_signature\":null,\"deleted\":false}]}",
      //         "allowAbsoluteUrls": true
      //     },
      //     "request": {}
      // }

      setAIResponse(response?.data);
      setLoadingAIResponse(false);
      // Handle form submission
      console.log("Form submitted with values:", values);
    },
  });

  return (
    <>
      {!isOpen && (
        <>
          <Input
            // onValueChange={handleValueChange}
            onFocus={() => onOpen()}
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
            value={formik.values.searchTerm}
            placeholder="Type to search..."
            radius="lg"
            startContent={
              <SearchIcon className="text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
            }
            name="searchTerm"
          />
        </>
      )}

      <Modal
        className={"h-3/4 min-w-[1200px]"}
        backdrop="blur"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        isDismissable={false}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Search Results
          </ModalHeader>
          <ModalBody className={"overflow-y-scroll"}>
            <div className={"absolute w-1/3 flex"}>
              <Input
                autoFocus={true}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    formik.handleSubmit();
                  }
                }}
                name="searchTerm"
                value={formik.values.searchTerm}
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
              <Button
                variant="bordered"
                color="default"
                className="ml-2"
                onPress={() => formik.handleSubmit()}
                isLoading={loadingAIResponse}
              >
                Search
              </Button>
            </div>
            {ai_response && (
              <div className="mt-8">
                <AIResponseCard
                  ai_response={ai_response}
                  loading={loadingAIResponse}
                />
              </div>
            )}

            {ai_response && <Divider className="my-4" />}
          </ModalBody>{" "}
          {/* ✅ Form & buttons are passed here */}
        </ModalContent>
      </Modal>
    </>
  );
};
