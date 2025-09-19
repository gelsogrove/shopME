export type FunctionDef = {
  name: string
  description?: string
  parameters?: {
    required?: string[]
    properties?: Record<string, { type?: string }>
  }
}

/**
 * Validate required params according to a required keys array.
 * Throws an Error if any required param is missing/empty.
 */
export function validateFunctionParamsByKeys(
  fnName: string,
  args: Record<string, any>,
  requiredKeys: string[]
) {
  const missing: string[] = []
  for (const key of requiredKeys || []) {
    const val = args[key]
    const isEmpty =
      val === undefined ||
      val === null ||
      (typeof val === "string" && val.trim() === "") ||
      (Array.isArray(val) && val.length === 0)
    if (isEmpty) missing.push(key)
  }
  if (missing.length) {
    const msg = `Function ${fnName} missing required params: ${missing.join(", ")}`
    console.error(`❌ [Function Validator] ${msg}`, { fnName, provided: args })
    throw new Error(msg)
  }
  console.debug(
    `✅ [Function Validator] All required params present for ${fnName}`
  )
  return true
}
