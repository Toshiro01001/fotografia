/* Grão Fotografia: comportamento do site. Tudo roda no navegador; nada é enviado. */
"use strict";

(function () {
  const $ = (s, raiz) => (raiz || document).querySelector(s);
  const $$ = (s, raiz) => Array.from((raiz || document).querySelectorAll(s));
  const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  const moedaCentavos = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
  const NOMES_TIPO = { casamento: "Casamento", ensaio: "Ensaio", evento: "Evento", produto: "Fotografia de produto" };
  const CHAVE_PRE = "grao-prereservas";

  /* ---------- Menu no celular ---------- */
  const menuBotao = $("#menu-botao");
  const menu = $("#menu");
  if (menuBotao && menu) {
    menuBotao.addEventListener("click", () => {
      const aberto = menu.classList.toggle("aberto");
      menuBotao.setAttribute("aria-expanded", String(aberto));
    });
    $$("a", menu).forEach((a) => a.addEventListener("click", () => {
      menu.classList.remove("aberto");
      menuBotao.setAttribute("aria-expanded", "false");
    }));
  }

  /* ---------- Portfólio: filtro ---------- */
  const itens = $$("#grade-fotos .foto-item");
  const filtroResumo = $("#filtro-resumo");
  function aplicarFiltro(tipo) {
    let visiveis = 0;
    itens.forEach((li) => {
      const mostra = !tipo || li.dataset.tipo === tipo;
      li.hidden = !mostra;
      if (mostra) { visiveis++; }
    });
    const nome = tipo ? DADOS.tipos[tipo].plural.toLowerCase() : "todos os tipos";
    filtroResumo.textContent = visiveis + (visiveis === 1 ? " foto, " : " fotos, ") + nome + ".";
  }
  $$("#filtros input").forEach((r) => r.addEventListener("change", () => aplicarFiltro(r.value)));

  /* ---------- Categorias e rodapé: atalhos que marcam o filtro ---------- */
  $$("[data-filtro]").forEach((a) => a.addEventListener("click", () => {
    const radio = $("#filtros input[value='" + a.dataset.filtro + "']");
    if (radio && !radio.checked) { radio.checked = true; aplicarFiltro(radio.value); }
  }));

  /* ---------- Portfólio: visor em tela cheia ---------- */
  const visor = $("#visor");
  const visorFoto = $("#visor-foto");
  const visorTitulo = $("#visor-titulo");
  const visorTexto = $("#visor-texto");
  const visorContador = $("#visor-contador");
  let listaAtual = [];
  let indice = 0;
  let botaoOrigem = null;

  function fotosVisiveis() {
    return itens.filter((li) => !li.hidden).map((li) => ({
      src: $("img", li).getAttribute("src"),
      alt: $("img", li).getAttribute("alt"),
      largura: $("img", li).getAttribute("width"),
      altura: $("img", li).getAttribute("height"),
      titulo: $("figcaption strong", li).textContent,
      texto: $("figcaption span", li).textContent,
      botao: $(".foto-botao", li)
    }));
  }
  function mostrar(i) {
    const n = listaAtual.length;
    indice = ((i % n) + n) % n;
    const f = listaAtual[indice];
    visorFoto.src = f.src;
    visorFoto.alt = f.alt;
    visorFoto.width = f.largura;
    visorFoto.height = f.altura;
    visorTitulo.textContent = f.titulo;
    visorTexto.textContent = f.texto;
    visorContador.textContent = (indice + 1) + " de " + n;
  }
  function abrirVisor(botao) {
    listaAtual = fotosVisiveis();
    const i = listaAtual.findIndex((f) => f.botao === botao);
    botaoOrigem = botao;
    mostrar(i < 0 ? 0 : i);
    if (typeof visor.showModal === "function") { visor.showModal(); } else { visor.setAttribute("open", ""); }
    $("#visor-fechar").focus();
  }
  function fecharVisor() {
    if (visor.open) { visor.close(); }
  }
  itens.forEach((li) => $(".foto-botao", li).addEventListener("click", (e) => abrirVisor(e.currentTarget)));
  $("#visor-fechar").addEventListener("click", fecharVisor);
  $("#visor-anterior").addEventListener("click", () => mostrar(indice - 1));
  $("#visor-proxima").addEventListener("click", () => mostrar(indice + 1));
  visor.addEventListener("close", () => { if (botaoOrigem) { botaoOrigem.focus(); } });
  visor.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); mostrar(indice + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); mostrar(indice - 1); }
  });
  // toque: arrastar para o lado
  const palco = $("#visor-palco");
  let toqueX = null;
  palco.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") { toqueX = e.clientX; } });
  palco.addEventListener("pointerup", (e) => {
    if (toqueX === null) { return; }
    const dx = e.clientX - toqueX;
    toqueX = null;
    if (Math.abs(dx) > 40) { mostrar(dx < 0 ? indice + 1 : indice - 1); }
  });
  palco.addEventListener("pointercancel", () => { toqueX = null; });
  // clique no fundo fecha
  visor.addEventListener("click", (e) => { if (e.target === visor) { fecharVisor(); } });

  /* ---------- Montador de pacote ---------- */
  const pacTipo = $("#pac-tipo");
  const pacHoras = $("#pac-horas");
  const pacFotos = $("#pac-fotos");
  const pacAlbum = $("#pac-album");
  const pacSegundo = $("#pac-segundo");
  const pacDesloc = $("#pac-deslocamento");
  const pacVezes = $("#pac-vezes");
  let pacoteAtual = null;

  /* Pilha de cartões de amostra: a carta de trás vem para a frente quando o tipo muda */
  const AMOSTRAS = {
    casamento: ["casamento-1", "casamento-3", "casamento-4"],
    ensaio: ["ensaio-2", "ensaio-1", "ensaio-3"],
    evento: ["evento-3", "evento-1", "evento-2"],
    produto: ["servico-produto-set", "produto-1", "produto-2"]
  };
  const POSICOES = ["pilha-frente", "pilha-meio", "pilha-fundo"];
  let cartoes = $$("#pilha .pilha-cartao");
  let tipoPilha = "casamento";
  function atualizarPilha(tipo) {
    if (!cartoes.length || tipo === tipoPilha) { return; }
    tipoPilha = tipo;
    cartoes = [cartoes[2], cartoes[0], cartoes[1]];
    cartoes.forEach((c, i) => {
      c.classList.remove(...POSICOES);
      c.classList.add(POSICOES[i]);
      const img = $("img", c);
      const nome = AMOSTRAS[tipo][i];
      if (!img.getAttribute("src").endsWith(nome + ".webp")) { img.src = "img/" + nome + ".webp"; }
      $(".pilha-rotulo", c).textContent = DADOS.tipos[tipo].nome;
    });
  }

  /* Passo ativo do montador: borda em Luz de segurança no passo que a pessoa está mexendo */
  const passos = $$("#montador-passos > .campo");
  function ativarPasso(passo) {
    passos.forEach((p) => p.classList.toggle("passo-ativo", p === passo));
  }
  passos.forEach((p) => {
    p.addEventListener("focusin", () => ativarPasso(p));
    p.addEventListener("pointerdown", () => ativarPasso(p));
  });
  if (passos.length) { ativarPasso(passos[0]); }

  function ajustarFaixas(tipo) {
    atualizarPilha(tipo);
    const t = DADOS.tipos[tipo];
    pacHoras.min = t.horasMinimas;
    pacHoras.max = t.horasMaximas;
    pacHoras.value = t.horasPadrao;
    pacFotos.min = t.fotosIncluidas;
    pacFotos.max = Math.max(t.fotosIncluidas * 3, t.fotosIncluidas + 200);
    pacFotos.step = t.fotosIncluidas >= 100 ? 50 : 10;
    pacFotos.value = t.fotosPadrao;
    $("#pac-horas-ajuda").textContent = t.nome + ": de " + t.horasMinimas + " a " + t.horasMaximas + " horas" + (tipo === "produto" ? " de estúdio." : ".");
    $("#pac-fotos-ajuda").textContent = t.fotosIncluidas + " já estão incluídas. Cada foto a mais custa " + moeda.format(DADOS.fotoExtra) + ".";
  }

  function calcular() {
    const tipo = pacTipo.value;
    const t = DADOS.tipos[tipo];
    const horas = Number(pacHoras.value);
    const fotos = Number(pacFotos.value);
    const extras = Math.max(0, fotos - t.fotosIncluidas);
    const album = DADOS.albuns[pacAlbum.value];
    const linhas = [
      { nome: t.nome + ", valor base", valor: t.base },
      { nome: horas + (horas === 1 ? " hora" : " horas") + " de cobertura", valor: horas * t.hora }
    ];
    if (extras > 0) { linhas.push({ nome: extras + " fotos além das " + t.fotosIncluidas + " incluídas", valor: extras * DADOS.fotoExtra }); }
    if (album.preco) { linhas.push({ nome: album.nome, valor: album.preco }); }
    if (pacSegundo.checked) { linhas.push({ nome: "Segundo fotógrafo, " + horas + " h", valor: horas * DADOS.segundoFotografoHora }); }
    if (pacDesloc.checked) { linhas.push({ nome: "Deslocamento fora da região", valor: DADOS.deslocamento }); }
    const total = linhas.reduce((s, l) => s + l.valor, 0);
    const vezes = Number(pacVezes.value);
    const prazo = t.prazoDias + Math.ceil(extras / 100) * 5 + (album.preco ? 15 : 0);
    return { tipo, t, horas, fotos, extras, album, linhas, total, vezes, prazo, segundo: pacSegundo.checked, desloc: pacDesloc.checked };
  }

  function renderPacote() {
    const p = calcular();
    pacoteAtual = p;
    $("#pac-horas-valor").textContent = p.horas + (p.horas === 1 ? " hora" : " horas");
    $("#pac-fotos-valor").textContent = p.fotos + " fotos";
    $("#pac-total").textContent = moeda.format(p.total);
    $("#pac-parcela").textContent = p.vezes === 1
      ? "à vista"
      : "ou " + p.vezes + " vezes de " + moedaCentavos.format(p.total / p.vezes) + " sem juros";
    const dl = $("#pac-linhas");
    dl.textContent = "";
    p.linhas.forEach((l) => {
      const div = document.createElement("div");
      const dt = document.createElement("dt"); dt.textContent = l.nome;
      const dd = document.createElement("dd"); dd.textContent = moeda.format(l.valor);
      div.append(dt, dd);
      dl.append(div);
    });
    $("#pac-prazo").textContent = "Entrega da galeria completa em até " + p.prazo + " dias" + (p.album.preco ? ", álbum incluído" : "") + ".";
  }

  pacTipo.addEventListener("change", () => { ajustarFaixas(pacTipo.value); renderPacote(); });
  [pacHoras, pacFotos, pacAlbum, pacSegundo, pacDesloc, pacVezes].forEach((el) => el.addEventListener("input", renderPacote));
  $("#montador").addEventListener("submit", (e) => e.preventDefault());

  $$("[data-tipo-pacote]").forEach((b) => b.addEventListener("click", () => {
    pacTipo.value = b.dataset.tipoPacote;
    ajustarFaixas(pacTipo.value);
    renderPacote();
    $("#pacote").scrollIntoView({ behavior: prefereMenosMovimento() ? "auto" : "smooth", block: "start" });
    pacTipo.focus({ preventScroll: true });
  }));

  function descreverPacote(p) {
    const partes = [p.t.nome, p.horas + " h", p.fotos + " fotos editadas"];
    if (p.album.preco) { partes.push(p.album.nome.toLowerCase()); }
    if (p.segundo) { partes.push("segundo fotógrafo"); }
    if (p.desloc) { partes.push("com deslocamento"); }
    return partes.join(", ") + ". " + moeda.format(p.total) + (p.vezes > 1 ? " em " + p.vezes + " vezes" : " à vista") + ".";
  }

  let pacoteAnexado = null;
  $("#pac-levar").addEventListener("click", () => {
    pacoteAnexado = calcular();
    const texto = $("#orc-pacote-texto");
    texto.textContent = descreverPacote(pacoteAnexado);
    texto.classList.add("pacote-anexado");
    $("#orc-tipo").value = pacoteAnexado.tipo;
    $("#orcamento").scrollIntoView({ behavior: prefereMenosMovimento() ? "auto" : "smooth", block: "start" });
    $("#orc-nome").focus({ preventScroll: true });
  });

  /* ---------- Calendário de datas ---------- */
  const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const DIAS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const primeiroMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const ultimoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 12, 1);
  let mesVisto = new Date(primeiroMes);
  let diaEscolhido = null;
  let preReservas = [];
  let guardar = false;

  function chaveData(d) {
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function dispersao(texto) {
    let h = 2166136261;
    for (let i = 0; i < texto.length; i++) { h ^= texto.charCodeAt(i); h = Math.imul(h, 16777619); }
    return ((h >>> 0) % 1000) / 1000;
  }
  function ocupado(d) {
    const limite = [0.4, 0.12, 0.1, 0.12, 0.15, 0.35, 0.65][d.getDay()];
    return dispersao("grao-" + chaveData(d)) < limite;
  }
  function nomeData(d) {
    const nome = DIAS[d.getDay()];
    return nome.charAt(0).toUpperCase() + nome.slice(1) + ", " + d.getDate() + " de " + MESES[d.getMonth()] + " de " + d.getFullYear();
  }
  function lerPre() {
    try {
      const bruto = localStorage.getItem(CHAVE_PRE);
      if (bruto) {
        const lista = JSON.parse(bruto);
        if (Array.isArray(lista)) { preReservas = lista.filter((p) => p && typeof p.data === "string"); guardar = true; }
      }
    } catch (e) { preReservas = []; }
  }
  function salvarPre() {
    try {
      if (guardar && preReservas.length) { localStorage.setItem(CHAVE_PRE, JSON.stringify(preReservas)); }
      else { localStorage.removeItem(CHAVE_PRE); }
    } catch (e) { /* navegador sem armazenamento: segue só em memória */ }
  }
  function temPre(chave) { return preReservas.some((p) => p.data === chave); }

  function renderCalendario() {
    const grade = $("#cal-grade");
    grade.textContent = "";
    const ano = mesVisto.getFullYear(), mes = mesVisto.getMonth();
    const nomeMes = MESES[mes];
    $("#cal-mes").textContent = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1) + " de " + ano;
    $("#cal-anterior").disabled = mesVisto <= primeiroMes;
    $("#cal-proximo").disabled = new Date(ano, mes + 1, 1) >= ultimoMes;
    const primeiroDia = new Date(ano, mes, 1).getDay();
    for (let i = 0; i < primeiroDia; i++) {
      const v = document.createElement("span"); v.className = "cal-dia vazio"; v.setAttribute("aria-hidden", "true"); grade.append(v);
    }
    const total = new Date(ano, mes + 1, 0).getDate();
    for (let dia = 1; dia <= total; dia++) {
      const d = new Date(ano, mes, dia);
      const chave = chaveData(d);
      const b = document.createElement("button");
      b.type = "button";
      b.className = "cal-dia";
      b.textContent = String(dia);
      b.dataset.data = chave;
      let estado;
      if (d < hoje) { estado = "passado"; b.disabled = true; }
      else if (temPre(chave)) { estado = "pre"; }
      else if (ocupado(d)) { estado = "ocupado"; }
      else { estado = "livre"; }
      b.classList.add(estado);
      if (chave === chaveData(hoje)) { b.classList.add("hoje"); }
      if (diaEscolhido === chave) { b.classList.add("escolhido"); b.setAttribute("aria-pressed", "true"); } else { b.setAttribute("aria-pressed", "false"); }
      const rotulos = { passado: "já passou", pre: "sua pré-reserva", ocupado: "reservado", livre: "livre" };
      b.setAttribute("aria-label", nomeData(d) + ", " + rotulos[estado]);
      b.addEventListener("click", () => escolherDia(d, estado));
      grade.append(b);
    }
  }

  function escolherDia(d, estado) {
    diaEscolhido = chaveData(d);
    renderCalendario();
    $("#dia-vazio").hidden = true;
    const det = $("#dia-detalhe");
    det.hidden = false;
    $("#dia-numero").textContent = String(d.getDate());
    $("#dia-nome").textContent = nomeData(d);
    const form = $("#pre-form");
    const feito = $("#pre-feito");
    $("#pre-erro").hidden = true;
    if (estado === "livre") {
      $("#dia-estado").textContent = "Livre. Você pode segurar esta data por 48 horas enquanto conversamos.";
      form.hidden = false; feito.hidden = true;
    } else if (estado === "pre") {
      const p = preReservas.find((x) => x.data === diaEscolhido);
      $("#dia-estado").textContent = "Pré-reservada" + (p && p.nome ? " por " + p.nome : "") + (p && p.tipo ? ", para " + NOMES_TIPO[p.tipo].toLowerCase() : "") + ".";
      form.hidden = true; feito.hidden = false;
    } else {
      $("#dia-estado").textContent = "Reservado. Escolha outro dia ou peça um orçamento informando datas alternativas.";
      form.hidden = true; feito.hidden = true;
    }
  }

  $("#cal-anterior").addEventListener("click", () => { mesVisto = new Date(mesVisto.getFullYear(), mesVisto.getMonth() - 1, 1); renderCalendario(); });
  $("#cal-proximo").addEventListener("click", () => { mesVisto = new Date(mesVisto.getFullYear(), mesVisto.getMonth() + 1, 1); renderCalendario(); });

  $("#pre-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = $("#pre-nome").value.trim();
    const erro = $("#pre-erro");
    if (nome.length < 2) {
      erro.textContent = "Escreva seu primeiro nome para segurar a data.";
      erro.hidden = false;
      $("#pre-nome").setAttribute("aria-invalid", "true");
      $("#pre-nome").focus();
      return;
    }
    $("#pre-nome").removeAttribute("aria-invalid");
    erro.hidden = true;
    guardar = $("#pre-guardar").checked;
    preReservas.push({ data: diaEscolhido, nome, tipo: $("#pre-tipo").value, feitaEm: new Date().toISOString() });
    salvarPre();
    renderCalendario();
    renderMinhas();
    escolherDia(new Date(diaEscolhido + "T00:00:00"), "pre");
    $("#pre-orcar").focus();
  });

  $("#pre-orcar").addEventListener("click", () => {
    const p = preReservas.find((x) => x.data === diaEscolhido);
    $("#orc-data").value = diaEscolhido;
    if (p) { $("#orc-tipo").value = p.tipo; if (!$("#orc-nome").value) { $("#orc-nome").value = p.nome; } }
    $("#orcamento").scrollIntoView({ behavior: prefereMenosMovimento() ? "auto" : "smooth", block: "start" });
    $("#orc-nome").focus({ preventScroll: true });
  });

  function renderMinhas() {
    const bloco = $("#minhas-pre");
    const lista = $("#minhas-lista");
    lista.textContent = "";
    bloco.hidden = preReservas.length === 0;
    preReservas.slice().sort((a, b) => a.data.localeCompare(b.data)).forEach((p) => {
      const li = document.createElement("li");
      const s1 = document.createElement("span");
      s1.textContent = nomeData(new Date(p.data + "T00:00:00")) + ": " + (NOMES_TIPO[p.tipo] || "") + (p.nome ? ", " + p.nome : "");
      const s2 = document.createElement("span");
      s2.textContent = guardar ? "guardada neste navegador" : "só nesta visita";
      li.append(s1, s2);
      lista.append(li);
    });
  }
  $("#minhas-apagar").addEventListener("click", () => {
    preReservas = [];
    guardar = false;
    salvarPre();
    $("#pre-guardar").checked = false;
    renderMinhas();
    renderCalendario();
    $("#dia-detalhe").hidden = true;
    $("#dia-vazio").hidden = false;
    diaEscolhido = null;
  });

  /* ---------- Orçamento ---------- */
  const form = $("#orcamento-form");
  function marcarErro(id, mensagem) {
    const campo = $("#" + id);
    const erro = $("#" + id + "-erro");
    if (mensagem) { erro.textContent = mensagem; erro.hidden = false; campo.setAttribute("aria-invalid", "true"); campo.setAttribute("aria-describedby", id + "-erro"); }
    else { erro.hidden = true; campo.removeAttribute("aria-invalid"); campo.removeAttribute("aria-describedby"); }
    return !mensagem;
  }
  function formatarFone(v) {
    const d = v.replace(/\D/g, "");
    if (d.length === 11) { return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7); }
    if (d.length === 10) { return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6); }
    return v.trim();
  }
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = $("#orc-nome").value.trim();
    const email = $("#orc-email").value.trim();
    const fone = $("#orc-fone").value.trim();
    const data = $("#orc-data").value;
    const ciente = $("#orc-ciente").checked;
    let ok = true;
    ok = marcarErro("orc-nome", nome.length < 3 ? "Escreva seu nome completo." : "") && ok;
    ok = marcarErro("orc-email", !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "Escreva um e-mail válido, como nome@exemplo.com." : "") && ok;
    const digitos = fone.replace(/\D/g, "");
    ok = marcarErro("orc-fone", fone && (digitos.length < 10 || digitos.length > 11) ? "Telefone com DDD precisa ter 10 ou 11 números." : "") && ok;
    let erroData = "";
    if (data) {
      const d = new Date(data + "T00:00:00");
      if (isNaN(d.getTime())) { erroData = "Data inválida."; }
      else if (d < hoje) { erroData = "A data já passou. Escolha um dia a partir de hoje."; }
      else if (ocupado(d) && !temPre(data)) { erroData = "Esse dia aparece como reservado no calendário. Pode manter, mas sugerimos outra data."; }
    }
    const dataOk = marcarErro("orc-data", erroData && !erroData.startsWith("Esse dia") ? erroData : "");
    if (erroData.startsWith("Esse dia")) { const er = $("#orc-data-erro"); er.textContent = erroData; er.hidden = false; }
    ok = dataOk && ok;
    ok = marcarErro("orc-ciente", !ciente ? "Marque a caixa para continuar." : "") && ok;
    const geral = $("#orc-erro");
    if (!ok) {
      geral.textContent = "Alguns campos precisam de atenção. Veja as mensagens acima.";
      geral.hidden = false;
      const primeiro = $("[aria-invalid='true']", form);
      if (primeiro) { primeiro.focus(); }
      return;
    }
    geral.hidden = true;
    const dl = $("#orc-resumo-lista");
    dl.textContent = "";
    const linhas = [
      ["Nome", nome],
      ["E-mail", email],
      ["Telefone", fone ? formatarFone(fone) : "não informado"],
      ["Tipo de trabalho", NOMES_TIPO[$("#orc-tipo").value]],
      ["Data pretendida", data ? nomeData(new Date(data + "T00:00:00")) + (temPre(data) ? " (pré-reservada)" : "") : "a combinar"],
      ["Local", $("#orc-local").value.trim() || "a combinar"],
      ["Pacote", pacoteAnexado ? descreverPacote(pacoteAnexado) : "nenhum anexado; o estúdio sugere depois da conversa"],
      ["Mensagem", $("#orc-msg").value.trim() || "sem mensagem"]
    ];
    linhas.forEach(([k, v]) => {
      const div = document.createElement("div");
      const dt = document.createElement("dt"); dt.textContent = k;
      const dd = document.createElement("dd"); dd.textContent = v;
      div.append(dt, dd);
      dl.append(div);
    });
    form.hidden = true;
    const resumo = $("#orc-resumo");
    resumo.hidden = false;
    resumo.focus();
  });
  $("#orc-novo").addEventListener("click", () => {
    $("#orc-resumo").hidden = true;
    form.hidden = false;
    $("#orc-nome").focus();
  });

  function prefereMenosMovimento() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* ---------- Trilho de progresso da rolagem ---------- */
  const trilho = $("#prog");
  let trilhoPendente = false;
  function desenharTrilho() {
    trilhoPendente = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    trilho.style.transform = "scaleX(" + (max > 0 ? Math.min(1, window.scrollY / max) : 0).toFixed(4) + ")";
  }
  if (trilho) {
    window.addEventListener("scroll", () => { if (!trilhoPendente) { trilhoPendente = true; requestAnimationFrame(desenharTrilho); } }, { passive: true });
    window.addEventListener("resize", desenharTrilho, { passive: true });
    desenharTrilho();
  }

  /* ---------- Contadores que sobem (0 até o valor em 1,1 s, uma vez) ---------- */
  function contar(el) {
    const alvo = Number(el.dataset.contar);
    if (!alvo || prefereMenosMovimento()) { return; }
    const inicio = performance.now();
    const duracao = 1100;
    el.textContent = "0";
    function passo(agora) {
      const p = Math.min(1, (agora - inicio) / duracao);
      el.textContent = String(Math.round(alvo * (1 - Math.pow(1 - p, 3))));
      if (p < 1) { requestAnimationFrame(passo); }
    }
    requestAnimationFrame(passo);
  }
  const contadores = $$("[data-contar]");
  if ("IntersectionObserver" in window && contadores.length) {
    const obsContar = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => { if (e.isIntersecting) { obsContar.unobserve(e.target); contar(e.target); } });
    }, { threshold: 0.6 });
    contadores.forEach((c) => obsContar.observe(c));
  }

  /* ---------- Revelação ao rolar: sobe 18px com fade, 60 ms entre irmãos ---------- */
  const revelaveis = $$("#grade-fotos .foto-item, .servicos .servico, .calendario, .orcamento, .ficha");
  if ("IntersectionObserver" in window && !prefereMenosMovimento()) {
    const obsRevelar = new IntersectionObserver((entradas) => {
      const visiveis = entradas.filter((e) => e.isIntersecting);
      visiveis.forEach((e, i) => {
        e.target.style.transitionDelay = (i * 60) + "ms";
        e.target.classList.add("revelado");
        obsRevelar.unobserve(e.target);
      });
    }, { threshold: 0.15 });
    revelaveis.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { return; }
      el.classList.add("revelar");
      el.addEventListener("transitionend", () => { el.style.transitionDelay = ""; }, { once: true });
      obsRevelar.observe(el);
    });
  }

  /* ---------- Início ---------- */
  aplicarFiltro("");
  ajustarFaixas(pacTipo.value);
  renderPacote();
  lerPre();
  renderCalendario();
  renderMinhas();
  if (guardar) { $("#pre-guardar").checked = true; }
})();
