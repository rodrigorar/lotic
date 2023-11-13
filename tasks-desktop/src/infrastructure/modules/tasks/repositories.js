const { generateId } = require("../../../domain/shared/utils");
const { Tables, Fields } = require("../../persistence/tables");
const { Task, TaskSync } = require("../../../domain/modules/tasks");

const TasksRepository = (() => {
    const save = async (unitOfWork, task) => {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(
            `INSERT INTO ${Tables.Tasks}`
            + `(${Fields.Tasks.Id}, ${Fields.Tasks.Title}, ${Fields.Tasks.Position}, ${Fields.Tasks.CreatedAt}, ${Fields.Tasks.UpdatedAt}, ${Fields.Tasks.OwnerId}) `
            + `VALUES(?, ?, ?, ?, ?, ?)`,
            [task.id, task.title, task.position, task.createdAt.toISOString(), task.updatedAt.toISOString(), task.ownerId]);
    }

    const update = async (unitOfWork, task) => {
        const queryManager = unitOfWork.getQueryManager();

        const setConditionFields = [Fields.Tasks.UpdatedAt];
        const variables = [task.updatedAt.toISOString()];
        if (task.title != undefined) {
            setConditionFields.push(Fields.Tasks.Title);
            variables.push(task.title);
        }
        if (task.position != undefined) {
            setConditionFields.push(Fields.Tasks.Position);
            variables.push(task.position);
        }
        if (task.ownerId != undefined) {
            setConditionFields.push(Fields.Tasks.OwnerId);
            variables.push(task.ownerId);
        }
        variables.push(task.id);
        
        await queryManager.run(
            `UPDATE ${Tables.Tasks} `
            + `SET ${setConditionFields.join("=? ,")}=? `
            + `WHERE ${Fields.Tasks.Id}=?`
            , variables);
    }

    const get = async (unitOfWork, taskId) => {
        const queryManager = unitOfWork.getQueryManager();
        const result = await queryManager
            .all(`SELECT *`
                + `FROM ${Tables.Tasks} `
                + `WHERE ${Fields.Tasks.Id} = ?`, [taskId]);
        return result 
            ? result.map((entity) => new Task(
                entity.task_id
                , entity.title
                , entity.position
                , new Date(entity.created_at)
                , new Date(entity.updated_at)
                , entity.owner_id))[0] 
            : undefined;
    }

    const listByAccountId = async (unitOfWork, accountId) => {
        const queryManager = unitOfWork.getQueryManager();
        const result = await queryManager
            .all(`SELECT * FROM `
                + `${Tables.Tasks} t `
                + `WHERE ${Fields.Tasks.OwnerId} = ?`, [accountId])
        return result.map(entry => new Task(
                entry.task_id
                , entry.title
                , entry.position
                , new Date(entry.created_at)
                , new Date(entry.updated_at)
                , entry.owner_id));
    }

    const listWithoutOwner = async (unitOfWork) => {
        const queryManager = unitOfWork.getQueryManager();
        const result = await queryManager
            .all(`SELECT * `
                + `FROM ${Tables.Tasks} `
                + `WHERE ${Fields.Tasks.OwnerId} is null`, []);
        return result.map(entry => new Task(
                entry.task_id
                , entry.title
                , entry.position
                , new Date(entry.created_at)
                , new Date(entry.updated_at)
                , entry.owner_id));
    }

    const listById = async (unitOfWork, tasksIds = []) => {
        const queryManager = unitOfWork.getQueryManager();
        const result = await queryManager
            .all(`SELECT * `
                + `FROM ${Tables.Tasks} `
                + `WHERE ${Fields.Tasks.Id} in (` + tasksIds.map(task => '?').join(',') + ')', tasksIds);
        return result.map(entry => new Task(
                entry.task_id
                , entry.title
                , entry.position
                , new Date(entry.created_at)
                , new Date(entry.updated_at)
                , entry.owner_id));
    }

    const getMaxPosition = async (unitOfWork) => {
        const queryManager = unitOfWork.getQueryManager();
        const queryResult = await queryManager
            .all(`SELECT MAX(${Fields.Tasks.Position}) as 'max_position'`
                + `FROM ${Tables.Tasks} `);
        const result = queryResult.map(entry => entry.max_position)[0];
        return result ? result : -1;
    }

    const erase = async (unitOfWork, id) => {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(`DELETE FROM ${Tables.Tasks} `
            + `WHERE ${Fields.Tasks.Id} = ?`, [id]);
    }

    const eraseAllForAccount = async (unitOfWork, accountId) => {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(`DELETE FROM ${Tables.Tasks} `
            + `WHERE ${Fields.Tasks.OwnerId} = ?`, [accountId]);
    }

    return {
        save
        , update
        , get
        , listByAccountId
        , listWithoutOwner
        , listById
        , getMaxPosition
        , erase
        , eraseAllForAccount
    }
})();

const TasksSyncRepository = (() => {
    const save = async (unitOfWork, taskId, state = undefined) => {
        const queryManager = unitOfWork.getQueryManager();
        const id = generateId();
        const currentDate = new Date();

        await queryManager.run(
            `INSERT INTO ${Tables.TasksSync}`
            + `(${Fields.TasksSync.Id}, task_id, synch_status, created_at, updated_at) `
            + `VALUES (?, ?, ?, ?, ?)`
            , [id, taskId, state , currentDate.toISOString(), currentDate.toISOString()]);   
    }

    const get = async (unitOfWork, taskId) => {
        const queryManager = unitOfWork.getQueryManager();
        const result = await queryManager.get(
            `SELECT * `
            + `FROM ${Tables.TasksSync} `
            + `WHERE ${Fields.TasksSync.TaskId} = ?`
            , [taskId]);
        
        if (result != undefined) {
            return new TaskSync(
                result.task_synch_id
                , result.task_id
                , result.synch_status
                , new Date(result.created_at)
                , new Date(result.updated_at))
        }  

        return result ? new TaskSync(
            result.task_sync_id
            , result.task_id
            , result.synch_status
            , new Date(result.created_at)
            , new Date(result.updated_at)) : undefined;
    }

    const getByState = async (unitOfWork, syncStatusList) => {
        const queryManager = unitOfWork.getQueryManager();
        const result = await queryManager.all(
            `SELECT * `
            + `FROM ${Tables.TasksSync} `
            + `WHERE ${Fields.TasksSync.Status} in (` + syncStatusList.map(_ => '?').join(',') + ')'
            , syncStatusList);

        return result 
            ? result.map((row) => 
                new TaskSync(
                    row.task_sync_id
                    , row.task_id
                    , row.synch_status
                    , new Date(row.created_at)
                    , new Date(row.updated_at)))
            : [];
    }

    const update = async (unitOfWork, taskSyncData) => {
        const queryManager = unitOfWork.getQueryManager();

        console.log(taskSyncData);

        let preparedStatement = `UPDATE ${Tables.TasksSync} `
            + `SET ${Fields.TasksSync.Status} = ?, ${Fields.TasksSync.UpdatedAt} = ? `
            + `WHERE ${Fields.TasksSync.TaskId} = ? `;
        const variables = [taskSyncData.status, new Date().toISOString(), taskSyncData.taskId];

        if (taskSyncData.notCondition != undefined) {
            preparedStatement = preparedStatement + `AND ${Fields.TasksSync.Status} != ?`
            variables.push(taskSyncData.notCondition);
        }

        await queryManager.run(preparedStatement, variables);
    }

    const eraseByTaskIds = async (unitOfWork, taskIds) => {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(
            `DELETE FROM ${Tables.TasksSync} `
            + `WHERE ${Fields.TasksSync.Status} = 'COMPLETE' AND ${Fields.TasksSync.TaskId} in (` + taskIds.map(_ => '?').join(',') + ")"
            , taskIds);
    }

    // FIXME: It's not deleting the task sync entries after logout
    const eraseAllForAccount = async (unitOfWork, accountId) => {
        const queryManager = unitOfWork.getQueryManager();
        await queryManager.run(
            `DELETE FROM ${Tables.TasksSync} `
            + `WHERE ${Fields.Tasks.Id} in (`
                + `SELECT ${Fields.Tasks.Id} `
                + `FROM ${Tables.Tasks} `
                + `WHERE ${Fields.Tasks.OwnerId} = ?)`
            , [accountId]);
    }

    return {
        save
        , get
        , getByState
        , update
        , eraseByTaskIds
        , eraseAllForAccount
    }
})();

module.exports.TasksRepository = TasksRepository;
module.exports.TasksSyncRepository = TasksSyncRepository;