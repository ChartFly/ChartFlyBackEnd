# import sqlite3
#
# # Initialize Secure Database
# def init_secure_db():
#     connection = sqlite3.connect("chartflysecure.db")
#     cursor = connection.cursor()
#
#     # Create a placeholder table for API keys
#     cursor.execute("""
#     CREATE TABLE IF NOT EXISTS api_keys (
#         id INTEGER PRIMARY KEY,
#         name TEXT NOT NULL,
#         key TEXT NOT NULL,
#         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
#     )
#     """)
#
#     connection.commit()
#     connection.close()
#
# if __name__ == "__main__":
#     init_secure_db()