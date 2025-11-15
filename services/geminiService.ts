import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AspectRatioOption, QualityOption, StyleOption, PromptModificationType, PromptModificationOptions, FocalLengthOption, FacialExpressionOption, ConsistencyOption } from "../types";

// Assume process.env.API_KEY is pre-configured and available.
// Initialize GoogleGenAI right before making an API call to ensure it uses the most up-to-date API key.

export async function reverseImagePrompt(
  imageParts: { inlineData: { mimeType: string; data: string } }[]
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash"; // A general model suitable for image understanding

  const textPart = {
    text: `详细描述这张图片，包括元素、构图、光照和风格。为生成式AI艺术模型生成一个简洁、高质量、富有创意的中文提示词，该提示词可以重现这张图片或类似的图片。提示词应适合生成写实或艺术风格的图片。不要包含任何关于图片来源或质量的元信息，只需提供提示词本身。`
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: { parts: [...imageParts, textPart] },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating reverse image prompt:", error);
    throw new Error(`Failed to generate prompt: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function modifyPrompt(options: PromptModificationOptions): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash"; // A general model suitable for text manipulation

  let systemInstruction = `你是一位专业的AI提示词工程师，擅长提炼和优化图片生成提示词。你的目标是根据质量、长宽比和风格的具体指令，修改给定的提示词。生成一个改进后的中文提示词。`;
  
  let userPrompt = `原始提示词: "${options.originalPrompt}"\n\n`;

  if (options.modificationType === PromptModificationType.Specify && options.specificModificationInstruction) {
    userPrompt += `具体修改指令: "${options.specificModificationInstruction}"\n`;
  } else {
    userPrompt += `创造性地优化此提示词。\n`;
  }

  if (options.quality === QualityOption.EightKCineLighting) {
    userPrompt += `确保输出提示词包含8K分辨率和电影打光效果。`;
  }

  if (options.aspectRatio === AspectRatioOption.Portrait) {
    userPrompt += `建议使用9:16（肖像）长宽比。`;
  } else if (options.aspectRatio === AspectRatioOption.Landscape) {
    userPrompt += `建议使用16:9（横向）长宽比。`;
  }

  if (options.style === StyleOption.RealisticPhotography) {
    userPrompt += `建议使用写实写真风格。`;
  }

  // 新增焦距选项
  if (options.focalLength === FocalLengthOption._10mm) {
    userPrompt += `使用10mm焦距。`;
  } else if (options.focalLength === FocalLengthOption._25mm) {
    userPrompt += `使用25mm焦距。`;
  } else if (options.focalLength === FocalLengthOption._35mm) {
    userPrompt += `使用35mm焦距。`;
  }

  // 新增面部特写选项
  if (options.facialExpression === FacialExpressionOption.ExaggeratedFear) {
    userPrompt += `面部特写，表情夸张恐惧。`;
  } else if (options.facialExpression === FacialExpressionOption.ExaggeratedAnger) {
    userPrompt += `面部特写，表情夸张愤怒。`;
  } else if (options.facialExpression === FacialExpressionOption.ExaggeratedJoy) {
    userPrompt += `面部特写，表情夸张喜悦。`;
  } else if (options.facialExpression === FacialExpressionOption.ExaggeratedCrying) {
    userPrompt += `面部特写，表情夸张流泪。`;
  } else if (options.facialExpression === FacialExpressionOption.ExaggeratedPain) {
    userPrompt += `面部特写，表情夸张痛苦。`;
  }

  // 新增镜头提示词一致性选项
  if (options.consistency === ConsistencyOption.AbsoluteConsistency) {
    userPrompt += `保持人物、动物、角色和场景的绝对一致性，并确保每个镜头能够自然衔接前后画面。`;
  }

  userPrompt += `\n仅提供优化后的提示词，不包含任何额外的对话文本或解释。`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error modifying prompt:", error);
    throw new Error(`Failed to modify prompt: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Helper functions for Live API if needed later.
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}