// Die Klasse Todo erzeugt ein einzelnes Todo
export class Todo {
  #description;
  #done;
  #todoId;
  #ulElement;
  #todoListElement;
  #todoCheckBox;

  //Konstruktor
  constructor(description, done, todoId) {
    this.#description = description ? description : "";
    this.#done = done === true || done === false ? done : false;
    //Id wird mit einer zufälligen unique Zahl initialisiert
    this.#todoId = todoId ? todoId : null;
    //this.#todoId = todoId ? todoId : "uui" + window.crypto.randomUUID();
    this.#init();
  }

  //gibt den Todo Text zurück
  get description() {
    return this.#description;
  }

  //Setzt den Todo Text
  set description(description) {
    this.#description = description;
  }

  //gibt den Erledigt Status zurück
  get done() {
    return this.#done;
  }

  //setzt den Erledigt Status
  set done(done) {
    this.#done = done;
    this.#updateStatus();
  }

  //setzt die Id
  set todoId(todoId) {
    this.#todoId = todoId;
  }

  // gibt die Todo Id zurück
  get todoId() {
    return this.#todoId;
  }

  //Ausgabe des Todo auf den Schirm, fügt das Todo Html-Element
  // dem DOM hinzu
  createTodo() {
    this.#ulElement.appendChild(this.#todoListElement);
  }

  // Macht das Element unsichtbar
  hideTodo() {
    this.#todoListElement.hidden = true;
  }

  // Macht das Element wieder sichtbar
  showTodo() {
    this.#todoListElement.hidden = false;
  }

  deleteTodo() {
    this.#ulElement.removeChild(this.#todoListElement);
  }

  //Wertet aus ob die Checkbox angeklickt wurde
  //Falls ja, wird der Status auf "done = true" gesetzt und
  //und der Text durchgestrichen.
  //Falls nein, wird der Status auf "done = false" gesetzt und der
  //Text normal dargestellt

  #updateStatus() {
    if (this.#done === true) {
      this.#todoListElement.style.textDecoration = "line-through";
      this.#todoCheckBox.checked = true;
    } else {
      this.#todoListElement.style.textDecoration = "none";
      this.#todoCheckBox.checked = false;
    }
  }

  //Erzeugt das Todo als Html Element, fügt es aber noch
  //nicht in das DOM ein
  #createHtmlTodo() {
    //<li>
    this.#todoListElement = document.createElement("li");
    //<checkbox>
    this.#todoCheckBox = document.createElement("input");
    this.#todoCheckBox.type = "checkbox";
    this.#todoCheckBox.class = "single-todo";
    this.#todoCheckBox.checked = this.#done;
    this.#todoCheckBox.todoElement = this;
    // textNode
    const todoContent = document.createTextNode(this.#description);
    //create HTML Struktur
    this.#todoListElement.appendChild(todoContent);
    this.#todoListElement.appendChild(this.#todoCheckBox);
  }

  // Wird im Konstruktor aufgerufen und erzeugt das Todo
  #init() {
    this.#ulElement = document.querySelector("#todos-output");
    this.#createHtmlTodo();
    this.#updateStatus();
  }
}
