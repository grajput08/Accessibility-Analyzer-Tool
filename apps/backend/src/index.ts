import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import accessibilityRoutes from "./routes/accessibility";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test API endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Accessibility Analyzer Backend API is running!",
    timestamp: new Date().toISOString(),
    status: "success",
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Accessibility routes
app.use("/api/accessibility", accessibilityRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`🔍 Accessibility API available at http://localhost:${PORT}/api/accessibility`);
});
