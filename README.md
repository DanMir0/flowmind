# 🧠 FlowMind

> **Plan. Focus. Complete. Analyze.**

FlowMind is a modern productivity and task-management application built with **Vue 3** and **Supabase**.  
It combines task management, calendar planning, focus sessions, productivity statistics, motivational quotes, personalization, authentication, and Premium functionality in one responsive interface.

---

## ✨ Features

### 📋 Task Management

FlowMind provides a complete task-management workflow:

- Create, edit, and delete tasks
- Add descriptions
- Set task priority
- Set deadlines
- Attach files to tasks
- Mark tasks as completed
- Filter tasks
- Sort tasks
- Search tasks
- Drag & Drop task management
- Task limits for Free users
- Unlimited tasks for Premium users

### 🔎 Search

The global task search helps users quickly find tasks by:

- Title
- Description
- Date

Search is integrated into the main application interface.

### 📅 Calendar

The calendar is designed for planning tasks by date.

Users can:

- View tasks for a specific day
- Add tasks to a selected date
- Plan future tasks
- See task distribution throughout the month
- Manage scheduled work directly from the calendar

### 🎯 Today's Focus

**Today's Focus** provides a focused view of the current day's productivity.

Users can:

- View today's tasks
- Track completed tasks
- See completion progress
- See remaining tasks
- Concentrate on the tasks scheduled for today

### ⏱️ Focus Timer

FlowMind includes a dedicated focus timer inspired by the **Pomodoro technique**.

It can be used for:

- Focused work sessions
- Time-limited task execution
- Improving concentration
- Structuring work and break periods

### 📊 Dashboard

The Dashboard provides an overview of the user's productivity.

It includes statistics such as:

- Total tasks
- Completed tasks
- Active tasks
- Current progress
- Productivity overview

### 💬 Quotes

FlowMind includes motivational quotes as part of the productivity experience.

Users can:

- View motivational quotes
- Change the quote language
- Configure the quote language in Settings
- Add custom quotes with Premium
- Pin favorite quotes

### ⭐ Premium

FlowMind includes a subscription system with Free, Trial, and Premium states.

Premium features include:

- Unlimited tasks
- Custom quotes
- Pinned/favorite quotes
- Drag & Drop functionality
- Extended productivity functionality

#### 🆓 7-Day Free Trial

New users can try Premium for **7 days**.

The trial:

- Lasts 7 days
- Unlocks Premium functionality
- Can only be used once
- Changes to an expired state after the expiration date

A **test payment flow** is currently implemented for development purposes. In a production environment it should be replaced with a real payment provider.

### 🔐 Authentication

FlowMind supports:

- Registration
- Login
- Logout
- Email/password authentication
- Google OAuth
- Email change
- Password change
- Two-factor authentication (2FA)
- Session-based authorization

After authentication, each user receives a personal workspace with their own tasks, profile, settings, quotes, files, and subscription data.

### ⚙️ Settings

The Settings page provides account and application customization.

Users can manage:

- 🎨 Light/Dark theme
- 🌍 Quote language
- 📧 Account email
- 🔑 Account password
- 🔐 Two-factor authentication

### 🔔 Notifications

The application provides notifications for important user and system events, including:

- Task changes
- Successful operations
- Errors
- Subscription events
- Other important application messages

Toast notifications are used for immediate feedback.

### 📎 Task Files

Tasks can contain attached files.

Stored file metadata includes:

- File name
- File path
- File type
- File size
- Upload date

Files are linked to tasks and are removed automatically when their related task is deleted through the database relationship.

---

## 🎨 UI / UX

FlowMind follows a modern, minimalistic and responsive design.

The interface includes:

- Desktop layout
- Mobile layout
- Responsive header
- Mobile navigation/menu
- Profile controls
- Notifications
- Global task search
- Modal dialogs
- Toast notifications
- Focus states
- Smooth transitions and animations
- Responsive task cards
- Mobile-friendly calendar
- Mobile-friendly timer
- Responsive dashboard

The application is designed to provide the same core functionality across desktop and mobile screen sizes.

---

## 🏗️ Architecture

FlowMind follows a client + backend architecture:

```text
┌─────────────────────────────────────┐
│              Vue 3                  │
│                                     │
│  Pages → Components → Composables   │
│             ↓                       │
│          Pinia Stores               │
│             ↓                       │
│       Supabase Client               │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│             Supabase                │
│                                     │
│  Auth → PostgreSQL → Storage        │
│              ↓                      │
│         Row Level Security          │
│              ↓                      │
│        Edge Functions               │
└─────────────────────────────────────┘
```

### Main frontend layers

- **Pages** — application screens
- **Components** — reusable UI components
- **Composables** — reusable Vue logic
- **Pinia Stores** — global application state
- **Services** — Supabase client and integrations
- **Utils** — helper functions and shared utilities

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| **Vue 3** | Frontend framework |
| **Composition API** | Component logic |
| **`<script setup>`** | Modern Vue component syntax |
| **Pinia** | Global state management |
| **Vue Router** | Application routing |
| **Vite** | Development server and build tool |
| **JavaScript** | Application logic |
| **CSS** | UI styling and responsive layouts |
| **Supabase** | Backend platform |
| **PostgreSQL** | Database |
| **Supabase Auth** | Authentication |
| **Google OAuth** | Social authentication |
| **Supabase Storage** | File storage |
| **Row Level Security** | Database-level authorization |
| **Supabase Edge Functions** | Server-side business logic |
| **2FA** | Additional account security |

---

## 🧠 State Management

Application-wide state is managed with **Pinia**.

The main stores include:

```text
store/
├── auth.js
├── tasks.js
└── subscription.js
```

### `authStore`

Responsible for:

- Current user
- Authentication state
- User profile
- Login/logout
- Session handling
- Authorization-related state

### `tasksStore`

Responsible for:

- Loading tasks
- Creating tasks
- Updating tasks
- Deleting tasks
- Task search
- Filtering
- Sorting
- Task state

### `subscriptionStore`

Responsible for:

- Subscription status
- Current Premium plan
- Expiration date
- Trial state
- Trial expiration
- Starting the free trial
- Test Premium activation

---

## 🗄️ Database

The main PostgreSQL tables include:

### `profiles`

Stores user profile and subscription information.

Important fields:

```text
id
user_id
username
subscription_plan
subscription_status
subscription_expires_at
trial_started_at
trial_expires_at
created_at
```

### `tasks`

Stores user tasks.

Important fields:

```text
id
user_id
title
description
priority
deadline
created_at
updated_at
```

### `task_files`

Stores files attached to tasks.

Important fields:

```text
id
task_id
file_name
file_path
file_type
file_size
uploaded_at
```

---

## 🔒 Security

Security is handled on multiple levels.

### Supabase Authentication

Authentication is managed through Supabase Auth and supports:

- Email/password
- Google OAuth
- Session management
- 2FA

### Row Level Security

Database access is protected using PostgreSQL **Row Level Security (RLS)**.

For example, task access is restricted to the authenticated owner:

```sql
auth.uid() = user_id
```

This prevents users from directly accessing another user's tasks.

### Edge Functions

Sensitive subscription operations are executed through Supabase Edge Functions rather than being trusted entirely to the frontend.

### Service Role

The Supabase Service Role Key is used only inside server-side Edge Functions.

> **The Service Role Key must never be exposed in frontend code or committed to the repository.**

---

## ⚡ Edge Functions

FlowMind currently uses Supabase Edge Functions for subscription-related server logic.

### `start-trial`

Creates the user's 7-day Premium trial.

The function:

1. Verifies the Authorization header
2. Identifies the authenticated user
3. Retrieves the user's profile
4. Checks whether the trial was already used
5. Checks the current subscription state
6. Creates the 7-day trial
7. Updates the profile
8. Returns subscription information

### `test-payment`

Simulates a successful Premium purchase for development/testing.

The function:

1. Verifies authentication
2. Validates the selected plan
3. Retrieves the user's profile
4. Checks the existing subscription
5. Calculates the expiration date
6. Activates Premium
7. Updates the profile
8. Returns test payment and subscription data

> The test payment implementation is intentionally not a production payment solution.

---

## 🧭 Application Routes

The main routes are:

```text
/
├── /dashboard
├── /login
├── /register
├── /to-do-list
├── /timer
├── /my-quotes
├── /settings
└── /calendar
```

The router uses navigation guards to protect authenticated routes.

---

## 📁 Project Structure

A simplified project structure:

```text
flowmind/
│
├── public/
│
├── src/
│   ├── assets/
│   ├── components/
│   ├── composables/
│   ├── pages/
│   ├── router/
│   ├── services/
│   ├── store/
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   └── subscription.js
│   ├── utils/
│   ├── App.vue
│   └── main.js
│
├── supabase/
│   ├── functions/
│   │   ├── start-trial/
│   │   └── test-payment/
│   └── migrations/
│
├── .env
├── package.json
├── vite.config.js
└── README.md
```

---

# 🚀 Getting Started

## Requirements

Before running FlowMind locally, install:

- **Node.js** — latest LTS recommended
- **npm**
- **Git**
- A **Supabase project**

Check your installed versions:

```bash
node -v
npm -v
git --version
```

---

## 📥 Installation

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd flowmind
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

### ⚠️ Important

Do **not** put the following key into the frontend `.env`:

```env
SUPABASE_SERVICE_ROLE_KEY
```

The Service Role Key has elevated database privileges and must only be used in server-side Edge Functions.

---

# ☁️ Supabase Setup

Create a Supabase project and configure:

1. PostgreSQL database
2. Authentication
3. Google OAuth
4. Row Level Security
5. RLS policies
6. Storage
7. Edge Functions
8. Required server-side secrets

The database schema and policies should match the application requirements.

---

## 🔑 Google Authentication

In the Supabase dashboard:

```text
Authentication
      ↓
Providers
      ↓
Google
```

Configure:

- Google Client ID
- Google Client Secret
- Supabase OAuth redirect URL

The redirect URL must exactly match the URL configured in the Supabase Authentication settings and the Google Cloud OAuth configuration.

---

# ▶️ Development

Start the Vite development server:

```bash
npm run dev
```

Vite will provide a local URL, usually:

```text
http://localhost:5173
```

Open the URL in your browser.

---

# 🏭 Production Build

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

# 🔄 Development Workflow

A typical development workflow:

```bash
git pull
npm install
npm run dev
```

Before creating a production build:

```bash
npm run build
```

---

# 🔁 Application Flow

### Guest user

```text
Landing / Login
      │
      ├── Register
      └── Continue with Google
```

### Authenticated user

```text
Dashboard
   │
   ├── Today's Focus
   ├── To-Do List
   ├── Calendar
   ├── Focus Timer
   ├── Quotes
   ├── Notifications
   ├── Settings
   └── Profile
```

---

# 🧩 Typical Productivity Workflow

The core FlowMind workflow can be represented as:

```text
Create Task
     ↓
Set Priority
     ↓
Set Deadline
     ↓
Schedule in Calendar
     ↓
Start Focus Timer
     ↓
Complete Task
     ↓
Today's Focus
     ↓
Dashboard Statistics
```

FlowMind therefore combines:

**Planning → Execution → Completion → Analysis**

---

# 📱 Responsive Design

FlowMind supports responsive desktop and mobile layouts.

Mobile adaptations include:

- Mobile navigation
- Responsive header
- Profile controls
- Notifications
- Responsive task cards
- Mobile calendar
- Mobile-friendly timer
- Responsive dashboard
- Adapted modal dialogs

The goal is to keep the primary productivity workflow usable regardless of screen size.

---

# 💳 Subscription Plans

FlowMind supports the following subscription periods:

| Plan | Duration |
|---|---:|
| Free | No Premium subscription |
| 1 Month | 1 month |
| 3 Months | 3 months |
| 6 Months | 6 months |
| 1 Year | 12 months |
| Free Trial | 7 days |

> Prices and payment processing are currently development-oriented and may change when a production payment provider is integrated.

---

# 🛡️ Production Checklist

Before deploying FlowMind to production, verify:

- [ ] Replace `test-payment` with a real payment provider
- [ ] Verify all RLS policies
- [ ] Verify Storage policies
- [ ] Configure production Google OAuth redirect URLs
- [ ] Configure production environment variables
- [ ] Configure email authentication
- [ ] Configure and test 2FA
- [ ] Verify subscription expiration logic
- [ ] Configure Edge Function secrets
- [ ] Enable production logging/monitoring
- [ ] Never expose the Service Role Key
- [ ] Test session recovery after page reload
- [ ] Test authentication flows
- [ ] Test Premium/trial transitions
- [ ] Test mobile layouts
- [ ] Test file upload/delete behavior

---

# 🔮 Future Improvements

Potential future extensions include:

- 💳 Full production payment integration
- 📱 Dedicated mobile application
- 🔔 Push notifications
- 🤖 AI Assistant
- 🤖 AI-powered task planning
- 📅 Automatic task scheduling
- 🔁 Recurring tasks
- 📈 Advanced productivity analytics
- 👥 Team workspaces
- 🤝 Collaborative tasks
- 📆 Google Calendar integration
- 🍎 Apple Calendar integration
- 🔗 Additional external integrations
- ⭐ More advanced subscription tiers

---

# 📄 License

FlowMind is currently a private project.

A separate open-source or commercial license can be added if the project is distributed publicly.

---

# 👨‍💻 About FlowMind

**FlowMind** is a productivity-focused application designed around one simple workflow:

> **Plan → Focus → Complete → Analyze**

It brings task management, scheduling, focused work sessions, productivity statistics, motivational content, personalization, and Premium functionality together in a single application.

Built with:

**Vue 3 · Pinia · Vue Router · Vite · Supabase · PostgreSQL**
