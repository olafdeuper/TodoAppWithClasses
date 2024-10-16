export const formWrapper = document.querySelectorAll("form"); // alle <form>-Elemente

// Verhindert auf allen <form>-Elementen, dass bei Buttonklick (triggert ein "submit"-Event) die Seite neu lädt
formWrapper.forEach((wrapper) => {
  wrapper.addEventListener("submit", function (event) {
    event.preventDefault();
  });
});
