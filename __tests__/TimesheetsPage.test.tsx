import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import TimesheetsPage from "@/app/timesheets/page";
import { useRouter } from "next/navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock Header and Footer components to avoid rendering full DOM
jest.mock("../components/Header", () => () => <div>Header</div>);
jest.mock("../components/Footer", () => () => <div>Footer</div>);

describe("TimesheetsPage", () => {
  const push = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({ push });
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders loading state initially", () => {
    render(<TimesheetsPage />);
    expect(screen.getByText(/Loading timesheets/i)).toBeInTheDocument();
  });

  it("renders timesheets table after fetch", async () => {
    const mockTimesheets = [
      {
        id: 1,
        week: 1,
        dateRange: "1-7 Jan",
        year: 2024,
        month: 0,
        startDate: "2024-01-01",
        endDate: "2024-01-07",
        tasks: [],
        totalHours: 40,
        status: "COMPLETED",
      },
      {
        id: 2,
        week: 2,
        dateRange: "8-14 Jan",
        year: 2024,
        month: 0,
        startDate: "2024-01-08",
        endDate: "2024-01-14",
        tasks: [],
        totalHours: 35,
        status: "INCOMPLETE",
      },
    ];

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ timesheets: mockTimesheets }),
      })
    ) as jest.Mock;

    render(<TimesheetsPage />);

    await waitFor(() => {
      expect(screen.getByText("1-7 Jan")).toBeInTheDocument();
      expect(screen.getByText("8-14 Jan")).toBeInTheDocument();
      expect(screen.getAllByText(/View|Update/).length).toBe(2);
    });
  });

  it("renders error message if fetch fails", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
      })
    ) as jest.Mock;

    render(<TimesheetsPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/Error: Failed to fetch timesheets/i)
      ).toBeInTheDocument();
    });
  });

  it("allows filtering by status", async () => {
    const mockTimesheets = [
      {
        id: 1,
        week: 1,
        dateRange: "1-7 Jan",
        year: 2024,
        month: 0,
        startDate: "2024-01-01",
        endDate: "2024-01-07",
        tasks: [],
        totalHours: 40,
        status: "COMPLETED",
      },
    ];

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ timesheets: mockTimesheets }),
      })
    ) as jest.Mock;

    render(<TimesheetsPage />);

    // Wait for initial render
    await waitFor(() => screen.getByText("1-7 Jan"));

    const statusSelect = screen.getByRole("combobox", { name: /Status/i });
    fireEvent.change(statusSelect, { target: { value: "COMPLETED" } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("status=COMPLETED")
      );
    });
  });

  it("calls router.push when clicking 'View' button for COMPLETED timesheet", async () => {
    const mockTimesheets = [
      {
        id: 1,
        week: 1,
        dateRange: "1-7 Jan",
        year: 2024,
        month: 0,
        startDate: "2024-01-01",
        endDate: "2024-01-07",
        tasks: [],
        totalHours: 40,
        status: "COMPLETED",
      },
    ];

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ timesheets: mockTimesheets }),
      })
    ) as jest.Mock;

    render(<TimesheetsPage />);

    await waitFor(() => screen.getByText("View"));
    fireEvent.click(screen.getByText("View"));

    expect(push).toHaveBeenCalledWith("/timesheets/1");
  });

  it("displays 'No timesheets found' if empty array", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ timesheets: [] }),
      })
    ) as jest.Mock;

    render(<TimesheetsPage />);

    await waitFor(() => {
      expect(screen.getByText(/No timesheets found/i)).toBeInTheDocument();
    });
  });
});
