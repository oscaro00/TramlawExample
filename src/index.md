---
theme: dashboard
toc: false
style: style.css
---

```js
import {dropdownInput} from "./components/dropdown.js";
```

# tramlaW Scorecard

---

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
const selectTimeFrame = dropdownInput({
  inputLabel: "Timeframe",
  inputId: "timeframe",
  placeholderText: 'Select timeframe...',
  options: [{value:"1,1", label:'Last Week'},
            {value:"1,4", label: 'Last 4 Weeks'},
            {value:"1,13", label: 'Last 13 Weeks'},
            {value:"1,26", label: 'Last 26 Weeks'},
            {value:"1,52", label: 'Last 52 Weeks'}],
  selected: ["1,13"],
  is_multi: false
});

const selectCategory = dropdownInput({
  inputLabel: "Category",
  inputId: "category",
  placeholderText: 'Select category...',
  options: [{value:"Category1", label:'Category 1'},
            {value:"Category2", label: 'Category 2'},
            {value:"Category3", label: 'Category 3'},
            {value:"Category4", label: 'Category 4'},
            {value:"Category5", label: 'Category 5'},
            {value:"Category6", label: 'Category 6'}],
  selected: ['Category1', 'Category2', 'Category3', 'Category4', 'Category5', 'Category6'],
  is_multi: true
});
```

<div class="grid grid-cols-2">
  <div>
    ${view(selectTimeFrame)}
  </div>
  <div>
    ${view(selectCategory)}
  </div>
</div>


```js
Inputs.table(pos)
```

```js
Inputs.table(inv)
```

```js
Inputs.table(frac)
```
