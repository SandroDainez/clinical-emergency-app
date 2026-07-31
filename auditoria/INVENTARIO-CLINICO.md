# Inventário de conteúdo clínico

> Gerado por `node scripts/inventario-clinico.cjs`. **Nenhum código foi alterado.**
> Este documento LOCALIZA conteúdo clínico. Ele não avalia se o conteúdo está
> correto — isso é a Camada 2 em diante, com as fontes em mãos.

- Arquivos varridos: **364**
- Ocorrências catalogadas: **13459**
- Módulos com conteúdo clínico: **65**

## Por módulo

| módulo | ocorrências | crítico | alto | moderado |
|---|---:|---:|---:|---:|
| (tradução) | 6029 | 2487 | 2092 | 1450 |
| pcr-adulto | 1165 | 784 | 191 | 190 |
| sepsis | 784 | 284 | 296 | 204 |
| anafilaxia | 717 | 342 | 158 | 217 |
| sepse-antimicrobianos | 437 | 254 | 17 | 166 |
| avc | 425 | 188 | 172 | 65 |
| eap | 269 | 104 | 90 | 75 |
| coronary | 238 | 93 | 69 | 76 |
| vasoactive | 236 | 204 | 24 | 8 |
| ventilation | 216 | 42 | 137 | 37 |
| sedation | 200 | 151 | 33 | 16 |
| anaphylaxis | 189 | 72 | 54 | 63 |
| dka-hhs | 187 | 49 | 52 | 86 |
| sepse | 187 | 61 | 81 | 45 |
| sepsis-antibiotic | 151 | 56 | 48 | 47 |
| guidelines-metadata | 141 | 79 | 42 | 20 |
| rsi | 137 | 46 | 74 | 17 |
| electrolyte | 118 | 47 | 30 | 41 |
| tep | 102 | 63 | 23 | 16 |
| (interface) | 95 | 52 | 29 | 14 |
| sindromes-coronarianas | 93 | 30 | 26 | 37 |
| clinical-calculators | 91 | 31 | 49 | 11 |
| acls-pharmacology | 80 | 52 | 13 | 15 |
| eclampsia | 79 | 24 | 37 | 18 |
| edema-agudo-pulmao | 75 | 32 | 26 | 17 |
| acidente-vascular-cerebral | 73 | 37 | 21 | 15 |
| sepse-adulto | 73 | 31 | 29 | 13 |
| poisoning | 61 | 28 | 13 | 20 |
| seizure | 61 | 26 | 21 | 14 |
| shock | 60 | 39 | 11 | 10 |
| (geral) | 59 | 32 | 20 | 7 |
| acls-tachycardia | 53 | 35 | 6 | 12 |
| coronary-syndromes | 48 | 10 | 0 | 38 |
| isr-rapida | 48 | 9 | 29 | 10 |
| ventilacao-mecanica | 46 | 9 | 34 | 3 |
| tce | 45 | 9 | 30 | 6 |
| ventilacao | 41 | 13 | 18 | 10 |
| politrauma | 39 | 12 | 19 | 8 |
| cetoacidose-hiperosmolar | 39 | 9 | 14 | 16 |
| cad | 34 | 13 | 8 | 13 |
| acls-protocol | 26 | 17 | 2 | 7 |
| acls-bradycardia | 25 | 9 | 9 | 7 |
| acute-abdomen | 24 | 6 | 12 | 6 |
| acls-reversible-causes | 24 | 13 | 1 | 10 |
| dyspnea | 24 | 5 | 6 | 13 |
| acls-post-rosc | 23 | 7 | 10 | 6 |
| acls-rhythms | 19 | 13 | 4 | 2 |
| acls-pregnancy | 17 | 10 | 6 | 1 |
| (navegação) | 12 | 3 | 7 | 2 |
| protocol | 11 | 3 | 7 | 1 |
| sepsis-flow | 6 | 3 | 2 | 1 |
| rsi-flow | 4 | 0 | 4 | 0 |
| shock-flow | 4 | 4 | 0 | 0 |
| seizure-flow | 3 | 0 | 2 | 1 |
| correcoes-eletroliticas | 3 | 2 | 0 | 1 |
| anafilaxia-flow | 2 | 0 | 1 | 1 |
| coronary-flow | 2 | 0 | 1 | 1 |
| tce-flow | 2 | 0 | 1 | 1 |
| paywall | 1 | 0 | 1 | 0 |
| acute-abdomen-flow | 1 | 0 | 1 | 0 |
| avc-flow | 1 | 1 | 0 | 0 |
| dka-hhs-flow | 1 | 0 | 0 | 1 |
| eap-flow | 1 | 1 | 0 | 0 |
| tep-flow | 1 | 1 | 0 | 0 |
| ventilation-flow | 1 | 0 | 1 | 0 |


> ⚠️ A coluna `módulo` vem do NOME DO ARQUIVO. O mesmo módulo clínico aparece com
> nome em português e em inglês — `sepse`/`sepsis`, `anafilaxia`/`anaphylaxis`,
> `avc`/`acidente-vascular-cerebral`, `rsi`/`isr-rapida`, `eap`/`edema-agudo-pulmao`,
> `coronary`/`sindromes-coronarianas` —, então um mesmo protocolo aparece dividido
> em duas linhas desta tabela. Isso não é defeito do inventário: é como o código
> está, e atrapalha exatamente a auditoria de consistência entre módulos (Camada
> 3), que precisa saber que dois arquivos falam do mesmo protocolo.

## Por categoria

| categoria | risco | ocorrências | módulos |
|---|---|---:|---:|
| Tempo ou janela terapêutica | alto | 2224 | 49 |
| Via de administração | moderado | 2172 | 51 |
| Sequência de ressuscitação | crítico | 1489 | 47 |
| Dose de medicamento | crítico | 1487 | 42 |
| Exame ou coleta | moderado | 1036 | 46 |
| Dose por peso | crítico | 960 | 40 |
| Critério de inclusão, exclusão ou gravidade | alto | 774 | 43 |
| Velocidade de infusão | crítico | 681 | 37 |
| Contraindicação | crítico | 457 | 36 |
| Meta hemodinâmica ou fisiológica | alto | 456 | 36 |
| Parâmetro de ventilação | alto | 449 | 21 |
| Critério de trombólise | crítico | 441 | 19 |
| Diluição ou concentração | crítico | 322 | 16 |
| Critério ou droga de intubação | alto | 311 | 31 |
| Energia de desfibrilação | crítico | 200 | 8 |

## Por camada — onde o conteúdo clínico está armazenado

| camada | ocorrências | leitura |
|---|---:|---|
| Camada de tradução | 6634 | |
| Engines clínicos | 2638 | |
| Árvores de decisão | 1602 | |
| Protocolos em JSON | 1223 | |
| Componentes de interface | 514 | |
| Motor do ACLS | 404 | |
| Domínio por módulo | 347 | |
| Não classificado — revisar | 55 | |
| Registro de módulos | 26 | |
| Rotas e navegação | 12 | |
| Bibliotecas de apoio | 4 | |

## Conteúdo clínico acoplado à interface

**514 ocorrências** em componentes de tela.

| arquivo | linha | categoria | texto |
|---|---:|---|---|
| `components/clinical-app.tsx` | 72 | sequencia-ressuscitacao | choque |
| `components/intro-landing.tsx` | 26 | sequencia-ressuscitacao | Choque & hemodinâmica |
| `components/intro-landing.tsx` | 27 | sequencia-ressuscitacao | Sepse com bundle da 1ª hora, diagnóstico diferencial do choque, drogas vasoativas e correç |
| `components/intro-landing.tsx` | 32 | intubacao | Intubação em sequência rápida, ventilação mecânica protetora, sedoanalgesia/BNM e edema ag |
| `components/intro-landing.tsx` | 47 | trombolise | Peso predito, TFG, ânion gap, osmolalidade, Glasgow, qSOFA, SOFA, Wells, CURB-65, HEART, N |
| `components/intro-landing.tsx` | 47 | criterio-clinico | Peso predito, TFG, ânion gap, osmolalidade, Glasgow, qSOFA, SOFA, Wells, CURB-65, HEART, N |
| `components/module-hub.tsx` | 26 | intubacao | #a78bfa |
| `components/module-hub.tsx` | 36 | sequencia-ressuscitacao | #ef4444 |
| `components/module-hub.tsx` | 41 | exame | Eletrólitos |
| `components/module-hub.tsx` | 75 | sequencia-ressuscitacao | choque |
| `components/paywall-screen.tsx` | 29 | intubacao | ISR — intubação sequência rápida |
| `components/protocol-screen/acls-bradycardia-screen.tsx` | 10 | sequencia-ressuscitacao | Baseado em AHA ACLS 2025 (Diretrizes RCP e ACE 2025) |
| `components/protocol-screen/acls-pharmacology-screen-v2.tsx` | 47 | criterio-clinico | Indicação no ACLS |
| `components/protocol-screen/acls-pharmacology-screen-v2.tsx` | 102 | criterio-clinico | Drogas de emergência organizadas por indicação clínica. Use como consulta rápida durante o |
| `components/protocol-screen/acls-pharmacology-screen-v2.tsx` | 125 | dose-por-peso | 1–1,5 mg/kg IV/IO |
| `components/protocol-screen/acls-pharmacology-screen-v2.tsx` | 125 | via-administracao | 1–1,5 mg/kg IV/IO |
| `components/protocol-screen/acls-pharmacology-screen-v2.tsx` | 126 | dose-por-peso |  em bolus para FV/TV sp refratária. 2ª dose: 0,5–0,75 mg/kg. Dose máx: 3 mg/kg. |
| `components/protocol-screen/acls-pharmacology-screen-v2.tsx` | 132 | dose | 1–2 g IV/IO |
| `components/protocol-screen/acls-pharmacology-screen-v2.tsx` | 132 | via-administracao | 1–2 g IV/IO |
| `components/protocol-screen/acls-pharmacology-screen-v2.tsx` | 133 | diluicao |  em bolus diluído. NÃO substitui a amiodarona para FV/TV monomórfica. |
| `components/protocol-screen/acls-pharmacology-screen-v2.tsx` | 136 | sequencia-ressuscitacao | Baseado em AHA ACLS 2025 (Diretrizes RCP e ACE 2025) |
| `components/protocol-screen/acls-pharmacology-screen.tsx` | 40 | dose | Adrenalina 1 mg / 10 mL (1:10.000) |
| `components/protocol-screen/acls-pharmacology-screen.tsx` | 40 | diluicao | Adrenalina 1 mg / 10 mL (1:10.000) |
| `components/protocol-screen/acls-pharmacology-screen.tsx` | 49 | dose | 1 mg IV/IO em bolus |
| `components/protocol-screen/acls-pharmacology-screen.tsx` | 49 | via-administracao | 1 mg IV/IO em bolus |
| `components/protocol-screen/acls-pharmacology-screen.tsx` | 50 | tempo-janela | A cada 3–5 minutos |
| `components/protocol-screen/acls-pharmacology-screen.tsx` | 51 | dose | Usar ampola de 1 mg sem diluição (1:10.000) |
| `components/protocol-screen/acls-pharmacology-screen.tsx` | 51 | diluicao | Usar ampola de 1 mg sem diluição (1:10.000) |
| `components/protocol-screen/acls-pharmacology-screen.tsx` | 51 | via-administracao | Preparo IV |
| `components/protocol-screen/acls-pharmacology-screen.tsx` | 56 | sequencia-ressuscitacao | FV/TV sem pulso: 1ª dose após o 2º choque sem ROSC, durante o ciclo de RCP subsequente (AH |
| `components/protocol-screen/acls-pharmacology-screen.tsx` | 57 | tempo-janela | Repetir a cada ciclo de 3–5 min enquanto a PCR persistir |
| `components/protocol-screen/acls-pharmacology-screen.tsx` | 60 | sequencia-ressuscitacao | Não atrasar a 1ª dose em ritmos não chocáveis. Em FV/TV refratária, priorize a desfibrilaç |
| `components/protocol-screen/acls-pharmacology-screen.tsx` | 66 | dose | Cordarone — 150 mg / 3 mL |
| `components/protocol-screen/acls-pharmacology-screen.tsx` | 66 | diluicao | Cordarone — 150 mg / 3 mL |
| `components/protocol-screen/acls-pharmacology-screen.tsx` | 73 | contraindicacao | FV ou TV sem pulso refratária a desfibrilação repetida. Não indicada em AESP nem assistoli |
| `components/protocol-screen/acls-pharmacology-screen.tsx` | 73 | sequencia-ressuscitacao | FV ou TV sem pulso refratária a desfibrilação repetida. Não indicada em AESP nem assistoli |
| `components/protocol-screen/acls-pharmacology-screen.tsx` | 75 | dose | 300 mg IV/IO em bolus |
| `components/protocol-screen/acls-pharmacology-screen.tsx` | 75 | via-administracao | 300 mg IV/IO em bolus |
| `components/protocol-screen/acls-pharmacology-screen.tsx` | 76 | dose | 150 mg IV/IO em bolus |
| `components/protocol-screen/acls-pharmacology-screen.tsx` | 76 | via-administracao | 150 mg IV/IO em bolus |
| … | | | mais 474 |

## Conteúdo clínico acoplado à navegação

**12 ocorrências** em rotas.

## Conteúdo clínico na camada de tradução

**6634 ocorrências.** Toda dose escrita aqui é uma SEGUNDA fonte da
mesma informação: mudar a dose no protocolo e não na tradução faz o app dizer
números diferentes conforme o idioma.

### Afirmações clínicas que existem SÓ na tradução

**21 de 6634** ocorrências de risco crítico ou alto
na camada de tradução não têm original correspondente no conteúdo-fonte.

Espelho de uma dose original é duplicação gerenciável. Dose que existe apenas
traduzida é conteúdo clínico órfão: não há de onde revisá-la, e chega ao médico
que usa o app naquele idioma.

| arquivo | linha | texto |
|---|---:|---|
| `acls/locales/es-419/strings-generated.ts` | 715 | Alteplase 50 mg IV em bolus durante PCR por TEP maciço confirmado ou altamente suspeito. RCP por pel |
| `acls/locales/es-419/strings-generated.ts` | 715 | Alteplase 50 mg IV em bolus durante PCR por TEP maciço confirmado ou altamente suspeito. RCP por pel |
| `acls/locales/es-419/strings-generated.ts` | 715 | Alteplase 50 mg IV em bolus durante PCR por TEP maciço confirmado ou altamente suspeito. RCP por pel |
| `acls/locales/es-419/strings-generated.ts` | 715 | Alteplase 50 mg IV em bolus durante PCR por TEP maciço confirmado ou altamente suspeito. RCP por pel |
| `lib/i18n/modules/avc.ts` | 205 | Antiagregante: AAS 160–325 mg em 24–48 h (após 24 h e TC sem hemorragia se houve trombólise). |
| `lib/i18n/modules/avc.ts` | 205 | Antiagregante: AAS 160–325 mg em 24–48 h (após 24 h e TC sem hemorragia se houve trombólise). |
| `lib/i18n/modules/avc.ts` | 205 | Antiagregante: AAS 160–325 mg em 24–48 h (após 24 h e TC sem hemorragia se houve trombólise). |
| `lib/i18n/modules/avc.ts` | 206 | Antiagregante: AAS 160–325 mg en 24–48 h (tras 24 h y TC sin hemorragia si hubo trombólisis). |
| `lib/i18n/modules/avc.ts` | 206 | Antiagregante: AAS 160–325 mg en 24–48 h (tras 24 h y TC sin hemorragia si hubo trombólisis). |
| `lib/i18n/modules/avc.ts` | 223 | Warfarina/AVK: Vitamina K 10 mg IV + complexo protrombínico (CCP) 4 fatores 25–50 UI/kg IV → alvo IN |
| `lib/i18n/modules/avc.ts` | 223 | Warfarina/AVK: Vitamina K 10 mg IV + complexo protrombínico (CCP) 4 fatores 25–50 UI/kg IV → alvo IN |
| `lib/i18n/modules/avc.ts` | 223 | Warfarina/AVK: Vitamina K 10 mg IV + complexo protrombínico (CCP) 4 fatores 25–50 UI/kg IV → alvo IN |
| `lib/i18n/modules/avc.ts` | 224 | Warfarina/AVK: Vitamina K 10 mg IV + concentrado de complejo protrombínico (CCP) de 4 factores 25–50 |
| `lib/i18n/modules/avc.ts` | 224 | Warfarina/AVK: Vitamina K 10 mg IV + concentrado de complejo protrombínico (CCP) de 4 factores 25–50 |
| `lib/i18n/modules/avc.ts` | 224 | Warfarina/AVK: Vitamina K 10 mg IV + concentrado de complejo protrombínico (CCP) de 4 factores 25–50 |
| `lib/i18n/modules/sca.ts` | 113 | Se a ICP não for possível em ≤ 120 min e o início for ≤ 12 h → fibrinólise (porta-agulha ≤ 30 min). |
| `lib/i18n/modules/sca.ts` | 114 | Si la ICP no es posible en ≤ 120 min y el inicio fue ≤ 12 h → fibrinólisis (puerta-aguja ≤ 30 min). |
| `lib/i18n/modules/sca.ts` | 181 | Associar: clopidogrel (300 mg; 75 mg sem ataque se ≥ 75a) + enoxaparina {enoxa} mg SC 12/12h (≥ 75a: |
| `lib/i18n/modules/sca.ts` | 181 | Associar: clopidogrel (300 mg; 75 mg sem ataque se ≥ 75a) + enoxaparina {enoxa} mg SC 12/12h (≥ 75a: |
| `lib/i18n/modules/sca.ts` | 182 | Asociar: clopidogrel (300 mg; 75 mg sin carga si ≥ 75 años) + enoxaparina {enoxa} mg SC cada 12 h (≥ |
| `lib/i18n/modules/sca.ts` | 182 | Asociar: clopidogrel (300 mg; 75 mg sin carga si ≥ 75 años) + enoxaparina {enoxa} mg SC cada 12 h (≥ |

## Afirmações duplicadas entre arquivos

**2631 afirmações** aparecem em mais de um arquivo.

| ocorrências | arquivos | afirmação |
|---:|---:|---|
| 9 | 9 | Baseado em AHA ACLS 2025 (Diretrizes RCP e ACE 2025) |
| 9 | 8 | ISR — Via aérea |
| 14 | 7 | Aplicar choque |
| 7 | 7 | Sepse / Choque séptico |
| 10 | 5 | choque aplicado |
| 5 | 5 | ECG 12 derivações |
| 7 | 4 | Sepse com suspeita de choque séptico |
| 4 | 4 | Indicação no ACLS |
| 8 | 4 | Aplicar choque bifásico |
| 8 | 4 | Aplicar choque monofásico |
| 4 | 4 | Manter RCP de alta qualidade |
| 4 | 4 | NIHSS — consciência |
| 4 | 4 | NIHSS — olhar e visão |
| 4 | 4 | NIHSS — coordenação e sensibilidade |
| 4 | 4 | Contraindicações absolutas |
| 4 | 4 | Contraindicações relativas |
| 4 | 4 | Contraindicações potencialmente corrigíveis |
| 4 | 4 | Sem contraindicação |
| 4 | 4 | Há contraindicação |
| 4 | 4 | Choque & hemodinâmica |
| 8 | 4 | Contraindicações à trombólise |
| 4 | 4 | Choque · Diagnóstico e conduta |
| 4 | 4 | STEMI trombólise |
| 4 | 4 | Choque cardiogênico |
| 4 | 4 | Adrenalina IM e manejo escalonado. |
| 5 | 4 | 🔴 Choque Séptico Refratário |
| 11 | 4 | choque séptico |
| 3 | 3 | Perdeu o pulso. Reiniciar RCP imediatamente. Reavaliar o ritmo. |
| 3 | 3 | Intubação registrada |
| 3 | 3 | Choque refratário |

## Possíveis contradições — mesmo medicamento, números diferentes

> ⚠️ Lista de SUSPEITAS, não de erros. Doses diferentes podem ser corretas
> (indicações, populações e vias diferentes). Cada linha precisa de olho médico.

| medicamento | valores encontrados | módulos |
|---|---|---|
| adrenalina | 1 mg · 1 mg IV · 0.25 mcg · 0.5 mcg · 0.2 mcg · 0.1 mcg · 5 ml | pcr-adulto, acls-pharmacology, guidelines-metadata, (tradução), sepsis, vasoactive |
| amiodarona | 300 mg IV · 150 mg IV · 150 mg · 300 mg | pcr-adulto, acls-protocol, (tradução), guidelines-metadata, acls-tachycardia, eap |
| atropina | 1 mg IV · 0.01 mg · 0.02 mg IV · 1 mg | pcr-adulto, acls-bradycardia, (tradução), sedation, rsi, guidelines-metadata |
| noradrenalina | 0.25 mcg · 0.5 mcg · 0.2 mcg · 0.1 mcg | (tradução), sepsis, vasoactive, sepse |
| meropenem | 1 g IV · 1 g · 2 g IV | (tradução), sepse, sepsis-antibiotic, sepsis |
| epinefrina | 1 mg IV · 1 mg | pcr-adulto, acls-rhythms, guidelines-metadata |
| dopamina | 50 mg · 5 mcg | pcr-adulto, acls-pharmacology, edema-agudo-pulmao |
| alteplase | 50 mg IV · 0.9 mg | pcr-adulto, guidelines-metadata |
| hidrocortisona | 200 mg · 200 mg IV | (tradução), guidelines-metadata, sepse-adulto, vasoactive, sepsis |
| rocurônio | 1.2 mg · 1.2 mg IV | (tradução), rsi, isr-rapida |
| tenecteplase | 0.25 mg IV · 0.25 mg | acidente-vascular-cerebral, guidelines-metadata |

## Afirmações de risco crítico ou alto sem referência próxima

**8064 de 10251**
ocorrências de risco crítico ou alto não têm citação de diretriz nas 12 linhas ao redor.

> Ausência de referência PRÓXIMA não significa ausência de fundamento: o arquivo
> pode citar a diretriz no cabeçalho. Significa que a afirmação não é rastreável
> ao ser lida no lugar onde está — que é o problema que a Camada 9 vai atacar.

## Acoplamento com inteligência artificial

> A decisão arquitetural do plano é explícita: nenhum serviço de IA
> implementado, contratado ou **acoplado** nesta fase.

Nenhum acoplamento encontrado.

## Prioridade recomendada para a auditoria

Ordem por risco × volume × acoplamento:

| # | módulo | críticos | sem referência próxima | total |
|---:|---|---:|---:|---:|
| 1 | (tradução) | 2487 | 3586 | 6029 |
| 2 | pcr-adulto | 784 | 586 | 1165 |
| 3 | anafilaxia | 342 | 447 | 717 |
| 4 | sepsis | 284 | 443 | 784 |
| 5 | sepse-antimicrobianos | 254 | 270 | 437 |
| 6 | vasoactive | 204 | 189 | 236 |
| 7 | avc | 188 | 316 | 425 |
| 8 | sedation | 151 | 159 | 200 |
| 9 | eap | 104 | 170 | 269 |
| 10 | coronary | 93 | 120 | 238 |
| 11 | guidelines-metadata | 79 | 21 | 141 |
| 12 | anaphylaxis | 72 | 97 | 189 |
| 13 | tep | 63 | 48 | 102 |
| 14 | sepse | 61 | 142 | 187 |
| 15 | sepsis-antibiotic | 56 | 102 | 151 |

---

### Limites conhecidos desta varredura

- **Expressão regular acha padrão, não sentido.** Há falso positivo (número com
  unidade que não é conduta) e falso negativo (conduta sem número).
- **Não avalia correção clínica.** Nada aqui diz que uma dose está certa ou errada.
- **Duplicação é por texto idêntico.** Duas redações diferentes da mesma conduta
  não são detectadas — só a Camada 3 pega isso.
- **Referência é presença de citação, não sua adequação.** Se a citação sustenta a
  afirmação é assunto da Camada 9.
