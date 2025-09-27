// 🌍 Sistema di traduzioni unificato per le pagine pubbliche

export type SupportedLanguage = "IT" | "EN" | "ES" | "PT"

export interface PublicPageTexts {
  // Loading states
  loading: string
  loadingMessage: string
  pleaseWait: string

  // Navigation buttons
  viewCart: string
  viewOrders: string
  viewProfile: string
  finalizeOrder: string

  // Common actions
  save: string
  cancel: string
  edit: string
  delete: string
  confirm: string
  back: string
  continue: string

  // Status labels
  pending: string
  confirmed: string
  shipped: string
  delivered: string
  cancelled: string

  // Form labels
  name: string
  email: string
  phone: string
  address: string
  company: string

  // Cart labels
  product: string
  quantity: string
  price: string
  total: string
  discount: string
  originalPrice: string
  finalPrice: string

  // Order labels
  orderCode: string
  orderDate: string
  orderStatus: string
  paymentStatus: string
  items: string

  // Profile labels
  personalData: string
  contactInfo: string
  billingAddress: string
  shippingAddress: string
  preferences: string

  // Messages
  noData: string
  error: string
  success: string
  dataUpdated: string

  // Greetings
  hello: string
  welcome: string

  // Checkout specific
  yourProducts: string
  addProducts: string
  emptyCart: string
  addProductsToContinue: string
  confirmOrder: string
  productSummary: string
  selectProducts: string
  loadingProducts: string
  confirmDelete: string
  confirmDeleteMessage: string
  remove: string
  addToCart: string
  thanks: string
  greeting: string
  steps: {
    products: string
    addresses: string
    confirm: string
  }

  // Checkout Success specific
  orderConfirmed: string
  orderReceived: string
  contactSoon: string
  closePage: string

  // Form placeholders
  streetPlaceholder: string
  cityPlaceholder: string
  postalCodePlaceholder: string
  provincePlaceholder: string
  countryPlaceholder: string
  namePlaceholder: string
  phonePlaceholder: string
  companyPlaceholder: string
  notesPlaceholder: string
  searchProductsPlaceholder: string

  // Form labels
  streetLabel: string
  cityLabel: string
  postalCodeLabel: string
  provinceLabel: string
  countryLabel: string
  sameAsShippingLabel: string
  additionalNotesLabel: string
}

export const publicPageTranslations: Record<
  SupportedLanguage,
  PublicPageTexts
> = {
  IT: {
    // Loading states
    loading: "Caricamento...",
    loadingMessage: "Stiamo preparando i tuoi dati",
    pleaseWait: "Attendere prego...",

    // Navigation buttons
    viewCart: "Carrello",
    viewOrders: "Ordini",
    viewProfile: "Profilo",
    finalizeOrder: "Finalizza Ordine",

    // Common actions
    save: "Salva",
    cancel: "Annulla",
    edit: "Modifica",
    delete: "Elimina",
    confirm: "Conferma",
    back: "Indietro",
    continue: "Continua",

    // Status labels
    pending: "In Attesa",
    confirmed: "Confermato",
    shipped: "Spedito",
    delivered: "Consegnato",
    cancelled: "Annullato",

    // Form labels
    name: "Nome",
    email: "Email",
    phone: "Telefono",
    address: "Indirizzo",
    company: "Azienda",

    // Cart labels
    product: "Prodotto",
    quantity: "Quantità",
    price: "Prezzo",
    total: "Totale",
    discount: "Sconto",
    originalPrice: "Prezzo Originale",
    finalPrice: "Prezzo Finale",

    // Order labels
    orderCode: "Codice Ordine",
    orderDate: "Data Ordine",
    orderStatus: "Stato Ordine",
    paymentStatus: "Stato Pagamento",
    items: "Articoli",

    // Profile labels
    personalData: "Dati Personali",
    contactInfo: "Informazioni di Contatto",
    billingAddress: "Indirizzo di Fatturazione",
    shippingAddress: "Indirizzo di Spedizione",
    preferences: "Preferenze",

    // Messages
    noData: "Nessun dato disponibile",
    error: "Si è verificato un errore",
    success: "Operazione completata con successo",
    dataUpdated: "Dati aggiornati correttamente",

    // Greetings
    hello: "Ciao",
    welcome: "Benvenuto",

    // Checkout specific
    yourProducts: "I Tuoi Prodotti",
    addProducts: "+ Aggiungi",
    emptyCart: "Il tuo carrello è vuoto",
    addProductsToContinue: "Aggiungi prodotti per continuare",
    confirmOrder: "Conferma Ordine",
    productSummary: "Riepilogo Prodotti",
    selectProducts: "Seleziona Prodotti",
    loadingProducts: "Caricamento prodotti...",
    confirmDelete: "Sei sicuro?",
    confirmDeleteMessage: 'Vuoi rimuovere "{name}" dal carrello?',
    remove: "Rimuovi",
    addToCart: "Aggiungi",
    thanks: "Grazie",
    greeting: "Ciao {name}, completa il tuo ordine in pochi passaggi",
    steps: {
      products: "Prodotti",
      addresses: "Indirizzi",
      confirm: "Conferma",
    },

    // Checkout Success specific
    orderConfirmed: "Ordine Confermato!",
    orderReceived: "Il tuo ordine è stato ricevuto con successo.",
    contactSoon: "Ti contatteremo il prima possibile per la conferma.",
    closePage: "Puoi chiudere questa pagina e tornare alla chat WhatsApp.",

    // Form placeholders
    streetPlaceholder: "Via e numero civico",
    cityPlaceholder: "Città",
    postalCodePlaceholder: "CAP",
    provincePlaceholder: "Provincia",
    countryPlaceholder: "Paese",
    namePlaceholder: "Nome completo",
    phonePlaceholder: "Telefono",
    companyPlaceholder: "Nome azienda",
    notesPlaceholder: "Eventuali note per la consegna...",
    searchProductsPlaceholder: "Cerca prodotti...",

    // Form labels
    streetLabel: "Via e numero civico",
    cityLabel: "Città",
    postalCodeLabel: "CAP",
    provinceLabel: "Provincia",
    countryLabel: "Paese",
    sameAsShippingLabel: "Stesso indirizzo di spedizione",
    additionalNotesLabel: "Note aggiuntive",
  },

  EN: {
    // Loading states
    loading: "Loading...",
    loadingMessage: "We're preparing your data",
    pleaseWait: "Please wait...",

    // Navigation buttons
    viewCart: "Cart",
    viewOrders: "Orders",
    viewProfile: "Profile",
    finalizeOrder: "Finalize Order",

    // Common actions
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    confirm: "Confirm",
    back: "Back",
    continue: "Continue",

    // Status labels
    pending: "Pending",
    confirmed: "Confirmed",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",

    // Form labels
    name: "Name",
    email: "Email",
    phone: "Phone",
    address: "Address",
    company: "Company",

    // Cart labels
    product: "Product",
    quantity: "Quantity",
    price: "Price",
    total: "Total",
    discount: "Discount",
    originalPrice: "Original Price",
    finalPrice: "Final Price",

    // Order labels
    orderCode: "Order Code",
    orderDate: "Order Date",
    orderStatus: "Order Status",
    paymentStatus: "Payment Status",
    items: "Items",

    // Profile labels
    personalData: "Personal Data",
    contactInfo: "Contact Information",
    billingAddress: "Billing Address",
    shippingAddress: "Shipping Address",
    preferences: "Preferences",

    // Messages
    noData: "No data available",
    error: "An error occurred",
    success: "Operation completed successfully",
    dataUpdated: "Data updated successfully",

    // Greetings
    hello: "Hello",
    welcome: "Welcome",

    // Checkout specific
    yourProducts: "Your Products",
    addProducts: "+ Add",
    emptyCart: "Your cart is empty",
    addProductsToContinue: "Add products to continue",
    confirmOrder: "Confirm Order",
    productSummary: "Product Summary",
    selectProducts: "Select Products",
    loadingProducts: "Loading products...",
    confirmDelete: "Are you sure?",
    confirmDeleteMessage: 'Do you want to remove "{name}" from your cart?',
    remove: "Remove",
    addToCart: "Add",
    thanks: "Thanks",
    greeting: "Hello {name}, complete your order in a few steps",
    steps: {
      products: "Products",
      addresses: "Addresses",
      confirm: "Confirm",
    },

    // Checkout Success specific
    orderConfirmed: "Order Confirmed!",
    orderReceived: "Your order has been received successfully.",
    contactSoon: "We will contact you as soon as possible for confirmation.",
    closePage: "You can close this page and return to WhatsApp chat.",

    // Form placeholders
    streetPlaceholder: "Street and number",
    cityPlaceholder: "City",
    postalCodePlaceholder: "ZIP Code",
    provincePlaceholder: "State/Province",
    countryPlaceholder: "Country",
    namePlaceholder: "Full name",
    phonePlaceholder: "Phone",
    companyPlaceholder: "Company name",
    notesPlaceholder: "Additional delivery notes...",
    searchProductsPlaceholder: "Search products...",

    // Form labels
    streetLabel: "Street and number",
    cityLabel: "City",
    postalCodeLabel: "ZIP Code",
    provinceLabel: "State/Province",
    countryLabel: "Country",
    sameAsShippingLabel: "Same as shipping address",
    additionalNotesLabel: "Additional notes",
  },

  ES: {
    // Loading states
    loading: "Cargando...",
    loadingMessage: "Estamos preparando tus datos",
    pleaseWait: "Por favor espera...",

    // Navigation buttons
    viewCart: "Carrito",
    viewOrders: "Pedidos",
    viewProfile: "Perfil",
    finalizeOrder: "Finalizar Pedido",

    // Common actions
    save: "Guardar",
    cancel: "Cancelar",
    edit: "Editar",
    delete: "Eliminar",
    confirm: "Confirmar",
    back: "Atrás",
    continue: "Continuar",

    // Status labels
    pending: "Pendiente",
    confirmed: "Confirmado",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",

    // Form labels
    name: "Nombre",
    email: "Email",
    phone: "Teléfono",
    address: "Dirección",
    company: "Empresa",

    // Cart labels
    product: "Producto",
    quantity: "Cantidad",
    price: "Precio",
    total: "Total",
    discount: "Descuento",
    originalPrice: "Precio Original",
    finalPrice: "Precio Final",

    // Order labels
    orderCode: "Código de Pedido",
    orderDate: "Fecha del Pedido",
    orderStatus: "Estado del Pedido",
    paymentStatus: "Estado del Pago",
    items: "Artículos",

    // Profile labels
    personalData: "Datos Personales",
    contactInfo: "Información de Contacto",
    billingAddress: "Dirección de Facturación",
    shippingAddress: "Dirección de Envío",
    preferences: "Preferencias",

    // Messages
    noData: "No hay datos disponibles",
    error: "Ha ocurrido un error",
    success: "Operación completada exitosamente",
    dataUpdated: "Datos actualizados correctamente",

    // Greetings
    hello: "Hola",
    welcome: "Bienvenido",

    // Checkout specific
    yourProducts: "Tus Productos",
    addProducts: "+ Agregar",
    emptyCart: "Tu carrito está vacío",
    addProductsToContinue: "Agrega productos para continuar",
    confirmOrder: "Confirmar Pedido",
    productSummary: "Resumen de Productos",
    selectProducts: "Seleccionar Productos",
    loadingProducts: "Cargando productos...",
    confirmDelete: "¿Estás seguro?",
    confirmDeleteMessage: '¿Quieres eliminar "{name}" de tu carrito?',
    remove: "Eliminar",
    addToCart: "Agregar",
    thanks: "Gracias",
    greeting: "Hola {name}, completa tu pedido en pocos pasos",
    steps: {
      products: "Productos",
      addresses: "Direcciones",
      confirm: "Confirmar",
    },

    // Checkout Success specific
    orderConfirmed: "¡Pedido Confirmado!",
    orderReceived: "Su pedido ha sido recibido con éxito.",
    contactSoon:
      "Nos pondremos en contacto contigo lo antes posible para la confirmación.",
    closePage: "Puedes cerrar esta página y volver al chat de WhatsApp.",

    // Form placeholders
    streetPlaceholder: "Calle y número",
    cityPlaceholder: "Ciudad",
    postalCodePlaceholder: "Código Postal",
    provincePlaceholder: "Provincia",
    countryPlaceholder: "País",
    namePlaceholder: "Nombre completo",
    phonePlaceholder: "Teléfono",
    companyPlaceholder: "Nombre de la empresa",
    notesPlaceholder: "Notas adicionales para la entrega...",
    searchProductsPlaceholder: "Buscar productos...",

    // Form labels
    streetLabel: "Calle y número",
    cityLabel: "Ciudad",
    postalCodeLabel: "Código Postal",
    provinceLabel: "Provincia",
    countryLabel: "País",
    sameAsShippingLabel: "Misma dirección de envío",
    additionalNotesLabel: "Notas adicionales",
  },

  PT: {
    // Loading states
    loading: "Carregando...",
    loadingMessage: "Estamos preparando seus dados",
    pleaseWait: "Por favor aguarde...",

    // Navigation buttons
    viewCart: "Carrinho",
    viewOrders: "Pedidos",
    viewProfile: "Perfil",
    finalizeOrder: "Finalizar Pedido",

    // Common actions
    save: "Salvar",
    cancel: "Cancelar",
    edit: "Editar",
    delete: "Excluir",
    confirm: "Confirmar",
    back: "Voltar",
    continue: "Continuar",

    // Status labels
    pending: "Pendente",
    confirmed: "Confirmado",
    shipped: "Enviado",
    delivered: "Entregue",
    cancelled: "Cancelado",

    // Form labels
    name: "Nome",
    email: "Email",
    phone: "Telefone",
    address: "Endereço",
    company: "Empresa",

    // Cart labels
    product: "Produto",
    quantity: "Quantidade",
    price: "Preço",
    total: "Total",
    discount: "Desconto",
    originalPrice: "Preço Original",
    finalPrice: "Preço Final",

    // Order labels
    orderCode: "Código do Pedido",
    orderDate: "Data do Pedido",
    orderStatus: "Status do Pedido",
    paymentStatus: "Status do Pagamento",
    items: "Itens",

    // Profile labels
    personalData: "Dados Pessoais",
    contactInfo: "Informações de Contato",
    billingAddress: "Endereço de Cobrança",
    shippingAddress: "Endereço de Entrega",
    preferences: "Preferências",

    // Messages
    noData: "Nenhum dado disponível",
    error: "Ocorreu um erro",
    success: "Operação concluída com sucesso",
    dataUpdated: "Dados atualizados com sucesso",

    // Greetings
    hello: "Olá",
    welcome: "Bem-vindo",

    // Checkout specific
    yourProducts: "Seus Produtos",
    addProducts: "+ Adicionar",
    emptyCart: "Seu carrinho está vazio",
    addProductsToContinue: "Adicione produtos para continuar",
    confirmOrder: "Confirmar Pedido",
    productSummary: "Resumo de Produtos",
    selectProducts: "Selecionar Produtos",
    loadingProducts: "Carregando produtos...",
    confirmDelete: "Tem certeza?",
    confirmDeleteMessage: 'Você quer remover "{name}" do seu carrinho?',
    remove: "Remover",
    addToCart: "Adicionar",
    thanks: "Obrigado",
    greeting: "Olá {name}, complete seu pedido em poucos passos",
    steps: {
      products: "Produtos",
      addresses: "Endereços",
      confirm: "Confirmar",
    },

    // Checkout Success specific
    orderConfirmed: "Pedido Confirmado!",
    orderReceived: "Seu pedido foi recebido com sucesso.",
    contactSoon:
      "Entraremos em contato com você o mais breve possível para confirmação.",
    closePage: "Você pode fechar esta página e voltar ao chat do WhatsApp.",

    // Form placeholders
    streetPlaceholder: "Rua e número",
    cityPlaceholder: "Cidade",
    postalCodePlaceholder: "Código Postal",
    provincePlaceholder: "Estado/Província",
    countryPlaceholder: "País",
    namePlaceholder: "Nome completo",
    phonePlaceholder: "Telefone",
    companyPlaceholder: "Nome da empresa",
    notesPlaceholder: "Notas adicionais para entrega...",
    searchProductsPlaceholder: "Buscar produtos...",

    // Form labels
    streetLabel: "Rua e número",
    cityLabel: "Cidade",
    postalCodeLabel: "Código Postal",
    provinceLabel: "Estado/Província",
    countryLabel: "País",
    sameAsShippingLabel: "Mesmo endereço de envio",
    additionalNotesLabel: "Notas adicionais",
  },
}

// 🎯 Funzione per ottenere le traduzioni basate sulla lingua del cliente
export const getPublicPageTexts = (
  customerLanguage?: string
): PublicPageTexts => {
  // Map database language codes to our localization keys
  const languageMap: { [key: string]: SupportedLanguage } = {
    it: "IT",
    en: "EN",
    es: "ES",
    pt: "PT",
    italian: "IT",
    english: "EN",
    spanish: "ES",
    portuguese: "PT",
  }

  const mappedLanguage =
    languageMap[customerLanguage?.toLowerCase() || ""] || "IT"
  return publicPageTranslations[mappedLanguage]
}

export default publicPageTranslations
