import os
import psycopg2
from urllib.parse import urlparse

DATABASE_URL = "postgresql://postgres.skofjfduwejhkmubuucn:feidlhTqjoB6dajI@aws-0-us-west-2.pooler.supabase.com:6543/postgres"

def get_connection():
    result = urlparse(DATABASE_URL)
    username = result.username
    password = result.password
    database = result.path[1:]
    hostname = result.hostname
    port = result.port
    return psycopg2.connect(
        database=database,
        user=username,
        password=password,
        host=hostname,
        port=port
    )

def inspect_tables():
    conn = get_connection()
    cur = conn.cursor()
    
    # List all tables in public schema
    cur.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    """)
    tables = [row[0] for row in cur.fetchall()]
    
    print(f"Found {len(tables)} tables: {', '.join(tables)}\n")
    
    important_tables = [
        'users_user', 'clients_clientprofile', 'business_accounts', 
        'business_members', 'chefs_chefprofile', 'chefs_chefonboarding', 
        'bookings_booking', 'payments_payment'
    ]
    
    for table in tables:
        if table in important_tables or any(important in table for important in important_tables):
            print(f"--- Table: {table} ---")
            # Columns and types
            cur.execute(f"""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = '{table}'
                ORDER BY ordinal_position
            """)
            for col in cur.fetchall():
                print(f"  {col[0]}: {col[1]} (Nullable: {col[2]}, Default: {col[3]})")
            
            # Constraints
            cur.execute(f"""
                SELECT conname, pg_get_constraintdef(c.oid)
                FROM pg_constraint c
                JOIN pg_namespace n ON n.oid = c.connamespace
                WHERE contype IN ('p', 'f', 'u', 'c')
                AND conrelid = '{table}'::regclass
            """)
            constraints = cur.fetchall()
            if constraints:
                print("  Constraints:")
                for con in constraints:
                    print(f"    {con[0]}: {con[1]}")
            
            # Count
            cur.execute(f"SELECT COUNT(*) FROM {table}")
            count = cur.fetchone()[0]
            print(f"  Row count: {count}")
            print()
            
    cur.close()
    conn.close()

if __name__ == "__main__":
    try:
        inspect_tables()
    except Exception as e:
        print(f"Error: {e}")
