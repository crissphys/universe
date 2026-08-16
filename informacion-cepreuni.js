(function(){
  'use strict';
  var profileButtons=[].slice.call(document.querySelectorAll('[data-ci-profile]'));
  var panels=[].slice.call(document.querySelectorAll('[data-ci-panel]'));
  var studentWarning=document.getElementById('ci-student-warning');
  var studentWarningDialog=studentWarning&&studentWarning.querySelector('.ci-warning-dialog');
  var studentWarningAccepted=false;
  var pendingStudentScroll=true;

  function openStudentWarning(shouldScroll){
    pendingStudentScroll=shouldScroll!==false;
    if(!studentWarning){showProfile('student',pendingStudentScroll);return}
    studentWarning.hidden=false;
    document.body.classList.add('ci-warning-open');
    window.setTimeout(function(){
      var accept=studentWarning.querySelector('[data-ci-warning-accept]');
      if(accept) accept.focus();
      else if(studentWarningDialog) studentWarningDialog.focus();
    },30);
  }

  function closeStudentWarning(){
    if(!studentWarning)return;
    studentWarning.hidden=true;
    document.body.classList.remove('ci-warning-open');
    var studentButton=document.querySelector('[data-ci-profile="student"]');
    if(studentButton) studentButton.focus();
  }

  function showProfile(profile,shouldScroll){
    panels.forEach(function(panel){
      var active=panel.getAttribute('data-ci-panel')===profile;
      panel.hidden=!active;
      if(active && profile==='family'){
        var pdf=panel.querySelector('[data-family-pdf]');
        if(pdf && !pdf.hasAttribute('src')) pdf.src=pdf.getAttribute('data-family-pdf');
      }
    });
    profileButtons.forEach(function(button){
      var active=button.getAttribute('data-ci-profile')===profile;
      button.setAttribute('aria-selected',active?'true':'false');
    });
    if(profile){
      history.replaceState(null,'','#'+(profile==='student'?'estudiante':'familia'));
      try{sessionStorage.setItem('universe_cepre_info_profile',profile)}catch(e){}
      if(shouldScroll){
        var target=document.querySelector('[data-ci-panel="'+profile+'"]');
        if(target) target.scrollIntoView({behavior:'smooth',block:'start'});
      }
    }
  }

  function resetProfile(){
    panels.forEach(function(panel){panel.hidden=true});
    profileButtons.forEach(function(button){button.setAttribute('aria-selected','false')});
    history.replaceState(null,'',location.pathname+location.search+'#elige-tu-ruta');
    document.getElementById('elige-tu-ruta').scrollIntoView({behavior:'smooth',block:'start'});
  }

  profileButtons.forEach(function(button){
    button.addEventListener('click',function(){
      var profile=button.getAttribute('data-ci-profile');
      if(profile==='student'&&!studentWarningAccepted) openStudentWarning(true);
      else showProfile(profile,true);
    });
  });
  [].slice.call(document.querySelectorAll('[data-ci-reset]')).forEach(function(button){button.addEventListener('click',resetProfile)});
  [].slice.call(document.querySelectorAll('[data-ci-warning-close]')).forEach(function(button){button.addEventListener('click',closeStudentWarning)});
  var warningAccept=document.querySelector('[data-ci-warning-accept]');
  if(warningAccept) warningAccept.addEventListener('click',function(){
    studentWarningAccepted=true;
    closeStudentWarning();
    showProfile('student',pendingStudentScroll);
  });
  document.addEventListener('keydown',function(event){
    if(event.key==='Escape'&&studentWarning&&!studentWarning.hidden) closeStudentWarning();
  });

  var docButtons=[].slice.call(document.querySelectorAll('[data-doc]'));
  var docPanels=[].slice.call(document.querySelectorAll('[data-doc-panel]'));
  docButtons.forEach(function(button){
    button.addEventListener('click',function(){
      var key=button.getAttribute('data-doc');
      docButtons.forEach(function(item){var on=item===button;item.classList.toggle('active',on);item.setAttribute('aria-selected',on?'true':'false')});
      docPanels.forEach(function(panel){
        var on=panel.getAttribute('data-doc-panel')===key;
        panel.hidden=!on;
        panel.classList.toggle('active',on);
        if(on){var frame=panel.querySelector('iframe[data-src]');if(frame && !frame.hasAttribute('src')) frame.src=frame.getAttribute('data-src')}
      });
    });
  });

  var hash=location.hash.toLowerCase();
  if(hash==='#estudiante') openStudentWarning(false);
  if(hash==='#familia'||hash==='#padres') showProfile('family',false);
})();
