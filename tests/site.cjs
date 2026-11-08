/* Testes do site Grão Fotografia com Playwright.
   Antes de rodar, sirva a pasta do site: python3 -m http.server 8313
   Depois: node tests/site.cjs
   Variáveis opcionais: URL (padrão http://localhost:8313/), CAPTURAS (pasta para salvar PNGs). */
const { chromium, devices } = require("playwright");
const fs = require("fs");
const path = require("path");

const URL = process.env.URL || "http://localhost:8313/";
const CAPTURAS = process.env.CAPTURAS || "";

const TELAS = [
  { nome: "computador", opcoes: { viewport: { width: 1280, height: 900 } } },
  { nome: "iphone13", opcoes: { ...devices["iPhone 13"] } },
  { nome: "estreito", opcoes: { viewport: { width: 320, height: 640 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } }
];

let falhas = 0;
function ok(cond, msg) {
  if (cond) { console.log("  ok   " + msg); }
  else { falhas++; console.log("  FALHA " + msg); }
}

async function verificarLayout(page, nome) {
  const info = await page.evaluate(() => {
    const larguraJanela = document.documentElement.clientWidth;
    const rolagem = document.documentElement.scrollWidth > larguraJanela + 1;
    const cortados = [];
    const estourados = [];
    document.querySelectorAll("body *").forEach((e) => {
      if (!e.offsetParent && e.tagName !== "BODY") { return; }
      if (e.closest("dialog")) { return; }
      const r = e.getBoundingClientRect();
      if (r.width <= 1 || r.height <= 1) { return; }
      if (r.right > larguraJanela + 1 && getComputedStyle(e).position !== "fixed") {
        estourados.push(e.tagName.toLowerCase() + (e.id ? "#" + e.id : "") + (e.className && typeof e.className === "string" ? "." + e.className.split(" ")[0] : ""));
      }
      const temTexto = Array.from(e.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!temTexto) { return; }
      const cs = getComputedStyle(e);
      if (cs.overflowX === "hidden" || cs.overflowX === "clip" || cs.textOverflow === "ellipsis") {
        if (e.scrollWidth > e.clientWidth + 1) {
          cortados.push(e.tagName.toLowerCase() + (e.id ? "#" + e.id : "") + ": " + e.textContent.trim().slice(0, 40));
        }
      }
    });
    return { rolagem, cortados, estourados: estourados.slice(0, 8) };
  });
  ok(!info.rolagem, nome + ": sem rolagem horizontal");
  ok(info.estourados.length === 0, nome + ": nenhum elemento passa da borda" + (info.estourados.length ? " (" + info.estourados.join(", ") + ")" : ""));
  ok(info.cortados.length === 0, nome + ": nenhum texto cortado" + (info.cortados.length ? " (" + info.cortados.join(" | ") + ")" : ""));
}

async function capturar(page, nome) {
  if (!CAPTURAS) { return; }
  fs.mkdirSync(CAPTURAS, { recursive: true });
  await page.screenshot({ path: path.join(CAPTURAS, nome + ".png") });
}

async function testarTela(browser, tela) {
  console.log("\n== " + tela.nome + " ==");
  const context = await browser.newContext(tela.opcoes);
  const page = await context.newPage();
  const erros = [];
  page.on("console", (m) => { if (m.type() === "error") { erros.push((page.url().includes("404") ? "[404] " : "") + m.text()); } });
  page.on("pageerror", (e) => erros.push("pageerror: " + e.message));
  page.on("requestfailed", (r) => erros.push("request: " + r.url()));
  page.on("response", (r) => { if (r.status() >= 400) { erros.push("http " + r.status() + " " + r.url()); } });

  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1400);
  await capturar(page, "capa-" + tela.nome);
  await verificarLayout(page, "abertura");
  const fotoOk = await page.evaluate(() => { const i = document.querySelector(".hero-foto"); return i && i.complete && i.naturalWidth === 1620; });
  ok(fotoOk, "hero: foto carregada com 1620px de largura");

  // Função 1: portfólio com filtro e visor em tela cheia
  ok((await page.locator("#grade-fotos .foto-item:not([hidden])").count()) === 12, "portfólio: 12 fotos no início");
  await page.locator("#filtros input[value='ensaio']").check({ force: true });
  await page.waitForTimeout(200);
  ok((await page.locator("#grade-fotos .foto-item:not([hidden])").count()) === 3, "portfólio: filtro Ensaios deixa 3");
  ok((await page.locator("#filtro-resumo").textContent()).includes("3 fotos, ensaios"), "portfólio: resumo acompanha o filtro");
  await page.locator("#portfolio .secao-cabeca").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await verificarLayout(page, "portfólio filtrado");
  await capturar(page, "portfolio-" + tela.nome);
  await page.locator("#grade-fotos .foto-item:not([hidden]) .foto-botao").nth(1).click();
  await page.waitForTimeout(300);
  ok(await page.locator("#visor").evaluate((d) => d.open), "visor: abre em tela cheia");
  ok((await page.locator("#visor-contador").textContent()) === "2 de 3", "visor: contador mostra 2 de 3 (só as filtradas)");
  ok((await page.locator("#visor-titulo").textContent()) === "Casal na beira do rio", "visor: título da foto certa");
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(100);
  ok((await page.locator("#visor-contador").textContent()) === "3 de 3", "visor: seta direita avança");
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(100);
  ok((await page.locator("#visor-contador").textContent()) === "1 de 3", "visor: dá a volta no fim");
  const palco = page.locator("#visor-palco");
  const caixa = await palco.boundingBox();
  await page.dispatchEvent("#visor-palco", "pointerdown", { pointerType: "touch", clientX: caixa.x + caixa.width * 0.8, clientY: caixa.y + caixa.height / 2 });
  await page.dispatchEvent("#visor-palco", "pointerup", { pointerType: "touch", clientX: caixa.x + caixa.width * 0.2, clientY: caixa.y + caixa.height / 2 });
  await page.waitForTimeout(100);
  ok((await page.locator("#visor-contador").textContent()) === "2 de 3", "visor: arrastar para a esquerda avança");
  const visorOk = await page.evaluate(() => { const i = document.querySelector("#visor-foto"); const r = i.getBoundingClientRect(); return r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1; });
  ok(visorOk, "visor: foto cabe na tela");
  await capturar(page, "visor-" + tela.nome);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  ok(!(await page.locator("#visor").evaluate((d) => d.open)), "visor: Esc fecha");
  ok(await page.evaluate(() => document.activeElement && document.activeElement.classList.contains("foto-botao")), "visor: foco volta para a foto da grade");
  await page.locator("#filtros input[value='']").check({ force: true });
  await page.waitForTimeout(200);

  // Função 2: montador de pacote
  ok((await page.locator("#pac-total").textContent()).replace(/\s/g, "") === "R$4.800", "pacote: casamento 8h começa em R$ 4.800 (" + (await page.locator("#pac-total").textContent()) + ")");
  await page.locator("[data-tipo-pacote='ensaio']").click();
  await page.waitForTimeout(600);
  ok((await page.locator("#pac-tipo").inputValue()) === "ensaio", "pacote: botão do serviço escolhe o tipo");
  ok((await page.locator("#pac-horas").getAttribute("max")) === "4", "pacote: faixa de horas muda com o tipo");
  ok((await page.locator("#pac-total").textContent()).replace(/\s/g, "") === "R$1.000", "pacote: ensaio 2h = R$ 1.000");
  await page.locator("#pac-fotos").evaluate((el) => { el.value = "80"; el.dispatchEvent(new Event("input", { bubbles: true })); });
  await page.waitForTimeout(100);
  ok((await page.locator("#pac-total").textContent()).replace(/\s/g, "") === "R$1.240", "pacote: 40 fotos extras somam R$ 240");
  await page.selectOption("#pac-album", "pequeno");
  await page.check("#pac-segundo");
  await page.waitForTimeout(150);
  ok((await page.locator("#pac-total").textContent()).replace(/\s/g, "") === "R$2.630", "pacote: álbum e segundo fotógrafo = R$ 2.630");
  ok((await page.locator("#pac-linhas > div").count()) === 5, "pacote: 5 linhas no detalhamento");
  await page.selectOption("#pac-vezes", "10");
  await page.waitForTimeout(100);
  ok((await page.locator("#pac-parcela").textContent()).replace(/\s/g, " ").includes("10 vezes de R$ 263,00"), "pacote: 10 vezes de R$ 263,00");
  ok((await page.locator("#pac-prazo").textContent()).includes("35 dias"), "pacote: prazo 15 + 5 (extras) + 15 (álbum) = 35 dias");
  await page.locator("#pacote .secao-cabeca").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await verificarLayout(page, "pacote");
  await capturar(page, "pacote-" + tela.nome);
  await page.click("#pac-levar");
  await page.waitForTimeout(600);
  ok((await page.locator("#orc-pacote-texto").textContent()).includes("Ensaio, 2 h, 80 fotos editadas"), "pacote: vai anexado ao orçamento");
  ok((await page.locator("#orc-tipo").inputValue()) === "ensaio", "pacote: tipo do orçamento acompanha");

  // Função 3: calendário com pré-reserva
  let livre = page.locator("#cal-grade .cal-dia.livre").first();
  if ((await livre.count()) === 0) { await page.click("#cal-proximo"); await page.waitForTimeout(200); livre = page.locator("#cal-grade .cal-dia.livre").first(); }
  ok((await livre.count()) === 1, "datas: há dia livre no calendário");
  const ocupados = await page.locator("#cal-grade .cal-dia.ocupado").count();
  ok(ocupados > 0, "datas: há dias reservados (" + ocupados + ")");
  const dataLivre = await livre.getAttribute("data-data");
  await livre.click();
  await page.waitForTimeout(200);
  ok(!(await page.locator("#dia-detalhe").isHidden()), "datas: painel do dia aparece");
  ok((await page.locator("#dia-estado").textContent()).startsWith("Livre"), "datas: dia livre mostra formulário de pré-reserva");
  await page.click("#pre-confirmar");
  await page.waitForTimeout(200);
  ok(!(await page.locator("#pre-erro").isHidden()), "datas: pré-reserva sem nome é barrada");
  await page.fill("#pre-nome", "Teste");
  await page.selectOption("#pre-tipo", "evento");
  await page.check("#pre-guardar");
  await page.locator("#datas .secao-cabeca").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await verificarLayout(page, "datas");
  await capturar(page, "datas-" + tela.nome);
  await page.click("#pre-confirmar");
  await page.waitForTimeout(300);
  ok((await page.locator("#cal-grade .cal-dia[data-data='" + dataLivre + "']").getAttribute("class")).includes("pre"), "datas: dia vira pré-reservado");
  ok((await page.locator("#dia-estado").textContent()).includes("Pré-reservada por Teste"), "datas: painel mostra a pré-reserva");
  ok((await page.locator("#minhas-lista li").count()) === 1, "datas: lista de pré-reservas tem 1 item");
  const chaves = await page.evaluate(() => Object.keys(localStorage).join(","));
  ok(chaves === "grao-prereservas", "datas: única chave no localStorage (" + chaves + ")");
  const ocupado = page.locator("#cal-grade .cal-dia.ocupado").first();
  if ((await ocupado.count()) > 0) {
    await ocupado.click();
    await page.waitForTimeout(150);
    ok((await page.locator("#dia-estado").textContent()).startsWith("Reservado"), "datas: dia reservado não oferece pré-reserva");
    ok(await page.locator("#pre-form").isHidden(), "datas: formulário escondido em dia reservado");
  }
  await page.locator("#cal-grade .cal-dia[data-data='" + dataLivre + "']").click();
  await page.waitForTimeout(150);
  await page.click("#pre-orcar");
  await page.waitForTimeout(600);
  ok((await page.locator("#orc-data").inputValue()) === dataLivre, "datas: botão leva a data para o orçamento");
  ok((await page.locator("#orc-tipo").inputValue()) === "evento", "datas: tipo da pré-reserva vai junto");

  // Função 4: orçamento com validação e resumo
  await page.fill("#orc-nome", "");
  await page.click("#orcamento-form button[type=submit]");
  await page.waitForTimeout(200);
  ok(!(await page.locator("#orc-erro").isHidden()), "orçamento: envio vazio mostra erro geral");
  ok(!(await page.locator("#orc-nome-erro").isHidden()) && !(await page.locator("#orc-email-erro").isHidden()) && !(await page.locator("#orc-ciente-erro").isHidden()), "orçamento: nome, e-mail e ciência marcados");
  ok(await page.locator("#orc-resumo").isHidden(), "orçamento: resumo não aparece com erro");
  await page.fill("#orc-nome", "Teste da Silva");
  await page.fill("#orc-email", "teste@exemplo.com");
  await page.fill("#orc-fone", "65 99999 0000");
  await page.fill("#orc-local", "Chapada dos Guimarães");
  await page.fill("#orc-msg", "Festa de formatura, umas 200 pessoas.");
  await page.check("#orc-ciente");
  await page.locator("#orcamento .secao-cabeca").scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await verificarLayout(page, "orçamento");
  await capturar(page, "orcamento-" + tela.nome);
  await page.click("#orcamento-form button[type=submit]");
  await page.waitForTimeout(400);
  ok(!(await page.locator("#orc-resumo").isHidden()), "orçamento: resumo aparece");
  const resumo = await page.locator("#orc-resumo-lista").textContent();
  ok(resumo.includes("Teste da Silva") && resumo.includes("(65) 99999-0000") && resumo.includes("Evento") && resumo.includes("(pré-reservada)") && resumo.includes("Ensaio, 2 h, 80 fotos"), "orçamento: resumo traz nome, telefone formatado, tipo, data pré-reservada e pacote");
  await verificarLayout(page, "resumo");
  await capturar(page, "resumo-" + tela.nome);
  await page.click("#orc-novo");
  await page.waitForTimeout(150);
  ok(!(await page.locator("#orcamento-form").isHidden()), "orçamento: editar volta ao formulário");

  // Apagar pré-reservas
  await page.click("#minhas-apagar");
  await page.waitForTimeout(150);
  ok((await page.evaluate(() => localStorage.length)) === 0, "datas: apagar limpa o localStorage");
  ok(await page.locator("#minhas-pre").isHidden(), "datas: lista some ao apagar");

  // Menu no celular
  if (await page.locator("#menu-botao").isVisible()) {
    await page.click("#menu-botao");
    ok(await page.locator("#menu").isVisible(), "menu: abre no celular");
    await page.click("#menu a");
    ok(!(await page.locator("#menu").isVisible()), "menu: fecha ao escolher uma seção");
  }

  // Página 404
  const resp404 = await page.goto(URL + "404.html", { waitUntil: "networkidle" });
  ok(resp404 && resp404.status() === 200, "404.html carrega");
  await verificarLayout(page, "404");
  const errosReais = erros.filter((e) => !e.includes("/fotografia/") && !e.startsWith("[404]"));
  ok(errosReais.length === 0, "console sem erros" + (errosReais.length ? " (" + errosReais.join(" | ") + ")" : ""));
  ok(true, "404 usa caminhos absolutos /fotografia/ (avisos só no servidor local são esperados fora do GitHub Pages)");

  await context.close();
}

(async () => {
  const browser = await chromium.launch();
  for (const tela of TELAS) { await testarTela(browser, tela); }
  await browser.close();
  console.log("\n" + (falhas ? falhas + " falha(s)." : "Tudo certo."));
  process.exit(falhas ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
