import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { auth } from '@/lib/auth/auth';

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
    const { topic, tone, length, keywords } = body;

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Construct the prompt
    const prompt = `Write a professional LinkedIn post about ${topic}.
    Tone: ${tone || 'professional'}
    Length: ${length || 'medium'} (short: 1-2 paragraphs, medium: 2-3 paragraphs, long: 3-4 paragraphs)
    ${keywords ? `Include these keywords: ${keywords.join(', ')}` : ''}
    
    Make sure the post:
    - Starts with a hook to grab attention
    - Includes relevant hashtags
    - Has proper spacing for readability
    - Ends with a call to action
    - Follows LinkedIn best practices
    - Is engaging and shareable`;

    // Generate content using OpenAI
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional LinkedIn content creator who specializes in creating engaging and viral posts."
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

    return NextResponse.json({ content: generatedContent });
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
