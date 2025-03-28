use sea_orm::*;

use sea_orm::*;
use crate::entities::{prelude::*, *};

impl DbState {
    // Create a user
    pub async fn create_user(&self, name: String, role: String, email: String, phone_number: Option<String>, password_hash: String, status: Option<String>) -> Result<users::Model, DbErr> {
        let active_model = users::ActiveModel {
            user_id: NotSet,
            name: Set(name),
            role: Set(role),
            email: Set(email),
            phone_number: Set(phone_number),
            password_hash: Set(password_hash),
            status: Set(status.unwrap_or_else(|| "Active".to_string())),
        };

        let result = Users::insert(active_model).exec_with_returning(&self.connection).await?;
        Ok(result)
    }

    // Get user by ID
    pub async fn get_user(&self, user_id: i32) -> Result<Option<users::Model>, DbErr> {
        let result = Users::find_by_id(user_id).one(&self.connection).await?;
        Ok(result)
    }

    // Update user status
    pub async fn update_user_status(&self, user_id: i32, new_status: String) -> Result<users::Model, DbErr> {
        let mut user: users::ActiveModel = Users::find_by_id(user_id)
            .one(&self.connection)
            .await?
            .ok_or(DbErr::RecordNotFound("User not found".to_string()))?
            .into();

        user.status = Set(new_status);
        let result = user.update(&self.connection).await?;
        Ok(result)
    }

    // Delete a user
    pub async fn delete_user(&self, user_id: i32) -> Result<(), DbErr> {
        Users::delete_by_id(user_id).exec(&self.connection).await?;
        Ok(())
    }
}

impl DbState {
    // Create a case
    pub async fn create_case(&self, title: String, assigned_staff_id: Option<i32>, priority: Option<String>) -> Result<cases::Model, DbErr> {
        let active_model = cases::ActiveModel {
            case_id: NotSet,
            title: Set(title),
            status: Set("Open".to_string()),
            assigned_staff_id: Set(assigned_staff_id),
            priority: Set(priority.unwrap_or_else(|| "Medium".to_string())),
            date_created: NotSet,
        };

        let result = Cases::insert(active_model).exec_with_returning(&self.connection).await?;
        Ok(result)
    }

    // Get a case by ID
    pub async fn get_case(&self, case_id: i32) -> Result<Option<cases::Model>, DbErr> {
        let result = Cases::find_by_id(case_id).one(&self.connection).await?;
        Ok(result)
    }

    // Update case status
    pub async fn update_case_status(&self, case_id: i32, new_status: String) -> Result<cases::Model, DbErr> {
        let mut case: cases::ActiveModel = Cases::find_by_id(case_id)
            .one(&self.connection)
            .await?
            .ok_or(DbErr::RecordNotFound("Case not found".to_string()))?
            .into();

        case.status = Set(new_status);
        let result = case.update(&self.connection).await?;
        Ok(result)
    }

    // Delete a case
    pub async fn delete_case(&self, case_id: i32) -> Result<(), DbErr> {
        Cases::delete_by_id(case_id).exec(&self.connection).await?;
        Ok(())
    }
}


impl DbState {
    // Upload a file
    pub async fn upload_file(&self, file_name: String, uploaded_by: i32, file_size: String, case_id: Option<i32>, version: Option<String>) -> Result<files::Model, DbErr> {
        let active_model = files::ActiveModel {
            file_id: NotSet,
            file_name: Set(file_name),
            uploaded_by: Set(uploaded_by),
            date_uploaded: NotSet,
            file_size: Set(file_size),
            case_id: Set(case_id),
            version: Set(version.unwrap_or_else(|| "1.0".to_string())),
        };

        let result = Files::insert(active_model).exec_with_returning(&self.connection).await?;
        Ok(result)
    }

    // Get files by case ID
    pub async fn get_files_by_case(&self, case_id: i32) -> Result<Vec<files::Model>, DbErr> {
        let results = Files::find()
            .filter(files::Column::CaseId.eq(case_id))
            .all(&self.connection)
            .await?;
        Ok(results)
    }

    // Delete a file
    pub async fn delete_file(&self, file_id: i32) -> Result<(), DbErr> {
        Files::delete_by_id(file_id).exec(&self.connection).await?;
        Ok(())
    }
}
