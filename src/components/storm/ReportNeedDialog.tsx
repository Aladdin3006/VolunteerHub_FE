import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Box, TextField, Typography, IconButton, MenuItem, Select, InputLabel, FormControl
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import React, { useEffect, useState } from 'react'

interface SupplyNeedItem {
  type: string
  quantity?: number | string
  note?: string
}

const needTypes = [
  'người mắc kẹt',
  'bị thương',
  'thiếu đồ ăn',
  'thiếu nước',
  'thiếu thuốc',
  'khác'
]

interface Props {
  open: boolean
  onClose: () => void
  stormId?: string
  presetLat?: number | null
  presetLng?: number | null
  onSubmitted?: () => void
  apiBase: string
}

export default function ReportNeedDialog({
  open, onClose, stormId, presetLat, presetLng, onSubmitted, apiBase
}: Props) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    lat: '',
    lng: '',
    needs: [{ type: '', quantity: '', note: '' }] as SupplyNeedItem[]
  })

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      lat: presetLat?.toString() || '',
      lng: presetLng?.toString() || ''
    }))
  }, [presetLat, presetLng, open])

  const addNeed = () =>
    setFormData((p) => ({ ...p, needs: [...p.needs, { type: '', quantity: '', note: '' }] }))

  const removeNeed = (i: number) =>
    setFormData((p) => ({ ...p, needs: p.needs.filter((_, idx) => idx !== i) }))

  const handleChange = (name: string, value: string) =>
    setFormData((p) => ({ ...p, [name]: value }))

  const handleNeedChange = (i: number, key: keyof SupplyNeedItem, val: string) => {
    const list = [...formData.needs]
    list[i] = { ...list[i], [key]: val }
    setFormData((p) => ({ ...p, needs: list }))
  }

  const handleSubmit = async () => {
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        type: 'need',
        stormId,
        needs: formData.needs.map((n) => ({
          type: n.type,
          quantity: n.quantity ? parseInt(String(n.quantity)) : undefined,
          note: n.note
        })),
        location: {
          type: 'Point',
          coordinates: [parseFloat(formData.lng), parseFloat(formData.lat)]
        }
      }

      const res = await fetch(`${apiBase}/relief-point`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        alert('Báo cáo đã được gửi thành công!')
        onSubmitted?.()
        onClose()
        setFormData({
          name: '',
          description: '',
          address: '',
          lat: '',
          lng: '',
          needs: [{ type: '', quantity: '', note: '' }]
        })
      } else {
        alert('Lỗi khi gửi báo cáo.')
      }
    } catch (e) {
      alert('Lỗi khi gửi báo cáo.')
      console.error(e)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Báo cáo nhu cầu cứu trợ</DialogTitle>
      <DialogContent>
        <TextField label="Tên điểm" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} fullWidth margin="dense" required />
        <TextField label="Mô tả" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} fullWidth margin="dense" multiline rows={3} />
        <TextField label="Địa chỉ" value={formData.address} onChange={(e) => handleChange('address', e.target.value)} fullWidth margin="dense" />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField label="Vĩ độ (lat)" value={formData.lat} onChange={(e) => handleChange('lat', e.target.value)} fullWidth margin="dense" required type="number" />
          <TextField label="Kinh độ (lng)" value={formData.lng} onChange={(e) => handleChange('lng', e.target.value)} fullWidth margin="dense" required type="number" />
        </Box>

        <Typography variant="subtitle1" sx={{ mt: 2 }}>Nhu cầu cứu trợ</Typography>
        {formData.needs.map((n, i) => (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <FormControl size="small" sx={{ minWidth: 150, flex: 1 }}>
              <InputLabel>Loại nhu cầu</InputLabel>
              <Select label="Loại nhu cầu" value={n.type} onChange={(e) => handleNeedChange(i, 'type', e.target.value as string)}>
                {needTypes.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField size="small" label="Số lượng" value={n.quantity ?? ''} onChange={(e) => handleNeedChange(i, 'quantity', e.target.value)} type="number" sx={{ width: 120 }} />
            <TextField size="small" label="Ghi chú" value={n.note ?? ''} onChange={(e) => handleNeedChange(i, 'note', e.target.value)} sx={{ flex: 1, minWidth: 200 }} />
            <IconButton onClick={() => removeNeed(i)} color="error"><RemoveIcon /></IconButton>
          </Box>
        ))}
        <Button onClick={addNeed} startIcon={<AddIcon />} sx={{ mt: 1 }}>Thêm nhu cầu</Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained">Gửi báo cáo</Button>
      </DialogActions>
    </Dialog>
  )
}
