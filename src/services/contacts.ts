import { invoke } from "@tauri-apps/api/core";

/**
 * Create a new contact.
 * @param name - The contact's name.
 * @param role - The role of the contact ('Court Admin' | 'Super Admin').
 * @param phoneNumber - The contact's phone number.
 * @returns A promise resolving to a success message.
 */
export async function createContact(
    name: string,
    role: "Court Admin" | "Super Admin",
    phoneNumber: string
): Promise<string> {
    try {
        const response: string = await invoke("create_contact", {
            name,
            role,
            phone_number: phoneNumber,
        });
        console.log("Contact Created:", response);
        return response;
    } catch (error) {
        console.error("Error creating contact:", error);
        throw error;
    }
}

/**
 * Fetch all contacts.
 * @returns A promise resolving to an array of contacts.
 */
export async function getContacts(): Promise<any[]> {
    try {
        const response: any[] = await invoke("get_contacts");
        console.log("Fetched Contacts:", response);
        return response;
    } catch (error) {
        console.error("Error fetching contacts:", error);
        throw error;
    }
}

/**
 * Update a contact's information.
 * @param contactId - The ID of the contact to update.
 * @param name - The updated contact name.
 * @param role - The updated contact role.
 * @param phoneNumber - The updated phone number.
 * @returns A promise resolving to a success message.
 */
export async function updateContact(
    contactId: number,
    name: string,
    role: "Court Admin" | "Super Admin",
    phoneNumber: string
): Promise<string> {
    try {
        const response: string = await invoke("update_contact", {
            contact_id: contactId,
            name,
            role,
            phone_number: phoneNumber,
        });
        console.log("Contact Updated:", response);
        return response;
    } catch (error) {
        console.error("Error updating contact:", error);
        throw error;
    }
}

/**
 * Delete a contact by its ID.
 * @param contactId - The ID of the contact to delete.
 * @returns A promise resolving to a success message.
 */
export async function deleteContact(contactId: number): Promise<string> {
    try {
        const response: string = await invoke("delete_contact", { contact_id: contactId });
        console.log("Contact Deleted:", response);
        return response;
    } catch (error) {
        console.error("Error deleting contact:", error);
        throw error;
    }
}
