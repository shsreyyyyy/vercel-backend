# E-Shop Backend

This is the **Backend API** of the E-Shop application built using **Node.js, Express.js and MongoDB**.

The backend handles authentication, products, categories, cart, wishlist and orders.

## Features

* User Authentication
* Registration & Login
* OTP Verification
* Forgot Password
* JWT Authentication
* Product Management
* Category Management
* Cart Management
* Wishlist Management
* Order Management
* Order Cancellation
* Admin Order Status Management
* Redis Integration
* Email / SMTP Integration

## Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* Redis
* Axios
* Bcrypt
* Dotenv
* Nodemailer / SMTP
* Nodemon

## Installation

Open the **Backend** folder:

```bash
npm install
```

> **Note:** All required dependencies are already included in `package.json`.
> You do **not** need to install Express, Axios, Mongoose, Redis, Bcrypt, Dotenv, Nodemailer or Nodemon separately.

## Environment Variables

Create a `.env` file in the Backend root directory.

Example:

```env
PORT=3000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

REDIS_URL=your_redis_connection_string

SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_email_password
```

> **Important:** Do not upload the `.env` file to GitHub.

Add the following to `.gitignore`:

```gitignore
.env
node_modules
```

## Run the Backend

### Development

Recommended:

```bash
npx nodemon server.js
```

Or:

```bash
npm run dev
```

### Normal

```bash
npm start
```

## API Server

The backend runs on:

```text
http://localhost:3000
```

The User Frontend and Admin Panel communicate with this backend using Axios.

## Important

Before starting the application, make sure:

* MongoDB is running or properly configured.
* Redis is configured and accessible.
* SMTP credentials are configured.
* `.env` file is present.
* Dependencies are installed using `npm install`.
* Backend server is running.

## Project Structure

```text
Backend/
│
├── Controller/
├── Model/
├── Routes/
├── middleware/
├── config/
├── server.js
├── package.json
└── .env
```

## Production

For production deployment:

1. Configure production environment variables.
2. Use a production MongoDB database.
3. Configure Redis.
4. Configure SMTP credentials.
5. Update the frontend API URL.
6. Start the production server.
