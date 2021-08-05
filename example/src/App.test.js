import React from "react";
import App from "./App";
import { render, screen } from "@testing-library/react";

it("renders without crashing", () => {
  // We need this because otherwise FocusChecker will be on.
  jest.spyOn(document, "hasFocus").mockImplementation(() => true);

  render(<App />);
  screen.getByText(/continue/i).click();
  screen.getByText(/continue/i).click();
  screen.getByRole("checkbox").click();
  screen.getByText(/submit/i).click();
  screen.getByText(/continue/i).click();

  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/continue/i, { selector: "button > span" }).click();

  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/continue/i, { selector: "button > span" }).click();

  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/continue/i, { selector: "button > span" }).click();

  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/continue/i, { selector: "button > span" }).click();

  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/\+/i).click();
  screen.getByText(/continue/i, { selector: "button > span" }).click();

  screen.getByText(/\+/i).click();
  screen.getByText(/continue/i, { selector: "button > span" }).click();

  screen.getByText(/You've completed the experiment/i);
});
