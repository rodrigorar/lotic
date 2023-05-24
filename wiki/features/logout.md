# Logout

## Description

Allows the user to logout from the system on a client and clear all their information
from the client.

## Problem Being Solved

A user might to use a client that it does not own or control and so after logging in and
doing what it needs to do, they should have the capability to logout from the system. Another
time were users might want to logout from a client is when a client is used by more than 
one user.

## Sequence Diagram

![Logout Sequence Diagram](../../assets/logout_sequence_diagram.png)


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

User -> TasksClient: Press Logout Button
TasksClient -> TasksBackend: Logout
TasksBackend -> TasksBackend: Validate that the user can logout (Permissions)
TasksBackend <-> TasksDB: Delete AuthSession Provided
TasksBackend -> TasksClient: Return from logout
TasksClient <-> TasksClientDB: Delete local AuthSession token
TasksClient <-> TasksClientDB: Delete all information related to the user
TasksClient -> TasksClient: Reset Main Screen


@enduml
```