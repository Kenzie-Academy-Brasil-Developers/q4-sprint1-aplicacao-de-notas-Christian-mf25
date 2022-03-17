import express from 'express';
import { v4 } from 'uuid';

const app = express();
const PORT = 3000;

app.use(express.json());

const USER = [];

const checkCpfParams = (req, res, next) => {
  const { cpf } = req.params;
  const user = USER.find((i) => i.cpf === cpf);

  if (!user) {
    return res.status(404).json({ error: 'user is not registered' });
  }

  req.user = user;

  return next();
};

const checkCpfExist = (req, res, next) => {
  const { cpf } = req.body;
  const user = USER.find((i) => cpf === i.cpf);

  if (user) {
    return res.status(422).json({ error: 'user already exists' });
  }
  return next();
};
const checkNoteId = (req, res, next) => {
  const { id } = req.params;
  const { user } = req;
  const note = user.notes.find((i) => i.id === id);

  if (!note) {
    return res.status(404).json({ error: 'note is not registered' });
  }

  req.notes = note;

  return next();
};

app.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}/ (Press CTRL+C to quit)`);
});

/* USER ROUTES */
app.post('/users', checkCpfExist, (req, res) => {
  const data = req.body;

  const user = {
    id: v4(),
    name: data.name,
    cpf: data.cpf,
    notes: [],
  };

  USER.push(user);

  res.status(201).json(user);
});

app.get('/users', (req, res) => {
  res.status(200).json(USER);
});

app.patch('/users/:cpf', checkCpfParams, (req, res) => {
  const { user } = req;
  const name = req.body.name ? req.body.name : user.name;
  const cpf = req.body.cpf ? req.body.cpf : user.cpf;

  const userCpf = USER.filter((i) => i.cpf === cpf);
  if (userCpf.length >= 1 && userCpf[0].id !== user.id) {
    return res.status(409).json({ error: 'cpf already registered' });
  }

  user.name = name;
  user.cpf = cpf;

  return res.status(200).json({
    message: 'User is updated',
    user,
  });
});

app.delete('/users/:cpf', checkCpfParams, (req, res) => {
  const { user } = req;
  const userToRemove = USER.indexOf(user);
  USER.splice(userToRemove, 1);

  return res.status(204).json();
});

/* NOTES ROUTES */
app.post('/users/:cpf/notes', checkCpfParams, (req, res) => {
  const data = req.body;
  const { user } = req;
  const date = new Date();

  const note = {
    id: v4(),
    created_at: date,
    title: data.title,
    content: data.content,
  };

  user.notes.push(note);

  return res.status(201).json({
    message: `${data.title} was added into ${user.name}'s notes`,
  });
});

app.get('/users/:cpf/notes', checkCpfParams, (req, res) => {
  const { user } = req;
  return res.status(200).json(user.notes);
});

app.patch('/users/:cpf/notes/:id', checkCpfParams, checkNoteId, (req, res) => {
  const { notes } = req;
  const content = req.body.content ? req.body.content : notes.content;
  const title = req.body.title ? req.body.title : notes.title;
  const date = new Date();

  notes.title = title;
  notes.content = content;
  notes.updated_at = date;

  return res.status(200).json(notes);
});

app.delete('/users/:cpf/notes/:id', checkCpfParams, checkNoteId, (req, res) => {
  const { notes, user } = req;
  const noteToRemove = user.notes.indexOf(notes);
  user.notes.splice(noteToRemove, 1);

  return res.status(204).json();
});
