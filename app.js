import { getFirestore, collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const cafelist = document.querySelector('#cafe-list');
const form = document.querySelector('#add-cafe-form');
const updateForm = document.querySelector('#update-cafe-form'); // The form to update data

// Initialize Firestore
const db = getFirestore();

// Function to render cafe data
function renderCafe(cafeDoc) {
    let li = document.createElement('li');
    let name = document.createElement('span');
    let city = document.createElement('span');
    let cross = document.createElement('div');
    let edit = document.createElement('button'); // Edit button

    li.setAttribute('data-id', cafeDoc.id);
    name.textContent = cafeDoc.data().name;
    city.textContent = cafeDoc.data().location;
    cross.textContent = 'x';
    edit.textContent = 'Edit'; // Button text

    li.appendChild(name);
    li.appendChild(city);
    li.appendChild(cross);
    li.appendChild(edit);
    cafelist.appendChild(li);

    // Delete action
    cross.addEventListener('click', async (e) => {
        e.stopPropagation();
        let id = e.target.parentElement.getAttribute('data-id');
        try {
            const docRef = doc(db, 'cafes', id);
            await deleteDoc(docRef);
            console.log(`Document with ID: ${id} deleted successfully!`);
            cafelist.removeChild(li); // Remove from DOM
        } catch (error) {
            console.error("Error deleting document:", error);
        }
    });

    // Edit action
    edit.addEventListener('click', (e) => {
        e.stopPropagation();
        let id = e.target.parentElement.getAttribute('data-id');
        let nameValue = e.target.parentElement.querySelector('span').textContent;
        let locationValue = e.target.parentElement.querySelectorAll('span')[1].textContent;

        // Fill the update form with current data
        updateForm.name.value = nameValue;
        updateForm.location.value = locationValue;
        updateForm.setAttribute('data-id', id); // Store doc id in form for later use
    });
}

// Update Cafe data
updateForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = updateForm.getAttribute('data-id'); // Get the cafe ID
    const newName = updateForm.name.value;
    const newLocation = updateForm.location.value;

    try {
        const cafeRef = doc(db, 'cafes', id); // Reference to the document to update
        await updateDoc(cafeRef, {
            name: newName,
            location: newLocation
        });
        console.log("Cafe updated successfully!");

        // Optionally, you can update the DOM directly without refreshing the page
        let li = cafelist.querySelector('[data-id="' + id + '"]');
        li.querySelector('span').textContent = newName;
        li.querySelectorAll('span')[1].textContent = newLocation;

        updateForm.reset(); // Clear the update form after submission
    } catch (error) {
        console.error("Error updating cafe:", error);
    }
});

// Real-time listener
const cafesQuery = query(collection(db, 'cafes'), orderBy('location')); // Query sorted by location
onSnapshot(cafesQuery, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
            renderCafe(change.doc); // Render added cafe
        } else if (change.type === 'removed') {
            let li = cafelist.querySelector('[data-id=' + change.doc.id + ']');
            cafelist.removeChild(li); // Remove deleted cafe from DOM
        }
    });
});

// Save Data on form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        await addDoc(collection(db, 'cafes'), {
            name: form.name.value,
            location: form.location.value,
        });

        form.reset();
        console.log("Cafe added successfully!");
    } catch (error) {
        console.error("Error adding cafe:", error);
    }
});
