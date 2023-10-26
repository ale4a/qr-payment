import express from "express";

import { getQR, statusQR, getToken } from "../controllers/payment";

export default (router: express.Router) => {
  router.post("/payment/bnb/token", getToken);
  router.post("/payment/bnb/qr", getQR);
  router.get("/payment/bnb/:qrId", statusQR);
};
