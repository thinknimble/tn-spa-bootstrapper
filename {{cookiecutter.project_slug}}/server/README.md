# Django

## Initial Setup for non-Docker local

1. Install Postgres (OSX - `brew install postgresql`; Linux - `apt-get`)
1. Copy .env.example to new file .env
1. Run `./init-db.sh` from the `scripts` directory (or view and manually create the database)

Once db credentials are set:

1. `uv sync` to install dependencies
1. `source .venv/bin/activate` to activate the virtualenv shell
1. `cd server`
1. `python manage.py migrate` to migrate database
1. `python manage.py runserver` to run the Django API (default - localhost:8000/admin)


## Environment Variables

### Email Allowlist Configuration

The application supports restricting user signups to specific email addresses through an allowlist feature:

- `USE_EMAIL_ALLOWLIST` (boolean, default: `False`): Enable/disable email allowlist feature
  - When `True`, only emails in the allowlist can register
  - When `False`, any valid email can register

- `EMAIL_ALLOWLIST` (JSON array, default: `[]`): List of allowed email addresses
  - Format: `'["email1@example.com", "email2@example.com"]'`
  - Example: `EMAIL_ALLOWLIST='["admin@thinknimble.com", "user@thinknimble.com"]'`
  - Must be a valid JSON array string

#### Example Configuration

```bash
# Enable email allowlist
USE_EMAIL_ALLOWLIST=True
EMAIL_ALLOWLIST='["admin@thinknimble.com", "developer@thinknimble.com"]'
```

#### Deployment Notes

- For Heroku deployments, these values are configured in `app.json`
- The EMAIL_ALLOWLIST must be provided as a JSON string in environment variables
- When disabled, the system logs warnings for potentially risky email domains

### Email Verification Configuration

The application requires users to verify their email address upon signup to improve security and prevent spam:

- `REQUIRE_EMAIL_VERIFICATION` (boolean, default: `True`): Enable/disable email verification requirement
  - When `True`, users must verify their email address to gain full access
  - When `False`, email verification is optional and users have immediate access
  - Staff users bypass verification checks regardless of this setting

#### How Email Verification Works

1. **On Signup**: When a user registers, they receive a verification email with a unique token
2. **Token Expiration**: Verification tokens expire after 24 hours
3. **Verification Link**: Users click the link in the email to verify their address
4. **Resend Option**: Unverified users can request a new verification email

#### API Endpoints

- `POST /api/verify-email/<user_id>/<token>/` - Verify email address with token
- `POST /api/resend-verification-email/` - Resend verification email (requires authentication)

#### Example Configuration

```bash
# Require email verification (default)
REQUIRE_EMAIL_VERIFICATION=True

# Disable email verification
REQUIRE_EMAIL_VERIFICATION=False
```

#### Testing Considerations

- In development, verification emails are logged to the console by default
- The email template can be previewed at `/api/template_preview/?template=registration/email_verification.html` (DEBUG mode only)
- Staff users always bypass verification requirements for administrative access

#### Deployment Notes

- For Heroku deployments, this value is configured in `app.json`
- Ensure proper email configuration (SMTP settings) for production environments
- Consider keeping verification enabled in production for security

## Linting
[WIP]

`ruff format`

`ruff check --fix`
