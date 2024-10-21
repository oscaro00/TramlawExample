---
toc: false
---

# tramlaW Scorecard

```js
const db = await DuckDBClient.of({ 
  fact_pos: FileAttachment('./data/fact_pos.parquet').parquet(),
  fact_inv: FileAttachment('./data/fact_inventory.parquet').parquet(),
  fact_frac: FileAttachment('./data/fact_fraction.parquet').parquet()
});
const pos = await db.sql`SELECT * FROM fact_pos`;
const inv = await db.sql`select * from fact_inv`;
const frac = await db.sql`select * from fact_frac`;
```

```js
Inputs.table(pos)
```

```js
Inputs.table(inv)
```

```js
Inputs.table(frac)
```
