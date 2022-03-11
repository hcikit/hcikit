import React from "react";
import ConsentForm from "./ConsentForm.js";
import { screen } from "@testing-library/react";
import { renderWithProvider } from "../test-utils.js";

describe("ConsentForm", () => {
  it("renders without crashing", () => {
    renderWithProvider(
      <ConsentForm
        content="consent form"
        questions={[{ label: "I consent", required: true }]}
      />
    );
  });

  it("doesn't advance if consent not given", () => {
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

    screen.getByText("Submit").click();
    expect(advance).toBeCalledTimes(0);
    screen.getByText("Required consent not given.");
  });

  it("advances only when all consent is given", () => {
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

    screen.getByText("* I consent").click();
    screen.getByText("Submit").click();
    expect(advance).toBeCalledTimes(0);
    screen.getByText("Required consent not given.");

    screen.getByText("* I consent again").click();
    screen.getByText("Submit").click();
    expect(advance).toBeCalledTimes(1);
  });

  it("advances when optionals left blank", () => {
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

    screen.getByText("* I consent").click();
    screen.getByText("Submit").click();
    expect(advance).toBeCalledTimes(1);
  });

  it("advances when consent given", () => {
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
    screen.getByText("* I consent").click();
    screen.getByText("Submit").click();
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
