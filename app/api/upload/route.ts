import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import crypto from 'crypto'

// Taille maximale : 5 Mo
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Types MIME acceptes pour les images
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]

// POST /api/upload — Upload d'image vers Cloudinary (admin)
export async function POST(request: NextRequest) {
  try {
    // Verification admin
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorise' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // Validation du type MIME
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Type de fichier non accepte. Formats autorises : JPEG, PNG, WebP, AVIF` },
        { status: 400 }
      )
    }

    // Validation de la taille
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux. Taille maximale : 5 Mo' },
        { status: 400 }
      )
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    // Fallback si Cloudinary n'est pas configure ou si les credentials sont des placeholders
    const isPlaceholder = (val: string | undefined) =>
      !val || val.startsWith('your-') || val === 'xxxxxxxxxxxxxxxx' || val.length < 5

    if (isPlaceholder(cloudName) || isPlaceholder(apiKey) || isPlaceholder(apiSecret)) {
      console.warn('Cloudinary non configure — configurez vos credentials dans .env')
      return NextResponse.json(
        { error: 'Cloudinary non configure. Allez dans Dashboard > Outils pour configurer vos cles API Cloudinary.' },
        { status: 400 }
      )
    }

    // Generer la signature pour l'upload securise (signed upload)
    const timestamp = Math.round(Date.now() / 1000)
    const folder = 'tokossa/products'

    // Construire la chaine a signer selon la spec Cloudinary
    const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret!}`
    const signature = crypto
      .createHash('sha1')
      .update(signatureString)
      .digest('hex')

    // Preparer le formulaire d'upload
    const uploadFormData = new FormData()
    uploadFormData.append('file', file)
    uploadFormData.append('api_key', apiKey!)
    uploadFormData.append('timestamp', String(timestamp))
    uploadFormData.append('signature', signature)
    uploadFormData.append('folder', folder)

    // Appel API Cloudinary
    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: uploadFormData,
      }
    )

    if (!cloudinaryResponse.ok) {
      const errorData = await cloudinaryResponse.text()
      console.error('Cloudinary upload error:', errorData)

      // Tentative avec upload preset (unsigned) en fallback
      const presetFormData = new FormData()
      presetFormData.append('file', file)
      presetFormData.append('upload_preset', 'tokossa_products')
      presetFormData.append('folder', folder)

      const retryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: presetFormData,
        }
      )

      if (!retryResponse.ok) {
        console.error('Cloudinary unsigned upload error:', await retryResponse.text())
        return NextResponse.json(
          { error: 'Erreur upload Cloudinary' },
          { status: 500 }
        )
      }

      const retryData = await retryResponse.json() as {
        secure_url: string
        public_id: string
      }

      return NextResponse.json({
        url: retryData.secure_url,
        publicId: retryData.public_id,
      })
    }

    const data = await cloudinaryResponse.json() as {
      secure_url: string
      public_id: string
    }

    return NextResponse.json({
      url: data.secure_url,
      publicId: data.public_id,
    })
  } catch (error) {
    console.error('POST /api/upload error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'upload' },
      { status: 500 }
    )
  }
}
