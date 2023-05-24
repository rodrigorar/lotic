# \<Title\>

## Description

A brief description of what the feature does, and how it is implemented on a high level degree. 

## Problem Being Solved

What problem are trying to solve by implementing this feature and it will bring value to the users of this feature. 

## Sequence Diagram

![Update Task Sequence Diagram](../assets/update_task_sequence_diagram.png)

```
@startuml

actor User
box "Client" #LightBlue
  participant TasksClient
  database TasksClientDB
end box

box "Backend" #LightGreen
  participant TasksBackend
  database TasksDB
end box

User -> TasksClient: Update Task Info
TasksClient <-> TasksClientDB: Update task info
TasksClient <-> TasksClientDB: Make task sync as DIRTY if it isn't
loop 
  TasksClient -> TasksClient: Run Sync (See Synchronization Diagram)
end


@enduml
```