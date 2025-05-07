use reqwest::Client;
use serde::Serialize;
use urlencoding::encode;

pub struct SupabaseClient {
    client: Client,
    base_url: String,
    api_key: String,
    token: String,
}

impl SupabaseClient {
    pub fn new(base_url: &str, api_key: &str, token: &str) -> Self {
        SupabaseClient {
            client: Client::new(),
            base_url: base_url.trim_end_matches('/').to_string(),
            api_key: api_key.to_string(),
            token: token.to_string(),
        }
    }

    pub async fn insert<T: Serialize>(
        &self,
        table: &str,
        data: &T,
    ) -> Result<reqwest::Response, String> {
        let url = format!("{}/rest/v1/{}", self.base_url, table);

        self.client
            .post(&url)
            .header("apikey", &self.api_key)
            .header("Authorization", format!("Bearer {}", &self.token))
            .header("Content-Type", "application/json")
            .json(data)
            .send()
            .await
            .map_err(|e| e.to_string())
    }

    pub async fn select<T: for<'de> serde::Deserialize<'de>>(
        &self,
        table: &str,
        filters: &[(&str, &str)],
    ) -> Result<Vec<T>, String> {
        let query_string: String = filters
            .iter()
            .map(|(k, v)| format!("{}={}", k, encode(v)))
            .collect::<Vec<_>>()
            .join("&");
        let url = format!("{}/rest/v1/{}?{}", self.base_url, table, query_string);

        let mut req = self
            .client
            .get(&url)
            .header("apikey", &self.api_key)
            .header("Content-Type", "application/json");

        // Only add Bearer token if explicitly set
        if !self.token.is_empty() {
            req = req.header("Authorization", format!("Bearer {}", &self.token));
        }

        let res = req.send().await.map_err(|e| e.to_string())?;

        let status = res.status(); // Capture status before consuming res
        let text = res.text().await.map_err(|e| e.to_string())?;

        println!("Supabase response status: {}", status);
        println!("Supabase response body: {}", text);

        if status.is_success() {
            serde_json::from_str(&text).map_err(|e| e.to_string())
        } else {
            Err(format!("Supabase error: {} - {}", status, text))
        }
    }
}
