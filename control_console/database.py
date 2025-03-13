import sqlite3

def get_non_secure_connection():
    return sqlite3.connect("chartflynonsecure.db")

def insert_holiday(name, date):
    connection = get_non_secure_connection()
    cursor = connection.cursor()
    cursor.execute("INSERT INTO holidays (name, date) VALUES (?, ?)", (name, date))
    connection.commit()
    holiday_id = cursor.lastrowid
    connection.close()
    return holiday_id


def get_holidays():
    connection = get_non_secure_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT name, date FROM holidays")
    holidays = cursor.fetchall()
    connection.close()
    return holidays

def update_holiday(id, new_name, new_date):
    connection = get_non_secure_connection()
    cursor = connection.cursor()
    cursor.execute("UPDATE holidays SET name = ?, date = ? WHERE id = ?", (new_name, new_date, id))
    connection.commit()
    connection.close()

def delete_holiday(id):
    connection = get_non_secure_connection()
    cursor = connection.cursor()
    cursor.execute("DELETE FROM holidays WHERE id = ?", (id,))
    connection.commit()
    connection.close()