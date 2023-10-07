
const Tables = {
    Accounts: "accounts"
    , AuthSessions: "auth_sessions"
    , Tasks: "tasks"
    , TasksSync: "tasks_sync"
}

const Fields = {
    Accounts: {
        Id: "id"
        , Email: "email"
    }
    , AuthSessions: {
        Id: "id"
        , AccessToken: "token"
        , RefreshToken: "refresh_token"
        , AccountId: "account_id"
        , ExpiresAt: "expires_at"
    }
    , Tasks: {
        Id: "task_id"
        , Title: "title"
        , Position: "position"
        , CreatedAt: "created_at"
        , UpdatedAt: "updated_at"
        , OwnerId: "owner_id"
    }
    , TasksSync: {
        Id: "task_synch_id"
        , TaskId: "task_id"
        , Status: "synch_status"
        , CreatedAt: "created_at"
        , UpdatedAt: "updated_at"
    }
}

module.exports.Tables = Tables;
module.exports.Fields = Fields;