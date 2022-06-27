import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDoc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword,
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

// queries
const q = query(notesCol, orderBy("createdAt", "desc"));

// selectors
const allNotesDiv = document.querySelector("#all-notes");
const logoutBtn = document.querySelector(".logout");
const loginBtn = document.querySelector(".login");
const registerBtn = document.querySelector(".register");

let loggedIn = false;
let userInfo;
console.log("current user", userInfo);

onSnapshot(q, (snapshot) => {
  allNotesDiv.innerHTML = "";
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
  console.log("docData", docData);

  docData.forEach((doc) => {
    if (userInfo && userInfo.uid == doc.user) {
      console.log("doc id", doc.user);
      console.log("userInfo.uid", userInfo.uid);
      allNotesDiv.innerHTML += `
        <div class="card" style="width: 18rem;" data-id="${doc.id.trim()}">
          <div class="card-body">
            <h5 class="card-title">${doc.title}</h5>
            <p class="card-text">${doc.body}</p>
            <a href="#" class="btn btn-danger delete-btn">Delete Note</a>
            <a href="#" class="btn btn-warning update-btn">Edit Note</a>
          </div>
        </div>
      `;
    }
  });

  deleteNote();
});

// delete note
function deleteNote() {
  const deleteBtns = document.querySelectorAll(".delete-btn");
  console.log("deleteBtns", deleteBtns);
  deleteBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const docRef = doc(
        db,
        "notes",
        e.target.parentElement.parentElement.dataset.id
      );

      deleteDoc(docRef);
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
  });
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

// subscribing to auth changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("user signed in:", user);
    logoutBtn.style.display = "block";
    loginBtn.style.display = "none";
    registerBtn.style.display = "none";
    loggedIn = true;
    userInfo = user;
    console.log("current user", userInfo.uid);
  } else {
    logoutBtn.style.display = "none";
    loginBtn.style.display = "block";
    registerBtn.style.display = "block";
    loggedIn = false;
    userInfo = {};
  }
});

let modalWrap = null;
const showModal = () => {
  if (modalWrap !== null) {
    modalWrap.remove();
  }

  modalWrap = document.createElement("div");
  modalWrap.innerHTML = `
   <div class="modal fade" id="new-note-modal" tabindex="-1" aria-labelledby="new-note-modal" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content p-5">
         <h1>Add New Note</h1>
         <form id="new-note-form">
            <div class="form-group">
            <label for="title">Title</label>
            <input type="text" id="title" class="form-control" name="title" placeholder="Title" required>
            </div>
            <div class="form-group">
            <label for="body">Body</label>
            <textarea id="body" class="form-control" name="body" rows="3" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary mt-3">Add Note</button>
         </form>
      </div>
      </div>
   </div>
   `;

  document.body.append(modalWrap);

  let modal = new bootstrap.Modal(modalWrap.querySelector(".modal"));
  modal.show();

  addNote();
};

const modalBtn = document.querySelector(".modal-button");
modalBtn.addEventListener("click", showModal);
