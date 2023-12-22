---
order: 90
---

# Notifications

The built-in user notifications system lets the backend notify a user of something new. This could be a simple message and/or a JSON data blob.

The `notifications` [database](../backend/database.md) table is responsible for storing all notifications and recording whether they have seen by the user or not.

Note that notifications can only be created from within the backend (including [background workers](../worker/index.md)).


## Creating a notification

The backend [bootstrap object](../backend/bootstrap.md) provides a convenient API for creating notifications:

```ts
/**
 * @id User id in database table.
 * @data Notification data.
 */
async function notifyUser (id: User, data: object): Promise<void>
```

This does two things:

1. Creates the corresponding entry in the `notifications` table.
1. Sends a [push notification](../backend/push-notifications.md) to the user informing them of new notifications. _(The frontend automatically updates the notifications indicator in the browser UI)_.

The `data` parameter can contain any structure, though at present the following structure is handled in the UI by default:

```ts
{
  msg: "The notification message to show",
}
```