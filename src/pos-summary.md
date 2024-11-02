---
theme: dashboard
toc: false
style: custom-style.css
---

```js
import {dropdownInput} from "./components/dropdown.js";
import {format_dropdown_inputs, zip_dropdown_inputs} from "./components/dropdown_inputs.js";
import {Trend} from "./components/trend.js";
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
  selected: typeof filter_context["time"] !== undefined ? filter_context["time"] : ["1,13"],
  is_multi: false
});
// Need the generator to access the dropdown value without placing the dropdown dom element
const timeFrame = Generators.input(selectTimeFrame);
```


```js
const category = ["'category1'", "'category2'", "'category3'", "'category4'", "'category5'", "'category6'"];

// see pos-summary.md for reading the session storage object
const filter_parameters_object = {time: timeFrame, catg: category};
// display(filter_parameters_object)
const filter_string = JSON.stringify(filter_parameters_object);
sessionStorage.setItem("filter parameter context", filter_string);
```

```js
const filter_string = sessionStorage.getItem("filter parameter context");
const filter_context = JSON.parse(filter_string);
display(filter_context)
```

${view(selectTimeFrame)}

```js
display(timeFrame)
```
