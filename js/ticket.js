(() => {
  const STORAGE_KEY = "codingConfTicket";
  let ticketData;

  try {
    ticketData = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
  } catch (error) {
    ticketData = null;
  }

  const hasRequiredData = ticketData
    && typeof ticketData.fullName === "string"
    && typeof ticketData.email === "string"
    && typeof ticketData.github === "string"
    && typeof ticketData.avatar === "string";

  if (!hasRequiredData) {
    window.location.replace("index.html");
    return;
  }

  document.querySelector("#ticket-name-heading").textContent = ticketData.fullName;
  document.querySelector("#ticket-email").textContent = ticketData.email;
  document.querySelector("#ticket-attendee-name").textContent = ticketData.fullName;
  document.querySelector("#ticket-github-handle").textContent = ticketData.github;

  const avatar = document.querySelector("#ticket-avatar");
  avatar.src = ticketData.avatar;
  avatar.alt = "Avatar uploaded by " + ticketData.fullName;

  const githubUsername = ticketData.github.replace(/^@/, "");
  const githubLink = document.querySelector("#ticket-github");
  githubLink.href = "https://github.com/" + encodeURIComponent(githubUsername);
  githubLink.setAttribute("aria-label", "Visit " + ticketData.github + "'s GitHub profile");
})();
