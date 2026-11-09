# Vistoria de segurança: Grão Fotografia

Data: 2026-11-08. Site estático de demonstração, publicado no GitHub Pages. Vistoria curta, feita antes do primeiro commit.

## Content-Security-Policy

Declarada por `<meta http-equiv="Content-Security-Policy">` em `index.html` e `404.html`:

```
default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:;
font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'
```

- Nenhum script inline, nenhum `onclick` em HTML, nenhum `style=""` em HTML. O JavaScript só altera atributos (`hidden`, `disabled`, `aria-*`, `value`) e classes; nunca usa `innerHTML` com texto digitado: todo conteúdo dinâmico entra por `textContent` ou `createElement`.
- `img-src` aceita `data:` só para a seta do `select`, embutida no CSS.
- `connect-src 'none'` impede qualquer `fetch`, `XMLHttpRequest` ou WebSocket.
- `form-action 'none'`: os três formulários (montador, pré-reserva e orçamento) nunca são submetidos a lugar algum; o JavaScript trata o `submit` e mostra o resultado na tela.
- Na `404.html`, `script-src 'none'`: a página não tem JavaScript.

## Envio de dados

Nenhum. O site não tem backend, não chama APIs, não carrega fontes, imagens ou scripts externos e não tem analytics. O único link externo é https://mileumalinhas.com.br, como texto, no rodapé. A faixa de demonstração do topo virou um ticker decorativo (só CSS, `aria-hidden`), com o aviso completo em texto oculto para leitor de tela.

## O que fica no navegador

- `localStorage`, chave única `grao-prereservas`, só quando a pessoa marca a caixa "Guardar minhas pré-reservas neste navegador". Conteúdo: lista de objetos com data, tipo de trabalho, o primeiro nome digitado e a hora em que a pré-reserva foi feita. Nada de telefone ou e-mail. O botão "Apagar todas" remove a chave. A leitura valida o formato (precisa ser uma lista de objetos com `data` em texto) e fica em `try/catch` para navegadores sem armazenamento ou com dados corrompidos.
- Nenhum cookie, nenhum `sessionStorage`, nenhum IndexedDB.
- O pacote montado e o pedido de orçamento ficam só em memória e somem ao recarregar.

## Dependências

Nenhuma em tempo de execução. Fontes Bodoni Moda e Manrope são arquivos `woff2` locais, licença SIL OFL, com o texto da licença em `fonts/`. As imagens do portfólio foram geradas com Pillow fora do site; as fotos do hero, do estúdio, da equipe, dos bastidores e do set de produto foram geradas por IA no Canva e são arquivos `webp` locais. Os efeitos de movimento são CSS e JavaScript próprios: nenhuma biblioteca, nenhum script de terceiros, CSP inalterada. O JavaScript novo só mexe em classes, `textContent` e `style.transform`/`style.transitionDelay` pelo CSSOM, que a CSP permite. Os testes usam Playwright só no computador de quem desenvolve; nada dele vai para o site.

## Dados fictícios

Estúdio, fotógrafos, endereço, telefone, e-mail, preços e agenda foram inventados. O telefone "(65) 3000-0404" e o e-mail "ola@grao.exemplo" (domínio reservado para exemplos) não pertencem a ninguém de propósito. Não há senha, chave ou credencial em nenhum arquivo.

## Riscos residuais

- Se a pessoa marcar "guardar" em um computador compartilhado, o primeiro nome e a data ficam visíveis para quem usar o mesmo navegador. O aviso está no texto da própria caixa e o botão de apagar fica na mesma seção.
- O calendário é uma simulação com regra fixa; um site real precisaria buscar a agenda do estúdio, o que exigiria revisar `connect-src` e tratar a resposta como dado, nunca como HTML.

## Revisão de 08/11/2026 (leva final de design)

Revisão feita depois de aplicar os design systems da leva final e encaixar as fotos geradas por IA no Canva.

- **CSP:** a política do `index.html` é a mesma de antes da leva (conferida linha a linha). Continua sem `unsafe-inline`, sem `unsafe-eval` e sem origem externa.
- **Script e estilo inline:** nenhum `<script>` inline, nenhum `<style>` e nenhum atributo `style` nas páginas. Os efeitos novos mudam só classes, `textContent` e propriedades CSS pelo CSSOM, que a CSP permite.
- **Recursos externos:** nenhum script, fonte, imagem ou folha de estilo de fora. Os únicos links externos são de navegação comum (mileumalinhas.com.br e o perfil do GitHub).
- **Bibliotecas:** nenhuma entrou. Movimento, vidro, contadores e revelação ao rolar são CSS e JavaScript escritos à mão, desligados com `prefers-reduced-motion`.
- **innerHTML:** nenhum uso no JavaScript.
- **eval e Function:** nenhum uso.
- **Armazenamento:** `localStorage` continua só com o que já existia (`grao-prereservas`), sem chave nova nesta leva.
- **Dados pessoais:** nenhum dado pessoal real entrou. Pessoas, empresas, telefones e endereços seguem fictícios. As fotos não retratam pessoas reais.
- **Imagens:** arquivos webp locais em `img/`, com `width`/`height`, `loading="lazy"` e `decoding="async"`. Nenhuma é carregada de outro domínio.
- **Testes:** `tests/site.cjs` passa em 1280x900, iPhone 13 e 320px, sem erro de console e sem rolagem horizontal.
