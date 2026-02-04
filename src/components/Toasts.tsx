import { Toaster } from "react-hot-toast";

export default function Toasts() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "rgba(24, 28, 36, 0.9)",
          color: "#EAEFF6",
          border: "1px solid rgba(148, 163, 184, 0.25)"
        }
      }}
    />
  );
}
