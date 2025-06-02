![EV Charging Dashboard](public/readme.png.png)

# EV Charging Station Management System

A full-stack application for managing electric vehicle charging stations, built with Vue.js, Node.js, Express, and MongoDB.

## Features

### Backend
- RESTful API built with Node.js and Express
- MongoDB database for data persistence
- JWT-based authentication
- CRUD operations for charging stations
- Protected routes for authenticated users

### Frontend
- Modern UI built with Vue.js 3 and TypeScript
- Interactive map view using OpenStreetMap
- Real-time station status updates
- Filtering and search capabilities
- Responsive design for all devices

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ev-charging-system
```

2. Install backend dependencies:
```bash
cd server
npm install
```

3. Install frontend dependencies:
```bash
cd ../client
npm install
```

4. Create a `.env` file in the server directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=3000
```

## Running the Application

1. Start the backend server:
```bash
cd server
npm run dev
```

2. Start the frontend development server:
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Charging Stations
- `GET /api/charging-stations` - List all stations
- `GET /api/charging-stations/:id` - Get station details
- `POST /api/charging-stations` - Create new station
- `PUT /api/charging-stations/:id` - Update station
- `DELETE /api/charging-stations/:id` - Delete station

## Detailed API Documentation

Base URL: `https://ev-chargning-system-management-system.onrender.com`

### Authentication APIs

#### Register User
- **Method**: POST
- **Endpoint**: `/api/auth/register`
- **Body**:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

#### Login
- **Method**: POST
- **Endpoint**: `/api/auth/login`
- **Body**:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

#### Get Current User
- **Method**: GET
- **Endpoint**: `/api/auth/me`
- **Headers**: `Authorization: Bearer <token>`

#### Cleanup Users Collection
- **Method**: POST
- **Endpoint**: `/api/auth/cleanup`

### Charging Station APIs (All require authentication)

#### Get All Stations
- **Method**: GET
- **Endpoint**: `/api/charging-stations`
- **Headers**: `Authorization: Bearer <token>`

#### Get Single Station
- **Method**: GET
- **Endpoint**: `/api/charging-stations/:id`
- **Headers**: `Authorization: Bearer <token>`

#### Create Station
- **Method**: POST
- **Endpoint**: `/api/charging-stations`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "name": "Downtown Station",
  "location": {
    "type": "Point",
    "coordinates": [-73.935242, 40.730610]
  },
  "status": "Available",
  "powerOutput": 50,
  "connectorType": "Type 2"
}
```

#### Update Station
- **Method**: PUT
- **Endpoint**: `/api/charging-stations/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
```json
{
  "name": "Updated Station Name",
  "status": "In Use",
  "powerOutput": 75
}
```

#### Delete Station
- **Method**: DELETE
- **Endpoint**: `/api/charging-stations/:id`
- **Headers**: `Authorization: Bearer <token>`

### Utility APIs

#### Health Check
- **Method**: GET
- **Endpoint**: `/api/health`

#### Seed Test Data
- **Method**: POST
- **Endpoint**: `/api/seed-data`

### Testing with Postman

1. Import the following collection into Postman:
```json
{
  "info": {
    "name": "EV Charging System API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/auth/register",
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"test@example.com\",\"password\":\"password123\"}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\"email\":\"test@example.com\",\"password\":\"password123\"}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        }
      ]
    }
  ]
}
```

2. Testing Steps:
   - Register a new user using the register endpoint
   - Login with the registered credentials to get the JWT token
   - Use the token in the Authorization header for all protected routes
   - Test the charging station endpoints
   - Use the health check endpoint to verify API status

## Features in Detail

### Charging Station Management
- Add new charging stations with location, power output, and connector type
- Edit existing station details
- Delete stations
- View station status and details

### Map Integration
- Interactive map showing all charging stations
- Color-coded markers based on station status
- Click markers to view station details
- Set station location by clicking on map

### Filtering and Search
- Filter stations by:
  - Status (Available, In Use, Maintenance, Offline)
  - Power Output
  - Connector Type
- Search stations by name or location

### User Authentication
- Secure user registration and login
- JWT-based authentication
- Protected routes for authenticated users
- Session management

## Tech Stack

### Frontend
- Vue.js 3
- TypeScript
- Pinia (State Management)
- Vue Router
- Leaflet.js (Maps)
- Tailwind CSS
- Vue Toastification

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs

## Development

### Project Structure
```
ev-charging-system/
├── client/                 # Frontend Vue.js application
│   ├── src/
│   │   ├── components/    # Vue components
│   │   ├── views/        # Page components
│   │   ├── stores/       # Pinia stores
│   │   ├── router/       # Vue Router configuration
│   │   └── types/        # TypeScript type definitions
│   └── package.json
│
└── server/                # Backend Node.js application
    ├── routes/           # API routes
    ├── models/          # MongoDB models
    ├── middleware/      # Express middleware
    └── package.json
```

### Available Scripts

#### Backend
- `npm run dev` - Start development server
- `npm start` - Start production server
- `npm test` - Run tests

#### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email [your-email] or open an issue in the repository.