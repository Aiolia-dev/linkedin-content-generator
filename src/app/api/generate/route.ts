import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { auth } from '@/lib/auth/auth';
import { db } from '@/lib/firebase/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { projectType, tone, subject, contentLength, keywords, persona, projectId } = body;

    if (!subject) {
      return NextResponse.json(
        { error: 'Subject is required' },
        { status: 400 }
      );
    }

    // Construct the prompt based on project type
    let prompt = '';
    if (projectType === 'linkedin_post') {
      prompt = `Write a professional LinkedIn post about ${subject}.
      Tone: ${tone || 'professional'}
      Length: ${contentLength || 'medium'} (short: 1-2 paragraphs, medium: 2-3 paragraphs, long: 3-4 paragraphs)
      ${keywords?.length > 0 ? `Include these keywords: ${keywords.join(', ')}` : ''}
      
      Make sure the post:
      - Starts with a hook to grab attention
      - Includes relevant hashtags
      - Has proper spacing for readability
      - Ends with a call to action
      - Follows LinkedIn best practices
      - Is engaging and shareable`;
    } else if (projectType === 'article') {
      prompt = `Write a professional LinkedIn article about ${subject}.
      Tone: ${tone || 'professional'}
      Length: ${contentLength || 'medium'} (short: 2-3 paragraphs, medium: 4-5 paragraphs, long: 6-7 paragraphs)
      ${keywords?.length > 0 ? `Include these keywords: ${keywords.join(', ')}` : ''}
      
      Make sure the article:
      - Has an engaging title
      - Includes a compelling introduction
      - Is well-structured with clear sections
      - Provides valuable insights
      - Ends with a strong conclusion
      - Includes relevant hashtags`;
    }

    // Generate content using OpenAI
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a professional LinkedIn content creator ${persona ? `taking on the persona of ${persona}` : ''} who specializes in creating engaging and viral content.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-4-turbo-preview",
      temperature: 0.7,
    });

    const generatedContent = completion.choices[0].message.content;

    // Save the generated content to Firebase
    try {
      const projectRef = doc(db, 'projects', body.projectId);
      await updateDoc(projectRef, {
        generatedContent,
        lastGeneratedAt: new Date().toISOString(),
        status: 'generated'
      });
    } catch (error) {
      console.error('Error saving to Firebase:', error);
      // Continue even if save fails, so user doesn't lose their generated content
    }

    return NextResponse.json({ content: generatedContent });
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
