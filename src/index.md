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
// look into this for the preset bookmarks
// https://github.com/observablehq/framework/discussions/883

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
// Need the generator to access the dropdown value
const timeFrame = Generators.input(selectTimeFrame);

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
// Need the generator to access the dropdown value
const category = Generators.input(selectCategory);

// function display_dropdowns(dropdown1, dropdown2) {
//   return html`
//   <div class="grid grid-cols-2">
//     <div>${display(dropdown1)}</div>
//     <div>${display(dropdown2)}</div>
//   </div>
//   `;
// }
```

```js
// display_dropdowns(selectTimeFrame, selectCategory)
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
display(timeFrame)
display(category)
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

```js
// see ________ for reading the session storage object
const filter_parameters_object = {time: timeFrame, catg: category};
display(filter_parameters_object)
const filter_string = JSON.stringify(filter_parameters_object)
sessionStorage.setItem("filter parameter context", filter_string);
```
