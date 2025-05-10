import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0", // This ensures the server is bound to the correct interface
    port: 5173, // Ensure the correct port is being used
    strictPort: true, // This will make Vite fail if the port is already taken
    allowedHosts: [
      "expense-tracker-1-wamc.onrender.com", // Add the host from the error message
      "localhost", // For local development
    ],
  },
  plugins: [react(), tailwindcss()],
});
