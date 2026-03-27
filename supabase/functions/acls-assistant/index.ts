// @ts-nocheck
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string" },
    focusNow: {
      type: "array",
      items: { type: "string" },
      maxItems: 3,
    },
    pendingActions: {
      type: "array",
      items: { type: "string" },
      maxItems: 4,
    },
    attentionChecks: {
      type: "array",
      items: { type: "string" },
      maxItems: 4,
    },
    rationale: { type: "string" },
    safetyNote: { type: "string" },
  },
  required: [
    "summary",
    "focusNow",
    "pendingActions",
    "attentionChecks",
    "rationale",
    "safetyNote",
  ],
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function extractOutputText(payload: any) {
  if (typeof payload?.output_text === "string" && payload.output_text.length > 0) {
    return payload.output_text;
  }

  const message = payload?.output?.find((item: any) => item?.type === "message");
  const outputText = message?.content?.find((item: any) => item?.type === "output_text");
  return outputText?.text;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ ok: false, error: "method_not_allowed" }, 405);
  }

  const openAiApiKey = Deno.env.get("OPENAI_API_KEY");
  const openAiModel = Deno.env.get("OPENAI_MODEL") ?? "gpt-5-mini";

  if (!openAiApiKey) {
    return jsonResponse({ ok: false, error: "openai_key_not_configured" }, 503);
  }

  const { context } = await req.json();

  if (!context?.stateId || !context?.stateText) {
    return jsonResponse({ ok: false, error: "invalid_context" }, 400);
  }

  const systemPrompt = [
    "Você é um assistente operacional de ACLS para atendimento de emergência.",
    "Você NÃO decide choque, ritmo, ROSC, doses ou transições críticas.",
    "Você apenas resume pendências, destaca checagens úteis, audita coerência do passo atual e organiza a atenção da equipe.",
    "Respeite o algoritmo ACLS/AHA informado pelo contexto recebido.",
    "Nunca invente medicamento, dose ou mudança de ramo não suportada pelo contexto.",
    "Use o contexto de medicação, timers, estado atual, clinicalIntent e métricas operacionais para detectar inconsistências aparentes.",
    "Se houver epinefrina ou antiarrítmico no contexto, avalie se parecem devidos agora, pendentes de confirmação ou ainda futuros.",
    "Se o contexto sugerir possível desalinhamento temporal, aponte isso em attentionChecks sem mudar a conduta do engine.",
    "Se houver incerteza, use linguagem de checagem: revisar, confirmar, reavaliar.",
    "Seja objetivo, clínico e curto.",
  ].join(" ");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: openAiModel,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: systemPrompt }],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify(context),
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "acls_operational_assistant",
          schema: OUTPUT_SCHEMA,
          strict: true,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorPayload = await response.text();
    return jsonResponse(
      { ok: false, error: "openai_request_failed", detail: errorPayload },
      502
    );
  }

  const payload = await response.json();
  const outputText = extractOutputText(payload);

  if (!outputText) {
    return jsonResponse({ ok: false, error: "empty_model_output" }, 502);
  }

  try {
    const insight = JSON.parse(outputText);
    return jsonResponse({ ok: true, insight });
  } catch (_error) {
    return jsonResponse({ ok: false, error: "invalid_model_json", raw: outputText }, 502);
  }
});
