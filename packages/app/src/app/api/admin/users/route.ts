import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

async function verifyAdmin(request: NextRequest) {
  if (!adminAuth || !adminDb) {
    throw new Error('Service unavailable')
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Unauthorized')
  }

  const idToken = authHeader.split('Bearer ')[1]
  const decodedToken = await adminAuth.verifyIdToken(idToken)
  
  const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get()
  const userRole = userDoc.data()?.role

  if (userRole !== 'admin') {
    throw new Error('Admin access required')
  }

  return decodedToken
}

export async function GET(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ users: [], total: 0 })
    }

    await verifyAdmin(request)

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = adminDb.collection('users').orderBy('createdAt', 'desc')

    if (role) {
      query = query.where('role', '==', role)
    }

    const snapshot = await query.limit(limit).offset(offset).get()
    
    const users: any[] = []
    snapshot.forEach(doc => {
      const userData = doc.data()
      users.push({
        id: doc.id,
        ...userData,
        createdAt: userData.createdAt?.toDate(),
        updatedAt: userData.updatedAt?.toDate()
      })
    })

    // Get total count
    const totalSnapshot = await adminDb.collection('users').get()
    const total = totalSnapshot.size

    return NextResponse.json({ users, total })

  } catch (error: any) {
    console.error('Error fetching users:', error)
    const status = error.message === 'Unauthorized' || error.message === 'Admin access required' ? 403 : 
                  error.message === 'Service unavailable' ? 503 : 500
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!adminAuth || !adminDb) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      )
    }

    await verifyAdmin(request)

    const userData = await request.json()
    
    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email: userData.email,
      password: userData.password,
      displayName: userData.displayName,
      disabled: false
    })

    // Create user profile in Firestore
    const user = {
      uid: userRecord.uid,
      email: userData.email,
      displayName: userData.displayName,
      role: userData.role || 'user',
      isVerified: userData.isVerified || false,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await adminDb.collection('users').doc(userRecord.uid).set(user)

    return NextResponse.json({
      success: true,
      user: user
    })

  } catch (error: any) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    )
  }
}