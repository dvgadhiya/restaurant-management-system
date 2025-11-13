"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { UserPlus, Clock, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

interface UserRequest {
  id: string
  email: string
  name: string
  role: string
  phone?: string
  status: string
  createdAt: string
}

export default function UserRequestsPage() {
  const [requests, setRequests] = useState<UserRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [processing, setProcessing] = useState(false)

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/user-requests")
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      }
    } catch (error) {
      console.error("Error fetching requests:", error)
      toast.error("Failed to load user requests")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleApprove = async (requestId: string) => {
    setProcessing(true)
    try {
      const response = await fetch(`/api/user-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE" })
      })

      if (response.ok) {
        toast.success("User approved and account created")
        fetchRequests()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to approve user")
      }
    } catch (error) {
      console.error("Error approving user:", error)
      toast.error("Failed to approve user")
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest) return

    setProcessing(true)
    try {
      const response = await fetch(`/api/user-requests/${selectedRequest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REJECT",
          rejectionReason
        })
      })

      if (response.ok) {
        toast.success("User request rejected")
        setShowRejectDialog(false)
        setRejectionReason("")
        setSelectedRequest(null)
        fetchRequests()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to reject user")
      }
    } catch (error) {
      console.error("Error rejecting user:", error)
      toast.error("Failed to reject user")
    } finally {
      setProcessing(false)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "WAITER":
        return "bg-blue-100 text-blue-800"
      case "CHEF":
        return "bg-orange-100 text-orange-800"
      case "CASHIER":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">User Requests</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Requests</h1>
          <p className="text-muted-foreground">Review and approve new user registrations</p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {requests.length} Pending
        </Badge>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl text-muted-foreground">No pending user requests</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>{request.name}</CardTitle>
                    <CardDescription>{request.email}</CardDescription>
                    {request.phone && (
                      <p className="text-sm text-muted-foreground">{request.phone}</p>
                    )}
                  </div>
                  <Badge className={getRoleBadgeColor(request.role)}>
                    {request.role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Clock className="h-4 w-4" />
                  <span>
                    Requested {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(request.id)}
                    disabled={processing}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      setSelectedRequest(request)
                      setShowRejectDialog(true)
                    }}
                    disabled={processing}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject User Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject {selectedRequest?.name}&apos;s registration request?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for rejection (optional)</Label>
            <Textarea
              id="reason"
              placeholder="Please provide a reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={processing}
              className="bg-red-600 hover:bg-red-700"
            >
              {processing ? "Rejecting..." : "Reject Request"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
