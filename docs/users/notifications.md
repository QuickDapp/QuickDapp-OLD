---
order: -3
expanded: true
---

# Notifications

The built-in user notifications system lets the backend notify a user of something new. This could be a simple message and/or a JSON data blob.

The `notifications` [database](../backend/database.md) table is responsible for storing all notifications and recording whether they have seen by the user or not.

Note that notifications can only be created from the backend.

## Creating a notification



QuickDapp comes with suport for building Docker images of your app