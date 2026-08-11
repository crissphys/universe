(function () {
  "use strict";

  var source = window.UNIVERSE_ADMISSION_MATH_FREQUENCY || {};
  var courses = Array.isArray(source.courses) ? source.courses : [];
  var grid = document.getElementById("ufa-grid");
  var filter = document.getElementById("ufa-course-filter");
  var topicCount = document.getElementById("ufa-topic-count");
  var occurrenceCount = document.getElementById("ufa-occurrence-count");

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function totalOccurrences(items) {
    return items.reduce(function (sum, item) { return sum + item.count; }, 0);
  }

  function topicMarkup(topic, index, maxCount) {
    var width = maxCount ? Math.max(5, Math.round((topic.count / maxCount) * 100)) : 5;
    var hiddenClass = index >= 10 ? " ufa-topic--extra" : "";
    return '<li class="ufa-topic' + hiddenClass + '">' +
      '<span class="ufa-topic-rank">' + String(index + 1).padStart(2, "0") + '</span>' +
      '<div class="ufa-topic-body"><div class="ufa-topic-line"><b>' + escapeHtml(topic.topic) + '</b>' +
      '<span class="ufa-topic-count">' + topic.count + ' apariciones</span></div>' +
      '<div class="ufa-topic-bar" aria-hidden="true"><i style="width:' + width + '%"></i></div>' +
      '<small>Tema ' + topic.topicNumber + ' del temario · presente en ' + topic.exams + ' procesos</small></div></li>';
  }

  function cardMarkup(course) {
    var maxCount = course.topics.length ? course.topics[0].count : 0;
    var hasExtra = course.topics.length > 10;
    return '<article class="ufa-card" id="ficha-' + course.id + '" data-course="' + course.id + '" style="--accent:' + course.color + '">' +
      '<header class="ufa-card-head"><span class="ufa-course-mark" aria-hidden="true">' + course.short + '</span>' +
      '<div class="ufa-course-title"><span>Ficha de Matemática</span><h2>' + escapeHtml(course.name) + '</h2><p>' + escapeHtml(course.description) + '</p></div>' +
      '<div class="ufa-total"><b>' + course.topics.length + '</b><span>temas</span></div></header>' +
      '<div class="ufa-card-guide"><span>Prioridad</span><span>Tema y frecuencia</span></div>' +
      '<ol class="ufa-topic-list">' + course.topics.map(function (topic, index) { return topicMarkup(topic, index, maxCount); }).join("") + '</ol>' +
      (hasExtra ? '<button class="ufa-expand" type="button" aria-expanded="false"><span>Ver todos los temas</span><b>+' + (course.topics.length - 10) + '</b></button>' : '<div class="ufa-complete">Todos los temas del curso están visibles</div>') +
      '</article>';
  }

  function render() {
    if (!grid) return;
    grid.innerHTML = courses.map(cardMarkup).join("");
    if (topicCount) topicCount.textContent = courses.reduce(function (sum, course) { return sum + course.topics.length; }, 0);
    if (occurrenceCount) occurrenceCount.textContent = courses.reduce(function (sum, course) { return sum + totalOccurrences(course.topics); }, 0);
  }

  function setFilter(courseId) {
    document.querySelectorAll(".ufa-filter").forEach(function (button) {
      button.classList.toggle("active", button.getAttribute("data-course-target") === courseId);
    });
    document.querySelectorAll(".ufa-card").forEach(function (card) {
      card.hidden = courseId !== "all" && card.getAttribute("data-course") !== courseId;
    });
  }

  render();

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
