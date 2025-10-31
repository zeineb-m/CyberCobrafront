"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { getCameras, createCamera, updateCamera, deleteCamera, type Camera } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'

type FormState = {
  name: string
  zone: string
  ip_address: string
  resolution: string
  status: 'RECORDING' | 'OFFLINE' | 'MAINTENANCE'
}

export default function CamerasPage() {
  const [data, setData] = useState<Camera[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Camera | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  const initialForm = useMemo<FormState>(
    () => ({ name: '', zone: '', ip_address: '', resolution: '1080p', status: 'RECORDING' }),
    []
  )
  const [form, setForm] = useState<FormState>(initialForm)

  useEffect(() => {
    const ac = new AbortController()
    setLoading(true)
    getCameras(ac.signal)
      .then(setData)
      .catch(() => toast({ title: 'Erreur', description: "Impossible de charger les caméras." }))
      .finally(() => setLoading(false))
    return () => ac.abort()
  }, [toast])

  const filteredData = useMemo(() => {
    if (!searchTerm) return data
    const term = searchTerm.toLowerCase()
    return data.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.zone.toLowerCase().includes(term) ||
        c.ip_address.toLowerCase().includes(term)
    )
  }, [data, searchTerm])

  function onEdit(item: Camera) {
    setEditing(item)
    setForm({
      name: item.name,
      zone: item.zone,
      ip_address: item.ip_address,
      resolution: item.resolution,
      status: item.status,
    })
    setOpen(true)
  }

  function onCreate() {
    setEditing(null)
    setForm(initialForm)
    setOpen(true)
  }

  async function onSubmit() {
    // Basic validation
    if (!form.name || !form.zone || !form.ip_address) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs obligatoires.', variant: 'destructive' })
      return
    }

    try {
      if (editing) {
        const updated = await updateCamera(editing.id_camera, form)
        setData((prev) => prev.map((c) => (c.id_camera === editing.id_camera ? updated : c)))
        toast({ title: 'Caméra mise à jour' })
      } else {
        const created = await createCamera(form)
        setData((prev) => [created, ...prev])
        toast({ title: 'Caméra créée' })
      }
      setOpen(false)
    } catch (e) {
      toast({ title: 'Erreur', description: "Action impossible. Vérifie l'authentification.", variant: 'destructive' })
    }
  }

  async function onDelete(id: number) {
    if (!confirm('Supprimer cette caméra ?')) return
    try {
      await deleteCamera(id)
      setData((prev) => prev.filter((c) => c.id_camera !== id))
      toast({ title: 'Caméra supprimée' })
    } catch (e) {
      toast({ title: 'Erreur', description: 'Suppression impossible.', variant: 'destructive' })
    }
  }

  function getStatusBadge(status: Camera['status']) {
    const variants: Record<Camera['status'], { label: string; variant: 'default' | 'destructive' | 'secondary' }> = {
      RECORDING: { label: 'Recording', variant: 'default' },
      OFFLINE: { label: 'Offline', variant: 'destructive' },
      MAINTENANCE: { label: 'Maintenance', variant: 'secondary' },
    }
    const config = variants[status]
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Camera Network</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor and manage surveillance cameras</p>
        </div>
        <Button onClick={onCreate}>+ Add Camera</Button>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Search cameras..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Resolution</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>Loading…</TableCell>
              </TableRow>
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>No cameras found</TableCell>
              </TableRow>
            ) : (
              filteredData.map((c) => (
                <TableRow key={c.id_camera}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.zone}</TableCell>
                  <TableCell className="font-mono text-sm">{c.ip_address}</TableCell>
                  <TableCell>{c.resolution}</TableCell>
                  <TableCell>{getStatusBadge(c.status)}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => onEdit(c)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(c.id_camera)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <span />
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Camera' : 'Add New Camera'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                placeholder="Front Gate"
                value={form.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Zone</label>
              <Input
                placeholder="Zone A"
                value={form.zone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, zone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">IP Address</label>
              <Input
                placeholder="192.168.1.10"
                value={form.ip_address}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setForm((f) => ({ ...f, ip_address: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Resolution</label>
              <Select value={form.resolution} onValueChange={(v: string) => setForm((f) => ({ ...f, resolution: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select resolution" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="720p">720p</SelectItem>
                  <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                  <SelectItem value="2K">2K</SelectItem>
                  <SelectItem value="4K">4K (Ultra HD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={form.status}
                onValueChange={(v: Camera['status']) => setForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RECORDING">Recording</SelectItem>
                  <SelectItem value="OFFLINE">Offline</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={onSubmit}>{editing ? 'Save Changes' : 'Create Camera'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
