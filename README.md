# Bookstore Backend API

This is the backend API for the Bookstore application, built with Node.js, Express, TypeScript, and MongoDB.

## Features

- User authentication with JWT
- Book management (CRUD operations)
- Order processing
- Admin functionality

## Prerequisites

- Node.js (v18+)
- MongoDB

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bookstore
JWT_SECRET=your_jwt_secret
```

## Running the Application

### Quick Setup (Recommended)

We've created a convenient setup script that will automatically:
1. Start MongoDB in a Docker container
2. Use the correct Node.js version with nvm
3. Install dependencies if needed
4. Build TypeScript files
5. Create an admin user (if it doesn't exist)
6. Start the backend server

```bash
npm run setup
```

### Manual Setup

#### Development Mode

```bash
npm run dev
```

#### Production Mode

```bash
npm run build
npm start
```

## Default Admin Credentials

The setup script automatically creates an admin user with the following credentials:

```
Email: admin@bookstore.com
Password: admin123
```

You can use these credentials to log in and access admin-only features.

## API Endpoints

### Authentication

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login and get JWT token
- `GET /api/users/profile` - Get user profile (requires authentication)
- `PUT /api/users/profile` - Update user profile (requires authentication)

### Books

- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get a specific book
- `POST /api/books` - Create a new book (admin only)
- `PUT /api/books/:id` - Update a book (admin only)
- `DELETE /api/books/:id` - Delete a book (admin only)

### Orders

- `GET /api/orders` - Get all orders (admin only)
- `GET /api/orders/myorders` - Get user's orders (requires authentication)
- `GET /api/orders/:id` - Get a specific order (requires authentication)
- `POST /api/orders` - Create a new order (requires authentication)
- `PUT /api/orders/:id/pay` - Update order to paid (requires authentication)
- `PUT /api/orders/:id/deliver` - Update order to delivered (admin only)
