# TaskFlow

TaskFlow is a web app for managing projects and tasks in small teams.
Built with Next.js, React, Tailwind CSS, Firebase Authentication and Cloud Firestore.

- Live demo: [PASTE VERCEL URL]
- Demo accounts (fictional):
  - Owner: owner@example.test / 12345678
  - Member: member@example.test / 12345678

## Features

- Register, log in and log out
- Create, edit and delete projects (owner only)
- Add and remove members by email
- Create, edit and delete tasks with status, priority, due date and assignee
- Search by title and filter by status, priority, assignee and overdue
- Dashboard with task counts and overdue tasks

## Setup

1. Run `npm install`
2. Create a Firebase project. Enable Email/Password sign-in and create a Firestore database.
3. Copy `.env.example` to `.env.local` and fill in your Firebase values.
4. Copy the contents of `firestore.rules` into Firestore > Rules and publish.
5. Run `npm run dev` and open http://localhost:3000

## Environment variables

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Firestore structure

```
users/{uid}                           displayName, email, createdAt
projects/{projectId}                  name, description, ownerId, memberIds, createdAt, updatedAt
projects/{projectId}/tasks/{taskId}   title, description, status, priority, assigneeId,
                                      dueDate, createdBy, createdAt, updatedAt
```

## Security rules

Rules are in `firestore.rules`.

- Only project members can read a project and its tasks.
- Only the owner can edit or delete the project and manage members.
- Any member can create tasks.
- A member can edit only tasks they created or are assigned to.
- Task status can be changed only by the owner or the assignee.
- Everything else is denied.

## Known limitations

- Any signed-in user can read user profiles (name and email) so members can be found by email.
- Deleting a project removes its tasks from the browser, not from a server function.
- Filtering runs in the browser; there is no pagination or real-time sync.
- If the network drops, a write may show an error but still be sent after reconnecting.