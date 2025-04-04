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

4. **Deploy**:

   - Click "Deploy" to start the deployment process
   - Wait for the deployment to complete

5. **Verify the deployment**:
   - Once deployed, Coolify will provide you with a URL
   - Visit the URL to verify that your application is working correctly

## Troubleshooting

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

## Additional Notes

- The application uses a multi-stage Docker build to optimize the image size
- The server is configured to serve the React application in production mode
- File uploads are stored in the `uploads` directory, which is created during the Docker build
