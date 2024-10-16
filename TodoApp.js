// Die eigentliche App als singleton Klasse
import { Todo } from "./Todo.js";
export class TodoApp {
  //Main Array, enthält die Todos die in der App
  //gerendert werden
  #todos;
  #todosUlOutput;
  #allFilters;
  #createDate;
  #appState;

  constructor() {
    this.#init();
  }
  //Speichert den Status der App (Filter und Offline Status)
  #saveAppStatus() {
    let appStateAct = {
      filter: this.#appState.filter,
      offline: this.#appState.offline,
    };
    localStorage.setItem("appState", JSON.stringify(appStateAct));
  }
  // Speichert die Todos im local Storage
  #saveTodosLocal() {
    let jsonTodos = [];

    for (let item of this.#todos) {
      jsonTodos.push({
        description: item.description,
        done: item.done,
        id: item.todoId,
      });
    }
    localStorage.setItem("todosState", JSON.stringify(jsonTodos));
  }

  // Lädt den Status der App und aktualisiert die App
  #loadAppStatus() {
    this.#appState = JSON.parse(localStorage.getItem("appState")) || {
      filter: "all",
      offline: false,
    };
    console.log(this.#appState);
    this.#filterTodos();
    this.#renderTodos();
  }

  // Lädt die im local storage gespeicherten Todos
  #loadTodosLocal() {
    let result = JSON.parse(localStorage.getItem("todosState")) || [];

    for (let item of result) {
      if (result.length > 0) {
        this.#todos.push(new Todo(item.description, item.done, item.id));
      }
    }
    this.#saveAppStatus();
    this.#filterTodos();
    this.#renderTodos();
  }

  //Speichert ein neues Todo auf dem Server
  async #saveTodoOnServer(newTodo, saveLocal) {
    try {
      await fetch("http://localhost:3000/todos", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(newTodo),
      })
        .then((res) => res.json())
        .then((newTodoFromAPI) => {
          this.#todos.push(
            new Todo(
              newTodoFromAPI.description,
              newTodoFromAPI.done,
              newTodoFromAPI.id
            )
          );
          this.#saveTodosLocal();
          this.#appState.filter = "all";
          this.#saveAppStatus();
          this.#filterTodos();
          this.#renderTodos();
        });
      // Falls der Server Zugriff nicht möglich ist, wird das
      // Todo nur lokal gespeichert. Die boolsche Variable savelocal
      // steuert ob diese lokale Speicherung durchgeführt wird
    } catch (error) {
      this.#appState.offline = true;
      this.#saveAppStatus();
      console.log(
        "Server konnte nicht gefunden werden, speichere Todos lokal!"
      );
      if (saveLocal === false) return;
      this.#todos.push(new Todo(newTodo.description, newTodo.done));
      this.#saveTodosLocal();
      this.#appState.filter = "all";
      this.#saveAppStatus();
      this.#filterTodos();
      this.#renderTodos();
    }
  }

  // Lädt die Todos vom Server. Ist kein Serverzugriff möglich,
  // werden die Todos aus dem lokalen Speicher geladen
  async #loadTodosFromServer() {
    try {
      await fetch("http://localhost:3000/todos")
        .then((request) => request.json())
        .then((todos) => {
          console.log(todos);
          for (let item of todos) {
            if (todos.length > 0) {
              this.#todos.push(new Todo(item.description, item.done, item.id));
            }
          }
          this.#saveTodosLocal();
          this.#filterTodos();
          this.#renderTodos();
        });
    } catch (error) {
      this.#appState.offline = true;
      this.#saveAppStatus();
      //console.log(error);
      this.#loadTodosLocal();
      console.log("Server konnte nicht gefunden werden, lade Todos lokal!");
    }
  }

  //Erzeugt ein Date Objekt und fügt es in das Todo ein
  #addDate(obj) {
    if (obj === undefined) return;
    this.#saveTodosLocal();
    this.#renderTodos();
  }

  // Zeigt die Dropdowns für die Dateeingabe in Abhängigkeit von
  // der "Need any deadline" Checkbox an
  #showDateForm(e) {
    this.#createDate.style.visibility = "hidden";
    if (e.target.checked) this.#createDate.style.visibility = "";
  }

  // Entfernt das Todo mit der id  "id" vom Server
  async #removeTodofromServer(id) {
    let serverUrl = "http://localhost:3000/todos/" + id;
    console.log(id);
    try {
      await fetch(serverUrl, {
        method: "DELETE",
      }).then((res) => res.json());
    } catch (error) {
      this.#appState.offline = true;
      this.#saveAppStatus();
      console.log(
        "Server konnte nicht gefunden werden, löschen nur lokal möglich"
      );
    }
  }

  //Löscht die erledigten Todos mittels des Buttons "Remove done Todos"
  #removeTodos() {
    let delTodos;
    delTodos = this.#todos.filter((item) => item.done === true);
    this.#todos = this.#todos.filter((item) => item.done === false);
    delTodos.forEach((item) => {
      if (item.todoId !== null) {
        console.log(item);
        this.#removeTodofromServer(item.todoId);
      }
      item.deleteTodo();
    });

    this.#saveTodosLocal();
    this.#renderTodos();
  }

  // Speichert die geänderten Eigenschaften eines Todos auf dem Server
  async #updateTodoOnServer(id, description, done) {
    let serverUrl = "http://localhost:3000/todos/" + id;
    const updatedTodo = { description: description, done: done };
    console.log(serverUrl);
    try {
      await fetch(serverUrl, {
        method: "PUT",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(updatedTodo),
      }); //.then((res) => res.json());
    } catch (error) {
      this.#appState.offline = true;
      this.#saveAppStatus();
      console.log(
        "Keine Verbindung zum Server möglich, update nur local möglich!"
      );
    }
  }

  // Setzt die Eigenschaft done mittels der Todo Checkbox und
  // aktualisiert diese auf dem Server
  #updateTodo(e) {
    if (e.target.checked) {
      e.target.todoElement.done = true;
    } else {
      e.target.todoElement.done = false;
    }
    if (e.target.todoElement.todoId !== null) {
      console.log("Halloo0");
      this.#updateTodoOnServer(
        e.target.todoElement.todoId,
        e.target.todoElement.description,
        e.target.todoElement.done
      );
    }
    this.#saveTodosLocal();
    this.#filterTodos();
  }

  //Ruft die Todo Methode create auf, diese fügt das Todo
  // in das DOM ein
  #createItem(item) {
    item.createTodo();
  }

  // Steuert die Darstellung der Todos mittels der RadioButtons
  //( all,open, done). Nutzt dafür die Todo Methode show bzw. hide todo
  #filterTodos() {
    console.log(this.#appState.filter);
    const checkedRadio = this.#allFilters.querySelector(
      `#${this.#appState.filter}`
    );
    checkedRadio.checked = true;

    if (this.#appState.filter === "done") {
      console.log(this.#appState.filter);
      this.#todos.forEach((item) => {
        if (item.done === true) {
          item.showTodo();
        } else {
          item.hideTodo();
        }
      });
    } else if (this.#appState.filter === "open") {
      this.#todos.forEach((item) => {
        console.log(this.#appState.filter);
        if (item.done === false) {
          item.showTodo();
        } else {
          item.hideTodo();
        }
      });
    } else if (this.#appState.filter === "all") {
      console.log(this.#appState.filter);
      this.#todos.forEach((item) => {
        item.showTodo();
      });
    }

    this.#renderTodos();
  }

  // Setzt den Filter mittels der Radio Buttons. Der Filter
  //wird über das Parent Element ermittelt, dieser gibt die Id
  //zurück. Die Id trägt die Bezeichnung des Filters("all", "done" "open")
  #setFilter(e) {
    this.#appState.filter = e.target.id;
    this.#saveAppStatus();
    this.#filterTodos();
  }

  // Stellt das Todo auf dem Bildschirm dar, indem es im DOM appended wird.
  // Dafür sorgt die Methode createItem
  #renderTodos(input = this.#todos) {
    this.#todosUlOutput.innerHTML = "";
    input.forEach((item) => this.#createItem(item));
  }

  // Erzeugt ein neues Todo, in Abhängigkeit vom Inhalt des "What's up" Feldes.
  // Getriggert wird die Methose durch den  Add Button
  addTodo() {
    const description = document.querySelector("#new-todo-text");
    if (description.value === "") return;
    this.#saveTodoOnServer(
      {
        description: description.value,
        done: false,
      },
      true
    );
    description.value = "";
    description.focus();
  }

  // Legt die Dropdown Elemente für die Eingabe eines Todo Datums an
  #initDate() {
    const allMonths = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const day = document.querySelector("#day");
    const month = document.querySelector("#month");
    const year = document.querySelector("#year");
    const thisYear = new Date().getFullYear();

    for (let i = 1; i < 32; i++) {
      const option = document.createElement("option");
      option.value = i - 1;
      if (i < 10) {
        const content = document.createTextNode("0" + i + ".");
        day.appendChild(option).appendChild(content);
      } else {
        const content = document.createTextNode(i + ".");
        day.appendChild(option).appendChild(content);
      }
    }

    for (let i = 0; i < 12; i++) {
      const option = document.createElement("option");
      option.value = i;
      const content = document.createTextNode(allMonths[i]);
      month.appendChild(option).appendChild(content);
    }

    for (let i = thisYear; i < thisYear + 11; i++) {
      const option = document.createElement("option");
      option.value = i;
      const content = document.createTextNode(i + "");
      year.appendChild(option).appendChild(content);
    }
  }

  //Holt alle Ids der momentan auf dem Server gespeicherten
  // Todos und gibt diese als Array zurück. Im Fehlerfall wird
  // null zurück gegeben.
  async #getAllIdsFromServer() {
    let result = [];
    try {
      await fetch("http://localhost:3000/todos")
        .then((request) => request.json())
        .then((todos) => {
          for (let item of todos) {
            if (todos.length > 0) {
              result.push(item.id);
            }
          }
        });
      return result;
    } catch (error) {
      return null;
    }
  }
  // Löscht sämtliche Todos vom Server
  async #clearServer(allIds) {
    let flag = true;
    for (let item of allIds) {
      let serverUrl = "http://localhost:3000/todos/" + item;
      try {
        await fetch(serverUrl, {
          method: "DELETE",
        }).then((res) => res.json());
      } catch (error) {
        flag = false;
      }
    }
    return flag;
  }

  //Falls die App offline war, sorgt die Methode dafür
  // alle im local Storage gespeicherten Todos auf dem
  // geleerten Server zu speichern
  async #updateServer(offlineState) {
    let jsTodos = [];
    console.log(offlineState);
    for (let item of offlineState) {
      const newTodo = {
        description: item.description,
        done: item.done,
      };
      console.log(newTodo);
      try {
        await fetch("http://localhost:3000/todos", {
          method: "POST",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify(newTodo),
        })
          .then((res) => res.json())
          .then((newTodoFromAPI) => {
            jsTodos.push({
              description: newTodoFromAPI.description,
              done: newTodoFromAPI.done,
              id: newTodoFromAPI.id,
            });
          });
      } catch (error) {}
    }
    console.log(jsTodos);
    localStorage.setItem("todosState", JSON.stringify(jsTodos));
  }

  // Synchronisiert die App mit dem Server, falls sie offline war
  async #syncWithServer() {
    let offlineState = JSON.parse(localStorage.getItem("todosState"));
    let allIds = await this.#getAllIdsFromServer();
    if (allIds === null) return;

    localStorage.removeItem("todosState");
    console.log(offlineState);
    await this.#clearServer(allIds);
    //if ((await this.#clearServer(allIds)) === false) console.log("return");

    await this.#updateServer(offlineState);
    this.#todos = [];

    await this.#loadTodosFromServer();
    console.log(this.#todos);
  }
  // Die Init Funktion erstellt die Event-Callbackstruktur der App
  // und initialisiert diverse Variablen
  #init() {
    this.#todos = [];

    this.#appState = { filter: "all", offline: "false" };

    const addBtn = document.querySelector("#add-btn");
    addBtn.addEventListener("click", () => {
      this.addTodo();
    });
    this.#todosUlOutput = document.querySelector("#todos-output");
    this.#todosUlOutput.addEventListener("click", (e) => {
      this.#updateTodo(e);
    });
    this.#allFilters = document.querySelector("#filter-container");
    this.#allFilters.addEventListener("change", (e) => {
      this.#setFilter(e);
    });
    const removeBtn = document.querySelector("#remove-done-btn");
    removeBtn.addEventListener("click", () => {
      this.#removeTodos();
    });
    //Date Eingabe Form verstecken
    this.#createDate = document.querySelector("#create-date-container");
    this.#createDate.addEventListener("change", (e) => {
      this.#addDate(e.target);
    });
    this.#createDate.style.visibility = "hidden";
    const dateCheckbox = document.querySelector("#date-checkbox");
    dateCheckbox.addEventListener("change", (e) => {
      this.#showDateForm(e);
    });

    this.#initDate();

    // Programm State laden
    this.#loadAppStatus();
    if (this.#appState.offline === true) {
      this.#syncWithServer();
      this.#appState.offline = false;
      this.#saveAppStatus();
    }
    this.#loadTodosFromServer();
  }
}
