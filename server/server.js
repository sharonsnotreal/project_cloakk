const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const connectDB = require("./db/config");
const rateLimit = require("express-rate-limit");
const path = require("path");
const mongoSanitize = require("@exortek/express-mongo-sanitize");
dotenv.config();
connectDB();

const app = express();
// General rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// Login-specific rate limiter
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // allow 5 login attempts per IP in this window
  handler: (req, res) => {
    res.status(429).json({
      status: "error",
      message: "Too many login attempts from this IP. Please try again after 15 minutes."
    });
  },
});

app.use(limiter);
// app.use(helmet());
app.use(
  helmet({
    xFrameOptions: { action: "deny" },
    contentSecurityPolicy: {
      directives: {
        "frame-ancestors": ["'none'"],
      },
    },
  })
);
const allowedOrigins = [
  'https://project-cloakk-1.onrender.com', 
  'https://your-frontend-app.com',         
  'http://localhost:3000']
  const corsOptions = {
  origin: function (origin, callback) {

    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// using mongo-sanitize middlware to prevent NoSQL Injection
app.use(mongoSanitize());
// API Routes
app.get("/health", (req, res) => res.status(200).send("OK"));
// Serve uploaded files
app.use("/api/submissions", require("./routes/submissionRoutes"));
app.use("/uploads", express.static(path.join(__dirname, "uploads").replace(/\\/g, "/")));
app.use("/api/admin", require("./routes/adminRoutes"));



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));