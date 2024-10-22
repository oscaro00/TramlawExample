import * as Inputs from "npm:@observablehq/inputs";
import {html} from "npm:htl";

export function dropdownInput(config = {}) {
    //set up configuration
    let {
      inputId, 
      inputLabel,
      placeholderText,
      options, 
      selected,
      is_multi
    } = config;
  
  
    const width = '250px'
  
    const maxHeight = '250px'
  
    //dropdown  button
    const dropdownButton = Inputs.button(html`<div class='button-inner' style='display:flex;justify-content:space-between;height:100%;' id='dropdown-${inputId}'><div class='filter-selected' style='text-align:left;'>${placeholderText}</div><span style='font-size:10px;padding-left:5px;display:flex;align-items:center;'><i class="fas fa-chevron-down"></i></span></div>`);
    dropdownButton.classList.add("dropdown-button");
  
    const  optionValues = options.map(option => option.value)
  
    //selectInput
    const selectInput = Inputs.select(optionValues, {multiple:is_multi, value:selected});
    selectInput.classList.add("dropdown-select");
    selectInput.style.display="none";
  
    //select and deselect buttons
    const selectDeselectButtons = Inputs.button([["Select All", value=> "Select All"],["Deselect All", value => "Deselect All"]]);
    selectDeselectButtons.classList.add("dropdown-action-buttons")
    
    let selectInputValue = selected.slice(); // Create a copy of selected for selectInputValue
  
    let optionListItems = options.map(option => {
      const isSelected = selectInputValue.includes(option.value);
      const listItem = html`<li id='${option.value}'><a style='cursor:pointer;'><span class='text'>${option.label}</span><span class='checkmark'><i class="fas fa-check"></i></span></a></li>`;
  
      
      // Event listener for the list item
      listItem.addEventListener('click', (event) => {
        event.preventDefault();
        
        const clickedListItem = event.currentTarget;
        const clickedItemId = clickedListItem.id;
        const index = selectInputValue.indexOf(clickedItemId);
  
        if (clickedListItem.classList.contains('selected')) {
          clickedListItem.classList.remove('selected');
          
          if (index !== -1) {
            selectInputValue.splice(index, 1);
          }
        } else {
  
          clickedListItem.classList.add('selected');
          selectInputValue.push(option.value);
        }
  
        // Update selectInput value
        selectInput.value = selectInputValue;
        
        // Update form value with selectInputValue
        form.value = selectInputValue;
        form.dispatchEvent(new CustomEvent("input", { bubbles: true }));
      });
  
      return listItem;
    });
  
    const optionList = html`<ul class='dropdown-list'>${optionListItems}</ul>`
    

    const innerDropdown = is_multi ? 
        html`<div class='dropdown-action-buttons-container'>${selectDeselectButtons}</div>${selectInput} <div class='dropdown-list-container' style='max-height:${maxHeight};overflow-y:scroll;'>${optionList}</div>` :
        html`${selectInput} <div class='dropdown-list-container' style='max-height:${maxHeight};overflow-y:scroll;'>${optionList}</div>`    
    
    innerDropdown.classList.add("dropdown-inner")
    innerDropdown.style.display = "none";
    innerDropdown.style.width = width;
  
     // Function to toggle dropdown visibility
    const toggleDropdown = () => {
      innerDropdown.style.display = innerDropdown.style.display === "none" ? "block" : "none";
    };
  
    // Toggle the visibility of the select input on button click
    dropdownButton.onclick = (event) => {
      toggleDropdown();
    };
  
      optionListItems.forEach((t, index) => {
    const option = options[index].value;
    if (selectInputValue.includes(option)) {
      t.classList.add('selected');
    }
  });
    
  selectDeselectButtons.onclick = () => {
    const buttonText = selectDeselectButtons.value;
    if (buttonText === "Select All") {
      selectInput.value = options.map(option => option.value);
      selectInputValue = options.map(option => option.value);
      form.value = selectInputValue;
  
      optionListItems.forEach(t => {
          t.classList.add('selected');
      });
    } else if (buttonText === "Deselect All") {
      selectInput.value = [];
      selectInputValue = [];
      form.value = [];
  
      optionListItems.forEach(t => {
          t.classList.remove('selected');
      });
    }
  
    form.dispatchEvent(new CustomEvent("input", { bubbles: true }));
  };
  
  //modified from inputs formula by https://observablehq.com/@jashkenas/inputs
  selectInput.onchange = e => {
    e && e.preventDefault();
    const value = selectInput.value; 
    if (form.output) {
      const out = value;
      if (out instanceof window.Element) {
        while (form.output.hasChildNodes()) {
          form.output.removeChild(form.output.lastChild);
        }
        form.output.append(out);
      } else {
        form.output.value = out;
      }
    }
    // Update form.value with the selectInput value
    form.value = value;
    form.dispatchEvent(new CustomEvent("input", { bubbles: true }));
  };
    
    const form = html`<label style='font-weight:bold;font-size:14px;'>${inputLabel}</label><form style='width:250px' id=${inputId}>${dropdownButton} ${innerDropdown}</form>`
  
    form.classList.add("dropdown-form");
  
    form.value = selected;
  
  
  
  const updatePlaceholderText = () => {
    const selectedValues = form.value;
    if (selectedValues.length > 0) {
      const filteredLabels = options
        .filter(option => selectedValues.includes(option.value))
        .map(filteredOption => {
          // Check if the label is an HTML element
          if (typeof filteredOption.label === 'object' && filteredOption.label instanceof HTMLElement) {
            return filteredOption.label.outerHTML;
          } else {
            return filteredOption.label; // Assuming label is a string if not HTML
          }
        });
        
      const concatenatedText = filteredLabels.join(', ');
      dropdownButton.querySelector('.filter-selected').innerHTML = `${concatenatedText}`;
    } else {
      dropdownButton.querySelector('.filter-selected').innerHTML = placeholderText;
    }
  };
  
    // ... (existing code)
  
    // Listen for changes in form.value
    form.addEventListener('input', updatePlaceholderText);
  
  
    // Initial update of placeholder text
    updatePlaceholderText();
    
    return form;
  }