(function () {
  "use strict";

  var source = window.UNIVERSE_ADMISSION_FREQUENCY || {};
  var courses = Array.isArray(source.courses) ? source.courses : [];
  var groups = {
    matematica: {
      label: "Examen de Matemática",
      shortLabel: "Matemática",
      description: "Aritmética, Álgebra, Geometría y Trigonometría, cada una en su propia fija."
    },
    ciencias: {
      label: "Examen de Física y Química",
      shortLabel: "Física y Química",
      description: "Los temas oficiales de Física y Química ordenados por recurrencia histórica."
    },
    humanidades: {
      label: "Examen de Aptitud Académica y Humanidades",
      shortLabel: "Aptitud y Humanidades",
      description: "Razonamiento Matemático, Razonamiento Verbal y todos los cursos de Humanidades."
    }
  };
  var activeGroup = "matematica";
  var activeCourse = "all";
  var grid = document.getElementById("ufa-grid");
  var filter = document.getElementById("ufa-course-filter");
  var examTabs = document.getElementById("ufa-exam-tabs");
  var topicCount = document.getElementById("ufa-topic-count");
  var courseCount = document.getElementById("ufa-course-count");
  var title = document.getElementById("ufa-title");
  var description = document.getElementById("ufa-description");
  var summary = document.getElementById("ufa-summary");

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function plural(value, singular, pluralForm) {
    return value === 1 ? singular : pluralForm;
  }

  function topicMarkup(topic, index, maxCount) {
    var width = maxCount ? Math.max(4, Math.round((topic.count / maxCount) * 100)) : 0;
    var hiddenClass = index >= 10 ? " ufa-topic--extra" : "";
    var countLabel = topic.count ? topic.count + " " + plural(topic.count, "aparición", "apariciones") : "Sin registros confiables";
    var examLabel = topic.exams ? "presente en " + topic.exams + " " + plural(topic.exams, "proceso", "procesos") : "sin aparición confiable registrada";
    return '<li class="ufa-topic' + hiddenClass + '">' +
      '<span class="ufa-topic-rank">' + String(index + 1).padStart(2, "0") + '</span>' +
      '<div class="ufa-topic-body"><div class="ufa-topic-line"><b>' + escapeHtml(topic.topic) + '</b>' +
      '<span class="ufa-topic-count">' + countLabel + '</span></div>' +
      '<div class="ufa-topic-bar" aria-hidden="true"><i style="width:' + width + '%"></i></div>' +
      '<small>Tema ' + topic.topicNumber + ' del temario · ' + examLabel + '</small></div></li>';
  }

  function cardMarkup(course) {
    var maxCount = course.topics.length ? course.topics[0].count : 0;
    var hasExtra = course.topics.length > 10;
    return '<article class="ufa-card" id="fija-' + course.id + '" data-course="' + course.id + '" style="--accent:' + course.color + '">' +
      '<header class="ufa-card-head"><span class="ufa-course-mark" aria-hidden="true">' + course.short + '</span>' +
      '<div class="ufa-course-title"><span>Fija por curso</span><h2>' + escapeHtml(course.name) + '</h2><p>' + escapeHtml(course.description) + '</p></div>' +
      '<div class="ufa-total"><b>' + course.topics.length + '</b><span>temas</span></div></header>' +
      '<div class="ufa-card-guide"><span>Prioridad</span><span>Tema y frecuencia</span></div>' +
      '<ol class="ufa-topic-list">' + course.topics.map(function (topic, index) { return topicMarkup(topic, index, maxCount); }).join("") + '</ol>' +
      (hasExtra ? '<button class="ufa-expand" type="button" aria-expanded="false"><span>Ver todos los temas</span><b>+' + (course.topics.length - 10) + '</b></button>' : '<div class="ufa-complete">Todos los temas del curso están visibles</div>') +
      '</article>';
  }

  function groupCourses() {
    return courses.filter(function (course) { return course.group === activeGroup; });
  }

  function renderFilters(items) {
    if (!filter) return;
    filter.innerHTML = '<button class="ufa-filter active" data-course-target="all" type="button">Todos los cursos</button>' + items.map(function (course) {
      return '<button class="ufa-filter" data-course-target="' + course.id + '" type="button">' + escapeHtml(course.name) + '</button>';
    }).join("");
  }

  function render() {
    if (!grid) return;
    var items = groupCourses();
    var groupTopicCount = items.reduce(function (sum, course) { return sum + course.topics.length; }, 0);
    activeCourse = "all";
    grid.innerHTML = items.map(cardMarkup).join("");
    renderFilters(items);
    if (title) title.textContent = groups[activeGroup].label;
    if (description) description.textContent = groups[activeGroup].description;
    if (summary) summary.textContent = items.length + " " + plural(items.length, "curso", "cursos") + " · " + groupTopicCount + " temas";
  }

  function setFilter(courseId) {
    activeCourse = courseId;
    document.querySelectorAll(".ufa-filter").forEach(function (button) {
      button.classList.toggle("active", button.getAttribute("data-course-target") === courseId);
    });
    document.querySelectorAll(".ufa-card").forEach(function (card) {
      card.hidden = courseId !== "all" && card.getAttribute("data-course") !== courseId;
    });
  }

  if (topicCount) topicCount.textContent = courses.reduce(function (sum, course) { return sum + course.topics.length; }, 0);
  if (courseCount) courseCount.textContent = courses.length;
  render();

  if (examTabs) {
    examTabs.addEventListener("click", function (event) {
      var button = event.target.closest("[data-exam-target]");
      if (!button) return;
      activeGroup = button.getAttribute("data-exam-target");
      examTabs.querySelectorAll("[data-exam-target]").forEach(function (item) {
        item.classList.toggle("active", item === button);
      });
      render();
    });
  }

  if (filter) {
    filter.addEventListener("click", function (event) {
      var button = event.target.closest("[data-course-target]");
      if (!button) return;
      setFilter(button.getAttribute("data-course-target"));
    });
  }

  if (grid) {
    grid.addEventListener("click", function (event) {
      var button = event.target.closest(".ufa-expand");
      if (!button) return;
      var card = button.closest(".ufa-card");
      var expanded = button.getAttribute("aria-expanded") === "true";
      card.classList.toggle("is-expanded", !expanded);
      button.setAttribute("aria-expanded", String(!expanded));
      button.querySelector("span").textContent = expanded ? "Ver todos los temas" : "Mostrar solo el top 10";
      button.querySelector("b").textContent = expanded ? "+" + card.querySelectorAll(".ufa-topic--extra").length : "−";
    });
  }
})();
