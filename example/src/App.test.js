import React from "react";
import App from "./App";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

it("renders without crashing", async () => {
  // We need this because otherwise FocusChecker will be on.
  jest.spyOn(document, "hasFocus").mockImplementation(() => true);

  render(<App />);
  await userEvent.click(screen.getByText(/continue/i));
  await userEvent.click(screen.getByText(/continue/i));
  await userEvent.click(screen.getByRole("checkbox"));
  await userEvent.click(screen.getByText(/submit/i));
  await userEvent.click(screen.getByText(/continue/i));

  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(
    screen.getByText(/continue/i, { selector: "button > span" })
  );

  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(
    screen.getByText(/continue/i, { selector: "button > span" })
  );

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
  await userEvent.click(
    screen.getByText(/continue/i, { selector: "button > span" })
  );

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
  await userEvent.click(
    screen.getByText(/continue/i, { selector: "button > span" })
  );

  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(
    screen.getByText(/continue/i, { selector: "button > span" })
  );

  await userEvent.click(screen.getByText(/\+/i));
  await userEvent.click(
    screen.getByText(/continue/i, { selector: "button > span" })
  );

  screen.getByText(/You've completed the experiment/i);
});
