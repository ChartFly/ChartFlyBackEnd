## 🔐 Environment Setup

This project uses environment variables stored in a `.env` file.

🚫 **Do not commit your `.env` file. It is ignored by `.gitignore` and protected by a pre-push hook.**

### Setup Instructions:
1. Copy `.env.template` to `.env`
2. Fill in your credentials and secrets
3. Save and you're good to go

---

### 🛡️ Git Hook Protection

A `pre-push` Git hook is installed to prevent accidental commits of `.env`.

If you see this error when pushing:

> ⛔ Push rejected: .env file is staged. Remove it before pushing.

Run this to fix it:

```bash
git restore --staged .env