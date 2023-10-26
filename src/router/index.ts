import express from "express";

import authentication from "./authentication";
import users from "./users";
import payment from "./payment";

const router = express.Router();

export default (): express.Router => {
  payment(router);
  authentication(router);
  users(router);

  return router;
};
