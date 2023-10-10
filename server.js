require('dotenv').config()
const express = require('express')
const path = require('path')
const app = express()
const {google} = require('googleapis');
const credentials = require('./credentials')

const PORT = process.env.PORT || 4000
const SPREADSHEET_ID = process.env.SPREADSHEET_ID

app.use(express.static(path.join(__dirname, 'build')))
app.use(express.json())

let client
let googleSheet

const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: "https://www.googleapis.com/auth/spreadsheets"
})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

app.post('/form', async (req, res) => {
    try {
        console.log(req.body)
        const {team, members} = req.body

        await googleSheet.spreadsheets.values.append({
            auth,
            spreadsheetId: SPREADSHEET_ID,
            range: "Data!A:A",
            valueInputOption: "USER_ENTERED",
            resource: {
                values: [[team]],
            }
        })

        for (let member of members) {
            const {fio, program, email, tg} = member
            await googleSheet.spreadsheets.values.append({
                auth,
                spreadsheetId: SPREADSHEET_ID,
                range: "Data!A:D",
                valueInputOption: "USER_ENTERED",
                resource: {
                    values: [[fio, program, email, tg]],
                }
            })  
        }

        res.sendStatus(200)
    } catch (e) {
        console.log(e)
        res.sendStatus(500)
    }
})

async function initialize() {
    client = await auth.getClient()
    googleSheet = google.sheets({version: 'v4', auth: client})
}

async function start() {
    try {
        await initialize()
        app.listen(PORT, () => console.log('App is working...'))
    } catch (e) {
        console.log(e)
        process.exit(1)
    }
}

start()