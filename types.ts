export enum AppView {
  ReversePrompt = 'reversePrompt',
  ModifyPrompt = 'modifyPrompt',
}

export interface ImagePrompt {
  id: string;
  filename: string;
  base64: string;
  mimeType: string; // Added mimeType
  prompt: string;
  isLoading: boolean;
  error: string | null;
}

export enum QualityOption {
  EightKCineLighting = '8k_cinematic_lighting',
}

export enum AspectRatioOption {
  None = 'none',
  Portrait = '9:16',
  Landscape = '16:9',
}

export enum StyleOption {
  None = 'none',
  RealisticPhotography = 'realistic_photography',
}

export enum FocalLengthOption {
  None = 'none',
  _10mm = '10mm',
  _25mm = '25mm',
  _35mm = '35mm',
}

export enum FacialExpressionOption {
  None = 'none',
  ExaggeratedFear = 'exaggerated_fear',
  ExaggeratedAnger = 'exaggerated_anger',
  ExaggeratedJoy = 'exaggerated_joy',
  ExaggeratedCrying = 'exaggerated_crying',
  ExaggeratedPain = 'exaggerated_pain',
}

export enum ConsistencyOption {
  None = 'none',
  AbsoluteConsistency = 'absolute_consistency',
}

export enum PromptModificationType {
  NoSpecific = 'no_specific',
  Specify = 'specify',
}

export interface PromptModificationOptions {
  originalPrompt: string;
  modificationType: PromptModificationType;
  specificModificationInstruction: string;
  quality: QualityOption;
  aspectRatio: AspectRatioOption;
  style: StyleOption;
  focalLength: FocalLengthOption; // 新增焦距选项
  facialExpression: FacialExpressionOption; // 新增面部特写选项
  consistency: ConsistencyOption; // 新增镜头提示词一致性选项
}