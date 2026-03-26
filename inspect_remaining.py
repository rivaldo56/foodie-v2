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

def inspect_remaining():
    conn = get_connection()
    cur = conn.cursor()
    
    important_tables = ['users_user', 'bookings_booking']
    
    for table in important_tables:
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
        try:
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
        except:
            print("  (Could not fetch constraints)")
        
        # Count
        cur.execute(f"SELECT COUNT(*) FROM {table}")
        count = cur.fetchone()[0]
        print(f"  Row count: {count}")
        print()
        
    # Check for duplicates or orphans
    print("--- Audit Queries ---")
    
    # Orphans: client profile without user
    cur.execute("SELECT COUNT(*) FROM clients_clientprofile WHERE user_id NOT IN (SELECT id FROM users_user)")
    print(f"Orphan profiles (no users_user): {cur.fetchone()[0]}")
    
    # Redundancy check: is supabase_user_id always same as user_id?
    cur.execute("SELECT COUNT(*) FROM chefs_chefprofile WHERE user_id != supabase_user_id AND supabase_user_id IS NOT NULL")
    print(f"Chef profiles with mismatched user_id/supabase_user_id: {cur.fetchone()[0]}")
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    try:
        inspect_remaining()
    except Exception as e:
        print(f"Error: {e}")
