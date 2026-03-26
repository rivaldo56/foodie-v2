import psycopg2
from urllib.parse import urlparse

DATABASE_URL = "postgresql://postgres.skofjfduwejhkmubuucn:feidlhTqjoB6dajI@aws-0-us-west-2.pooler.supabase.com:6543/postgres"

def run_sql():
    result = urlparse(DATABASE_URL)
    conn = psycopg2.connect(
        database=result.path[1:],
        user=result.username,
        password=result.password,
        host=result.hostname,
        port=result.port
    )
    conn.autocommit = True
    cur = conn.cursor()
    
    with open('final_alignment.sql', 'r') as f:
        sql = f.read()
    
    print("Executing final_alignment.sql...")
    cur.execute(sql)
    print("SQL execution complete.")
    
    cur.close()
    conn.close()

if __name__ == "__main__":
    try:
        run_sql()
    except Exception as e:
        print(f"Error: {e}")
