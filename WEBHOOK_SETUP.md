# Clerk Webhook Setup for Subscription Sync

This webhook automatically syncs user subscription changes from Clerk to update credit limits in the database.

## Setup Instructions

### 1. Get Webhook Secret from Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **Webhooks** in the sidebar
4. Click **Add Endpoint**
5. Enter your webhook URL: `https://yourdomain.com/api/webhooks/clerk`
6. Select the following events:
   - `user.updated`
   - `organizationMembership.updated`
7. Click **Create**
8. Copy the **Signing Secret** shown on the page

### 2. Add Environment Variable

Add the signing secret to your `.env` file:

```bash
CLERK_WEBHOOK_SECRET="whsec_your_signing_secret_here"
```

### 3. Configure Subscription Plans in Clerk

In your Clerk Dashboard, set up subscription plans with the following metadata:

#### Free Plan
- Plan ID: `free_user`
- Public Metadata: `{ "subscription_plan": "free_user" }`
- Credits: 50

#### Pro Plan
- Plan ID: `pro`
- Public Metadata: `{ "subscription_plan": "pro" }`
- Credits: 100

### 4. How It Works

When a user subscribes or updates their subscription:
1. Clerk sends a webhook to `/api/webhooks/clerk`
2. The webhook verifies the signature for security
3. It reads the `subscription_plan` from user's public metadata
4. Updates the user's `creditsLimit` in the database:
   - `free_user` → 50 credits
   - `pro` → 100 credits

### 5. Testing Locally

To test webhooks locally, use the Clerk CLI:

```bash
# Install Clerk CLI
npm install -g @clerk/clerk-cli

# Forward webhooks to localhost
clerk webhooks forward http://localhost:3000/api/webhooks/clerk
```

### 6. Manual Credit Sync

Credits are also automatically synced when users:
- Create a new project
- Send a message
- Load their usage stats

This ensures the credit limit always matches their current subscription plan, even without webhook events.

## Webhook Events

The webhook listens for:
- `user.updated` - When user profile or metadata changes
- `organizationMembership.updated` - When organization membership changes

## Security

- Webhooks are verified using Svix signature verification
- Only requests with valid signatures are processed
- Invalid requests return 400 status codes
