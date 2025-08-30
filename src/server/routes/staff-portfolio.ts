import { Router } from 'express'
import { db } from '../lib/db'
import { tenantId, requireRole } from '../lib/guards'
import multer from 'multer'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs'
const r = Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/portfolio'
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files allowed'))
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
})

r.get('/api/staff/:staffId/portfolio', async (req,res)=>{
  const { staffId } = req.params
  const t = tenantId(req)
  const portfolio = await db.staffPortfolio.findMany({
    where: { tenantId: t, staffId },
    orderBy: [
      { featured: 'desc' },
      { createdAt: 'desc' }
    ]
  })
  res.json(portfolio)
})

r.get('/api/admin/staff/:staffId/portfolio', requireRole(['owner','admin']), async (req,res)=>{
  const { staffId } = req.params
  const t = tenantId(req)
  const portfolio = await db.staffPortfolio.findMany({
    where: { tenantId: t, staffId },
    orderBy: { createdAt: 'desc' }
  })
  res.json(portfolio)
})

r.post('/api/admin/staff/:staffId/portfolio', requireRole(['owner','admin']), upload.single('image'), async (req,res)=>{
  const { staffId } = req.params
  const { title, description, category, featured } = req.body || {}
  if (!title || !req.file) return res.status(422).json({ error:'Title and image required' })
  const t = tenantId(req)
  
  const staff = await db.staff.findUnique({ where: { id: staffId } })
  if (!staff || staff.tenantId !== t) return res.status(404).json({ error:'Staff not found' })
  
  try {
    const optimizedPath = req.file.path.replace(path.extname(req.file.path), '-optimized.webp')
    await sharp(req.file.path)
      .resize(800, 600, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(optimizedPath)
    
    fs.unlinkSync(req.file.path)
    
    const imageUrl = `/uploads/portfolio/${path.basename(optimizedPath)}`
    
    const portfolioItem = await db.staffPortfolio.create({
      data: {
        tenantId: t,
        staffId,
        title,
        description,
        category,
        featured: featured === 'true',
        imageUrl
      }
    })
    
    res.status(201).json(portfolioItem)
  } catch (error) {
    console.error('Image processing error:', error)
    res.status(500).json({ error: 'Image processing failed' })
  }
})

r.put('/api/admin/staff/:staffId/portfolio/:id', requireRole(['owner','admin']), async (req,res)=>{
  const { staffId, id } = req.params
  const { title, description, category, featured } = req.body || {}
  const t = tenantId(req)
  
  const portfolioItem = await db.staffPortfolio.findUnique({ where: { id } })
  if (!portfolioItem || portfolioItem.tenantId !== t || portfolioItem.staffId !== staffId) {
    return res.status(404).json({ error:'Portfolio item not found' })
  }
  
  const updated = await db.staffPortfolio.update({
    where: { id },
    data: { title, description, category, featured }
  })
  
  res.json(updated)
})

r.delete('/api/admin/staff/:staffId/portfolio/:id', requireRole(['owner','admin']), async (req,res)=>{
  const { staffId, id } = req.params
  const t = tenantId(req)
  
  const portfolioItem = await db.staffPortfolio.findUnique({ where: { id } })
  if (!portfolioItem || portfolioItem.tenantId !== t || portfolioItem.staffId !== staffId) {
    return res.status(404).json({ error:'Portfolio item not found' })
  }
  
  try {
    const imagePath = path.join('uploads/portfolio', path.basename(portfolioItem.imageUrl))
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath)
    }
  } catch (error) {
    console.error('Error deleting image file:', error)
  }
  
  await db.staffPortfolio.delete({ where: { id } })
  res.status(204).send()
})

r.post('/api/admin/staff/:id/upload', requireRole(['owner','admin']), upload.single('image'), async (req,res)=>{
  const { id } = req.params
  const t = tenantId(req)
  
  const staff = await db.staff.findUnique({ where: { id } })
  if (!staff || staff.tenantId !== t) return res.status(404).json({ error:'Staff not found' })
  
  if (!req.file) return res.status(422).json({ error:'Image required' })
  
  try {
    const optimizedPath = req.file.path.replace(path.extname(req.file.path), '-optimized.webp')
    await sharp(req.file.path)
      .resize(400, 400, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(optimizedPath)
    
    fs.unlinkSync(req.file.path)
    
    const imageUrl = `/uploads/portfolio/${path.basename(optimizedPath)}`
    
    if (staff.imageUrl) {
      try {
        const oldImagePath = path.join('uploads/portfolio', path.basename(staff.imageUrl))
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath)
        }
      } catch (error) {
        console.error('Error deleting old image:', error)
      }
    }
    
    const updated = await db.staff.update({
      where: { id },
      data: { imageUrl }
    })
    
    res.json(updated)
  } catch (error) {
    console.error('Image processing error:', error)
    res.status(500).json({ error: 'Image processing failed' })
  }
})

export default r
