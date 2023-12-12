---
order: 0
---

# Creating a job

There are two types of background jobs

All worker jobs are stored in the `worker_jobs` table. The schema is as as follows:

```json
id    Int     @id @default(autoincrement())
type String
userId Int
data Json
due DateTime
started DateTime?
finished DateTime?
removeAt DateTime
success Boolean?
result Json?
cronSchedule String?
autoRescheduleOnFailure Boolean @default(false)
autoRescheduleOnFailureDelay Int @default(0)
removeDelay Int @default(0)
rescheduledFromJob Int?
createdAt DateTime @default(now())
updatedAt DateTime @default(now())

```