export interface Notification {
  id: string;
  message: string;
  type: "Info" | "Warning" | "Success" | "Error";
  date: string;
  read: boolean;
}

export const notifications: Notification[] = [
  {
    id: "1",
    message: "New case file added.",
    type: "Info",
    date: "2025-03-24",
    read: false,
  },
  {
    id: "2",
    message: "System update scheduled.",
    type: "Warning",
    date: "2025-03-22",
    read: true,
  },
  {
    id: "3",
    message: "Case resolved successfully.",
    type: "Success",
    date: "2025-03-20",
    read: false,
  },
  {
    id: "4",
    message: "Unauthorized login detected!",
    type: "Error",
    date: "2025-03-18",
    read: false,
  },
];
