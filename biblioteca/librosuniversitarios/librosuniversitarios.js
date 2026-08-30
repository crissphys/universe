(function(){
  const data=window.UNIVERSITY_BOOK_CATALOG;
  const mount=document.getElementById('catalog-sections');
  if(!data||!mount)return;
  const imageBase='/biblioteca/librosuniversitarios/assets/raymond-chang/';
  const esc=(value)=>String(value).replace(/[&<>"']/g,(char)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const books=data.sections.flatMap((section)=>section.books.map((book)=>({...book,author:section.author})));
  const sectionMarkup=data.sections.map((section,index)=>{
    const cards=section.books.map((book)=>{
      const search=`${book.title} ${book.edition} ${book.language} ${section.author}`.toLowerCase();
      return `<a class="book-card" data-language="${esc(book.language.toLowerCase())}" data-search="${esc(search)}" href="https://drive.google.com/file/d/${encodeURIComponent(book.id)}/view?usp=drive_link" target="_blank" rel="noopener noreferrer" aria-label="Abrir ${esc(book.title)}, ${esc(book.edition)}, en Google Drive"><div class="book-cover"><img src="${imageBase}${encodeURIComponent(book.image)}" alt="Portada de ${esc(book.title)}, ${esc(book.edition)}" loading="lazy"><span class="language-badge">${esc(book.language)}</span></div><div class="book-info"><span class="book-series">${esc(book.edition)} · ${esc(book.language)}</span><h4>${esc(book.title)}</h4><span class="book-open">Abrir libro <b aria-hidden="true">↗</b></span></div></a>`;
    }).join('');
    return `<div class="collection-subsection collection-subsection-${esc(section.slug)}" id="${esc(section.slug)}" aria-labelledby="${esc(section.slug)}-title"><header class="collection-subheading"><div><span>Sección ${String(index+1).padStart(2,'0')}</span><h3 id="${esc(section.slug)}-title">${esc(section.author)}</h3><p>${esc(section.description)}</p></div><strong>${section.books.length} ${section.books.length===1?'libro':'libros'}</strong></header><div class="book-grid collection-book-grid" aria-label="Libros de ${esc(section.author)}">${cards}</div></div>`;
  }).join('');
  mount.innerHTML=`<section class="catalog-collection catalog-collection-raymond-chang" aria-labelledby="raymond-chang-catalog-title"><header class="collection-heading"><div><span class="collection-number">Catálogo 01</span><h2 id="raymond-chang-catalog-title">Raymond Chang</h2><p>Química universitaria organizada por autor, coautor, edición e idioma.</p></div><span class="collection-count">${books.length} libros disponibles</span></header>${sectionMarkup}</section>`;
  const input=document.getElementById('catalog-search');
  const buttons=[...document.querySelectorAll('.language-filter')];
  const result=document.getElementById('catalog-result');
  const empty=document.getElementById('catalog-empty');
  let active='todos';
  function filter(){
    const query=(input.value||'').trim().toLowerCase();let visible=0;
    document.querySelectorAll('.book-card').forEach((card)=>{const show=(active==='todos'||card.dataset.language===active)&&(!query||card.dataset.search.includes(query));card.hidden=!show;if(show)visible++;});
    document.querySelectorAll('.collection-subsection').forEach((section)=>{section.hidden=![...section.querySelectorAll('.book-card')].some((card)=>!card.hidden);});
    result.textContent=`${visible} de ${books.length} libros`;empty.classList.toggle('is-visible',visible===0);
  }
  input.addEventListener('input',filter);
  buttons.forEach((button)=>button.addEventListener('click',()=>{active=button.dataset.language;buttons.forEach((item)=>item.classList.toggle('is-active',item===button));filter();}));
  filter();
  const loader=document.getElementById('universe-page-loader');if(loader)setTimeout(()=>loader.classList.add('hide'),180);
})();
