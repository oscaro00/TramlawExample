import polars as pl
import pyarrow as pa
import pyarrow.parquet as pq
import sys

df_inventory = pl.scan_parquet('C:\\Users\\obrie\\Documents\\tramlaW Raw Data\\fact_inventory.parquet')
df_item = pl.scan_parquet('C:\\Users\\obrie\\Documents\\tramlaW Raw Data\\dim_item.parquet')

df_final = (
    df_inventory
    .join(df_item, on = 'item_id', how = 'inner')
    .group_by('week', 'category', 'subcategory', 'brand')
    .agg(
        pl.col('pods').sum().alias('pods'),
        pl.col('instock_numerator').sum().alias('instock_numerator'),
        pl.col('instock_denominator').sum().alias('instock_denominator')
    )
    .collect()
)

# print(df_final)

df_final.write_parquet(sys.stdout.buffer)