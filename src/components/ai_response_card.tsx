import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { CalendarDaysIcon, Info, MapPinIcon, Paperclip } from "lucide-react";
import TypewriterText from "./typewriter_text";

interface AIResponse {
  concise?: string;
  longer?: string;
  notification?: {
    title?: string;
    content?: string;
    deadline?: string;
    submitted_at?: string;
    location?: string;
    signature_required_by?: string;
  };
}

export default function AIResponseCard({
  ai_response,
  loading,
}: {
  ai_response: AIResponse;
  loading: boolean;
}) {
  return (
    <>
      {!loading && (
        <div className="mt-6 max-w-3xl rounded-lg shadow-md p-6 space-y-6 bg-background/60 dark:bg-default-100/50">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <ClipboardDocumentListIcon className="w-6 h-6 text-blue-500" />
              Response
            </h2>
            {/* <p className="mt-2 text-gray-700 dark:text-gray-300">
          {ai_response?.concise}
        </p> */}
            <TypewriterText
              text={ai_response?.concise}
              className="text-base"
              speed={30}
            />
            {/* <TypewriterText
          text={ai_response?.longer}
          className="text-sm mt-2"
          speed={30} */}
            {/* /> */}
            {/* <p className="mt-1 text-gray-600 dark:text-gray-400">
          {ai_response?.longer}
        </p> */}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              {/* <BellIcon className="w-5 h-5 text-amber-500" /> */}
              {/* Notification */}
              <Info className="w-5 h-5 text-amber-500" />
              More Information
            </h3>
            <div className="mt-2 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <p className="flex items-center gap-1">
                <span className="font-medium text-gray-800 dark:text-gray-100 flex items-center gap-1">
                  <Paperclip className="w-4 h-4 text-gray-500" /> Title:
                </span>{" "}
                {ai_response?.notification?.title}
              </p>
              <p className="flex items-center gap-1">
                <span className="font-medium flex items-center gap-1 text-gray-800 dark:text-gray-100">
                  <Paperclip className="w-4 h-4 text-gray-500" /> Content:
                </span>
                {ai_response?.notification?.content}
              </p>
              <p className="flex items-center gap-1">
                <CalendarDaysIcon className="w-4 h-4 text-blue-400" />
                <span className="font-medium">Deadline:</span>{" "}
                {ai_response?.notification?.deadline}
              </p>
              {/* <p className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4 text-purple-400" />
            <span className="font-medium">Submitted At:</span>{" "}
            {ai_response?.notification?.submitted_at}
          </p> */}
              <p className="flex items-center gap-1">
                <MapPinIcon className="w-4 h-4 text-green-400" />
                <span className="font-medium">Location:</span>{" "}
                {ai_response?.notification?.location}
              </p>
              {/* <p className="flex items-center gap-1">
            <PencilSquareIcon className="w-4 h-4 text-red-400" />
            <span className="font-medium">Signature Required By:</span>{" "}
            {ai_response?.notification?.signature_required_by}
          </p> */}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
