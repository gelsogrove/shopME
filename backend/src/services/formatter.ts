export type FormatterOptions = {
  language?: string
  customerId?: string
  workspaceId?: string
  originalQuestion?: string
  formatRules?: { template?: string } | undefined
}

export function replaceAllVariables(
  template: string,
  data: Record<string, any>
): string {
  if (!template) return template
  let out = template
  for (const [k, v] of Object.entries(data || {})) {
    const token = `{{${k}}}`
    const val = v === undefined || v === null ? "" : String(v)
    out = out.split(token).join(val)
  }
  return out
}

export function simpleNaturalFormatter(args: {
  response: any
  language?: string
  originalQuestion?: string
}): string {
  const { response, language, originalQuestion } = args

  // Minimal passthrough formatter.
  // Responsibility: return a representation of `response` and include `language` and `originalQuestion`
  // so the LLM-based formatter can produce a natural-language reply. Do not perform branching,
  // replacements or logic here; the OpenRouter/OpenAI LLM will format the final text.

  const payload = {
    language: language || null,
    originalQuestion: originalQuestion || null,
    data: response ?? null,
  }

  try {
    return JSON.stringify(payload)
  } catch (e) {
    return String(response ?? "")
  }
}

export async function formatCFResult(
  cfResult: any,
  options: FormatterOptions = {}
): Promise<{ text: string; metadata?: any }> {
  const data = (cfResult && (cfResult.data || cfResult)) || {}
  const language = options.language || "it"

  const template = options.formatRules && (options.formatRules as any).template

  // <-- IF BRANCH START: TEMPLATE / REPLACE + URL AUGMENTATION
  if (template && typeof template === "string") {
    let replaced = replaceAllVariables(template, data)

    if (data && typeof data.link === "string") {
      try {
        const originalLink = data.link
        const url = new URL(originalLink)
        if (options.workspaceId)
          url.searchParams.set("workspaceId", options.workspaceId)
        if (options.customerId)
          url.searchParams.set("customerId", options.customerId)
        // <-- QUI: aggiungo fisicamente l'orderCode come query param se presente nel risultato CF
        if (data.orderCode) url.searchParams.set("orderCode", data.orderCode)
        const augmentedLink = url.toString()
        replaced = replaced.split(originalLink).join(augmentedLink) // no regex
        data.link = augmentedLink
      } catch (err) {
        console.debug("[FORMATTER] Unable to parse/augment link", err)
      }
    }

    const finalText = replaced
    return { text: finalText, metadata: { usedTemplate: true } }
  }
  // <-- IF BRANCH END

  // <-- AUGMENT LINK BEFORE NATURAL FORMATTING -->
  if (data && typeof data.link === "string") {
    try {
      const originalLink = data.link
      const url = new URL(originalLink)
      if (options.workspaceId)
        url.searchParams.set("workspaceId", options.workspaceId)
      if (options.customerId)
        url.searchParams.set("customerId", options.customerId)
      // <-- QUI: aggiungo fisicamente l'orderCode anche nel ramo naturale
      if (data.orderCode) url.searchParams.set("orderCode", data.orderCode)
      const augmentedLink = url.toString()
      data.link = augmentedLink
    } catch (err) {
      console.debug(
        "[FORMATTER] Unable to parse/augment link before natural formatting",
        err
      )
    }
  }

  const text = simpleNaturalFormatter({
    response: data,
    language,
    originalQuestion: options.originalQuestion,
  })

  return { text, metadata: { usedTemplate: false } }
}
