import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

//--------
//Request section
//--------
//Target the tabs to insert the data of the request
const queryParamsContainer = document.querySelector("[data-query-params]");
const requestHeadersContainer = document.querySelector("[data-request-headers]");

//Get the template for the key value pair
const keyValueTemplate = document.querySelector("[data-key-value-template]");

//Add a single key value pair to the container to initialize the page with one already showing
queryParamsContainer.append(createKeyValuePair());
requestHeadersContainer.append(createKeyValuePair());

//Add the event listeners to the add buttons to add a key value pair
document.querySelector("[data-add-query-param-btn]").addEventListener("click", () => {
  queryParamsContainer.append(createKeyValuePair());
});
document.querySelector("[data-add-request-header-btn]").addEventListener("click", () => {
  requestHeadersContainer.append(createKeyValuePair());
});

//Add an event listener to the form to run when submitting
document.querySelector("[data-form]").addEventListener("submit", (e) => {
  e.preventDefault();
  //Make the http request via axios
  axios({
    url: document.querySelector("[data-url]").value,
    method: document.querySelector("[data-method]").value,
    headers: keyValuePairsToObjects(requestHeadersContainer),
    params: keyValuePairsToObjects(queryParamsContainer),
  }).then((response) => {
    console.log(response);
  });
});

//Function to create an element from the key value template and return it
function createKeyValuePair() {
  //Clone all the template with the children included
  const element = keyValueTemplate.content.cloneNode(true);
  //Add an event listener to the remove button
  element.querySelector("[data-remove-btn]").addEventListener("click", (e) => {
    e.target.closest("[data-key-value-pair]").remove();
  });
  return element;
}

//Function to return the params and headers as objects
function keyValuePairsToObjects(container) {
  const pairs = container.querySelectorAll("[data-key-value-pair]");
  //Convert all in a array
  return [...pairs].reduce((data, pair) => {
    //Get the data of each pair
    const key = pair.querySelector("[data-key]").value;
    const value = pair.querySelector("[data-value]").value;
    //If there is nothing typed on it, keep the data as it as
    if (key === "") return data;
    //If there is something typed, add to the array a new object with the key and value
    console.log({ ...data, [key]: value });
    return { ...data, [key]: value };
  }, {});
}

//--------
//Response section
//--------
