/* Dados fictícios do site Grão Fotografia. Nada aqui é real. */
"use strict";

const DADOS = {
  tipos: {
    casamento: {
      nome: "Casamento",
      plural: "Casamentos",
      base: 1200,
      hora: 450,
      horasMinimas: 4,
      horasMaximas: 12,
      horasPadrao: 8,
      fotosIncluidas: 300,
      fotosPadrao: 300,
      prazoDias: 45,
      frase: "Da preparação à última música. Duas pessoas fotografando quando a festa passa de 150 convidados."
    },
    ensaio: {
      nome: "Ensaio",
      plural: "Ensaios",
      base: 300,
      hora: 350,
      horasMinimas: 1,
      horasMaximas: 4,
      horasPadrao: 2,
      fotosIncluidas: 40,
      fotosPadrao: 40,
      prazoDias: 15,
      frase: "Casal, gestante, família ou retrato para trabalho. Em estúdio ou em um lugar da cidade que faça sentido para você."
    },
    evento: {
      nome: "Evento",
      plural: "Eventos",
      base: 600,
      hora: 400,
      horasMinimas: 2,
      horasMaximas: 12,
      horasPadrao: 4,
      fotosIncluidas: 120,
      fotosPadrao: 120,
      prazoDias: 20,
      frase: "Formaturas, aniversários, lançamentos e congressos. Entrega de uma seleção em 48 horas para as redes e o restante no prazo combinado."
    },
    produto: {
      nome: "Produto",
      plural: "Produto",
      base: 400,
      hora: 300,
      horasMinimas: 1,
      horasMaximas: 8,
      horasPadrao: 3,
      fotosIncluidas: 30,
      fotosPadrao: 30,
      prazoDias: 10,
      frase: "Fundo branco para catálogo ou cena montada para campanha. Preço por hora de estúdio, com tratamento de cor incluído."
    }
  },
  fotoExtra: 6,
  albuns: {
    nenhum: { nome: "Sem álbum", preco: 0 },
    pequeno: { nome: "Álbum 20x20 cm, 30 páginas", preco: 890 },
    grande: { nome: "Álbum 30x30 cm, 40 páginas", preco: 1490 }
  },
  segundoFotografoHora: 250,
  deslocamento: 350,
  parcelasMaximas: 10,
  estudio: {
    nome: "Grão Fotografia",
    endereco: "Rua da Prata, 404, Bairro do Porto, Cuiabá, MT (endereço fictício)",
    telefone: "(65) 3000-0404",
    email: "ola@grao.exemplo",
    horario: "Terça a sábado, 9h às 19h. Eventos em qualquer dia.",
    equipe: [
      { nome: "Helena Vilar", papel: "Fotógrafa principal. Casamentos e ensaios." },
      { nome: "Caio Monteiro", papel: "Fotógrafo. Eventos e fotografia de produto." }
    ]
  }
};
