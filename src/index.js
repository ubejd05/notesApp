import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, onSnapshot, 
  addDoc, deleteDoc, doc, query, 
  where, orderBy, serverTimestamp,
  getDoc, updateDoc, getDocs,
} from "firebase/firestore";
import {
  getAuth, createUserWithEmailAndPassword,
  signOut, signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCH2Cu8V41oG8OMFmCKBfeK9n8G9z0_oK4",
  authDomain: "notes-app-ecce6.firebaseapp.com",
  projectId: "notes-app-ecce6",
  storageBucket: "notes-app-ecce6.appspot.com",
  messagingSenderId: "182472416911",
  appId: "1:182472416911:web:9f73d8a0c9a4b8d775dafa",
};

// init firebase app
initializeApp(firebaseConfig);

// init services
const db = getFirestore();
const auth = getAuth();

// collection refs
const notesCol = collection(db, "notes");


// selectors
const allNotesDiv = document.querySelector("#all-notes");
const logoutBtn = document.querySelector(".logout");
const loginBtn = document.querySelector(".login");
const registerBtn = document.querySelector(".register");
const modalBtn = document.querySelector(".modal-button");
const backBtn =  document.querySelector('.back-btn');

let loggedIn = false;
let userInfo;

let mode = 'all-notes';
let singleNoteId;


function loadNotes() {
 const q = query(notesCol, where("user", "==", userInfo.uid), orderBy("createdAt", "desc")); 

  onSnapshot(q, (snapshot) => {
    allNotesDiv.innerHTML = "";
    if (mode === 'all-notes') {
      allNotesDiv.classList.remove('single-note-view')
      loadAllNotes(snapshot)
    } else {
      const docRef = doc(db, 'notes', singleNoteId)
      getDoc(docRef)
        .then((doc) => {
          let id = doc.id;
          let title = doc.data().title;
          let body = doc.data().body;
          singleNoteView(id, title, body)
        })
    }
    
  
    loadEventListeners()
  })
}


function loadAllNotes(snapshot) {
  modalBtn.style.display = 'block';
  backBtn.style.display = 'none';

  let docData = [];
  snapshot.docs.forEach((doc) => {
    docData.push({
      id: doc.id,
      title: doc.data().title,
      body: doc.data().body,
      user: doc.data().user,
      createdAt: doc.data().createdAt,
    });
  });

  if (docData.length < 1) {
    noNotes()
  } else {
    docData.forEach((doc) => {
      allNotesDiv.innerHTML += `
        <div class="card note" style="width: 18rem;" data-id="${doc.id.trim()}">
          <div class="card-body">
            <h5 class="card-title">${doc.title}</h5>
            <p class="card-text">${doc.body.length > 70 ? doc.body.slice(0, 70).trim() + '<span class="dots">...<span>' : doc.body}</p>
            <a href="#" class="btn btn-danger delete-btn">Delete Note</a>
            <a href="#" class="btn btn-warning edit-btn">Edit Note</a>
          </div>
        </div>
      `;
    });
  }
  
}

function loadEventListeners() {
  deleteNote();
  editNoteModal();
  singleNoteData();
}


function noNotes() {
  allNotesDiv.innerHTML = `
    <img src="../illustration.svg" />
    <h2 style="color: #536DFE;">No notes found!</h2>
  `;
  allNotesDiv.classList.add('single-note-view')
  allNotesDiv.querySelector('img').style.width = '25rem'
}

// delete note
function deleteNote(mode) {
  const deleteBtns = document.querySelectorAll(".delete-btn");

  deleteBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      let noteId;

      if (mode === 'singlenote') {
        noteId = e.target.parentElement.dataset.id;
      } else {
        noteId = e.target.parentElement.parentElement.dataset.id;
      }
      
      const docRef = doc(db, "notes", noteId);
      deleteDoc(docRef);
      allNotesMode();
    });
  });
}

// add new note
function addNote() {
  const addNoteForm = document.querySelector("#new-note-form");
  addNoteForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!loggedIn) {
      alert("Please log in first");
    } else {
      addDoc(notesCol, {
        title: addNoteForm.title.value,
        body: addNoteForm.body.value,
        user: userInfo.uid,
        createdAt: serverTimestamp(),
      })
        .then(() => {
          addNoteForm.reset();
        })
        .catch((err) => console.log(err.message));
    }

    closeModal()
  });
}


// edit note
function editNote(noteId) {
  const editNoteForm = document.querySelector('#edit-note-form');
  editNoteForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const docRef = doc(db, 'notes', noteId);

    updateDoc(docRef, {
      title: editNoteForm.title.value,
      body: editNoteForm.body.value
    })

    closeModal()
  })
}


// open edit modal and populate data
function editNoteModal(mode) {
  const editBtns = document.querySelectorAll('.edit-btn');  

  editBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      let noteId;

      if (mode === 'singlenote') {
        noteId = e.target.parentElement.dataset.id;
      } else {
        noteId = e.target.parentElement.parentElement.dataset.id;
      }

      let title;
      let body;
      let id;

      const docRef = doc(db, 'notes', noteId)
      getDoc(docRef)
        .then((doc) => {
          id = doc.id;
          title = doc.data().title;
          body = doc.data().body;
          showModal('edit', id, title, body)
        })
    })
  })
}

// single note
function singleNoteData() {
  const notes = document.querySelectorAll('.note');
  notes.forEach((note) => {
    note.addEventListener('click', (e) => {
      mode = 'single-note';
      singleNoteId = note.dataset.id;

      const noteId = note.dataset.id;

      const docRef = doc(db, 'notes', noteId)
      getDoc(docRef)
        .then((doc) => {
          let id = doc.id;
          let title = doc.data().title;
          let body = doc.data().body;
          singleNoteView(id, title, body)
        })
    })
  })
  
}

// single note view
function singleNoteView(id, title, body) {
  allNotesDiv.classList.add('single-note-view')
  allNotesDiv.innerHTML = `
  <div class="single-note" style="width: 18rem;" data-id="${id.trim()}">
      <h5 class="card-title">${title}</h5>
      <p class="card-text">${body}</p>
      <a href="#" class="btn btn-danger delete-btn">Delete Note</a>
      <a href="#" class="btn btn-warning edit-btn">Edit Note</a>
  </div>
  `; 

  modalBtn.style.display = 'none';
  backBtn.style.display = 'block';

  deleteNote('singlenote');
  editNoteModal('singlenote');
}


// logging out
const logoutButton = document.querySelector(".logout");
logoutButton.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      allNotesDiv.innerHTML = "";
      console.log("the user signed out");
    })
    .catch((err) => {
      console.log(err.message);
    });
});

// log users in
const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = loginForm.email.value;
  const password = loginForm.password.value;

  signInWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      console.log('user signed in:', cred.user);
      loginForm.reset();
      window.location.href = "index.html";
    })
    .catch((err) => {
      console.log(err.message);
    })
})

// sign users up
const signupForm = document.querySelector('#signup-form');
signupForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const email = signupForm.email.value;
  const password = signupForm.password.value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      console.log('user created:', cred.user);
      signupForm.reset();
      window.location.href = "index.html";
    })
    .catch((err) => {
      console.log(err.message)
    })
});

// subscribing to auth changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    loggedIn = true;
    userInfo = user;
    logoutBtn.style.display = "block";
    loginBtn.style.display = "none";
    registerBtn.style.display = "none";
    modalBtn.style.display = "block";
    loadNotes();
  } else {
    loggedIn = false;
    userInfo = {};
    logoutBtn.style.display = "none";
    loginBtn.style.display = "block";
    registerBtn.style.display = "block";
    modalBtn.style.display = "none";
  }
});

let modalWrap = null;
function showModal(mode, id, title, body) {
  if (modalWrap !== null) {
    modalWrap.remove();
  }

  modalWrap = document.createElement("div");
  modalWrap.innerHTML = `
    <div class="modal fade" id="${mode === 'edit' ? 'edit-note-modal' : 'new-note-modal'}" tabindex="-1" aria-labelledby="${mode === 'edit' ? 'edit-note-modal' : 'new-note-modal'}" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content p-5">
          <h1>${mode === 'edit' ? 'Edit Note' : 'Add New Note'}</h1>
          <form id="${mode === 'edit' ? 'edit-note-form' : 'new-note-form'}">
            <div class="form-group">
              <label for="title">Title</label>
              <input type="text" id="title" class="form-control" name="title" placeholder="Title" required value="${mode === 'edit' ? title : ''}">
            </div>
            <div class="form-group">
              <label for="body">Body</label>
              <textarea id="body" class="form-control" name="body" rows="3" required>${mode === 'edit' ? body : ''}</textarea>
            </div>
            <button type="submit" class="${mode === 'edit' ? "btn btn-warning mt-3" : "btn btn-primary mt-3"}">${mode === 'edit' ? 'Edit' : 'Add Note'}</button>
          </form>
        </div>
      </div>
    </div>
  `;

  document.body.append(modalWrap);

  let modal = new bootstrap.Modal(modalWrap.querySelector(".modal"));
  modal.show();

  if (mode === 'edit') {
    editNote(id); 
  } else {
    addNote();
  }
};

function allNotesMode() {
  mode = 'all-notes';
  singleNoteId = '';
}


modalBtn.addEventListener("click", showModal);
backBtn.addEventListener('click', allNotesMode);


function closeModal() {
  const modal = document.querySelector(".modal");
  const modalBackdrop = document.querySelector('.modal-backdrop')
  
  modal.classList.remove('show')
  modal.classList.add('hide')
  modal.style.display = 'none';
  
  modalBackdrop.classList.remove('show')
  modalBackdrop.classList.add('hide')
  modalBackdrop.remove();
}
