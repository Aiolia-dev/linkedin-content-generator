import { NextResponse } from 'next/server';
import { db, auth as adminAuth } from '@/lib/firebase/admin';
import { collection, getDocs, query, where, orderBy } from 'firebase-admin/firestore';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const projects = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return new NextResponse(JSON.stringify(projects), {
      status: 200,
    });
  } catch (error) {
    console.error('Error in /api/projects:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
}
