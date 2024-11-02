import polars as pl
# import pyarrow as pa
# import pyarrow.parquet as pq
import sys

df_pos = pl.scan_parquet('C:\\Users\\obrie\\Documents\\tramlaW Raw Data\\fact_pos.parquet')
df_item = pl.scan_parquet('C:\\Users\\obrie\\Documents\\tramlaW Raw Data\\dim_item.parquet')

df_final = (
    df_pos
    .join(df_item, on = 'item_id', how = 'inner')
    .group_by('week', 'channel', 'category', 'subcategory', 'brand')
    .agg(
        pl.col('units').sum().alias('units'),
        pl.col('dollars').sum().alias('dollars')
    )
    .collect()
)

# print(df_final)

df_final.write_parquet(sys.stdout.buffer)