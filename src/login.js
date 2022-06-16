import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInWithEmailAndPassword,
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

const auth = getAuth();

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



