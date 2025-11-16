import { render, screen, fireEvent } from "@testing-library/react";
import ListTile from "@/components/ListTile";

describe("ListTile component", () => {

  const baseProps = {
    name: "My List",
    isEditing: false,
    editingValue: "",
    onEditStart: jest.fn(),
    onEditCancel: jest.fn(),
    onEditChange: jest.fn(),
    onEditSave: jest.fn(),
    onDelete: jest.fn(),
    onOpen: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it("renders list name", () => {
    render(<ListTile {...baseProps} />);
    expect(screen.getByText("My List")).toBeInTheDocument();
  });

  it("calls onEditStart when edit button is clicked", () => {
    render(<ListTile {...baseProps} />);
    fireEvent.click(screen.getByLabelText("edit"));
    expect(baseProps.onEditStart).toHaveBeenCalled();
  });

  it("calls onDelete when delete is clicked", () => {
    render(<ListTile {...baseProps} />);
    fireEvent.click(screen.getByLabelText("delete"));
    expect(baseProps.onDelete).toHaveBeenCalled();
  });

  it("calls onOpen when chevron is clicked", () => {
    render(<ListTile {...baseProps} />);
    fireEvent.click(screen.getByLabelText("go-to-list"));
    expect(baseProps.onOpen).toHaveBeenCalled();
  });

  it("shows TextField when isEditing = true", () => {
    render(<ListTile {...baseProps} isEditing editingValue="abc" />);
    expect(screen.getByDisplayValue("abc")).toBeInTheDocument();
  });

  it("calls onEditChange when typing in TextField", () => {
    render(<ListTile {...baseProps} isEditing editingValue="abc" />);
    const input = screen.getByDisplayValue("abc");
    fireEvent.change(input, { target: { value: "hola" } });
    expect(baseProps.onEditChange).toHaveBeenCalledWith("hola");
  });

  it("calls onEditSave when save icon is clicked", () => {
    render(<ListTile {...baseProps} isEditing editingValue="abc" />);
    fireEvent.click(screen.getByLabelText("save"));
    expect(baseProps.onEditSave).toHaveBeenCalled();
  });

  it("saves with Enter key", () => {
    render(<ListTile {...baseProps} isEditing editingValue="abc" />);
    const input = screen.getByDisplayValue("abc");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(baseProps.onEditSave).toHaveBeenCalled();
  });

  it("cancels edit with Escape key", () => {
    render(<ListTile {...baseProps} isEditing editingValue="abc" />);
    const input = screen.getByDisplayValue("abc");
    fireEvent.keyDown(input, { key: "Escape" });
    expect(baseProps.onEditCancel).toHaveBeenCalled();
  });

  it("calls onToggle when checkbox is clicked", () => {
    const props = { ...baseProps, showCheckbox: true, checked: false, onToggle: jest.fn() };
    render(<ListTile {...props} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(props.onToggle).toHaveBeenCalled();
  });

  it("shows pending hourglass icon when pending=true", () => {
    render(<ListTile {...baseProps} pending />);
    expect(screen.getByTestId("HourglassEmptyIcon")).toBeInTheDocument();
  });

  it("hides chevron when hideChevron=true", () => {
    render(<ListTile {...baseProps} hideChevron />);
    expect(screen.queryByLabelText("go-to-list")).not.toBeInTheDocument();
  });

  it("hides edit button when hideEditButton=true", () => {
    render(<ListTile {...baseProps} hideEditButton />);
    expect(screen.queryByLabelText("edit")).not.toBeInTheDocument();
  });
});
