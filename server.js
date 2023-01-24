const express = require('express')
const fs = require('fs')
const path = require('path')
const Profanity = require('profanity-js')
const {uuid} = require('uuidv4')

const app = express()
const PORT = process.env.PORT || 3001


app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

app.use(express.static('public'))

//directs start screen to the notes page
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './public/notes.html'))
})

//pulls the notes from the db.json file
app.get('/api/notes', (req, res) => {
    var notes = JSON.parse(fs.readFileSync('./db/db.json', 'utf8'))
    res.json(notes)
})

//posts new notes from the save icon
app.post('/api/notes', (req, res) => {
    var notes = JSON.parse(fs.readFileSync('./db/db.json', 'utf8'))
    
    //combines body to var and censors bad words
    let config = {
        language: "en-us"
    };

    var rawNote = JSON.stringify(req.body);

    let profanity = new Profanity(rawNote, config)

    var newNote = JSON.parse(profanity.censor(rawNote))

    //gives note a unique id via module
    newNote.id = uuid()

    //adds to the array
    var noteArray  = [...notes, newNote]
    
    //writes new array to db file
    fs.writeFileSync('./db/db.json', JSON.stringify(noteArray))

    //pulls the new array to the user interface
    res.json(noteArray)
})

//deletes note on trash icon click
app.delete('/api/notes/:id', (req, res) => {
    //stores id of attached note
    var tbDelete = req.params.id

    //parses for editing
    var notes = JSON.parse(fs.readFileSync('./db/db.json', 'utf8'))
    
    //edits array to filter for all id's that do not match tbDelete
    var filteredNotes = notes.filter(note => {
        console.log(note.id, tbDelete)
        return note.id != tbDelete
    })

    //edits db.json file
    fs.writeFileSync('./db/db.json', JSON.stringify(filteredNotes))

    //pulls new array to the user interface
    res.json(filteredNotes)
})

//if no location specified, take user to start screen
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'))
})

//opens port
app.listen(PORT, () => {
    console.log(`listening on PORT: ${PORT}`)
})