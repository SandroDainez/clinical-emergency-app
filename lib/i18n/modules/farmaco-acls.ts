/**
 * Farmacologia no ACLS + preparos consumindo Vasoativas (R-46).
 */
export const ES_FARMACO_ACLS: Record<string, string> = {
  "150 mg IV/IO em bolus — NÃO no ciclo seguinte: a 2ª dose entra um ciclo DEPOIS, alternando com a epinefrina, e é assim que o app a oferece. Espaçar 300 mg → 150 mg em dois ciclos reproduz a cadência do algoritmo circular; dar as duas em ciclos consecutivos não é o que a máquina executa nem o que a diretriz descreve.":
    "150 mg IV/IO en bolo — NO en el ciclo siguiente: la 2ª dosis entra un ciclo DESPUÉS, alternando con la epinefrina, y así es como la app la ofrece. Espaciar 300 mg → 150 mg en dos ciclos reproduce la cadencia del algoritmo circular; dar las dos en ciclos consecutivos no es lo que la máquina ejecuta ni lo que la guía describe.",
  "AHA ACLS 2025 · apresentações e volumes em lib/atropina.ts (fonte única).":
    "AHA ACLS 2025 · presentaciones y volúmenes en lib/atropina.ts (fuente única).",
  "Preparo":
    "Preparación",
  "Usar a solução padrão do módulo Drogas Vasoativas — 5 ampolas (250 mg) + 200 mL → 250 mL final = 1000 mcg/mL. ⚠️ NÃO usar o preparo de 200 mg/250 mL dos textos internacionais: ele pressupõe o frasco americano de 200 mg, e a ampola nacional é de 50 mg/10 mL. Duas concentrações no mesmo app são 25% de erro num vasopressor.":
    "Usar la solución estándar del módulo Drogas Vasoactivas — 5 ampollas (250 mg) + 200 mL → 250 mL final = 1000 mcg/mL. ⚠️ NO usar la preparación de 200 mg/250 mL de los textos internacionales: presupone el frasco estadounidense de 200 mg, y la ampolla nacional es de 50 mg/10 mL. Dos concentraciones en la misma app son un 25% de error en un vasopresor.",
  "INOTRÓPICO 1ª linha — DOBUTAMINA IV (aumenta DC, reduz PCWP).":
    "INOTRÓPICO de 1ª línea — DOBUTAMINA IV (aumenta el GC, reduce la PCWP).",
  "PREPARO: usar as soluções padrão do módulo Drogas Vasoativas — 2000 mcg/mL (1 ampola de 250 mg + 105 mL → 125 mL) ou 4000 mcg/mL (2 ampolas + 85 mL → 125 mL). ⚠️ O preparo de 250 mg em 250 mL, que este passo trazia, dá 1000 mcg/mL — uma TERCEIRA concentração que não existe na tabela do módulo dono, e programar a bomba pela tabela errada erra por fator 2 ou 4 num inotrópico.":
    "PREPARACIÓN: usar las soluciones estándar del módulo Drogas Vasoactivas — 2000 mcg/mL (1 ampolla de 250 mg + 105 mL → 125 mL) o 4000 mcg/mL (2 ampollas + 85 mL → 125 mL). ⚠️ La preparación de 250 mg en 250 mL, que este paso traía, da 1000 mcg/mL — una TERCERA concentración que no existe en la tabla del módulo dueño, y programar la bomba por la tabla equivocada yerra por factor 2 o 4 en un inotrópico.",
  "VASOPRESSOR de escolha — NOREPINEFRINA 0,1–1 mcg/kg/min IV (superior à dopamina — SOAP II). Alvo PAM ≥ 65 mmHg. Preparo: solução de 16 mcg/mL do módulo Drogas Vasoativas.":
    "VASOPRESOR de elección — NOREPINEFRINA 0,1–1 mcg/kg/min IV (superior a la dopamina — SOAP II). Objetivo PAM ≥ 65 mmHg. Preparación: solución de 16 mcg/mL del módulo Drogas Vasoactivas.",
  "APRESENTAÇÕES NACIONAIS — são DUAS, e o volume muda: sulfato de atropina 0,25 mg/mL e 0,5 mg/mL, ampola de 1 mL. A de 0,25 mg/mL é a padronizada pelo SUS, e nela 1 mg exige QUATRO ampolas. Conferir o rótulo antes de aspirar: a dose em miligramas é a mesma, o volume não.":
    "PRESENTACIONES NACIONALES — son DOS, y el volumen cambia: sulfato de atropina 0,25 mg/mL y 0,5 mg/mL, ampolla de 1 mL. La de 0,25 mg/mL es la estandarizada por el SUS, y en ella 1 mg exige CUATRO ampollas. Verificar la etiqueta antes de aspirar: la dosis en miligramos es la misma, el volumen no.",
  "ATROPINA — 1 mg IV em bolus, repetir a cada 3–5 min conforme a resposta, até o total de 3 mg (efeito vagolítico máximo). Acima disso não há ganho: se a bradicardia persistir, o caminho é marcapasso transcutâneo ou infusão cronotrópica, não mais atropina.":
    "ATROPINA — 1 mg IV en bolo, repetir cada 3–5 min según la respuesta, hasta un total de 3 mg (efecto vagolítico máximo). Por encima de eso no hay ganancia: si la bradicardia persiste, el camino es el marcapasos transcutáneo o la infusión cronotrópica, no más atropina.",
  "⚠️ ONDE A ATROPINA NÃO FUNCIONA: bloqueio AV de 2º grau Mobitz II e BAVT com QRS largo — o bloqueio é infranodal, e a atropina age no nó AV. Insistir nela ali ATRASA o marcapasso, que é o tratamento. Também não se usa em bradicardia por hipotermia.":
    "⚠️ DONDE LA ATROPINA NO FUNCIONA: bloqueo AV de 2º grado Mobitz II y BAVC con QRS ancho — el bloqueo es infranodal, y la atropina actúa en el nodo AV. Insistir con ella allí RETRASA el marcapasos, que es el tratamiento. Tampoco se usa en bradicardia por hipotermia.",
  "ADRENALINA IV CONTÍNUA: usar a solução de 10 mcg/mL do módulo Drogas Vasoativas (1 ampola de 1 mg + 99 mL SF → 100 mL) — a diluição da anafilaxia refratária, listada lá ao lado das de 20 e 40 mcg/mL.":
    "ADRENALINA IV CONTINUA: usar la solución de 10 mcg/mL del módulo Drogas Vasoactivas (1 ampolla de 1 mg + 99 mL SF → 100 mL) — la dilución de la anafilaxia refractaria, listada allí junto a las de 20 y 40 mcg/mL.",
  "INFUSÃO IV CONTÍNUA de adrenalina se falha após 2–3 doses IM: usar a solução de 10 mcg/mL do módulo Drogas Vasoativas (1 ampola de 1 mg + 99 mL SF → 100 mL) — é a diluição da anafilaxia refratária, e está lá ao lado das de 20 e 40 mcg/mL para que a escolha seja consciente.":
    "INFUSIÓN IV CONTINUA de adrenalina si falla tras 2–3 dosis IM: usar la solución de 10 mcg/mL del módulo Drogas Vasoactivas (1 ampolla de 1 mg + 99 mL SF → 100 mL) — es la dilución de la anafilaxia refractaria, y está allí junto a las de 20 y 40 mcg/mL para que la elección sea consciente.",
  "NOREPINEFRINA IV em bomba, iniciar ≈ {noraStart} mcg/kg/min (0,05 mcg/kg/min) e titular para PAM ≥ 65 — em ≥ 65 anos aceita-se 60–65 (SSC 2026); 70–75 em hipertenso crônico. Preparo: solução de 16 mcg/mL do módulo Drogas Vasoativas.":
    "NOREPINEFRINA IV en bomba, iniciar ≈ {noraStart} mcg/kg/min (0,05 mcg/kg/min) y titular para PAM ≥ 65 — en ≥ 65 años se acepta 60–65 (SSC 2026); 70–75 en hipertenso crónico. Preparación: solución de 16 mcg/mL del módulo Drogas Vasoactivas.",
  "10 mcg/mL • 1 amp + 99 mL → 100 mL final (anafilaxia refratária)":
    "10 mcg/mL • 1 amp + 99 mL → 100 mL final (anafilaxia refractaria)",
  "NÃO usar em AESP de ritmo lento — não reverte a causa subjacente e pode mascarar o quadro. Ineficaz em bloqueio AV de alto grau infranodal (Mobitz II, BAVT com QRS largo), onde atrasa o marcapasso.":
    "NO usar en AESP de ritmo lento — no revierte la causa subyacente y puede enmascarar el cuadro. Ineficaz en bloqueo AV de alto grado infranodal (Mobitz II, BAVC con QRS ancho), donde retrasa el marcapasos.",
};
