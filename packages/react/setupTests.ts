import "@testing-library/jest-dom";

console.log("heloo");

// jest.mock("styled-components", () => {
//   const actual = jest.requireActual(
//     "styled-components"
//   ) as typeof import("styled-components");
//   const styled = actual.default;

//   return Object.assign(styled, actual);
// });

// const error = console.error;

// console.error = function (message, ...args) {
//   error.apply(console, args); // keep default behaviour
//   throw message instanceof Error ? message : new Error(message);
// };
