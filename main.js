"use strict";

// Die Klasse Todo erzeugt ein einzelnes Todo
class Todo {
  #todoText;
  #done;
  #todoId;
  #todoLi;

  //Konstruktor
  constructor(todoText, done, todoId) {
    this.#todoText = todoText ? todoText : "";
    this.#done = done === true || done === false ? done : false;
    //Id wird mit einer zufälligen unique Zahl initialisiert
    this.#todoId = todoId ? todoId : "uui" + window.crypto.randomUUID();
    console.log(this.#todoId);
    this.#initialize();
  }

  //gibt den Todo Text zurück
  get todoText() {
    return this.#todoText;
  }

  //Setzt den Todo Text
  set todoText(todoText) {
    this.#todoText = todoText;
  }

  //gibt den Erledigt Status zurück
  get done() {
    return this.#done;
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
  renderTodo() {
    const thisLi = document.getElementById(this.#todoId);
    const parentUl = document.querySelector("#todoOutput");
    parentUl.appendChild(this.#todoLi);
  }

  // Entfernt das Element aus dem DOM
  removeTodo() {
    const thisLi = document.getElementById(this.#todoId);
    thisLi.parentNode.removeChild(thisLi);
  }

  // Macht das Element unsichtbar
  hideTodo() {
    const thisLi = document.getElementById(this.#todoId);
    thisLi.hidden = true;
  }

  // Macht das Element wieder sichtbar
  showTodo() {
    const thisLi = document.getElementById(this.#todoId);
    thisLi.hidden = false;
  }

  //Wertet aus ob die Checkbox angeklickt wurde
  //Falls ja, wird der Status auf "done = true" gesetzt und
  //und der Text durchgestrichen.
  //Falls nein, wird der Status auf "done = false" gesetzt und der
  //Text normal dargestellt
  #updateStatus() {
    const thisLi = document.getElementById(this.#todoId);

    if (thisLi.firstElementChild.checked) {
      this.#done = true;
    } else {
      this.#done = false;
    }

    if (this.#done === true) {
      thisLi.style.textDecoration = "line-through";
    } else {
      thisLi.style.textDecoration = "none";
    }
    //Eigenes Event, dass feuert, wenn sich der done Status des
    //Todos ändert
    const changeEvent = new Event("changeDone");
    dispatchEvent(changeEvent);
  }

  //Erzeugt das Todo als Html Element, fügt es aber noch
  //nicht in das DOM ein
  #makeHtmlTodo() {
    this.#todoLi = document.createElement("li");
    const todochck = document.createElement("input");
    const todoContent = document.createTextNode(this.#todoText);

    todochck.type = "checkbox";
    todochck.class = "singleTodo";
    todochck.addEventListener("click", () => this.#updateStatus());
    this.#todoLi.id = this.#todoId;
    this.#todoLi.appendChild(todoContent);
    const chkbx = this.#todoLi.appendChild(todochck);
    chkbx.checked = this.#done;
    if (this.#done === true) {
      this.#todoLi.style.textDecoration = "line-through";
    } else {
      this.#todoLi.style.textDecoration = "none";
    }
  }

  // Wird im Konstruktor aufgerufen und erzeugt das Todo
  #initialize() {
    this.#makeHtmlTodo();
  }
}

// Die eigentliche App als singleton Klasse
class TodoApp {
  //Main Array, enthält die Todos die in der App
  //gerendert werden
  #todosArr = [];
  #all;
  #open;
  #done;
  #saveTodos = "TodoAppArr";
  #saveApp = "TodoAppData";

  constructor() {
    this.initialize();
  }

  //Lädt die gespeicherten Daten aus dem local Storage
  #loadAppData() {
    let result = [];
    let status;

    if (JSON.parse(localStorage.getItem(this.#saveTodos)) !== null) {
      //Erzeugt aus den gespeicherten Daten ein Array
      result = [...JSON.parse(localStorage.getItem(this.#saveTodos))];
      //Erzeugt über den Konstruktor neue Todos und setzt die gespeicherten
      // Eigenschaften für Text, done-Status und ID
      result.forEach((item) => {
        this.#todosArr.push(new Todo(item.text, item.doneState, item.uid));
      });
      //Rendert die erzeugten Elemente
      this.#renderApp(this.#todosArr);
    }

    if (JSON.parse(localStorage.getItem(this.#saveApp)) !== null) {
      //Erzeugt aus den gespeicherten Daten ein Array
      status = JSON.parse(localStorage.getItem(this.#saveApp));
      //Rekonstruiert den App Staus aus den gespeicherten Daten
      // Status der Radio Buttons
    } else {
      // Default Status, falls gespeicherte Daten nicht geladen werden können
      status = {
        all: true,
        open: false,
        done: false,
      };
    }
    console.log(status);
    // Gespeicherten Datus in die Klassenvariablen
    // all, open und done zurückschreiben
    this.#all = status.all;
    this.#open = status.open;
    this.#done = status.done;

    // Bug: Eigentlich sollten die Radio Buttons wieder wie beim Speichern
    // angezeigt werden, passiert aber nicht
    document.querySelector("#all").selected = this.#all;
    document.querySelector("#open").selected = this.#open;
    document.querySelector("#done").selected = this.#done;

    //Rendert die erzeugten Elemente
    this.#renderApp(this.#todosArr);
  }

  // Rendert die App und stellt die einzelnen Todos je
  // nach Filter (all, open, done) dar.
  // Zeigt die nicht gefilterten und versteckt die gefilterten
  // Todos
  #renderApp(input) {
    let arr = [...input];
    // Alle
    if (this.#all === true) {
      arr.forEach((item) => {
        item.renderTodo();
        item.showTodo();
      });
    }
    // Open
    if (this.#open === true) {
      arr.forEach((item) => {
        if (item.done === false) {
          console.log(item);
          item.renderTodo();
          item.showTodo();
        } else {
          item.renderTodo();
          item.hideTodo();
        }
      });
    }
    // done
    if (this.#done === true) {
      arr.forEach((item) => {
        if (item.done === true) {
          item.renderTodo();
          item.showTodo();
        } else {
          item.renderTodo();
          item.hideTodo();
        }
      });
    }
  }

  //Fügt ein neues Todo der Liste hinzu
  #addTodo(strg = "") {
    let todoText;
    if (strg !== "") {
      todoText = strg;
    } else {
      todoText = document.querySelector("#newTodoText").value;
    }
    if (todoText === "") return;
    this.#todosArr.push(new Todo(todoText));
    //Löscht den Text nach dem einfügen und stellt
    //den ursprünglichen Zustand der Text-Box wieder her
    document.querySelector("#newTodoText").value = "";
    this.#saveAppStatus(this.#todosArr);
    this.#renderApp(this.#todosArr);
  }

  //Löscht die Todos mit dem Status done = true
  #removeTodos(arr) {
    let result = [];
    let delTodo;
    for (let i = 0; i < arr.length; i++) {
      delTodo = arr[i];
      if (delTodo.done === false) {
        result.push(delTodo);
      } else {
        delTodo.removeTodo();
      }
    }
    this.#todosArr = [...result];
  }

  //Speichert den Zustand der App im local storage
  #saveAppStatus(input) {
    let arr = [...input];
    let status;
    //Erzeugt ein Array, das die Daten
    //(Test, done-Status und Id) enthält
    arr.forEach((item) => {
      item.text = item.todoText;
      item.doneState = item.done;
      item.uui = item.todoId;
    });
    //Wandelt das Array in ein JSON Objekt um und speichert es
    localStorage.setItem(this.#saveTodos, JSON.stringify(arr));
    console.log(status);
    //Erzeugt ein Objekt, dass den Staus
    // der RadioButtons speichert
    status = {
      all: this.#all,
      open: this.#open,
      done: this.#done,
    };
    // Speichert den Zustand der Buttons im local Storage
    localStorage.setItem(this.#saveApp, JSON.stringify(status));
  }

  // Initialisiert die App nach der Instanzierung
  initialize() {
    const addBtn = document.querySelector("#addBtn");
    const removeDoneBtn = document.querySelector("#removeDoneBtn");
    const allRadioBtn = document.querySelector("#all");
    const openRadioBtn = document.querySelector("#open");
    const doneRadioBtn = document.querySelector("#done");
    // Event Listener für den "Add" Button ruft die add Todo
    // Funktion auf
    addBtn.addEventListener("click", () => {
      this.#addTodo();
    });

    // Eigener Event listener, der feuert, wenn sich der done-Status der
    // Todos ändert um die Darstellung auf dem Bildschirm zu aktualisieren
    addEventListener(
      "changeDone",
      () => {
        this.#saveAppStatus(this.#todosArr);
        this.#renderApp(this.#todosArr);
      },
      false
    );

    //Event Listener für den "Remove done Todos" Button
    // Ruft removeTodos() auf
    removeDoneBtn.addEventListener("click", () => {
      this.#removeTodos(this.#todosArr);
    });

    //Event Listener für die drei Radio Buttons, die den
    //Filter für die dargestellten Todos bilden
    //Setzen jeweils die boolschen Flags für die Auswahl der
    //dargestellten Todos
    allRadioBtn.addEventListener("change", () => {
      this.#all = true;
      this.#open = false;
      this.#done = false;
      this.#saveAppStatus(this.#todosArr);
      this.#renderApp(this.#todosArr);
    });
    openRadioBtn.addEventListener("change", () => {
      this.#all = false;
      this.#open = true;
      this.#done = false;
      this.#saveAppStatus(this.#todosArr);
      this.#renderApp(this.#todosArr);
    });
    doneRadioBtn.addEventListener("change", () => {
      this.#all = false;
      this.#open = false;
      this.#done = true;
      this.#saveAppStatus(this.#todosArr);
      this.#renderApp(this.#todosArr);
    });

    //Gespeicherten AppStatus laden
    this.#loadAppData();
  }
}

// Aufruf der App über den Konstruktor
const todoApp = new TodoApp();
