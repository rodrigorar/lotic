
const Tables = {
    Accounts: "accounts"
    , AuthSessions: "auth_sessions"
    , Tasks: "tasks"
    , TasksSync: "tasks_sync"
    , I18N: 'i18n'
    , I18NLanguages: 'i18n_languages'
}

const Fields = {
    Accounts: {
        Id: "id"
        , Email: "email"
        , Language: "language"
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
    , I18N: {
        Id: "id"
        , Key: "key"
        , Language: "language"
        , Value: "value"
    }
    , I18NLanguages: {
        Id: "id"
        , Name: "name"
        , Code: "code"
    }
}

module.exports.Tables = Tables;
module.exports.Fields = Fields;