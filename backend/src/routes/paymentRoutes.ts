import { Router } from "express";
import { confirmMockPayment, createPayment, getPaymentStatus } from "../controller/paymenr_controller.js";

export const paymentRouter : Router = Router();

paymentRouter.post("/create" , createPayment);
paymentRouter.get("/:paymentId/getStatus" , getPaymentStatus);
paymentRouter.post("/:paymentId/conformMock" , confirmMockPayment);