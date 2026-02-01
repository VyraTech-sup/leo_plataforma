import "@testing-library/jest-dom"

// Mock global ResizeObserver for recharts compatibility in tests
if (typeof window !== "undefined" && !window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}
