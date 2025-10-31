"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { getEquipements, createEquipement, updateEquipement, deleteEquipement, type Equipement } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'

type FormState = {
  nom: string
  statut: 'AUTORISE' | 'INTERDIT' | 'SOUMIS'
  description: string
}

export default function EquipementsPage() {
  const [data, setData] = useState<Equipement[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Equipement | null>(null)
  const { toast } = useToast()

  const initialForm = useMemo<FormState>(() => ({ nom: '', statut: 'AUTORISE', description: '' }), [])
  const [form, setForm] = useState<FormState>(initialForm)

  useEffect(() => {
    const ac = new AbortController()
    setLoading(true)
    getEquipements(ac.signal)
      .then(setData)
      .catch(() => toast({ title: 'Erreur', description: "Impossible de charger les équipements." }))
      .finally(() => setLoading(false))
    return () => ac.abort()
  }, [toast])

  function onEdit(item: Equipement) {
    setEditing(item)
    setForm({ nom: item.nom, statut: item.statut, description: item.description || '' })
    setOpen(true)
  }

  function onCreate() {
    setEditing(null)
    setForm(initialForm)
    setOpen(true)
  }

  async function onSubmit() {
    try {
      if (editing) {
        const updated = await updateEquipement(editing.id_equipement, form)
        setData((prev) => prev.map((e) => (e.id_equipement === editing.id_equipement ? updated : e)))
        toast({ title: 'Équipement mis à jour' })
      } else {
        const created = await createEquipement(form)
        setData((prev) => [created, ...prev])
        toast({ title: 'Équipement créé' })
      }
      setOpen(false)
    } catch (e) {
      toast({ title: 'Erreur', description: "Action impossible. Vérifie l'authentification." })
    }
  }

  async function onDelete(id: number) {
    if (!confirm('Supprimer cet équipement ?')) return
    try {
      await deleteEquipement(id)
      setData((prev) => prev.filter((e) => e.id_equipement !== id))
      toast({ title: 'Équipement supprimé' })
    } catch (e) {
      toast({ title: 'Erreur', description: "Suppression impossible." })
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Gestion des équipements</h1>
        <Button onClick={onCreate}>Nouvel équipement</Button>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Ajouté le</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6}>Chargement…</TableCell></TableRow>
            ) : data.length === 0 ? (
              <TableRow><TableCell colSpan={6}>Aucun équipement</TableCell></TableRow>
            ) : (
              data.map((e) => (
                <TableRow key={e.id_equipement}>
                  <TableCell>{e.id_equipement}</TableCell>
                  <TableCell>{e.nom}</TableCell>
                  <TableCell>{
                    e.statut === 'AUTORISE' ? 'Autorisé' : e.statut === 'INTERDIT' ? 'Interdit' : 'Soumis à autorisation'
                  }</TableCell>
                  <TableCell>{new Date(e.date_ajout).toLocaleString()}</TableCell>
                  <TableCell className="max-w-[380px] truncate" title={e.description}>{e.description}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="secondary" onClick={() => onEdit(e)}>Modifier</Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(e.id_equipement)}>Supprimer</Button>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier un équipement' : 'Créer un équipement'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom</label>
              <Input value={form.nom} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, nom: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Statut</label>
              <Select value={form.statut} onValueChange={(v: any) => setForm((f) => ({ ...f, statut: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AUTORISE">Autorisé</SelectItem>
                  <SelectItem value="INTERDIT">Interdit</SelectItem>
                  <SelectItem value="SOUMIS">Soumis à autorisation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea value={form.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setOpen(false)}>Annuler</Button>
              <Button onClick={onSubmit}>{editing ? 'Enregistrer' : 'Créer'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
