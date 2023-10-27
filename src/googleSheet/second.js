const fs = require("fs").promises;
const path = require("path");
const process = require("process");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

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
async function saveCredentials(client) {
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
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1ZeyieYJnC_8IJIf_EJdP-Yx3SlgUD6KusHFHB48cAAY/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
async function listMajors(auth) {
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: "1ZeyieYJnC_8IJIf_EJdP-Yx3SlgUD6KusHFHB48cAAY",
    range: "compra!A2:H",
  });
  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.log("No data found.");
    return;
  }
  rows.forEach((row) => {
    console.log(`${row[0]}, ${row[1]}, ${row[2]}, ${row[3]}, ${row[4]}`);
  });
}

async function writeToSheet(auth) {
  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = "1ZeyieYJnC_8IJIf_EJdP-Yx3SlgUD6KusHFHB48cAAY";
  const range = "compra!A2:H";
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  const rows = res.data.values;
  const lastNonEmptyRow = rows.length;
  
  const newRow = ["NuevoDato1", "NuevoDato2", "NuevoDato3", "NuevoDato4", "NuevoDato5"];
  await sheets.spreadsheets.values.append({
    spreadsheetId: "1ZeyieYJnC_8IJIf_EJdP-Yx3SlgUD6KusHFHB48cAAY",
    range: `compra!A${lastNonEmptyRow + 2}:H${lastNonEmptyRow + 2}`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    resource: {
      values: [newRow],
    },
  });
  // // Escribe los nuevos valores en la hoja de cálculo
  // const updateRes = await sheets.spreadsheets.values.update({
  //   spreadsheetId,
  //   range,
  //   valueInputOption: "RAW", // Puedes cambiar esto a "USER_ENTERED" si es necesario
  //   resource: {
  //     values: newValues,
  //   },
  // });

  console.log(`Se han escrito los nuevos valores en la hoja de cálculo.`);
}

async function appendToNextColumn(auth) {
  const newRow = ["NuevoDato1", "NuevoDato2", "NuevoDato3", "NuevoDato4", "NuevoDato5"];
  const sheets = google.sheets({ version: "v4", auth });

  // Determina la próxima columna disponible (suponiendo que no hay datos en la primera columna)
  const nextColumn = String.fromCharCode(65); // A, B, C, ...
  console.log(nextColumn)
  // Construye el rango para escribir los nuevos datos
  const range = `compra!${nextColumn}:${nextColumn}`;

  // Construye los valores a escribir (debe ser una matriz bidimensional)
  const values = newRow.map(item => [item]);

  // Escribe los nuevos datos en la hoja de cálculo utilizando append
  await sheets.spreadsheets.values.append({
    spreadsheetId: "1ZeyieYJnC_8IJIf_EJdP-Yx3SlgUD6KusHFHB48cAAY",
    range,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS", // Opción para insertar nuevas filas
    resource: { values },
  });

  console.log(`Datos agregados en la columna ${nextColumn}.`);
}


authorize().then(appendToNextColumn).catch(console.error);
authorize().then(listMajors).catch(console.error);

