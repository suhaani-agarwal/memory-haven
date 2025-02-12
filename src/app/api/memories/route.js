// import { getServerSession } from "next-auth/next";
// import { authOptions } from "../auth/[...nextauth]";
// import { prisma } from "@/lib/prisma";
// import { NextResponse } from "next/server";

// export async function POST(req) {
//   try {
//     const session = await getServerSession(authOptions);
    
//     if (!session) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     const formData = await req.formData();
//     const text = formData.get('text');
//     const imageFile = formData.get('image');
//     const audioFile = formData.get('audio');
    
//     // Upload files to your storage service (e.g., Supabase Storage)
//     let imageUrl = null;
//     let audioUrl = null;
    
//     if (imageFile) {
//       imageUrl = await uploadToStorage(imageFile); // Implement this function
//     }
    
//     if (audioFile) {
//       audioUrl = await uploadToStorage(audioFile); // Implement this function
//     }
    
//     // Create memory in database
//     const memory = await prisma.memory.create({
//       data: {
//         text,
//         imageUrl,
//         audioUrl,
//         userId: session.user.id,
//       },
//     });
    
//     return NextResponse.json(memory);
//   } catch (error) {
//     console.error('Error creating memory:', error);
//     return new NextResponse("Internal Server Error", { status: 500 });
//   }
// }

// export async function GET(req) {
//   try {
//     const session = await getServerSession(authOptions);
    
//     if (!session) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }
    
//     const memories = await prisma.memory.findMany({
//       where: {
//         userId: session.user.id
//       },
//       orderBy: {
//         createdAt: 'desc'
//       },
//       take: 10 // Get last 10 memories
//     });
    
//     return NextResponse.json(memories);
//   } catch (error) {
//     console.error('Error fetching memories:', error);
//     return new NextResponse("Internal Server Error", { status: 500 });
//   }
// }


// pages/api/memories/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const text = formData.get('text');
    const mood = formData.get('mood');
    const imageFile = formData.get('image');
    const audioFile = formData.get('audio');
    
    // For now, let's just store the base64 image directly
    // In production, you'd want to upload to proper storage
    let imageUrl = null;
    let audioUrl = null;
    
    if (imageFile) {
      // Convert File to base64 and store
      const imageBuffer = await imageFile.arrayBuffer();
      const imageBase64 = Buffer.from(imageBuffer).toString('base64');
      imageUrl = `data:${imageFile.type};base64,${imageBase64}`;
    }
    
    if (audioFile) {
      // Convert File to base64 and store
      const audioBuffer = await audioFile.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString('base64');
      audioUrl = `data:${audioFile.type};base64,${audioBase64}`;
    }
    
    // Create memory in database
    const memory = await prisma.memory.create({
      data: {
        text,
        mood,
        imageUrl,
        audioUrl,
        userId: session.user.id,
      },
    });
    
    return NextResponse.json(memory);
  } catch (error) {
    console.error('Error creating memory:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// For testing, you can add this logging
console.log('Memory created:', memory);

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const memories = await prisma.memory.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });
    
    return NextResponse.json(memories);
  } catch (error) {
    console.error('Error fetching memories:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}