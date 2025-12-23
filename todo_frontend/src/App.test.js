import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders to-do list title", () => {
  render(<App />);
  expect(screen.getByText(/to‑do list/i)).toBeInTheDocument();
});
