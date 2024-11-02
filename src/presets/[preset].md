The current preset is ${observable.params.preset}.

```js
const test = FileAttachment(`../data/fact_pos_${observable.params.preset}.parquet`).parquet();
```

```js
const db = await DuckDBClient.of({ 
  fact_pos: FileAttachment(`../data/fact_pos_${observable.params.preset}.parquet`).parquet() //,
  // fact_inv: FileAttachment('./data/fact_inventory.parquet').parquet(),
  // fact_frac: FileAttachment('./data/fact_fraction.parquet').parquet()
});
const pos = await db.sql`SELECT * FROM fact_pos`;
// const inv = await db.sql`select * from fact_inv`;
// const frac = await db.sql`select * from fact_frac`;
```

```js
const pos_table = await db.sql([`
  select * from fact_pos
`]);
```


```js
Inputs.table(pos_table)
```