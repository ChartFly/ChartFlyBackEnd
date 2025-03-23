# control_console/database.py

# Legacy sync connections are now deprecated.
# All database access is handled via asyncpg connection pool set in app.state.db_pool
# and injected via request.state.db middleware.

# This file remains as a placeholder in case you later define:
# - utility functions for migrations
# - health checks
# - future fallback options

# If needed later, you can define:
# def get_db_connection(): ...
# for psycopg2 or other tools

# For now, this file can be safely empty or contain logging/debug helpers if needed.