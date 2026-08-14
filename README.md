FlowMind
Modern task management and productivity application built with Vue 3 and Supabase.

FlowMind is a modern application for task management, daily planning, and productivity enhancement. The application combines a task list, calendar, Focus Timer, statistics, quotes, subscription system, and personalization tools in one interface.

✨ Key Features
📋 Task Management
FlowMind provides a full-featured task management system:

create tasks;

edit tasks;

delete tasks;

task description;

set priority;

set deadline;

attach files to tasks;

mark tasks as completed;

filter tasks;

sort tasks;

search tasks;

Drag & Drop;

task limit for free users;

unlimited tasks for Premium users.

🔎 Search
The application implements task search functionality.

Search allows finding tasks by:

title;

description;

date.

Search works directly through the main application interface and allows quickly finding the required task.

📅 Calendar
FlowMind includes a separate calendar for task planning.

The calendar allows:

viewing tasks by day;

adding tasks for a specific date;

planning future tasks;

viewing task distribution across the calendar.

The calendar allows using FlowMind not only as a Todo List but also as a full-fledged planning tool.

🎯 Today's Focus
Today's Focus is a special section for monitoring productivity throughout the current day.

The user can:

view today's tasks;

track completed tasks;

see progress;

monitor the number of remaining tasks;

focus only on today's tasks.

This allows quickly assessing productivity for the current day.

⏱️ Focus Timer
FlowMind contains a separate timer for task concentration.

The Timer is designed for:

focused work;

time limiting for task completion;

increasing concentration;

Pomodoro-style work.

The timer is placed in a separate application section.

📊 Dashboard
The main page contains statistics and general information about user productivity.

On the Dashboard, you can get a quick overview of:

number of tasks;

completed tasks;

active tasks;

current progress;

productivity.

The Dashboard is the central point of the application after authorization.

💬 Quotes
FlowMind uses quotes for additional user motivation.

Features:

display quotes;

change quote language;

select quote language in settings;

add custom quotes for Premium users;

pin favorite quotes.

Premium users get extended quote management capabilities.

⭐ Premium
FlowMind implements a Premium subscription system.

Free
Free users have access to basic application features with certain limitations.

Premium
Premium users get additional features:

unlimited tasks;

create custom quotes;

pin quotes;

Drag & Drop;

extended productivity features.

Free Trial
New users get a 7-day free Premium Trial.

The Trial:

lasts 7 days;

allows trying Premium features;

can be used once;

after expiration, switches the user to expired state.

A test payment system is also implemented for development and testing of Premium functionality.

In the future, the test payment may be replaced with a full-fledged payment service.

👤 Authentication
FlowMind contains a full-featured authentication system.

Supported:

registration;

login;

logout;

Google login;

email change;

password change;

two-factor authentication (2FA).

After authorization, the user receives a personal workspace with their own tasks, settings, quotes, and subscription.

🔐 Security
Supabase is used for the backend.

Access to user data is protected using:

Supabase Authentication;

Row Level Security (RLS);

JWT authentication;

user access policies;

Edge Functions;

Service Role for server operations.

The user has access only to their own data.

For example, tasks are linked to a specific user and should not be accessible to other users.

⚙️ Settings
FlowMind has a separate settings page.

The user can change:

🎨 Theme
Application theme switching is supported:

Light;

Dark.

🌍 Quote Language
The language of displayed quotes can be changed.

📧 Email
The user can change their account email.

🔑 Password
The user can change their password.

🔐 Two-Factor Authentication
2FA configuration is available in settings for additional account protection.

🎨 UI / UX
FlowMind is developed using a modern responsive UI.

Core interface principles:

modern minimalistic design;

desktop adaptation;

mobile adaptation;

unified header;

mobile menu;

profile menu;

notifications;

task search;

modal dialogs;

toast notifications;

focus states;

smooth transitions and animations.

The interface is adapted for various screen sizes.

🔔 Notifications
The application includes a notification system.

It is used to display important events:

task state changes;

user actions;

errors;

successful operations;

subscription events;

other system messages.

Toast notifications are used for user messages.

📎 Task Files
Files can be attached to tasks.

The following information is stored for files:

file name;

file path;

file type;

size;

upload date.

Files are linked to a specific task and are deleted along with the task due to cascade relationship.

🏗️ Architecture
The project is built on Vue 3 + Supabase architecture.

Main application levels:

text
Vue 3
│
├── Pages
│
├── Components
│
├── Composables
│
├── Pinia Stores
│
└── Supabase Client
│
├── Authentication
├── PostgreSQL
├── Storage
└── Edge Functions
🛠️ Technologies
Frontend
Vue 3
Main frontend framework.

Used:

Composition API;

<script setup>;

reactive state;

computed properties;

watchers;

composables.

Pinia
Used for global application state management.

Main stores:

Authentication;

Tasks;

Subscription;

other global application data.

Example:

js
import { defineStore } from 'pinia'

export const useSubscriptionStore = defineStore(
  'subscription',
  {
    // ...
  }
)
Vue Router
Used for navigation between pages.

Main routes:

text
/
├── /dashboard
├── /login
├── /register
├── /to-do-list
├── /timer
├── /my-quotes
├── /settings
└── /calendar
A navigation guard is also used for user authorization verification.

☁️ Backend
Supabase
Supabase is used as a backend-as-a-service.

The project uses:

Supabase Authentication;

PostgreSQL;

Supabase Storage;

Row Level Security;

Edge Functions.

Supabase is responsible for storing user data, tasks, subscriptions, and files.

🗄️ Database
Main project tables:

profiles
Stores user information.

Example main fields:

text
id
user_id
username
subscription_plan
subscription_status
subscription_expires_at
trial_started_at
trial_expires_at
created_at
tasks
Stores user tasks.

Main fields:

text
id
user_id
title
description
priority
deadline
created_at
updated_at
task_files
Stores files attached to tasks.

Main fields:

text
id
task_id
file_name
file_path
file_type
file_size
uploaded_at
🔒 Row Level Security
RLS policies are used for user data.

For example, a user can only manage their own tasks.

Access logic:

sql
auth.uid() = user_id
For files, task ownership is verified.

This prevents one user from accessing another user's data.

⚡ Edge Functions
Supabase Edge Functions are used for server-side business logic.

In particular:

text
start-trial
test-payment
start-trial
Creates a 7-day Premium Trial.

The function:

verifies Authorization;

retrieves the current user;

retrieves the profile;

checks if the Trial was already used;

checks the current subscription;

creates the Trial;

updates the profile;

returns subscription data.

test-payment
Used for testing Premium purchases without real payment.

The function:

verifies the user;

retrieves the selected tariff;

checks existing subscription;

calculates the expiration date;

activates Premium;

returns test payment information.

In production, the test payment must be replaced with a real payment provider.

📦 Project Structure
Example project structure:

text
flowmind/
│
├── public/
│
├── src/
│   │
│   ├── assets/
│   │
│   ├── components/
│   │
│   ├── composables/
│   │
│   ├── pages/
│   │
│   ├── router/
│   │
│   ├── services/
│   │   └── supabase.js
│   │
│   ├── store/
│   │   ├── auth.js
│   │   ├── tasks.js
│   │   └── subscription.js
│   │
│   ├── utils/
│   │
│   ├── App.vue
│   └── main.js
│
├── supabase/
│   │
│   ├── functions/
│   │   ├── start-trial/
│   │   └── test-payment/
│   │
│   └── migrations/
│
├── .env
├── package.json
├── vite.config.js
└── README.md
🚀 Installation
Requirements
Before running, you need to install:

Node.js;

npm;

Git;

Supabase project.

It is recommended to use the latest LTS version of Node.js.

Check installation:

bash
node -v
npm -v
git --version
📥 Clone repository
Clone the project:

bash
git clone <REPOSITORY_URL>
Navigate to the directory:

bash
cd flowmind
📦 Install dependencies
Install dependencies:

bash
npm install
🔐 Environment Variables
Create a file:

text
.env
Add Supabase credentials:

env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
Do not add SUPABASE_SERVICE_ROLE_KEY to the frontend .env.

The Service Role Key should never be exposed in client-side code.

It is only used by server-side Edge Functions.

🗄️ Supabase Setup
Create a project in Supabase.

After that, you need to:

create necessary tables;

configure Authentication;

configure Google OAuth;

enable Row Level Security;

create RLS policies;

configure Storage;

add Edge Functions;

add required environment secrets.

🔑 Google Authentication
For Google login, you need to configure the OAuth provider in Supabase.

In Supabase:

text
Authentication
    ↓
Providers
    ↓
Google
After configuration, you need to specify:

Google Client ID;

Google Client Secret;

Redirect URL.

The Redirect URL must match the URL specified in Supabase Authentication settings.

▶️ Development
To start the development server:

bash
npm run dev
After starting, Vite will show the local address, for example:

text
http://localhost:5173
Open it in your browser.

🏭 Production Build
To create a production build:

bash
npm run build
Preview the production build locally:

bash
npm run preview
🧪 Development Workflow
Recommended workflow:

bash
git pull
npm install
npm run dev
Before creating a production build:

bash
npm run build
🔄 Application Flow
After opening the application, the user is redirected to the login page if not authenticated.

Guest
text
Login
   │
   ├── Register
   └── Continue with Google
Authenticated user
text
Dashboard
   │
   ├── Today's Focus
   ├── To-Do List
   ├── Calendar
   ├── Timer
   ├── Quotes
   ├── Notifications
   ├── Settings
   └── Profile
🧠 Productivity Workflow
Main FlowMind usage scenario:

text
Create Task
     ↓
Set Priority
     ↓
Set Deadline
     ↓
Schedule in Calendar
     ↓
Focus Timer
     ↓
Complete Task
     ↓
Today's Focus
     ↓
Dashboard Statistics
Thus, the application combines planning, execution, and productivity analysis.

📱 Responsive Design
FlowMind supports desktop and mobile layouts.

On mobile devices, the interface adapts to small screens:

mobile navigation;

adapted header;

profile controls;

notifications;

responsive task cards;

adapted modal windows;

mobile calendar;

mobile-friendly timer;

responsive Dashboard.

💳 Subscription Plans
The project includes the following plans:

Plan	Duration
Free	Free
1 Month	1 month
3 Months	3 months
6 Months	6 months
1 Year	12 months
Also available:

text
7-Day Free Trial
Prices and payment logic may vary depending on the production payment provider.

🛡️ Production Considerations
Before publishing the project, you need to:

replace test-payment with a real payment provider;

verify all RLS policies;

verify Google OAuth production redirect URL;

configure production environment variables;

verify Storage policies;

configure email authentication;

configure 2FA;

verify subscription expiration logic;

enable production logging/monitoring;

do not expose the Service Role Key;

verify Edge Functions permissions;

test mobile layout;

test session recovery after page reload.

🔮 Future Improvements
In the future, FlowMind can be extended with:

full-fledged payment system;

mobile application;

push notifications;

AI Assistant;

AI task planning;

automatic task distribution across calendar;

recurring tasks;

advanced productivity analytics;

team workspaces;

collaborative tasks;

Google Calendar integration;

Apple Calendar integration;

external service integration;

extended subscription system.

📄 License
The project is a private project.

A license may be added separately depending on the distribution method of FlowMind.

👨‍💻 Tech Stack
Technology	Purpose
Vue 3	Frontend framework
Composition API	Component logic
Pinia	State management
Vue Router	Application routing
Vite	Development & build tool
Supabase	Backend platform
PostgreSQL	Database
Supabase Auth	Authentication
Supabase Storage	File storage
Supabase Edge Functions	Server-side logic
Row Level Security	Database security
Google OAuth	Social authentication
2FA	Account security
CSS	UI styling
JavaScript	Application logic
🌟 About FlowMind
FlowMind is a productivity-focused application created to combine task management, time planning, and concentration in one place.

The application allows the user to:

Plan → Focus → Complete → Analyze

Plan tasks, focus on completing them, complete them, and analyze your own productivity.

