import express from "express";

import { getQR, statusQR } from "controllers/payment";

export default (router: express.Router) => {
  router.get("/payment/bnb/:qrId", statusQR);
  router.post("/payment/bnb/qr", getQR);
};
