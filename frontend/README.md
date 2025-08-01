# Frontend Application

This directory contains the React-based frontend for the Food PWA application.

## Vercel Deployment

To deploy the frontend to Vercel, you need to configure a single environment variable in your Vercel project settings.

### Environment Variable

- **`REACT_APP_API_URL`**: This variable should contain the full public URL of the deployed backend API.

  For example: `https://your-backend-service-name.a.run.app`

**To set this variable:**

1.  Go to your project's dashboard on Vercel.
2.  Navigate to the **Settings** tab.
3.  Click on **Environment Variables** in the side menu.
4.  Create a new variable with the key `REACT_APP_API_URL` and paste your backend URL as the value.
5.  Ensure the variable is available to the **Production** environment (and Preview/Development if needed).