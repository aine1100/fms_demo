"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { FireExtinguisher, Camera, CheckCircle, XCircle, AlertTriangle, ArrowLeft, ArrowRight, Save, Send } from "lucide-react"

const inspectionItems = [
  { id: 1, name: "ABC Dry Chemical - EXT-001", location: "Floor 1 - Entrance" },
  { id: 2, name: "CO2 Extinguisher - EXT-002", location: "Floor 1 - Kitchen" },
  { id: 3, name: "Water Extinguisher - EXT-003", location: "Floor 1 - Storage" },
  { id: 4, name: "ABC Dry Chemical - EXT-004", location: "Floor 2 - Office" },
  { id: 5, name: "Foam Extinguisher - EXT-005", location: "Floor 2 - Lab" },
]

const checklistItems = [
  { id: "pressure", label: "Pressure gauge in green zone" },
  { id: "seal", label: "Safety seal intact" },
  { id: "pin", label: "Pull pin present and secured" },
  { id: "hose", label: "Hose and nozzle in good condition" },
  { id: "body", label: "Cylinder body free from damage/corrosion" },
  { id: "label", label: "Operating instructions visible" },
  { id: "mounting", label: "Properly mounted and accessible" },
  { id: "signage", label: "Location signage visible" },
]

export default function InspectionFormPage() {
  const [currentItem, setCurrentItem] = useState(0)
  const [checklist, setChecklist] = useState<Record<string, boolean>>({})
  const [overallStatus, setOverallStatus] = useState("")
  const [notes, setNotes] = useState("")

  const progress = ((currentItem + 1) / inspectionItems.length) * 100
  const item = inspectionItems[currentItem]

  const handleChecklistChange = (id: string, checked: boolean) => {
    setChecklist({ ...checklist, [id]: checked })
  }

  const handleNext = () => {
    if (currentItem < inspectionItems.length - 1) {
      setCurrentItem(currentItem + 1)
      setChecklist({})
      setOverallStatus("")
      setNotes("")
    }
  }

  const handlePrevious = () => {
    if (currentItem > 0) {
      setCurrentItem(currentItem - 1)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inspection Form</h1>
            <p className="text-muted-foreground">ABC Corporation - Building A</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Item {currentItem + 1} of {inspectionItems.length}
            </span>
            <Button variant="outline" className="gap-2">
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-3">
                      <FireExtinguisher className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>{item.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{item.location}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Camera className="h-4 w-4" />
                    Add Photo
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Inspection Checklist</h3>
                  <div className="space-y-3">
                    {checklistItems.map((checkItem) => (
                      <div key={checkItem.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={checkItem.id}
                          checked={checklist[checkItem.id] || false}
                          onCheckedChange={(checked) => handleChecklistChange(checkItem.id, checked as boolean)}
                        />
                        <Label htmlFor={checkItem.id} className="text-sm cursor-pointer">
                          {checkItem.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-medium">Overall Status</h3>
                  <RadioGroup value={overallStatus} onValueChange={setOverallStatus}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pass" id="pass" />
                      <Label htmlFor="pass" className="flex items-center gap-2 cursor-pointer">
                        <CheckCircle className="h-4 w-4 text-success" />
                        Pass - Equipment in good condition
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fail" id="fail" />
                      <Label htmlFor="fail" className="flex items-center gap-2 cursor-pointer">
                        <XCircle className="h-4 w-4 text-destructive" />
                        Fail - Requires immediate attention
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="warning" id="warning" />
                      <Label htmlFor="warning" className="flex items-center gap-2 cursor-pointer">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        Warning - Needs service soon
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes / Observations</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional notes or observations..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                {overallStatus === "fail" && (
                  <div className="space-y-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                    <h4 className="font-medium text-destructive">Failure Details</h4>
                    <div className="space-y-2">
                      <Label htmlFor="failureReason">Reason for Failure</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pressure">Low/No Pressure</SelectItem>
                          <SelectItem value="damage">Physical Damage</SelectItem>
                          <SelectItem value="corrosion">Corrosion</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                          <SelectItem value="missing">Missing Component</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="action">Recommended Action</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recharge">Recharge</SelectItem>
                          <SelectItem value="repair">Repair</SelectItem>
                          <SelectItem value="replace">Replace</SelectItem>
                          <SelectItem value="service">Professional Service</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handlePrevious} disabled={currentItem === 0} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
              {currentItem < inspectionItems.length - 1 ? (
                <Button onClick={handleNext} className="gap-2">
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button className="gap-2">
                  <Send className="h-4 w-4" />
                  Submit Inspection
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Equipment List</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {inspectionItems.map((equip, index) => (
                    <button
                      key={equip.id}
                      onClick={() => setCurrentItem(index)}
                      className={`w-full text-left rounded-lg p-3 transition-colors ${
                        index === currentItem
                          ? "bg-primary text-primary-foreground"
                          : index < currentItem
                          ? "bg-success/10 border border-success/20"
                          : "bg-muted/50 hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{equip.name}</p>
                          <p className={`text-xs ${index === currentItem ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                            {equip.location}
                          </p>
                        </div>
                        {index < currentItem && (
                          <CheckCircle className="h-4 w-4 text-success" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Customer Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company</span>
                  <span className="font-medium">ABC Corporation</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact</span>
                  <span className="font-medium">John Doe</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">(555) 123-4567</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">Building A</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
