const CheckoutSuccessPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ordine Confermato!</h2>
        <p className="text-gray-600 mb-6">
          Il tuo ordine è stato ricevuto con successo. 
          Ti contatteremo il prima possibile per la conferma.
        </p>
        <p className="text-sm text-gray-500">
          Puoi chiudere questa pagina e tornare alla chat WhatsApp.
        </p>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;