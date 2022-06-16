import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, onSnapshot,
  addDoc, deleteDoc, doc,
  query, where, orderBy,
  serverTimestamp,
  getDoc, updateDoc, getDocs,
} from 'firebase/firestore';
import { 
  getAuth, createUserWithEmailAndPassword,
  signOut, signInWithEmailAndPassword,
  onAuthStateChanged,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCH2Cu8V41oG8OMFmCKBfeK9n8G9z0_oK4",
  authDomain: "notes-app-ecce6.firebaseapp.com",
  projectId: "notes-app-ecce6",
  storageBucket: "notes-app-ecce6.appspot.com",
  messagingSenderId: "182472416911",
  appId: "1:182472416911:web:9f73d8a0c9a4b8d775dafa"
};

// init firebase app
initializeApp(firebaseConfig);

// init services
const db = getFirestore();
const auth = getAuth();

// collection refs
const notesCol = collection(db, 'notes');

// queries
const q = query(notesCol,  orderBy('createdAt', 'desc'));



// selectors
const allNotesDiv = document.querySelector('#all-notes');
const logoutBtn = document.querySelector('.logout');
const loginBtn = document.querySelector('.login');
const registerBtn = document.querySelector('.register');

let loggedIn = false;
let userInfo = null;
console.log('current user', userInfo);

onSnapshot(notesCol, (snapshot) => {
  allNotesDiv.innerHTML = ''
  let docData = [];
  snapshot.docs.forEach(doc => {
    docData.push({
      'id': doc.id,
      'title': doc.data().title,
      'body': doc.data().body,
    });
  });
  console.log('docData', docData)

  docData.forEach((doc) => {
    console.log('doc Id', doc.id)
    
    allNotesDiv.innerHTML += `
    <div class="card" style="width: 18rem;" data-id="${doc.id.trim()}">
      <div class="card-body">
        <h5 class="card-title">${doc.title}</h5>
        <p class="card-text">${doc.body}</p>
        <a href="#" class="btn btn-danger delete-btn">Delete Note</a>
      </div>
    </div>
    `;
  })

  deleteNote()
})

// delete note
function deleteNote() {
  const deleteBtns = document.querySelectorAll('.delete-btn');
  console.log('deleteBtns', deleteBtns);
  deleteBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const docRef = doc(db, 'notes', e.target.parentElement.parentElement.dataset.id);

      deleteDoc(docRef);
    });
  })
}

// if (loggedIn) {
//   logoutBtn.style.display = 'block';
//   loginBtn.style.display = 'none';
// } else {
//   logoutBtn.style.display = 'none';
//   loginBtn.style.display = 'block';
// }
 

// // add new note
// const addNoteForm = document.querySelector('.addNote');
// addNoteForm.addEventListener('submit', (e) => {
//   e.preventDefault();
//   if(!loggedIn) {
//     alert('Please log in first');
//   } else {
//     addDoc(notesCol, {
//       title: addNoteForm.title.value, 
//       body: addNoteForm.body.value,
//       user: userInfo.uid,
//       createdAt: serverTimestamp(),
//     }).then(() => {
//         addNoteForm.reset();
//       })
//       .catch(err => console.log(err.message));
//   }
// });


// registerBtn.addEventListener('click', renderSignUp)
// function renderSignUp() {
//   // sign users up
//   const signupForm = document.querySelector("#signup-form");
//   signupForm.addEventListener("submit", (e) => {
//     e.preventDefault();

//     const email = signupForm.email.value;
//     const password = signupForm.password.value;

//     createUserWithEmailAndPassword(auth, email, password)
//       .then((cred) => {
//         console.log("user created:", cred.user);
//         signupForm.reset();
//       })
//       .catch((err) => {
//         console.log(err.message);
//       });
//   });
// }


// loginBtn.addEventListener('click', renderLogIn);
// function renderLogIn() {
//   const loginForm = document.querySelector("#login-form");
//   loginForm.addEventListener("submit", (e) => {
//     e.preventDefault();

//     const email = loginForm.email.value;
//     const password = loginForm.password.value;

//     signInWithEmailAndPassword(auth, email, password)
//       .then((cred) => {
//         console.log("user signed in:", cred.user);
//         loginForm.reset();
//       })
//       .catch((err) => {
//         console.log(err.message);
//       });
//   });
// }

// // logging in and out
const logoutButton = document.querySelector('.logout');
logoutButton.addEventListener('click', () => {
  signOut(auth)
    .then(() => {
      console.log('the user signed out');
    })
    .catch((err) => {
      console.log(err.message);
    })
})




// subscribing to auth changes

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('user signed in:', user);
    logoutBtn.style.display = 'block';
    loginBtn.style.display = 'none';
    loggedIn = true;
    userInfo = user;
  } else {
    logoutBtn.style.display = 'none';
    loginBtn.style.display = 'block';
    loggedIn = false;
    userInfo = {};
  }
});

