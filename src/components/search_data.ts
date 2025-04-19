type Search = {
    page: string;
    page_items: string[];
    link: string;               // URL to the page
    description?: string;       // Optional description of the page
    icon?: string;              // Optional icon name or path
}[];

export const search_data: Search = [
    {
        page: "home",
        page_items: ["Home", "Dashboard", "Overview"],
        link: "/home",
        description: "Main overview of your account and activities.",
        icon: "home-icon" // Replace with actual icon name or path
    },
    {
        page: "profile",
        page_items: ["User Profile", "Account Settings", "Privacy Settings"],
        link: "/profile",
        description: "Manage your personal information and settings.",
        icon: "user-icon"
    },
    {
        page: "settings",
        page_items: ["General Settings", "Notification Settings", "Security"],
        link: "/settings",
        description: "Adjust your app settings and preferences.",
        icon: "settings-icon"
    },
    {
        page: "reports",
        page_items: ["Monthly Reports", "Annual Summary", "User Activity"],
        link: "/reports",
        description: "View and analyze your activity reports.",
        icon: "report-icon"
    },
    {
        page: "notifications",
        page_items: ["New Messages", "System Alerts", "Updates"],
        link: "/notifications",
        description: "Check your recent notifications and alerts.",
        icon: "bell-icon"
    },
    {
        page: "help",
        page_items: ["FAQs", "Contact Support", "User Guides"],
        link: "/help",
        description: "Find help and support resources.",
        icon: "help-icon"
    },
    {
        page: "products",
        page_items: ["Product List", "Add New Product", "Inventory"],
        link: "/products",
        description: "Manage your products and inventory.",
        icon: "product-icon"
    },
    {
        page: "users",
        page_items: ["User List", "Add New User", "Roles and Permissions"],
        link: "/users",
        description: "Manage user accounts and permissions.",
        icon: "users-icon"
    },
    {
        page: "analytics",
        page_items: ["Traffic Analysis", "User Behavior", "Conversion Rates"],
        link: "/analytics",
        description: "Analyze user engagement and traffic.",
        icon: "analytics-icon"
    },
    {
        page: "integrations",
        page_items: ["API Integrations", "Third-Party Services", "Webhooks"],
        link: "/integrations",
        description: "Manage external integrations and services.",
        icon: "integration-icon"
    },
    {
        page: "feedback",
        page_items: ["User Feedback", "Suggestions", "Report Bugs"],
        link: "/feedback",
        description: "Submit and view feedback from users.",
        icon: "feedback-icon"
    },
    {
        page: "tasks",
        page_items: ["Task List", "Completed Tasks", "Add New Task"],
        link: "/tasks",
        description: "Organize and track your tasks.",
        icon: "task-icon"
    },
    {
        page: "calendar",
        page_items: ["Event Calendar", "Add New Event", "Reminders"],
        link: "/calendar",
        description: "Manage your events and reminders.",
        icon: "calendar-icon"
    },
    {
        page: "billing",
        page_items: ["Billing Overview", "Payment Methods", "Invoices"],
        link: "/billing",
        description: "View and manage your billing information.",
        icon: "billing-icon"
    },
    {
        page: "subscriptions",
        page_items: ["Manage Subscriptions", "Upgrade Plan", "Billing History"],
        link: "/subscriptions",
        description: "Manage your subscription plans and history.",
        icon: "subscription-icon"
    },
];