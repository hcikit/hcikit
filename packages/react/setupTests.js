import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";

configure({ adapter: new Adapter() });

let error = console.error;

console.error = function (message) {
  error.apply(console, arguments); // keep default behaviour
  throw message instanceof Error ? message : new Error(message);
};
