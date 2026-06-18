import pandas as pd
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path='../.env')

# Connect to MongoDB
mongo_uri = os.getenv('MONGODB_URI')
if not mongo_uri:
    print("Error: MONGODB_URI not found in .env file.")
    exit(1)

print(f"Connecting to MongoDB...")
client = MongoClient(mongo_uri)
db = client['swipe-export']
collection = db['traderecords']

# Read the excel file
file_path = '../commodity_trade_statistics_final.xlsx'
print(f"Reading dataset from {file_path}...")
df = pd.read_excel(file_path)

# Based on previous EDA, columns start at index 1 conceptually if there was a header
# The actual columns are: country_or_area, year, commodity, flow, trade_usd
# But the first row might be headers. Let's rename them appropriately
print(f"Original columns: {df.columns.tolist()}")
df.columns = ['country_or_area', 'year', 'commodity', 'flow', 'trade_usd']

# Drop the first row if it contains the header text
if df.iloc[0]['country_or_area'] == 'country_or_area':
    df = df.iloc[1:]

df = df.dropna()
df = df.drop_duplicates()

# Convert trade_usd to float
df['trade_usd'] = pd.to_numeric(df['trade_usd'], errors='coerce')
df['year'] = pd.to_numeric(df['year'], errors='coerce')
df = df.dropna(subset=['trade_usd', 'year'])

# Convert to list of dictionaries
records = df.to_dict(orient='records')

print(f"Inserting {len(records)} records into MongoDB...")
collection.delete_many({}) # Clear existing data
result = collection.insert_many(records)
print(f"Successfully inserted {len(result.inserted_ids)} records.")

print("Seeding complete!")
