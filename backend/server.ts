import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./src/db/index.js";
import { paymentRouter } from "./src/routes/paymentRoutes.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use("/api/payments", paymentRouter);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Payment gateway server running at ${PORT}`);
    });
});