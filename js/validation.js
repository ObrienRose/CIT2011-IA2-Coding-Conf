(() => {
  const STORAGE_KEY = "codingConfTicket";
  const MAX_AVATAR_BYTES = 500 * 1024;
  const form = document.querySelector("#registration-form");

  if (!form) return;

  const fields = {
    fullName: form.elements.fullName,
    email: form.elements.email,
    github: form.elements.github,
    avatar: form.elements.avatar
  };

  const dropzone = document.querySelector("#upload-dropzone");
  const uploadTitle = document.querySelector("#upload-title");
  const fileName = document.querySelector("#upload-file-name");
  const avatarPreview = document.querySelector("#avatar-preview");
  const avatarActions = document.querySelector("#avatar-actions");
  const removeAvatarButton = document.querySelector("#remove-avatar");
  const changeAvatarButton = document.querySelector("#change-avatar");
  const formStatus = document.querySelector("#form-status");
  const submitButton = form.querySelector('[type="submit"]');

  function showError(fieldName, message) {
    const field = fields[fieldName];
    const error = document.querySelector('[data-error-for="' + fieldName + '"]');

    field.setAttribute("aria-invalid", "true");
    error.textContent = message;

    if (fieldName === "avatar") {
      dropzone.setAttribute("aria-invalid", "true");
    }
  }

  function clearError(fieldName) {
    const field = fields[fieldName];
    const error = document.querySelector('[data-error-for="' + fieldName + '"]');

    field.removeAttribute("aria-invalid");
    error.textContent = "";

    if (fieldName === "avatar") {
      dropzone.removeAttribute("aria-invalid");
    }
  }

  function checkName() {
    if (!fields.fullName.value.trim()) {
      showError("fullName", "Please enter your full name.");
      return false;
    }

    clearError("fullName");
    return true;
  }

  function checkEmail() {
    const email = fields.email.value.trim();
    const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}$/i;

    if (!emailPattern.test(email)) {
      showError("email", "Please enter a valid email address.");
      return false;
    }

    clearError("email");
    return true;
  }

  function checkGitHub() {
    const username = fields.github.value.trim();
    const usernamePattern = /^@[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])?$/i;

    if (!usernamePattern.test(username)) {
      showError("github", "Enter a valid GitHub username that starts with @.");
      return false;
    }

    clearError("github");
    return true;
  }

  function checkAvatar() {
    const file = fields.avatar.files[0];

    if (!file) {
      showError("avatar", "Please upload an image.");
      return false;
    }

    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      showError("avatar", "Upload a JPG or PNG image.");
      return false;
    }

    if (file.size >= MAX_AVATAR_BYTES) {
      showError("avatar", "File too large. Please upload a photo under 500KB.");
      return false;
    }

    clearError("avatar");
    return true;
  }

  function displayAvatar(file) {
    if (!file) return;

    formStatus.textContent = "";

    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      showError("avatar", "Upload a JPG or PNG image.");
      return;
    }

    if (file.size >= MAX_AVATAR_BYTES) {
      showError("avatar", "File too large. Please upload a photo under 500KB.");
      return;
    }

    clearError("avatar");
    dropzone.classList.add("has-image");
    uploadTitle.textContent = "Image selected";
    fileName.textContent = file.name;
    avatarActions.hidden = false;

    const reader = new FileReader();

    reader.addEventListener("load", () => {
      avatarPreview.src = reader.result;
      avatarPreview.hidden = false;
    });

    reader.addEventListener("error", () => {
      showError("avatar", "The image could not be read. Please choose another file.");
    });

    reader.readAsDataURL(file);
  }

  function clearAvatar() {
    fields.avatar.value = "";
    avatarPreview.removeAttribute("src");
    avatarPreview.hidden = true;
    avatarActions.hidden = true;
    dropzone.classList.remove("has-image");
    uploadTitle.textContent = "Drag and drop or click to upload";
    fileName.textContent = "JPG or PNG, max size: 500KB";
    clearError("avatar");
  }

  function readAvatarAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.addEventListener("load", () => resolve(reader.result));
      reader.addEventListener("error", () => reject(new Error("Could not read the image.")));
      reader.readAsDataURL(file);
    });
  }

  fields.fullName.addEventListener("input", () => {
    clearError("fullName");
    formStatus.textContent = "";
  });

  fields.email.addEventListener("input", () => {
    clearError("email");
    formStatus.textContent = "";
  });

  fields.github.addEventListener("input", () => {
    clearError("github");
    formStatus.textContent = "";
  });

  fields.avatar.addEventListener("change", () => {
    displayAvatar(fields.avatar.files[0]);
  });

  removeAvatarButton.addEventListener("click", clearAvatar);

  changeAvatarButton.addEventListener("click", () => {
    fields.avatar.click();
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.add("is-dragging");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.remove("is-dragging");
    });
  });

  dropzone.addEventListener("drop", (event) => {
    const file = event.dataTransfer.files[0];

    if (!file) return;

    const transfer = new DataTransfer();
    transfer.items.add(file);
    fields.avatar.files = transfer.files;
    displayAvatar(file);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    formStatus.textContent = "";

    const nameIsValid = checkName();
    const emailIsValid = checkEmail();
    const githubIsValid = checkGitHub();
    const avatarIsValid = checkAvatar();

    if (!nameIsValid || !emailIsValid || !githubIsValid || !avatarIsValid) {
      const firstInvalidField = form.querySelector('[aria-invalid="true"]');
      if (firstInvalidField) firstInvalidField.focus();
      return;
    }

    submitButton.disabled = true;

    try {
      const ticketData = {
        fullName: fields.fullName.value.trim(),
        email: fields.email.value.trim(),
        github: fields.github.value.trim(),
        avatar: await readAvatarAsDataURL(fields.avatar.files[0])
      };

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ticketData));
      window.location.assign("ticket.html");
    } catch (error) {
      formStatus.textContent = "Could not save the ticket. Please try another image.";
      submitButton.disabled = false;
    }
  });
})();
