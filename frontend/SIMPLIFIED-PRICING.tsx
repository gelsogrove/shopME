// VERSIONE SEMPLIFICATA DEL PRICING NEL WHATSAPP POPUP
// Sostituire la sezione da linea 1345 a 1454 con questo codice:

{
  /* 💰 SIMPLE: current + new = total */
}
{
  showFunctionCalls && message.sender === "bot" && (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-300 rounded-lg p-3 my-2">
      {message.billing ? (
        <div className="font-mono text-center">
          <span className="text-gray-700 font-semibold">
            €{message.billing.currentTotal.toFixed(2)}
          </span>
          <span className="text-blue-600 mx-2 font-bold">+</span>
          <span className="text-blue-700 font-semibold">
            €
            {(
              message.billing.messageCharge + message.billing.humanSupportCharge
            ).toFixed(2)}
          </span>
          <span className="text-green-600 mx-2 font-bold">=</span>
          <span className="font-bold text-green-700 text-lg">
            €{message.billing.newTotal.toFixed(2)}
          </span>
        </div>
      ) : (
        <div className="font-mono text-center text-gray-600">
          Messaggio: €0.15
        </div>
      )}
    </div>
  )
}
