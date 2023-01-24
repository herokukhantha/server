import express from "express";
import dotenv from "dotenv";
import connectDatabase from "./config/MongoDb.js"
import ImportData from "./Dataimport.js";
import productRouter from "./Routes/ProductRoutes.js"
import { errorHandler, notFound} from "./Middleware/Errors.js"
import userRouter from "./Routes/UserRoutes.js";
import orderRouter from "./Routes/orderRouters.js";



dotenv.config();
connectDatabase();
const app = express();
app.use(express.json());

// API
app.use("/api/import", ImportData);
app.use("/api/products", productRouter);
app.use("/api/users", userRouter);
app.use("/api/orders", orderRouter);

//ERROR HANDLER
app.use(notFound);
app.use(errorHandler);


const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`server run in port ${PORT}`));