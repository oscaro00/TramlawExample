import polars as pl
import pyarrow as pa
import pyarrow.parquet as pq
import sys

df_fraction = pl.scan_parquet('C:\\Users\\obrie\\Documents\\tramlaW Raw Data\\fact_fraction.parquet')

df_final = (
    df_fraction
    .collect()
)

df_final.write_parquet(sys.stdout.buffer)