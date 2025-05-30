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