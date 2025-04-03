import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowRight,
  ArrowUp,
  CreditCard,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react"
import { Link } from "react-router-dom"

export default function DashboardPage() {
  // Dati di esempio per la dashboard
  const totalOrders = 1352
  const totalUsage = 12580.9

  const newClients = [
    { id: 1, name: "Marco Rossi", date: "2 ore fa" },
    { id: 2, name: "Giulia Verdi", date: "6 ore fa" },
    { id: 3, name: "Luca Bianchi", date: "1 giorno fa" },
    { id: 4, name: "Sofia Romano", date: "2 giorni fa" },
  ]

  const latestOrders = [
    { id: 1, customer: "Marco Rossi", amount: "€299.99" },
    { id: 2, customer: "Giuseppe Verdi", amount: "€199.99" },
    { id: 3, customer: "Sofia Bianchi", amount: "€399.99" },
    { id: 4, customer: "Alessandro Neri", amount: "€149.50" },
  ]

  const latestMessages = [
    {
      id: 1,
      name: "Marco Rossi",
      initials: "MR",
      message: "Ho bisogno di aiuto con il mio ordine #12345...",
      time: "2h fa",
    },
    {
      id: 2,
      name: "Giuseppe Verdi",
      initials: "GV",
      message: "Quando sarà disponibile il prodotto Parmigiano Reggiano?",
      time: "4h fa",
    },
    {
      id: 3,
      name: "Sofia Bianchi",
      initials: "SB",
      message: "Posso modificare il mio indirizzo di spedizione?",
      time: "1g fa",
    },
    {
      id: 4,
      name: "Elena Ferrari",
      initials: "EF",
      message: "Vorrei effettuare un reso per un prodotto danneggiato.",
      time: "2g fa",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid gap-6">
        {/* Metriche principali */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex flex-col items-start justify-between p-6">
              <div className="flex items-center space-x-4">
                <div className="rounded-full p-2 bg-blue-100">
                  <ShoppingCart className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Totale Ordini
                  </p>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-2xl font-bold">{totalOrders}</h3>
                    <span className="flex items-center text-xs text-green-500">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      12%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-start justify-between p-6">
              <div className="flex items-center space-x-4">
                <div className="rounded-full p-2 bg-green-100">
                  <CreditCard className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Totale Usage
                  </p>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-2xl font-bold">
                      €
                      {totalUsage.toLocaleString("it-IT", {
                        minimumFractionDigits: 2,
                      })}
                    </h3>
                    <span className="flex items-center text-xs text-green-500">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      8%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-start justify-between p-6">
              <div className="flex items-center space-x-4">
                <div className="rounded-full p-2 bg-purple-100">
                  <Users className="h-6 w-6 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Nuovi Clienti
                  </p>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-2xl font-bold">{newClients.length}</h3>
                    <span className="flex items-center text-xs text-green-500">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      5%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col items-start justify-between p-6">
              <div className="flex items-center space-x-4">
                <div className="rounded-full p-2 bg-yellow-100">
                  <Package className="h-6 w-6 text-yellow-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Prodotti Attivi
                  </p>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-2xl font-bold">18</h3>
                    <span className="flex items-center text-xs text-green-500">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      2%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Box principali */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Box ultimi ordini */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                Ultimi Ordini
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/orders" className="flex items-center gap-1 text-sm">
                  Vedi tutti
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {latestOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="font-medium">{order.customer}</div>
                    <div className="font-semibold text-green-600">
                      {order.amount}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Box nuovi clienti */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                Nuovi Clienti
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/clients" className="flex items-center gap-1 text-sm">
                  Vedi tutti
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {newClients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="font-medium">{client.name}</div>
                    <div className="text-sm text-gray-500">{client.date}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Box ultimi messaggi */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">
                Ultimi Messaggi
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/chats" className="flex items-center gap-1 text-sm">
                  Vedi tutti
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {latestMessages.map((message) => (
                  <div
                    key={message.id}
                    className="flex gap-3 border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
                      <span className="text-sm font-semibold text-gray-700">
                        {message.initials}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{message.name}</div>
                        <div className="text-xs text-gray-500">
                          {message.time}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {message.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
