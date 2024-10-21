---
toc: false
---

# tramlaW Scorecard

```js
const db = await DuckDBClient.of({ fact_pos: FileAttachment("./data/fact_pos.parquet").parquet() });
const data = await db.sql`SELECT * FROM fact_pos`;
```

```js
Inputs.table(data)
```
