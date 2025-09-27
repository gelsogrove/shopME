import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { logger } from "@/lib/logger"
import axios from "axios"
import React, { useState } from "react"

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`

const MessageTestPage: React.FC = () => {
  const [message, setMessage] = useState("")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setResponse("")

    try {
      const { data } = await axios.post(`${API_URL}/messages`, {
        message,
      })

      if (data.success) {
        setResponse(JSON.stringify(data.data, null, 2))
      } else {
        setError("Request failed: " + data.error)
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`)
      logger.error("Error sending message:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-lg font-bold mb-6">Message Processing API Test</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Send a Message</CardTitle>
            <CardDescription>
              This will send your message to the API and return the processed
              result.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="message">Message</Label>
                  <Input
                    id="message"
                    placeholder="Type your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                type="button"
                onClick={() => setMessage("")}
              >
                Clear
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
            <CardDescription>
              The processed message from the API will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            {response && (
              <Textarea
                className="min-h-[200px] font-mono"
                readOnly
                value={response}
              />
            )}
            {!response && !error && (
              <div className="text-gray-500 italic">
                Responses will appear here after you send a message.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default MessageTestPage
