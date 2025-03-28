import { invoke } from "@tauri-apps/api/core";

/**
 * Create a new news entry.
 * @param title - The title of the news article.
 * @param content - The content/body of the news article.
 * @returns A promise resolving to a success message.
 */
export async function createNews(title: string, content: string): Promise<string> {
    try {
        const response: string = await invoke("create_news", {
            title,
            content
        });
        console.log("News Created:", response);
        return response;
    } catch (error) {
        console.error("Error creating news:", error);
        throw error;
    }
}

/**
 * Fetch all news articles.
 * @returns A promise resolving to an array of news articles.
 */
export async function getNews(): Promise<any[]> {
    try {
        const response: any[] = await invoke("get_news");
        console.log("Fetched News:", response);
        return response;
    } catch (error) {
        console.error("Error fetching news:", error);
        throw error;
    }
}

/**
 * Fetch a news article by ID.
 * @param newsId - The ID of the news article to fetch.
 * @returns A promise resolving to the news article data.
 */
export async function getNewsById(newsId: number): Promise<any> {
    try {
        const response: any = await invoke("get_news_by_id", { news_id: newsId });
        console.log("Fetched News:", response);
        return response;
    } catch (error) {
        console.error("Error fetching news:", error);
        throw error;
    }
}

/**
 * Update a news article.
 * @param newsId - The ID of the news article to update.
 * @param title - The updated title.
 * @param content - The updated content.
 * @returns A promise resolving to a success message.
 */
export async function updateNews(newsId: number, title: string, content: string): Promise<string> {
    try {
        const response: string = await invoke("update_news", {
            news_id: newsId,
            title,
            content
        });
        console.log("News Updated:", response);
        return response;
    } catch (error) {
        console.error("Error updating news:", error);
        throw error;
    }
}

/**
 * Delete a news article by ID.
 * @param newsId - The ID of the news article to delete.
 * @returns A promise resolving to a success message.
 */
export async function deleteNews(newsId: number): Promise<string> {
    try {
        const response: string = await invoke("delete_news", { news_id: newsId });
        console.log("News Deleted:", response);
        return response;
    } catch (error) {
        console.error("Error deleting news:", error);
        throw error;
    }
}
