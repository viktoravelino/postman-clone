import "./_snowpack/pkg/bootstrap.js";
import "./_snowpack/pkg/bootstrap/dist/css/bootstrap.min.css.proxy.js";
import axios from "./_snowpack/pkg/axios.js";
import prettyBytes from "./_snowpack/pkg/pretty-bytes.js";
import setupEditors from "./setupEditor.js";
const {updateResponseEditor, requestEditor} = setupEditors();
const queryParamsContainer = document.querySelector("[data-query-params]");
const requestHeadersContainer = document.querySelector("[data-request-headers]");
const keyValueTemplate = document.querySelector("[data-key-value-template]");
queryParamsContainer.append(createKeyValuePair());
requestHeadersContainer.append(createKeyValuePair());
document.querySelector("[data-add-query-param-btn]").addEventListener("click", () => {
  queryParamsContainer.append(createKeyValuePair());
});
document.querySelector("[data-add-request-header-btn]").addEventListener("click", () => {
  requestHeadersContainer.append(createKeyValuePair());
});
document.querySelector("[data-form]").addEventListener("submit", (e) => {
  e.preventDefault();
  let data;
  try {
    data = JSON.parse(requestEditor.state.doc.toString() || null);
  } catch (e2) {
    alert("Json data is malformed!");
  }
  axios({
    url: document.querySelector("[data-url]").value,
    method: document.querySelector("[data-method]").value,
    headers: keyValuePairsToObjects(requestHeadersContainer),
    params: keyValuePairsToObjects(queryParamsContainer),
    data
  }).catch((e2) => e2).then((response) => {
    showResponse(response);
  });
});
function createKeyValuePair() {
  const element = keyValueTemplate.content.cloneNode(true);
  element.querySelector("[data-remove-btn]").addEventListener("click", (e) => {
    e.target.closest("[data-key-value-pair]").remove();
  });
  return element;
}
function keyValuePairsToObjects(container) {
  const pairs = container.querySelectorAll("[data-key-value-pair]");
  return [...pairs].reduce((data, pair) => {
    const key = pair.querySelector("[data-key]").value;
    const value = pair.querySelector("[data-value]").value;
    if (key === "")
      return data;
    return {...data, [key]: value};
  }, {});
}
const responseHeadersContainer = document.querySelector("[data-response-headers]");
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
  response.customData.time = new Date().getTime() - response.config.customData.startTime;
  return response;
}
function showResponse(response) {
  document.querySelector("[data-response-section]").classList.remove("d-none");
  updateResponseDetails(response);
  updateResponseEditor(response.data);
  updateResponseHeaders(response.headers);
}
function updateResponseDetails(response) {
  document.querySelector("[data-status]").textContent = response.status.toString();
  document.querySelector("[data-time]").textContent = response.customData.time.toString();
  document.querySelector("[data-size]").textContent = prettyBytes(JSON.stringify(response.data).length + JSON.stringify(response.headers).length);
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
