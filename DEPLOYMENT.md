# Deployment Guide for Coolify

This guide will help you deploy your Wormhole application to Coolify.

## Prerequisites

- A Coolify account
- A Slack app with the necessary permissions
- Environment variables for your application

## Environment Variables

Make sure to set the following environment variables in your Coolify deployment:

- `NODE_ENV`: Set to `production`
- `PORT`: Set to `3001` (or your preferred port)
- `SLACK_CLIENT_ID`: Your Slack app client ID
- `SLACK_CLIENT_SECRET`: Your Slack app client secret
- `SLACK_BOT_TOKEN`: Your Slack bot token (starts with `xoxb-`)
- `SLACK_SIGNING_SECRET`: Your Slack app signing secret
- `SLACK_APP_TOKEN`: Your Slack app token (starts with `xapp-`)
- `SLACK_CHANNEL_ID`: The ID of the Slack channel where files will be uploaded
- `FRONTEND_URL`: The URL of your deployed application (e.g., `https://your-app.coolify.app`)
- `VITE_SLACK_CLIENT_ID`: Your Slack app client ID (must match `SLACK_CLIENT_ID`)

> **Important**: The `VITE_SLACK_CLIENT_ID` environment variable is crucial for the frontend to authenticate with Slack. Make sure it's set correctly in Coolify and matches your `SLACK_CLIENT_ID`.

## Deployment Steps

1. **Connect your repository to Coolify**:

   - Log in to your Coolify dashboard
   - Click on "New Resource"
   - Select "Application"
   - Connect your Git repository

2. **Configure the deployment**:

   - Select the branch you want to deploy (usually `main` or `master`)
   - Set the build command to: `npm run build`
   - Set the start command to: `node server.js`
   - Set the port to: `3001`

3. **Set environment variables**:

   - Add all the environment variables listed above
   - Make sure to set `NODE_ENV` to `production`
   - Double-check that `VITE_SLACK_CLIENT_ID` is set correctly

4. **Deploy**:

   - Click "Deploy" to start the deployment process
   - Wait for the deployment to complete

5. **Verify the deployment**:
   - Once deployed, Coolify will provide you with a URL
   - Visit the URL to verify that your application is working correctly

## Troubleshooting

### "Cannot GET" Error

If you encounter a "cannot GET" error:

1. **Check your logs**:

   - In Coolify, go to your application
   - Click on "Logs" to see the server logs
   - Look for any errors or warnings

2. **Verify environment variables**:

   - Make sure all required environment variables are set correctly
   - Double-check the values, especially for Slack tokens

3. **Check the build process**:

   - Make sure the build process completed successfully
   - Verify that the `dist` directory was created

4. **Restart the application**:
   - Sometimes, a simple restart can fix issues
   - In Coolify, go to your application and click "Restart"

### "Bad Gateway" Error

If you encounter a "Bad Gateway" error:

1. **Check port configuration**:

   - Make sure the port in your Dockerfile (`ENV PORT=3001`) matches the port exposed (`EXPOSE 3001`)
   - Make sure the port in Coolify settings matches the port in your Dockerfile
   - Make sure the port in your server.js (`const port = process.env.PORT || 3001`) matches

2. **Check if the server is running**:

   - In Coolify, go to your application
   - Click on "Logs" to see if the server started successfully
   - Look for the message "Server running on port 3001"

3. **Check for build issues**:

   - Make sure the build process completed successfully
   - Check if the `dist` directory was created and contains the necessary files
   - Look for any errors in the build logs

4. **Check environment variables**:

   - Make sure all required environment variables are set correctly
   - Double-check the values, especially for Slack tokens

5. **Check Coolify proxy settings**:

   - In Coolify, go to your application settings
   - Make sure the proxy settings are correct
   - Try changing the proxy settings to "Direct" instead of "Traefik" if available

6. **Restart the application**:

   - Sometimes, a simple restart can fix issues
   - In Coolify, go to your application and click "Restart"

7. **Check for memory issues**:
   - If your application is using too much memory, it might be terminated
   - Check the memory usage in Coolify
   - Consider increasing the memory limit if necessary

### "Invalid client_id parameter" Error

If you encounter an "Invalid client_id parameter" error when trying to log in with Slack:

1. **Check the VITE_SLACK_CLIENT_ID environment variable**:

   - Make sure `VITE_SLACK_CLIENT_ID` is set correctly in Coolify
   - It should match your `SLACK_CLIENT_ID` value
   - The value should be your Slack app's client ID (e.g., `1234567890.1234567890`)

2. **Rebuild the application**:

   - After setting the environment variable, rebuild the application
   - In Coolify, go to your application and click "Rebuild"

3. **Check the browser console**:

   - Open your browser's developer tools (F12)
   - Go to the Console tab
   - Look for any errors related to the Slack client ID

4. **Verify the Slack app configuration**:

   - Make sure your Slack app is properly configured
   - Check that the OAuth & Permissions settings are correct
   - Verify that the redirect URI matches your application's URL

## Additional Notes

- The application uses a multi-stage Docker build to optimize the image size
- The server is configured to serve the React application in production mode
- File uploads are stored in the `uploads` directory, which is created during the Docker build
