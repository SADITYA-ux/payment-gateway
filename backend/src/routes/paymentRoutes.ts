import { Router } from "express";
import { confirmMockPayment, createPayment, getEsewaForm, getPaymentStatus, verifyEsewaCallback } from "../controller/paymenr_controller.js";
import { requireApiKey } from "../middleware/apikey.js";

export const paymentRouter : Router = Router();

paymentRouter.post("/create", requireApiKey , createPayment);
paymentRouter.get("/:paymentId/status"  , getPaymentStatus);
paymentRouter.post("/:paymentId/confirm-mock" , confirmMockPayment);
paymentRouter.get("/:paymentId/esewa-form", getEsewaForm);
paymentRouter.get("/esewa/verify", verifyEsewaCallback);