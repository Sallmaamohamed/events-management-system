# Event Management System - API

Production-ready RESTful API for an Event Ticketing and Management Platform built with Node.js, Express, and MongoDB.

## Key Features
- **Auth & Access Control**: JWT authentication with Bcrypt password hashing. Role-based permissions (Admin, Organizer, Attendee).
- **Event Lifecycle**: Complete CRUD flow for drafting, publishing, updating, and filtering events.
- **Inventory & Tickets**: Dynamic ticket tier creation with real-time stock management.
- **Booking Engine**: Race-condition safe ticket reservation logic.
- **Admin Control**: System-wide metrics, user account status toggles (Active/Suspended).

## Tech Stack
- **Environment**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Auth & Security**: JSON Web Tokens, Bcrypt.js, CORS

## Project Structure
```text
events-management-project/
├── config/             # DB connection setup
├── controllers/        # Request handlers & logic
├── middlewares/        # Auth, RBAC, error handler
├── models/             # Mongoose schemas
├── routes/             # Endpoint routing
├── .env                # App configuration (git-ignored)
├── .gitignore          # Version control exclusions
├── package.json        # Manifest & dependencies
└── server.js           # Express entry point