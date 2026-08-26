(function () {
  'use strict';

  function session(time, course, note) { return { time: time, course: course, note: note || '' }; }
  function day(name, sessions) { return { name: name, sessions: sessions }; }

  var preMorningModule1 = [
    day('Lunes', [session('07:30–10:00', 'Álgebra'), session('10:20–12:50', 'Trigonometría'), session('12:50–13:45', 'Humanidades')]),
    day('Martes', [session('07:30–10:00', 'Geometría'), session('10:20–12:50', 'Física'), session('12:50–13:45', 'Humanidades')]),
    day('Miércoles', [session('07:30–10:00', 'Álgebra'), session('10:20–12:50', 'Aritmética'), session('12:50–13:45', 'Humanidades')]),
    day('Jueves', [session('07:30–10:00', 'Geometría'), session('10:20–12:50', 'Física'), session('12:50–13:45', 'Humanidades')]),
    day('Viernes', [session('07:30–10:00', 'Química'), session('10:20–12:50', 'Aritmética'), session('12:50–13:45', 'Humanidades')]),
    day('Sábado', [session('07:30–10:00', 'Química'), session('10:20–12:50', 'Trigonometría'), session('12:50–13:45', 'Humanidades')])
  ];
  var preMorningModule2 = [
    day('Lunes', [session('07:30–10:00', 'Trigonometría'), session('10:20–12:50', 'Álgebra'), session('12:50–13:45', 'Humanidades')]),
    day('Martes', [session('07:30–10:00', 'Física'), session('10:20–12:50', 'Geometría'), session('12:50–13:45', 'Humanidades')]),
    day('Miércoles', [session('07:30–10:00', 'Aritmética'), session('10:20–12:50', 'Álgebra'), session('12:50–13:45', 'Humanidades')]),
    day('Jueves', [session('07:30–10:00', 'Física'), session('10:20–12:50', 'Geometría'), session('12:50–13:45', 'Humanidades')]),
    day('Viernes', [session('07:30–10:00', 'Aritmética'), session('10:20–12:50', 'Química'), session('12:50–13:45', 'Humanidades')]),
    day('Sábado', [session('07:30–10:00', 'Trigonometría'), session('10:20–12:50', 'Química'), session('12:50–13:45', 'Humanidades')])
  ];
  var preAfternoonModule1 = [
    day('Lunes', [session('14:25–15:20', 'Humanidades'), session('15:20–17:50', 'Álgebra'), session('18:10–20:40', 'Trigonometría')]),
    day('Martes', [session('14:25–15:20', 'Humanidades'), session('15:20–17:50', 'Geometría'), session('18:10–20:40', 'Física')]),
    day('Miércoles', [session('14:25–15:20', 'Humanidades'), session('15:20–17:50', 'Álgebra'), session('18:10–20:40', 'Aritmética')]),
    day('Jueves', [session('14:25–15:20', 'Humanidades'), session('15:20–17:50', 'Geometría'), session('18:10–20:40', 'Física')]),
    day('Viernes', [session('14:25–15:20', 'Humanidades'), session('15:20–17:50', 'Química'), session('18:10–20:40', 'Aritmética')]),
    day('Sábado', [session('14:25–15:20', 'Humanidades'), session('15:20–17:50', 'Química'), session('18:10–20:40', 'Trigonometría')])
  ];
  var preAfternoonModule2 = [
    day('Lunes', [session('14:25–15:20', 'Humanidades'), session('15:20–17:50', 'Trigonometría'), session('18:10–20:40', 'Álgebra')]),
    day('Martes', [session('14:25–15:20', 'Humanidades'), session('15:20–17:50', 'Física'), session('18:10–20:40', 'Geometría')]),
    day('Miércoles', [session('14:25–15:20', 'Humanidades'), session('15:20–17:50', 'Aritmética'), session('18:10–20:40', 'Álgebra')]),
    day('Jueves', [session('14:25–15:20', 'Humanidades'), session('15:20–17:50', 'Física'), session('18:10–20:40', 'Geometría')]),
    day('Viernes', [session('14:25–15:20', 'Humanidades'), session('15:20–17:50', 'Aritmética'), session('18:10–20:40', 'Química')]),
    day('Sábado', [session('14:25–15:20', 'Humanidades'), session('15:20–17:50', 'Trigonometría'), session('18:10–20:40', 'Química')])
  ];

  window.UNIVERSE_CEPREUNI_2027 = {
    version: 1,
    source: 'Cronogramas y horarios CEPREUNI 2027 entregados para publicación',
    cycles: {
      preuniversitario: {
        title: 'Ciclo preuniversitario 2027-1', shortTitle: 'Preuniversitario',
        startDate: '2026-08-31', planEnd: '2027-01-31', finalDate: '2027-02-07',
        endLabel: 'Una semana antes del examen final', endDateLabel: '31 enero 2027',
        schedule: {
          morning: { label: 'Turno mañana', breakLabel: 'Descanso general: 10:00–10:20', modules: { module1: preMorningModule1, module2: preMorningModule2 } },
          afternoon: { label: 'Turno tarde', breakLabel: 'Descanso general: 17:50–18:10', modules: { module1: preAfternoonModule1, module2: preAfternoonModule2 } }
        },
        evaluations: [
          { date: '2026-09-13', name: 'Primera práctica calificada', mode: 'Presencial' },
          { date: '2026-09-27', name: 'Segunda práctica calificada', mode: 'Presencial' },
          { date: '2026-10-11', name: 'Primer examen parcial', mode: 'Presencial' },
          { date: '2026-10-25', name: 'Tercera práctica calificada', mode: 'Presencial' },
          { date: '2026-11-15', name: 'Cuarta práctica calificada', mode: 'Presencial' },
          { date: '2026-11-29', name: 'Segundo examen parcial', mode: 'Presencial' },
          { date: '2026-12-13', name: 'Quinta práctica calificada', mode: 'Presencial' },
          { date: '2027-01-10', name: 'Sexta práctica calificada', mode: 'Presencial' },
          { date: '2027-01-31', name: 'Séptima práctica calificada', mode: 'Presencial' },
          { date: '2027-02-06', name: 'Prueba de aptitud vocacional', mode: 'Según especialidad' },
          { date: '2027-02-07', name: 'Examen final', mode: 'Presencial' }
        ]
      },
      basico: {
        title: 'Ciclo básico 2027-1', shortTitle: 'Básico',
        startDate: '2026-08-31', planEnd: '2027-01-31', finalDate: '2027-01-31',
        endLabel: 'Última evaluación calificada', endDateLabel: '31 enero 2027',
        schedule: {
          morning: { label: 'Turno mañana', breakLabel: 'Lunes a viernes: 10:00–10:20 · Sábado: 10:15–10:35', modules: { module1: [
            day('Lunes', [session('08:10–11:15', 'Aritmética'), session('11:15–12:10', 'Aritmética (RM)')]),
            day('Martes', [session('08:10–11:15', 'Álgebra'), session('11:15–12:10', 'Álgebra (RM)')]),
            day('Miércoles', [session('08:10–12:10', 'Física')]), day('Jueves', [session('08:10–12:10', 'Química')]),
            day('Viernes', [session('08:10–11:15', 'Trigonometría'), session('11:15–12:10', 'Trigonometría (RM)')]),
            day('Sábado', [session('07:30–09:20', 'Razonamiento verbal'), session('09:20–10:15', 'Geometría (RM)'), session('10:35–13:20', 'Geometría')])
          ] } },
          afternoon: { label: 'Turno tarde', breakLabel: 'Lunes a viernes: 17:50–18:10 · Sábado: 17:10–17:30', modules: { module1: [
            day('Lunes', [session('16:00–19:05', 'Aritmética'), session('19:05–20:00', 'Aritmética (RM)')]),
            day('Martes', [session('16:00–19:05', 'Álgebra'), session('19:05–20:00', 'Álgebra (RM)')]),
            day('Miércoles', [session('16:00–20:00', 'Física')]), day('Jueves', [session('16:00–20:00', 'Química')]),
            day('Viernes', [session('16:00–19:05', 'Trigonometría'), session('19:05–20:00', 'Trigonometría (RM)')]),
            day('Sábado', [session('14:25–17:10', 'Geometría'), session('17:30–18:25', 'Geometría (RM)'), session('18:25–20:15', 'Razonamiento verbal')])
          ] } }
        },
        evaluations: [
          { date: '2026-09-13', name: 'Primera evaluación calificada', mode: 'Presencial' },
          { date: '2026-09-27', name: 'Segunda evaluación calificada', mode: 'Presencial' },
          { date: '2026-10-11', name: 'Tercera evaluación calificada', mode: 'Presencial' },
          { date: '2026-10-25', name: 'Cuarta evaluación calificada', mode: 'Presencial' },
          { date: '2026-11-15', name: 'Quinta evaluación calificada', mode: 'Presencial' },
          { date: '2026-11-29', name: 'Sexta evaluación calificada', mode: 'Presencial' },
          { date: '2026-12-13', name: 'Séptima evaluación calificada', mode: 'Presencial' },
          { date: '2027-01-10', name: 'Octava evaluación calificada', mode: 'Presencial' },
          { date: '2027-01-31', name: 'Novena evaluación calificada', mode: 'Presencial' }
        ]
      },
      ien: {
        title: 'Ciclo IEN 2027', shortTitle: 'IEN',
        startDate: '2026-07-06', planEnd: '2026-11-22', finalDate: '2026-11-29',
        endLabel: 'Una semana antes del examen final', endDateLabel: '22 noviembre 2026',
        schedule: {
          morning: { label: 'Turno mañana', breakLabel: 'Bloque principal: 09:50–10:10 · Humanidades virtual: 17:50–18:10', modules: { module1: [
            day('Lunes', [session('08:00–12:00', 'Aritmética', 'Descanso 09:50–10:10')]), day('Martes', [session('08:00–12:00', 'Álgebra', 'Descanso 09:50–10:10')]),
            day('Miércoles', [session('08:00–12:00', 'Física', 'Descanso 09:50–10:10')]), day('Jueves', [session('08:00–12:00', 'Química', 'Descanso 09:50–10:10')]),
            day('Viernes', [session('08:00–12:00', 'Trigonometría', 'Descanso 09:50–10:10')]),
            day('Sábado', [session('08:00–12:00', 'Geometría', 'Descanso 09:50–10:10'), session('16:00–20:00', 'Humanidades', 'Virtual · descanso 17:50–18:10')])
          ] } },
          afternoon: { label: 'Turno tarde', breakLabel: 'Humanidades virtual: 09:50–10:10 · Bloque principal: 17:50–18:10', modules: { module1: [
            day('Lunes', [session('16:00–20:00', 'Aritmética', 'Descanso 17:50–18:10')]), day('Martes', [session('16:00–20:00', 'Álgebra', 'Descanso 17:50–18:10')]),
            day('Miércoles', [session('16:00–20:00', 'Física', 'Descanso 17:50–18:10')]), day('Jueves', [session('16:00–20:00', 'Química', 'Descanso 17:50–18:10')]),
            day('Viernes', [session('16:00–20:00', 'Trigonometría', 'Descanso 17:50–18:10')]),
            day('Sábado', [session('08:00–12:00', 'Humanidades', 'Virtual · descanso 09:50–10:10'), session('16:00–20:00', 'Geometría', 'Descanso 17:50–18:10')])
          ] } }
        },
        evaluations: [
          { date: '2026-08-16', name: 'Primera autoevaluación', mode: 'Virtual' },
          { date: '2026-09-20', name: 'Examen parcial', mode: 'Presencial' },
          { date: '2026-10-25', name: 'Segunda autoevaluación', mode: 'Virtual' },
          { date: '2026-11-29', name: 'Examen final', mode: 'Presencial o virtual, según modalidad' }
        ]
      }
    }
  };
})();
