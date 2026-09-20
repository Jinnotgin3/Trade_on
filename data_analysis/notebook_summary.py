--- Code ---

--- Markdown ---
# Global Trade Matchmaking Project
## Data Analysis & Exploratory Data Analysis (EDA)
This notebook performs exploratory analysis on the commodity trade dataset used for the Swipe-to-Export matchmaking system.
--- Markdown ---
## 1. Import Libraries
--- Code ---
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
--- Markdown ---
## 2. Load Dataset
--- Code ---
df = pd.read_csv('/content/sample_data/commodity_trade_statistics_final.csv', header=1)
df.head()
--- Markdown ---
## 3. Select Relevant Columns
--- Code ---
df = df[['country_or_area','year','commodity','flow','trade_usd']]
df.head()
--- Markdown ---
## 4. Dataset Overview
--- Code ---
print('Dataset shape:', df.shape)
print('\nColumn types:')
print(df.dtypes)
print('\nMissing values:')
print(df.isnull().sum())
--- Markdown ---
## 5. Data Cleaning
--- Code ---
df = df.dropna()
df = df.drop_duplicates()
df.shape
--- Markdown ---
## 6. Summary Statistics
--- Code ---
df.describe()
--- Markdown ---
## 7. Export vs Import Distribution
--- Code ---
flow_counts = df['flow'].value_counts()
flow_counts
--- Code ---
flow_counts.plot(kind='bar')
plt.title('Export vs Import Distribution')
plt.xlabel('Trade Flow')
plt.ylabel('Count')
plt.show()
--- Markdown ---
## 8. Top Exporting Countries
--- Code ---
exports = df[df['flow']=='Export']
top_exporters = exports.groupby('country_or_area')['trade_usd'].sum().sort_values(ascending=False).head(10)
top_exporters
--- Code ---
top_exporters.plot(kind='bar')
plt.title('Top Exporting Countries')
plt.xlabel('Country')
plt.ylabel('Export Value')
plt.show()
--- Markdown ---
## 9. Top Importing Countries
--- Code ---
imports = df[df['flow']=='Import']
top_importers = imports.groupby('country_or_area')['trade_usd'].sum().sort_values(ascending=False).head(10)
top_importers
--- Code ---
top_importers.plot(kind='bar')
plt.title('Top Importing Countries')
plt.xlabel('Country')
plt.ylabel('Import Value')
plt.show()
--- Markdown ---
## 10. Most Traded Commodities
--- Code ---
top_products = df.groupby('commodity')['trade_usd'].sum().sort_values(ascending=False).head(10)
top_products
--- Code ---
top_products.plot(kind='bar')
plt.title('Top Traded Commodities')
plt.xlabel('Commodity')
plt.ylabel('Trade Value')
plt.show()
--- Markdown ---
## 11. Commodity Search Example
--- Code ---
def search_commodity(keyword):
    keyword = keyword.lower()
    options = [c for c in df['commodity'].unique() if keyword in c.lower()]
    return options

search_commodity('coffee')
--- Markdown ---
## 12. Key Insights
- Identify major exporters and importers
- Identify high-demand commodities
- Understand trade patterns used for matchmaking
- These insights help build the ML recommendation system
