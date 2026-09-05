const fs = require('node:fs');
const path = require('node:path');

const file = path.resolve(__dirname, '..', 'avc-decision-tree.ts');
let src = fs.readFileSync(file, 'utf8');

function swap(oldText, newText, label) {
  if (!src.includes(oldText)) throw new Error(`${label}: trecho esperado não encontrado`);
  src = src.replace(oldText, newText);
}

swap(
`        { id: "codigo_avc_acionado", label: "Código AVC acionado", kind: "confirm" },
        { id: "neurologia_acionada", label: "Neurologia acionada", kind: "confirm" },
        { id: "imagem_acionada", label: "Equipe de imagem acionada", kind: "confirm" },`,
`        { id: "codigo_avc_acionado", label: "Código AVC", kind: "choice", options: [
          { id: "acionado", label: "Acionado", value: "acionado" },
          { id: "pendente", label: "Pendente", value: "pendente" },
          { id: "indisponivel", label: "Fluxo institucional indisponível", value: "indisponivel" },
        ] },
        { id: "neurologia_acionada", label: "Neurologia", kind: "choice", options: [
          { id: "acionada", label: "Acionada", value: "acionada" },
          { id: "pendente", label: "Pendente", value: "pendente" },
          { id: "indisponivel", label: "Indisponível — escalonamento/transferência necessário", value: "indisponivel" },
        ] },
        { id: "imagem_acionada", label: "Equipe de imagem", kind: "choice", options: [
          { id: "acionada", label: "Acionada", value: "acionada" },
          { id: "pendente", label: "Pendente", value: "pendente" },
          { id: "indisponivel", label: "Indisponível no serviço", value: "indisponivel" },
        ] },`,
'acionamentos iniciais');

swap(
`        { id: "monitor_instalado", label: "Monitorização instalada", kind: "confirm" },`,
`        { id: "monitor_instalado", label: "Monitorização", kind: "choice", options: [
          { id: "instalada", label: "Instalada", value: "instalada" },
          { id: "pendente", label: "Pendente", value: "pendente" },
          { id: "indisponivel", label: "Indisponível neste momento", value: "indisponivel" },
        ] },`,
'monitorização inicial');

swap(
`        { id: "neurorradio_acionada", label: "Neurorradiologia intervencionista acionada", kind: "confirm" },`,
`        { id: "neurorradio_acionada", label: "Neurorradiologia intervencionista", kind: "choice", options: [
          { id: "acionada", label: "Acionada", value: "acionada" },
          { id: "pendente", label: "Pendente", value: "pendente" },
          { id: "indisponivel", label: "Indisponível — transferência necessária", value: "indisponivel" },
        ] },`,
'neurorradiologia');

swap(
`        { id: "hic_neurocirurgia_acionada", label: "Neurocirurgia acionada", kind: "confirm" },`,
`        { id: "hic_neurocirurgia_acionada", label: "Neurocirurgia", kind: "choice", options: [
          { id: "acionada", label: "Acionada", value: "acionada" },
          { id: "pendente", label: "Pendente", value: "pendente" },
          { id: "indisponivel", label: "Indisponível — transferência/escalonamento necessário", value: "indisponivel" },
        ] },`,
'neurocirurgia');

fs.writeFileSync(file, src);
console.log('AVC: ações de acionamento agora registram feito, pendente ou indisponível.');
