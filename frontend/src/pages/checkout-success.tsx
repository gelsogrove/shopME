const CheckoutSuccessPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Confirmed!</h2>
        <p className="text-gray-600 mb-6">
          Your order has been received successfully. 
          We will contact you as soon as possible for confirmation.
        </p>
        <p className="text-sm text-gray-500">
          You can close this page and return to WhatsApp chat.
        </p>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;