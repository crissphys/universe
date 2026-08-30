(function(){
  const data=window.UNIVERSITY_BOOK_CATALOG;
  const mount=document.getElementById('catalog-sections');
  if(!data||!mount)return;
  const imageBase='/biblioteca/librosuniversitarios/assets/raymond-chang/';
  const esc=(value)=>String(value).replace(/[&<>"']/g,(char)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const cards=[];
  mount.innerHTML=data.sections.map((section,index)=>{
    const books=section.books.map((book)=>{
      const search=`${book.title} ${book.edition} ${book.language} ${section.author}`.toLowerCase();
      cards.push({language:book.language.toLowerCase(),search});
      return `<a class="book-card" data-language="${esc(book.language.toLowerCase())}" data-search="${esc(search)}" href="https://drive.google.com/file/d/${encodeURIComponent(book.id)}/view?usp=drive_link" target="_blank" rel="noopener noreferrer" aria-label="Abrir ${esc(book.title)}, ${esc(book.edition)}, en Google Drive"><div class="book-cover"><img src="${imageBase}${encodeURIComponent(book.image)}" alt="Portada de ${esc(book.title)}, ${esc(book.edition)}" loading="lazy"><span class="language-badge">${esc(book.language)}</span></div><div class="book-copy"><span class="book-author">${esc(section.author)}</span><h3>${esc(book.title)}</h3><p class="book-edition">${esc(book.edition)}</p><span class="book-open">Abrir libro <b aria-hidden="true">↗</b></span></div></a>`;
    }).join('');
    return `<section class="author-section" id="${esc(section.slug)}"><header class="author-heading"><div><span class="author-index">Sección ${String(index+1).padStart(2,'0')}</span><h2>${esc(section.author)}</h2><p>${esc(section.description)}</p></div><strong class="author-count">${section.books.length} ${section.books.length===1?'libro':'libros'}</strong></header><div class="books-grid">${books}</div></section>`;
  }).join('');
  const input=document.getElementById('catalog-search');
  const buttons=[...document.querySelectorAll('.language-filter')];
  const result=document.getElementById('catalog-result');
  const empty=document.getElementById('catalog-empty');
  let active='todos';
  function filter(){
    const query=(input.value||'').trim().toLowerCase();let visible=0;
    document.querySelectorAll('.book-card').forEach((card)=>{const show=(active==='todos'||card.dataset.language===active)&&(!query||card.dataset.search.includes(query));card.hidden=!show;if(show)visible++;});
    document.querySelectorAll('.author-section').forEach((section)=>{section.hidden=![...section.querySelectorAll('.book-card')].some((card)=>!card.hidden);});
    result.textContent=`${visible} de ${cards.length} libros`;empty.classList.toggle('is-visible',visible===0);
  }
  input.addEventListener('input',filter);
  buttons.forEach((button)=>button.addEventListener('click',()=>{active=button.dataset.language;buttons.forEach((item)=>item.classList.toggle('is-active',item===button));filter();}));
  filter();
  const loader=document.getElementById('universe-page-loader');if(loader)setTimeout(()=>loader.classList.add('hide'),180);
})();
