const firebaseConfig = {
  apiKey: "AIzaSyAkgu2zyME7lE5Iv_3HItEKYTImgFdVTV0",
  authDomain: "dragoknight-4e88f.firebaseapp.com",
  projectId: "dragoknight-4e88f",
  storageBucket: "dragoknight-4e88f.firebasestorage.app",
  messagingSenderId: "78783562577",
  appId: "1:78783562577:web:51e8acc093f7c0730cc970",
  databaseURL: "https://dragoknight-4e88f-default-rtdb.firebaseio.com"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
window.auth = firebase.auth();
window.database = firebase.database();
