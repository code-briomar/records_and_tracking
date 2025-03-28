import { invoke } from "@tauri-apps/api/core";

/**
 * Create a new theme.
 * @param name - The name of the theme.
 * @param configJson - The theme configuration in JSON format.
 * @param userId - (Optional) The ID of the user who created the theme.
 * @returns A promise resolving to a success message.
 */
export async function createTheme(name: string, configJson: string, userId?: number): Promise<string> {
    try {
        const response: string = await invoke("create_theme", {
            name,
            config_json: configJson,
            user_id: userId,
        });
        console.log("Theme Created:", response);
        return response;
    } catch (error) {
        console.error("Error creating theme:", error);
        throw error;
    }
}

/**
 * Fetch all themes.
 * @returns A promise resolving to an array of themes.
 */
export async function getThemes(): Promise<any[]> {
    try {
        const response: any[] = await invoke("get_themes");
        console.log("Fetched Themes:", response);
        return response;
    } catch (error) {
        console.error("Error fetching themes:", error);
        throw error;
    }
}

/**
 * Fetch a theme by ID.
 * @param themeId - The ID of the theme to fetch.
 * @returns A promise resolving to the theme data.
 */
export async function getThemeById(themeId: number): Promise<any> {
    try {
        const response: any = await invoke("get_theme_by_id", { theme_id: themeId });
        console.log("Fetched Theme:", response);
        return response;
    } catch (error) {
        console.error("Error fetching theme:", error);
        throw error;
    }
}

/**
 * Update a theme.
 * @param themeId - The ID of the theme to update.
 * @param name - The updated theme name.
 * @param configJson - The updated theme configuration in JSON format.
 * @returns A promise resolving to a success message.
 */
export async function updateTheme(themeId: number, name: string, configJson: string): Promise<string> {
    try {
        const response: string = await invoke("update_theme", {
            theme_id: themeId,
            name,
            config_json: configJson,
        });
        console.log("Theme Updated:", response);
        return response;
    } catch (error) {
        console.error("Error updating theme:", error);
        throw error;
    }
}

/**
 * Delete a theme by ID.
 * @param themeId - The ID of the theme to delete.
 * @returns A promise resolving to a success message.
 */
export async function deleteTheme(themeId: number): Promise<string> {
    try {
        const response: string = await invoke("delete_theme", { theme_id: themeId });
        console.log("Theme Deleted:", response);
        return response;
    } catch (error) {
        console.error("Error deleting theme:", error);
        throw error;
    }
}
