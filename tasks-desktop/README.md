# Tasks Desktop

## Coding Guidelines

**TODO:** Define some coding guidelines to be used in the project. 

### Quotes

**Rule:** When writing strings we should use " instead of ', and for single 
chars we should use ' instead of ". 

This is so that it is easier to transition between languages, 
f.ex Kotlin does the previous described approach, while Javascript and Python
allow for both ' and ", we will follow the more restrictive approach. 

## Schema Migrations

The migrations are run sequencially from a list in the code, all migrations
should be implemented to be indempotent and not fail if run more than once. The 
pattern that should be used on the database schema migrations is the Expand/Contract
pattern. 

**Reference:** Go to ---> src/shared/persistence/database.js