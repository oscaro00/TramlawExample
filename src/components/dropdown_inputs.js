export function format_dropdown_inputs(col_array, col_name, with_quotes = false) {
    let arr_values = [];

    const prefix_suffix = with_quotes ? "'" : "";

    col_array.forEach(element => {
        arr_values.push(prefix_suffix + element[col_name] + prefix_suffix);
    });

    return arr_values;
}


export function zip_dropdown_inputs(arr_values, arr_labels) {
    let arr_val_lab = [];

    arr_values.forEach((element, index) => {
        arr_val_lab.push({value: element, label: arr_labels[index]});
    });

    return arr_val_lab;
}