---
theme: dashboard
toc: false
style: style.css
---

```js
import {dropdownInput} from "./components/dropdown.js";
import {format_dropdown_inputs, zip_dropdown_inputs} from "./components/dropdown_inputs.js";
// import {big_value_card} from "./components/big_value_card.js"; // replaced by trend.js
import {Trend} from "./components/trend.js";
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
const distinct_catg = await db.sql([`
  select distinct category from fact_pos order by category asc
`]);
const arr_distinct_catg = distinct_catg.toArray();
const catg_values = format_dropdown_inputs(arr_distinct_catg, 'category', true);
const catg_labels = format_dropdown_inputs(arr_distinct_catg, 'category', false);
const catg_values_labels = zip_dropdown_inputs(catg_values, catg_labels);
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
// Need the generator to access the dropdown value without placing the dropdown dom element
const timeFrame = Generators.input(selectTimeFrame);

const selectCategory = dropdownInput({
  inputLabel: "Category",
  inputId: "category",
  placeholderText: 'Select category...',
  options: catg_values_labels,
  selected: catg_values,
  is_multi: true
});
// Need the generator to access the dropdown value without placing the dropdown dom element
const category = Generators.input(selectCategory);
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
const ty_metrics = await db.sql([`
  with selected_weeks as (
    select distinct
      week
    from
      fact_pos
    order by
      week desc
    limit
      ${Number(timeFrame[0].split(",")[1])}
  )
  select
    sum(dollars) as ty_dollars,
    sum(units) as ty_units
  from
    fact_pos
    inner join selected_weeks on selected_weeks.week = fact_pos.week
  where
    category in (${category.length == 0 ? "'placeholder'" : category})
`]);
```

```js
const ly_metrics = await db.sql([`
  with selected_weeks as (
    select distinct
      week
    from
      fact_pos
    order by
      week desc
    limit
      ${Number(timeFrame[0].split(",")[1])}
    offset
      52
  )
  select
    sum(dollars) as ly_dollars,
    sum(units) as ly_units
  from
    fact_pos
    inner join selected_weeks on selected_weeks.week = fact_pos.week
  where
    category in (${category.length == 0 ? "'placeholder'" : category})
`]);
```

```js
const ty_dollars = ty_metrics.toArray()[0]["ty_dollars"].toLocaleString("en-US", {currency: "USD", notation: "compact"});
const dollars_comp = ly_metrics.toArray()[0]["ly_dollars"] ? 
  ((ty_metrics.toArray()[0]["ty_dollars"] - ly_metrics.toArray()[0]["ly_dollars"]) / ly_metrics.toArray()[0]["ly_dollars"]) : undefined;

const ty_units = ty_metrics.toArray()[0]["ty_units"].toLocaleString("en-US", {notation: "compact"});
const units_comp = ly_metrics.toArray()[0]["ly_units"] ? 
  ((ty_metrics.toArray()[0]["ty_units"] - ly_metrics.toArray()[0]["ly_units"]) / ly_metrics.toArray()[0]["ly_units"]) : undefined;
```

```js
const pos_table = await db.sql([`
  with ty_selected_weeks as (
    select distinct
      week
    from
      fact_pos
    order by
      week desc
    limit
      ${Number(timeFrame[0].split(",")[1])}
    offset
      52
  ),
  ly_selected_weeks as (
    select distinct
      week
    from
      fact_pos
    order by
      week desc
    limit
      ${Number(timeFrame[0].split(",")[1])}
    offset
      52
  ),
  ty_metrics as (
    select
      category,
      sum(dollars) as ty_dollars
    from
      fact_pos
      inner join ty_selected_weeks on ty_selected_weeks.week = fact_pos.week
    where
      category in (${category.length == 0 ? "'placeholder'" : category})
    group by
      category
  ),
  ly_metrics as (
    select
      category,
      sum(dollars) as ly_dollars
    from
      fact_pos
      inner join ly_selected_weeks on ly_selected_weeks.week = fact_pos.week
    where
      category in (${category.length == 0 ? "'placeholder'" : category})
    group by
      category
  )
  select
    ty_metrics.category as Category,
    round(ty_metrics.ty_dollars) as Dollars,
    round((ty_dollars - ly_dollars) / ly_dollars * 100, 1) as Chg
  from
    ty_metrics
    inner join ly_metrics on ly_metrics.category = ty_metrics.category
  order by
    ty_metrics.category asc
`]);
```
```js
// see this link for formatting and a good card example
// https://observablehq.observablehq.cloud/framework-example-plot/

// see for compact number formatting
// https://stackoverflow.com/questions/9461621/format-a-number-as-2-5k-if-a-thousand-or-more-otherwise-900
```

<div class="grid grid-cols-4">
  <a class="card" style="color: inherit;">
    <h2>Dollars</h2>
    <span class="big">${ty_dollars}</span>
    ${Trend(dollars_comp, {format: {style: "percent", minimumFractionDigits: 1}})}
    <span class="muted">vs LY</span>
  </a>
  <a class="card" style="color: inherit;">
    <h2>Units</h2>
    <span class="big">${ty_units}</span>
    ${Trend(units_comp, {format: {style: "percent", minimumFractionDigits: 1}})}
    <span class="muted">vs LY</span>
  </a>
  <div class="card grid-colspan-2" style="color: inherit;">
    <h2>GitHub stars</h2>
    <span class="big">123M</span>
    <span class="muted">over 7d</span></div>
  <div class="card grid-colspan-2">
    <h2>POS by Category</h2>
    ${Inputs.table(pos_table)}
  </div>
  <div class="card grid-colspan-2"><h1>E</h1>2 × 1</div>
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

```js
// see ________ for reading the session storage object
const filter_parameters_object = {time: timeFrame, catg: category};
display(filter_parameters_object)
const filter_string = JSON.stringify(filter_parameters_object);
sessionStorage.setItem("filter parameter context", filter_string);
```
