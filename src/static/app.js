document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('registration-form');
  const participantsList = document.getElementById('participants-list');

  form.addEventListener('submit', function(event) {
    event.preventDefault();
    const nameInput = document.getElementById('name');
    const name = nameInput.value.trim();
    if (name) {
      addParticipant(name);
      nameInput.value = '';
    }
  });

  function addParticipant(name) {
    const li = document.createElement('li');
    li.style.listStyleType = 'none'; // Hide bullet point
    li.style.display = 'flex';
    li.style.alignItems = 'center';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = name;
    nameSpan.style.flexGrow = '1';

    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.title = 'Unregister participant';
    deleteBtn.style.marginLeft = '8px';
    deleteBtn.style.background = 'none';
    deleteBtn.style.border = 'none';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.style.fontSize = '1.1em';
    deleteBtn.addEventListener('click', function() {
      participantsList.removeChild(li);
    });

    li.appendChild(nameSpan);
    li.appendChild(deleteBtn);
    participantsList.appendChild(li);
  }

  // Hide bullet points for all existing list items (if any)
  Array.from(participantsList.children).forEach(li => {
    li.style.listStyleType = 'none';
    li.style.display = 'flex';
    li.style.alignItems = 'center';
    // Add delete button to existing items if not present
    if (!li.querySelector('button')) {
      const deleteBtn = document.createElement('button');
      deleteBtn.innerHTML = '🗑️';
      deleteBtn.title = 'Unregister participant';
      deleteBtn.style.marginLeft = '8px';
      deleteBtn.style.background = 'none';
      deleteBtn.style.border = 'none';
      deleteBtn.style.cursor = 'pointer';
      deleteBtn.style.fontSize = '1.1em';
      deleteBtn.addEventListener('click', function() {
        participantsList.removeChild(li);
      });
      li.appendChild(deleteBtn);
    }
  });
});

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Create participants list HTML
        let participantsHTML = "";
        if (details.participants.length > 0) {
          participantsHTML = `
            <div class="participants-section">
              <strong>Participants:</strong>
              <ul>
                ${details.participants.map(email => `<li>${email}</li>`).join("")}
              </ul>
            </div>
          `;
        } else {
          participantsHTML = `
            <div class="participants-section">
              <strong>Participants:</strong>
              <p class="no-participants">No participants yet.</p>
            </div>
          `;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHTML}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
