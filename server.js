const express = require('express')
const fs = require('fs')
const path = require('path')
const {uuid} = require('uuidv4')

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

app.use(express.static('public'))

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './public/notes.html'))
})

app.get('/api/notes', (req, res) => {
    var notes = JSON.parse(fs.readFileSync('./db/db.json', 'utf8'))
    res.json(notes)
})

app.post('/api/notes', (req, res) => {
    var notes = JSON.parse(fs.readFileSync('./db/db.json', 'utf8'))
    var newNote = req.body;

    newNote.id = uuid()

    var noteArray  = [...notes, newNote]
    
    fs.writeFileSync('./db/db.json', JSON.stringify(noteArray))

    res.json(noteArray)
})

app.delete('/api/notes/:id', (req, res) => {
    var tbDelete = req.params.id

    var notes = JSON.parse(fs.readFileSync('./db/db.json', 'utf8'))
    
    var filteredNotes = notes.filter(note => {
        note != tbDelete
    })

    fs.writeFileSync('./db/db.json', JSON.stringify(filteredNotes))

    res.json(filteredNotes)
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'))
})

app.listen(PORT, () => {
    console.log(`listening on PORT: ${PORT}`)
})