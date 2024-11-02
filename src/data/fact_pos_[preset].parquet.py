import argparse
import polars as pl
import sys

# Instantiate the parser
parser = argparse.ArgumentParser(description='Parse command line arguments for preset filters for the fact pos table')

# Required positional argument
parser.add_argument('--preset', type=str,
                    help='A required preset argument')

args = parser.parse_args()

if args.preset == 'evens':
    lst_preset_filter = ['Category2', 'Category4', 'Category6']
elif args.preset == 'odds':
    lst_preset_filter = ['Category1', 'Category3', 'Category5']


df_pos = pl.scan_parquet('C:\\Users\\obrie\\Documents\\tramlaW Raw Data\\fact_pos.parquet')
df_item = pl.scan_parquet('C:\\Users\\obrie\\Documents\\tramlaW Raw Data\\dim_item.parquet')

df_final = (
    df_pos
    .join(df_item, on = 'item_id', how = 'inner')
    .filter(pl.col('category').is_in(lst_preset_filter))
    .group_by('week', 'channel', 'category', 'subcategory', 'brand')
    .agg(
        pl.col('units').sum().alias('units'),
        pl.col('dollars').sum().alias('dollars')
    )
    .collect()
)

# print(df_final)

df_final.write_parquet(sys.stdout.buffer)