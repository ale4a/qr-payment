const fs = require("fs").promises;
const path = require("path");
const process = require("process");
const { google } = require("googleapis");

const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");
const SPREADSHEETID = "1nhuXeQ1poJiXh9zaUbIqTRco5gd1VEdLX9-JHfWefcY";

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client: any) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
export async function authorize() {
  // let client = await loadSavedCredentialsIfExist();
  // if (client) {
  //   return client;
  // }
  // let client = await authenticate({
  //   scopes: SCOPES,
  //   keyfilePath: CREDENTIALS_PATH,
  // });
  let auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  let authClient = await auth.getClient();
  // if (client.credentials) {
  //   await saveCredentials(authClient);
  // }
  return authClient;
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1ZeyieYJnC_8IJIf_EJdP-Yx3SlgUD6KusHFHB48cAAY/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
async function listSales(auth: any) {
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEETID,
    range: "Venta!A2:J",
  });
  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.log("No data found.");
    return;
  }
  rows.forEach((row: any[]) => {
    console.log(
      `${row[0]}, ${row[1]}, ${row[2]}, ${row[3]}, ${row[4]}, ${row[5]}`
    );
  });
}

export async function getFilledRowCount(auth: any) {
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = SPREADSHEETID;
  const range = "Venta!A:J"; // Rango de la hoja donde deseas contar las filas

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const values = response.data.values;

    if (!values || values.length === 0) {
      return 0; // No hay datos en la hoja
    }

    // El número de filas llenadas es igual a la longitud del arreglo de valores
    return values.length;
  } catch (error) {
    console.error("Error al obtener datos de Google Sheets:", error);
    return -1; // Manejo de error
  }
}

export async function appendToNextColumn(auth: any, newRow: any[]) {
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = SPREADSHEETID;
  const range = "Venta!A:J"; // Rango donde deseas agregar el nuevo valor

  const values = [newRow];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    resource: { values },
  });
}
// example for to use
/*
const newRow = [
  "NuevoDato1",
  "NuevoDato2",
  "NuevoDato3",
  "NuevoDato4",
  "NuevoDato5",
  "NuevoDato6",
  "NuevoDato7",
  "NuevoDato8",
];
authorize()
  .then((auth) => appendToNextColumn(auth, newRow))
  .catch(console.error);
authorize().then(listSales).catch(console.error);
*/

// async function main () {
//     const auth = new google.auth.GoogleAuth({
//         keyFile: "credentials.json",
//         scopes: ['https://www.googleapis.com/auth/spreadsheets']
//     });
//     const authClient = await auth.getClient();
//     const spreadsheetId = SPREADSHEETID;

//     const sheets = google.sheets({ version: "v4", authClient });
//     const res = await sheets.spreadsheets.values.update({
//         auth,
//         spreadsheetId,
//         range: "compra!A2:H",
//         valueInputOption: "USER_ENTERED",
//         resource: {
//             values:[["1","t est@gmail.com", "9 "]]
//         }
//     });
//     console.log(res.data);
// }

// main().catch(console.error);
