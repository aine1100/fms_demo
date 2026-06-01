"use client"

import { useState, useRef, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/shared/status-badge"
import { QrCode, Camera, Search, FireExtinguisher, MapPin, Calendar, CheckCircle, AlertTriangle } from "lucide-react"

const sampleEquipment = {
  id: "EXT-001",
  type: "ABC Dry Chemical",
  capacity: "10 lbs",
  location: "Building A - Floor 1 - Main Entrance",
  customer: "ABC Corporation",
  lastInspection: "2024-01-10",
  nextInspection: "2024-07-10",
  expiryDate: "2025-01-10",
  status: "active" as const,
  manufacturer: "Kidde",
  model: "Pro 10",
  serialNumber: "KD-2024-001234",
  installDate: "2022-01-15",
}

export default function QRScannerPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [manualCode, setManualCode] = useState("")
  const [scannedEquipment, setScannedEquipment] = useState<typeof sampleEquipment | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleScan = () => {
    // Simulate scanning - in production, this would use a QR code library
    setIsScanning(true)
    setTimeout(() => {
      setIsScanning(false)
      setScannedEquipment(sampleEquipment)
    }, 2000)
  }

  const handleManualSearch = () => {
    if (manualCode.trim()) {
      setScannedEquipment(sampleEquipment)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">QR Scanner</h1>
          <p className="text-muted-foreground">Scan equipment QR codes to view details</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Scan QR Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative aspect-square rounded-lg border-2 border-dashed bg-muted/50 flex items-center justify-center overflow-hidden">
                {isScanning ? (
                  <div className="text-center">
                    <div className="animate-pulse">
                      <QrCode className="mx-auto h-16 w-16 text-primary" />
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">Scanning...</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <QrCode className="mx-auto h-16 w-16 text-muted-foreground" />
                    <p className="mt-4 text-sm text-muted-foreground">
                      Position QR code within the frame
                    </p>
                  </div>
                )}
              </div>
              <Button className="w-full gap-2" onClick={handleScan} disabled={isScanning}>
                <Camera className="h-4 w-4" />
                {isScanning ? "Scanning..." : "Start Scanning"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manual Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Can&apos;t scan? Enter the equipment ID manually.
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Enter equipment ID (e.g., EXT-001)"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="pl-10"
                    onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                  />
                </div>
                <Button onClick={handleManualSearch}>Search</Button>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <h4 className="font-medium text-sm mb-2">Recent Scans</h4>
                <div className="space-y-2">
                  {["EXT-001", "EXT-015", "EXT-023"].map((id) => (
                    <button
                      key={id}
                      className="w-full text-left rounded-lg bg-background p-2 text-sm hover:bg-muted transition-colors"
                      onClick={() => {
                        setManualCode(id)
                        setScannedEquipment(sampleEquipment)
                      }}
                    >
                      <span className="font-medium">{id}</span>
                      <span className="text-muted-foreground ml-2">- ABC Corporation</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {scannedEquipment && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`rounded-full p-3 ${
                    scannedEquipment.status === "active" ? "bg-success/10" : "bg-warning/10"
                  }`}>
                    <FireExtinguisher className={`h-6 w-6 ${
                      scannedEquipment.status === "active" ? "text-success" : "text-warning"
                    }`} />
                  </div>
                  <div>
                    <CardTitle>{scannedEquipment.id}</CardTitle>
                    <p className="text-sm text-muted-foreground">{scannedEquipment.type}</p>
                  </div>
                </div>
                <StatusBadge status={scannedEquipment.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Equipment Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Manufacturer</span>
                      <span className="font-medium">{scannedEquipment.manufacturer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Model</span>
                      <span className="font-medium">{scannedEquipment.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Serial Number</span>
                      <span className="font-medium">{scannedEquipment.serialNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Capacity</span>
                      <span className="font-medium">{scannedEquipment.capacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Install Date</span>
                      <span className="font-medium">{scannedEquipment.installDate}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Inspection Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Inspection</span>
                      <span className="font-medium flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-success" />
                        {scannedEquipment.lastInspection}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Next Inspection</span>
                      <span className="font-medium">{scannedEquipment.nextInspection}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expiry Date</span>
                      <span className="font-medium">{scannedEquipment.expiryDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Customer</span>
                      <span className="font-medium">{scannedEquipment.customer}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{scannedEquipment.location}</span>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <Button className="flex-1">Start Inspection</Button>
                <Button variant="outline" className="flex-1">View History</Button>
                <Button variant="outline">Report Issue</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
