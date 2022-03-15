import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import axios, { AxiosRequestConfig, AxiosResponse, Method } from "axios";
import prettyBytes from "pretty-bytes";
import setupEditors from "./setupEditor";

const { updateResponseEditor, requestEditor } = setupEditors();

//--------
//Request section
//--------
const queryParamsContainer = document.querySelector("[data-query-params]");
const requestHeadersContainer = document.querySelector(
  "[data-request-headers]"
);

//Get the template for the key value pair
const keyValueTemplate = document.querySelector("[data-key-value-template]");
// console.log(keyValueTemplate.cloneNode(true));

//Add a single key value pair to the container to initialize the page with one already showing
queryParamsContainer.append(createKeyValuePair());
requestHeadersContainer.append(createKeyValuePair());

//Add the event listeners to the add buttons to add a key value pair
document
  .querySelector("[data-add-query-param-btn]")
  .addEventListener("click", () => {
    queryParamsContainer.append(createKeyValuePair());
  });
document
  .querySelector("[data-add-request-header-btn]")
  .addEventListener("click", () => {
    requestHeadersContainer.append(createKeyValuePair());
  });

document.querySelector("[data-form]").addEventListener("submit", (e) => {
  e.preventDefault();
  // const test = <Method>document.querySelector<HTMLSelectElement>("[data-method]").value;
  // console.log(test);
  //Get the data from the json body
  let data;
  try {
    data = JSON.parse(requestEditor.state.doc.toString() || null);
  } catch (e) {
    alert("Json data is malformed!");
  }
  //Make the http request via axios
  axios({
    url: document.querySelector("[data-url]").value,
    method: document.querySelector("[data-method]").value,
    headers: keyValuePairsToObjects(requestHeadersContainer),
    params: keyValuePairsToObjects(queryParamsContainer),
    data,
  })
    .catch((e) => e)
    .then((response) => {
      showResponse(response);
    });
});

//Function to create an element from the key value template and return it
function createKeyValuePair() {
  //Clone all the template with the children included
  const element = keyValueTemplate.content.cloneNode(true);
  // const element = keyValueTemplate.content;
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
    return { ...data, [key]: value };
  }, {});
}

//--------
//Response section
//--------
const responseHeadersContainer = document.querySelector(
  "[data-response-headers]"
);

// type CustomAxiosRequestConfig = AxiosRequestConfig & {
//   customData?: { startTime?: number };
// };

// type CustomAxiosResponse = AxiosResponse & {
//   customData?: { time?: number };
//   config: CustomAxiosRequestConfig;
// };

axios.interceptors.request.use((request) => {
  request.customData = request.customData || {};
  request.customData.startTime = new Date().getTime();
  return request;
});

axios.interceptors.response.use(updateEndTime, (e) => {
  return Promise.reject(updateEndTime(e.response));
});

function updateEndTime(response) {
  response.customData = response.customData || {};
  response.customData.time =
    new Date().getTime() - response.config.customData.startTime;
  return response;
}

function showResponse(response) {
  document.querySelector("[data-response-section]").classList.remove("d-none");
  updateResponseDetails(response);
  updateResponseEditor(response.data);
  updateResponseHeaders(response.headers);
}

function updateResponseDetails(response) {
  document.querySelector("[data-status]").textContent =
    response.status.toString();
  document.querySelector("[data-time]").textContent =
    response.customData.time.toString();
  document.querySelector("[data-size]").textContent = prettyBytes(
    JSON.stringify(response.data).length +
      JSON.stringify(response.headers).length
  );
}

function updateResponseHeaders(headers) {
  responseHeadersContainer.innerHTML = "";
  Object.entries(headers).forEach(([key, value]) => {
    const keyElement = document.createElement("div");
    keyElement.textContent = key;
    responseHeadersContainer.append(keyElement);
    const valueElement = document.createElement("div");
    valueElement.textContent = value;
    responseHeadersContainer.append(valueElement);
  });
}
