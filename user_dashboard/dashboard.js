import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const nameSpan = document.getElementById("name");
const emailSpan = document.getElementById("email");
const deploymentsList = document.getElementById("deploymentsList");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  nameSpan.textContent = user.displayName || "N/A";
  emailSpan.textContent = user.email;

  // Fetch user's deployments
  const q = query(collection(db, "deployments"), where("userId", "==", user.uid));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    deploymentsList.innerHTML = "<li>No deployments found</li>";
    return;
  }

  deploymentsList.innerHTML = "";

  snapshot.forEach((doc) => {
    const data = doc.data();
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${data.name}</strong><br>
      <a href="${data.url}" target="_blank">${data.url}</a><br>
      <small>📅 ${new Date(data.timestamp).toLocaleString()}</small>
    `;
    deploymentsList.appendChild(li);
  });
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
}); 