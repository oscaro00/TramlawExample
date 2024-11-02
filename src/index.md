---
theme: dashboard
toc: false
style: custom-style.css
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

const distinct_timeframe = await db.sql([`
  select distinct timeframe from fact_frac order by timeframe asc
`]);
const arr_distinct_timeframe = distinct_timeframe.toArray();
const timeframe_values = format_dropdown_inputs(arr_distinct_timeframe, 'timeframe', true);
const timeframe_labels = format_dropdown_inputs(arr_distinct_timeframe, 'timeframe', false);
const timeframe_values_labels = zip_dropdown_inputs(timeframe_values, timeframe_labels); 
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
  selected: filter_context["time"],
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

const selectFracTimeframe = dropdownInput({
  inputLabel: "Timeframe",
  inputId: "timeframe",
  placeholderText: 'Select timeframe...',
  options: timeframe_values_labels,
  selected: ["'Last 12 months'"],
  is_multi: false
});
// Need the generator to access the dropdown value without placing the dropdown dom element
const fracTimeframe = Generators.input(selectFracTimeframe);
```

```js
const evensButton = Inputs.button("Evens");
const eButton = Generators.input(evensButton);
const oddsButton = Inputs.button("Odds");
const oButton = Generators.input(oddsButton);
```

```js
if (eButton != 0) {
  selectCategory.value = ["'Category2'", "'Category4'", "'Category6'"];
  selectCategory.dispatchEvent(new Event("input", {bubbles: true}));
  //selectCategory.dispatchEvent(new Event("click", {bubbles: true}));
}
```

```js
if (oButton != 0) {
  selectCategory.value = ["'Category1'", "'Category3'", "'Category5'"];
  selectCategory.dispatchEvent(new Event("input", {bubbles: true}));
  //selectCategory.dispatchEvent(new Event("click", {bubbles: true}));
}
```

<div class="filters">
  <div class="timeFilter" style="display: inline-block;">${view(selectTimeFrame)}</div>
  <div class="categoryFilter" style="display: inline-block;">${view(selectCategory)}</div>
  <div class="evensButton" style="display: inline-block; max-width: 50px;">${view(evensButton)}</div>
  <div class="oddsButton" style="display: inline-block; max-width: 50px;">${view(oddsButton)}</div>
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
const ty_inv_metrics = await db.sql([`
  with selected_weeks as (
    select distinct
      week
    from
      fact_inv
    order by
      week desc
    limit
      ${Number(timeFrame[0].split(",")[1])}
  )
  select
    sum(instock_numerator) / sum(instock_denominator) as ty_instock,
    sum(pods) as ty_pods
  from
    fact_inv
    inner join selected_weeks on selected_weeks.week = fact_inv.week
  where
    category in (${category.length == 0 ? "'placeholder'" : category})
`]);
```

```js
const ly_inv_metrics = await db.sql([`
  with selected_weeks as (
    select distinct
      week
    from
      fact_inv
    order by
      week desc
    limit
      ${Number(timeFrame[0].split(",")[1])}
    offset
      52
  )
  select
    sum(instock_numerator) / sum(instock_denominator) as ly_instock,
    sum(pods) as ly_pods
  from
    fact_inv
    inner join selected_weeks on selected_weeks.week = fact_inv.week
  where
    category in (${category.length == 0 ? "'placeholder'" : category})
`]);
```

```js
const ty_instock = ty_inv_metrics.toArray()[0]["ty_instock"].toLocaleString("en-US", {style: "percent", notation: "compact"});
const instock_comp = ly_inv_metrics.toArray()[0]["ly_instock"] ? 
  ((ty_inv_metrics.toArray()[0]["ty_instock"] - ly_inv_metrics.toArray()[0]["ly_instock"]) / ly_inv_metrics.toArray()[0]["ly_instock"]) : undefined;

const ty_pods = ty_inv_metrics.toArray()[0]["ty_pods"].toLocaleString("en-US", {notation: "compact"});
const pods_comp = ly_inv_metrics.toArray()[0]["ly_pods"] ? 
  ((ty_inv_metrics.toArray()[0]["ty_pods"] - ly_inv_metrics.toArray()[0]["ly_pods"]) / ly_inv_metrics.toArray()[0]["ly_pods"]) : undefined;
```

```js
const inv_table = await db.sql([`
  with ty_selected_weeks as (
    select distinct
      week
    from
      fact_inv
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
      fact_inv
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
      sum(instock_numerator) / sum(instock_denominator) as ty_instock,
      sum(pods) as ty_pods
    from
      fact_inv
      inner join ty_selected_weeks on ty_selected_weeks.week = fact_inv.week
    where
      category in (${category.length == 0 ? "'placeholder'" : category})
    group by
      category
  ),
  ly_metrics as (
    select
      category,
      sum(instock_numerator) / sum(instock_denominator) as ly_instock,
      sum(pods) as ly_pods
    from
      fact_inv
      inner join ly_selected_weeks on ly_selected_weeks.week = fact_inv.week
    where
      category in (${category.length == 0 ? "'placeholder'" : category})
    group by
      category
  )
  select
    ty_metrics.category as Category,
    round(ty_metrics.ty_instock, 2) as Instock,
    round(ty_metrics.ty_pods, 0) as PODs
  from
    ty_metrics
    inner join ly_metrics on ly_metrics.category = ty_metrics.category
  order by
    ty_metrics.category asc
`]);
```

```js
const frac_metrics = await db.sql([`
  select
    household_penetration,
    buy_rate
  from
    fact_frac
  where
    category in (${category.length == 0 ? "'placeholder'" : category})
    and timeframe = ${fracTimeframe}
`]);
```

```js
const household_penetration = frac_metrics.toArray()[0]["household_penetration"].toLocaleString("en-US", {style: "percent", minimumFractionDigits: 1});

const buy_rate = frac_metrics.toArray()[0]["buy_rate"].toLocaleString("en-US", {minimumFractionDigits: 1});
```


```js
// see this link for formatting and a good card example
// https://observablehq.observablehq.cloud/framework-example-plot/
```

# Light

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
  <a class="card" style="color: inherit;">
    <h2>Instock</h2>
    <span class="big">${ty_instock}</span>
    ${Trend(instock_comp, {format: {style: "percent", minimumFractionDigits: 1}})}
    <span class="muted">vs LY</span>
  </a>
  <a class="card" style="color: inherit;">
    <h2>PODs</h2>
    <span class="big">${ty_pods}</span>
    ${Trend(pods_comp, {format: {style: "percent", minimumFractionDigits: 1}})}
    <span class="muted">vs LY</span>
  </a>
</div>



<div class="grid grid-cols-4">
  <div class="card grid-colspan-2">
      <h2>POS by Category</h2>
    ${Inputs.table(pos_table)}
  </div>
  <div class="card grid-colspan-2">
      <h2>Inventory by Category</h2>
    ${Inputs.table(inv_table)}
  </div>
</div>


# Denominator

<div class="filters">
  <div class="fracTimeframe" style="display: inline-block;">${view(selectFracTimeframe)}</div>
</div>

<div class="grid grid-cols-4">
  <a class="card" style="color: inherit;">
    <h2>Household Penetration</h2>
    <span class="big">${household_penetration}</span>
  </a>
  <a class="card" style="color: inherit;">
    <h2>Buy Rate</h2>
    <span class="big">${buy_rate}</span>
  </a>
</div>


```js
// see pos-summary.md for reading the session storage object
const filter_parameters_object = {time: timeFrame, catg: category};
display(filter_parameters_object)
const filter_string = JSON.stringify(filter_parameters_object);
sessionStorage.setItem("filter parameter context", filter_string);
```

```js
const filter_string = sessionStorage.getItem("filter parameter context");

let filter_context = {};
if (filter_string === null) {
  filter_context["time"] = ["1,13"];
} else {
  filter_context = JSON.parse(filter_string);
}
// display(filter_string)
// display(filter_context)
```
