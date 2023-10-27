import express from "express";
import { IDataQR, IStatusQR } from "types/payment";
import {
  authorize,
  appendToNextColumn,
  getFilledRowCount,
} from "../googleSheet";
import { base64ToPng } from "../helpers";

export const getQR = async (req: express.Request, res: express.Response) => {
  try {
    const { gloss, amount, additionalData } = req.body;
    /*
        gloss: payment description
        amount: amount of payment
        addtionalData: data for identifier the qr {name, ci}
    */
    console.log(gloss);
    console.log(amount);
    console.log(additionalData);
    if (!gloss || !amount || !additionalData) {
      return res.sendStatus(400).end();
    }

    const dataBody = {
      currency: "BOB",
      gloss,
      amount,
      singleUse: true,
      expirationDate: "2023-10-27",
      additionalData,
      destinationAccountId: "1",
    };

    const token = req.cookies["BNB-TOKEN"];
    console.log(token);
    const url =
      "http://test.bnb.com.bo/QRSimple.API/api/v1/main/getQRWithImageAsync";

    const response = await fetch(url, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dataBody),
    });

    const dataQR: IDataQR = await response.json();
    const { id, qr, success, message } = dataQR;
    // const outputPath = `qr/${id}.png`;
    // await base64ToPng(qr, outputPath);
    console.log("-------------");
    console.log(dataQR);
    if (success) {
      const responseQR = {
        success: true,
        data: {
          qr,
          qrId: id,
        },
        message,
      };
      return res.status(200).json(responseQR).end();
    } else {
      return res
        .status(400)
        .json({
          success: false,
          data: {},
          message,
        })
        .end();
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ success: false, data: {} }).end();
  }
};

export const statusQR = async (req: express.Request, res: express.Response) => {
  try {
    const { qrId } = req.params;
    const { idProduct, phone, quantity, amount } = req.body;
    /*
        gloss: payment description
        amount: amount of payment
        addtionalData: data for identifier the qr {name, ci}
    */
    if (!idProduct || !phone || !quantity || !amount || !qrId) {
      return res.sendStatus(400).end();
    }

    const dataBody = {
      qrId: Number(qrId),
    };

    const token = req.cookies["BNB-TOKEN"];
    const url =
      "http://test.bnb.com.bo/QRSimple.API/api/v1/main/getQRStatusAsync";

    const response = await fetch(url, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dataBody),
    });

    console.log(token);

    const dataQR: IStatusQR = await response.json();
    const { statusId, success, message, expirationDate } = dataQR;
    console.log("-@@@@@@@@@@@@@@@");
    console.log(expirationDate);
    // 1=No Usado
    // 2= Usado
    // 3=Expirado
    // 4=Con error
    console.log(success);
    if (success) {
      if (statusId === 1) {
        const countRows = await authorize().then((auth) =>
          getFilledRowCount(auth)
        );
        const currentDate = new Date();
        const day = String(currentDate.getDate()).padStart(2, "0");
        const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Note: In JavaScript, months are 0-indexed, so we add 1 to get the current month.
        const year = currentDate.getFullYear();
        const formattedDate = `${month}/${day}/${year}`;
        const newRow = [
          `${countRows + 1}`,
          phone,
          formattedDate,
          "Santa Cruz de la Sierra",
          qrId,
          idProduct,
          "hombre",
          amount,
          quantity,
          "Pendiente",
        ];
        authorize()
          .then((auth) => appendToNextColumn(auth, newRow))
          .catch(console.error);
      }
      const responseQR = {
        success: true,
        data: {
          statusId,
          expirationDate,
        },
        message,
      };
      return res.status(200).json(responseQR).end();
    } else {
      return res
        .status(400)
        .json({
          success: false,
          data: {},
          message,
        })
        .end();
    }
  } catch (error) {
    console.log(error);
  }
};

export const getToken = async (req: express.Request, res: express.Response) => {
  try {
    const accountId = process.env.ACCOUNTID;
    const authorizationId = process.env.AUTHORIZATIONID;

    const dataBody = {
      accountId,
      authorizationId,
    };

    const url =
      "http://test.bnb.com.bo/ClientAuthentication.API/api/v1/auth/token";

    const response = await fetch(url, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataBody),
    });

    const { message } = await response.json();
    res.cookie("BNB-TOKEN", message, {
      maxAge: 900000,
      httpOnly: true,
    });

    return res.status(200).end();
  } catch (error) {
    console.log(error);
    return undefined;
  }
};
