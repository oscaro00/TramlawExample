import {html} from "npm:htl";

export function big_value_card(big_value, big_format, comparison_value, comparison_format, title, comparison_text) {
    
    function format_order(value, decimals) {
        if (value > 1e9) {
            return (value / 1e9).toFixed(decimals) + "B";
        } else if (value > 1e6) {
            return (value / 1e6).toFixed(decimals) + "M";
        } else if (value > 1e3) {
            return (value / 1e3).toFixed(decimals) + "K";
        } else {
            return value.toFixed(decimals);
        }
    }
    
    let formatted_big_value = format_order(big_value, 2);
    let formatted_comparison_value = format_order(((big_value - comparison_value) / comparison_value), 1);
    
    return html`
        <h2>${title}</h2>
        <h3>${big_format == "dollars" ? "$" : ""}${formatted_big_value}${big_format == "percentage" ? "%" : ""}</h3>
        <p>${formatted_comparison_value}${comparison_format == "percentage" ? "%" : ""} ${comparison_text}</p>
    `;

    // return html`
    // <div class="card" style="max-width: 320px;">
    //     <h2>${title}</h2>
    //     <h3>${big_format == "dollars" ? "$" : ""}${formatted_big_value}${big_format == "percentage" ? "%" : ""}</h3>
    //     <p>${formatted_comparison_value}${comparison_format == "percentage" ? "%" : ""} ${comparison_text}</p>
    // </div>
    // `;
}