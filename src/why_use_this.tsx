import { Button, Card, CardBody } from "@heroui/react";
import { ArrowLeftCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function WhyUseThis() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Button variant="flat" className="mb-4" onPress={() => navigate(-1)}>
        <ArrowLeftCircle className="mr-2" />
        Back
      </Button>

      <Card className="max-w-2xl w-full">
        <CardBody>
          <h1 className="text-3xl font-bold mb-4">Why Use This System?</h1>
          <ul className="list-disc ml-6 mb-4 text-lg">
            <li>
              Never miss a deadline again: get WhatsApp/SMS reminders for every
              important date.
            </li>
            <li>
              Access your case data from anywhere, even if your office is closed
              or you’re on the go.
            </li>
            <li>
              Export or print any view for easy sharing or record-keeping.
            </li>
            <li>
              Works alongside your current paper or Excel process and no need to
              change everything at once.
            </li>
            <li>Local support and training available.</li>
          </ul>
          {/* <h2 className="text-2xl font-semibold mb-2">Real Stories</h2> */}
          {/* <div className="mb-2">
            <b>
              "We used to lose track of deadlines. Now, everyone gets a WhatsApp
              reminder and our office runs smoother."
            </b>
            <div className="text-sm text-gray-500">— Clerk, County Court</div>
          </div>
          <div className="mb-2">
            <b>
              "I can print my case list for the week and hand it to my boss. It
              saves me hours every month."
            </b>
            <div className="text-sm text-gray-500">— Legal Secretary</div>
          </div>
          <div className="mb-2">
            <b>
              "We started with just the calendar reminders, but now we use the
              whole system. It’s easy and reliable."
            </b>
            <div className="text-sm text-gray-500">— Office Manager</div>
          </div> */}
        </CardBody>
      </Card>
    </div>
  );
}
