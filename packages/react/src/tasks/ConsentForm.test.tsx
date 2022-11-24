import React from "react";
import ConsentForm from "./ConsentForm.js";
import { screen } from "@testing-library/react";
import { renderWithProvider } from "../test-utils.js";
import { jest } from "@jest/globals";
import userEvent from "@testing-library/user-event";

describe("ConsentForm", () => {
  it("renders without crashing", () => {
    renderWithProvider(
      <ConsentForm
        content="consent form"
        questions={[{ label: "I consent", required: true }]}
      />
    );
  });

  it("doesn't advance if consent not given", async () => {
    const advance = jest.fn();

    renderWithProvider(
      <ConsentForm
        content="consent form"
        questions={[{ label: "I consent", required: true }]}
      />,
      {
        advance,
      }
    );

    await userEvent.click(screen.getByText("Submit"));
    expect(advance).toBeCalledTimes(0);
    screen.getByText("Required consent not given.");
  });

  it("advances only when all consent is given", async () => {
    const advance = jest.fn();

    renderWithProvider(
      <ConsentForm
        content="consent form"
        questions={[
          { label: "I consent", required: true },
          { label: "I consent again", required: true },
        ]}
      />,
      {
        advance,
      }
    );

    await userEvent.click(screen.getByText("* I consent"));
    await userEvent.click(screen.getByText("Submit"));
    expect(advance).toBeCalledTimes(0);
    screen.getByText("Required consent not given.");

    await userEvent.click(screen.getByText("* I consent again"));
    await userEvent.click(screen.getByText("Submit"));
    expect(advance).toBeCalledTimes(1);
  });

  it("advances when optionals left blank", async () => {
    const advance = jest.fn();

    renderWithProvider(
      <ConsentForm
        content="consent form"
        questions={[
          { label: "I consent", required: true },
          { label: "I consent again", required: false },
        ]}
      />,
      {
        advance,
      }
    );

    await userEvent.click(screen.getByText("* I consent"));
    await userEvent.click(screen.getByText("Submit"));
    expect(advance).toBeCalledTimes(1);
  });

  it("advances when consent given", async () => {
    const advance = jest.fn();

    renderWithProvider(
      <ConsentForm
        content="consent form"
        questions={[{ label: "I consent", required: true }]}
      />,
      {
        advance,
      }
    );
    await userEvent.click(screen.getByText("* I consent"));
    await userEvent.click(screen.getByText("Submit"));
    expect(advance).toBeCalledTimes(1);
  });

  it("renders properly", () => {
    expect(
      renderWithProvider(
        <ConsentForm
          content={`
  # Title
  this is **bold**.
   - and
   - a
   - list
      `}
          questions={[
            { label: "I consent", required: true },
            { label: "I consent optional", required: false },
          ]}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });
});
