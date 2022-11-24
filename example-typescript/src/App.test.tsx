import React from "react";
import App from "./App";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { jest } from "@jest/globals";

it("renders without crashing", async () => {
  // We need this because otherwise FocusChecker will be on.
  jest.spyOn(document, "hasFocus").mockImplementation(() => true);

  render(<App />);
  fireEvent(window, new Event("focus"));
  await userEvent.click(screen.getByText(/continue/i));
  await userEvent.click(screen.getByText(/continue/i));
  await userEvent.click(screen.getByRole("checkbox"));
  await userEvent.click(screen.getByText(/submit/i));
  await userEvent.click(screen.getByText(/continue/i));

  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/continue/i, { selector: "button" }));

  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/continue/i, { selector: "button" }));

  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/continue/i, { selector: "button" }));

  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/continue/i, { selector: "button" }));

  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/continue/i, { selector: "button" }));

  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/continue/i, { selector: "button" }));

  screen.getByText(/You've completed the experiment/i);
});
