# RPC Operations

## #POST: /api/v1/tasks

### Description

Create multiple tasks in the server with the information provided 
in the request. 

### Request

```
{
	"userId": "<uuid>",
	"requestId": "<uuid>",
	"tasks": [
		{
			"id": "<uuid>",
			"title": "<title>",
			"description": "<description>",
			"createdAt": "<timestamp 2022-10-30T09:00:00Z",
			"ownerId": "<useruid:uuid>"
		}
	]
}
```

### Responses

**200 Ok**

```
{
	"requestId": "<uuid>",
	"taskIds": [
		"<taskId:uuid>"
	]
}
```

**400 Bad Request**

```
{
	"type": "https://<ants-url>.com/probs/bad-request",
	"title": "Bad Request",
	"status": 400
	"invalid-params": [
		{
			"name": "<parameter-name>",
			"reason": "<reason why the parameter does not respect the API>"
		}
	]
}
```

**409 Conflict**

```
{
	"type": "https://<ants-url>.com/probs/conflict",
	"title": "Conflict",
	"status": 409
	"details": "<details of why there was a conflict>"
}
```

**500 Internal Server Error**

```
{
	"type": "https://<ants-url>.com/probs/internal-server-error",
	"title": "Internal Server Error",
	"status": 500
	"details": "<details of why there was an internal server error>"
}

```

## #GET /api/v1/tasks?user_id=<user-id>

### Description

Get all the tasks belonging to a user defined by the **user-id**.

### Request

Not Defined. 

### Responses

**200 Ok**
Not Defined.

**404 Not Found**
Not Defined.

**500 Internal Server Error**
Not Defined.

## #PUT /api/v1/tasks

### Description

Update several tasks on the server based on the id provided
for each task. 

### Request
Not Defined.

### Responses

**200 Ok**
Not Defined.

**400 Bad Request**
Not Defined. 

**404 Not Found**
Not Defined

**409 Conflict**
Not Defined.

**500 Internal Server Error**
Not Defined.

