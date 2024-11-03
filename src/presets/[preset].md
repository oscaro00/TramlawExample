---
theme: dashboard
toc: false
style: ../custom-style.css
---

```js
import {dropdownInput} from "../components/dropdown.js";
import {format_dropdown_inputs, zip_dropdown_inputs} from "../components/dropdown_inputs.js";
import {Trend} from "../components/trend.js";
```
# ${observable.params.preset} preset filter

---

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
```

<div class="filters">
  <div class="timeFilter" style="display: inline-block;">${view(selectTimeFrame)}</div>
</div>

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
    --offset
    --  52
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

<div class="grid grid-cols-2">
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
</div>

<div class="grid grid-cols-2">
  <div class="card grid-colspan-2">
      <h2>POS by Category</h2>
    ${Inputs.table(pos_table)}
  </div>
</div>

```js
const pos_plot_data = await db.sql([`
  with ty_selected_weeks as (
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
    fact_pos.week as Week,
    channel as Channel,
    sum(dollars) / 1000000 as Dollars
  from
    fact_pos
    inner join ty_selected_weeks on ty_selected_weeks.week = fact_pos.week
  group by
    fact_pos.week,
    channel
  order by
    fact_pos.week,
    channel
`]);
```


<!-- ```js
const pos_plot = Plot.barY({
  x : {interval : 1}
  y : {grid : true},
  marks : [
    Plot.barY(pos_plot_data.toArray(), {x: "Week", y: "Dollars", fill: "Channel"}),
    Plot.ruleY([0])
  ]
});
``` -->

<div class="card" style="display: flex; flex-direction: column; gap: 1rem;">
  ${
    resize((width) => Plot.plot({
      width,
      x : {type : "band"},
      y : {grid : true, label : "Dollars (M)"},
      color : {legend : true},
      marks : [
        Plot.barY(pos_plot_data.toArray(), {x: "Week", y: "Dollars", fill: "Channel", sort: {y: "-x"}}),
        Plot.ruleY([0])
      ]
    }))
  }
</div>


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