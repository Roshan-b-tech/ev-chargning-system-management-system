# Deployment Guide

## Backend Deployment (Render.com)

1. Create a new Web Service on Render.com
2. Connect your GitHub repository
3. Configure the service:
   - Name: ev-charging-backend
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `node index.js`
   - Plan: Free

4. Set Environment Variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/ev_charging
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-url.vercel.app
   ```

## Frontend Deployment (Vercel)

1. Create a new project on Vercel
2. Connect your GitHub repository
3. Configure the project:
   - Framework Preset: Vue.js
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. Set Environment Variables:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

## Database Setup (MongoDB Atlas)

1. Create a free MongoDB Atlas account
2. Create a new cluster
3. Set up database access:
   - Create a database user
   - Set a secure password
4. Set up network access:
   - Add your IP address
   - Or allow access from anywhere (0.0.0.0/0)
5. Get your connection string

## Testing the Deployment

1. Backend API Testing:
   ```bash
   # Test the API endpoint
   curl https://your-backend-url.onrender.com/api/health
   
   # Expected response
   {"status":"ok","message":"API is running"}
   ```

2. Frontend Testing:
   - Visit your Vercel deployment URL
   - Test the login functionality
   - Verify that the map loads correctly
   - Test CRUD operations for charging stations

## Troubleshooting

1. Backend Issues:
   - Check Render.com logs
   - Verify environment variables
   - Test MongoDB connection
   - Check CORS configuration
   - Verify JWT token generation and validation

2. Frontend Issues:
   - Check Vercel deployment logs
   - Verify API endpoint configuration
   - Check browser console for errors
   - Verify environment variables
   - Check JWT token storage and usage

## Security Considerations

1. Backend:
   - Use HTTPS
   - Implement rate limiting
   - Set secure CORS policies
   - Use environment variables for sensitive data
   - Secure JWT token generation and validation
   - Implement token expiration and refresh

2. Frontend:
   - Use HTTPS
   - Implement proper authentication
   - Secure API calls
   - Handle errors gracefully
   - Secure JWT token storage
   - Implement proper token refresh

## Monitoring

1. Set up monitoring for:
   - API response times
   - Error rates
   - Database performance
   - User sessions
   - JWT token usage and validation

2. Configure alerts for:
   - Service downtime
   - High error rates
   - Database connection issues
   - API endpoint failures
   - Authentication failures 