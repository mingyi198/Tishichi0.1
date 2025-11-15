import React, { useState, useCallback } from 'react';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ToggleOption from '../components/ToggleOption';
import { modifyPrompt } from '../services/geminiService';
import {
  AspectRatioOption,
  QualityOption,
  StyleOption,
  PromptModificationType,
  PromptModificationOptions,
  FocalLengthOption, // 导入新增枚举
  FacialExpressionOption, // 导入新增枚举
  ConsistencyOption, // 导入新增枚举
} from '../types';

const PromptModifier: React.FC = () => {
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [modifiedPrompt, setModifiedPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [modificationType, setModificationType] = useState<PromptModificationType>(PromptModificationType.NoSpecific);
  const [specificModificationInstruction, setSpecificModificationInstruction] = useState('');
  const [quality, setQuality] = useState<QualityOption>(QualityOption.EightKCineLighting); // Default to 8K电影打光
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>(AspectRatioOption.None);
  const [style, setStyle] = useState<StyleOption>(StyleOption.None);
  // 新增状态
  const [focalLength, setFocalLength] = useState<FocalLengthOption>(FocalLengthOption.None);
  const [facialExpression, setFacialExpression] = useState<FacialExpressionOption>(FacialExpressionOption.None);
  const [consistency, setConsistency] = useState<ConsistencyOption>(ConsistencyOption.None);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalPrompt.trim()) {
      setError('原始提示词不能为空。');
      return;
    }

    setIsLoading(true);
    setError(null);
    setModifiedPrompt('');

    const options: PromptModificationOptions = {
      originalPrompt,
      modificationType,
      specificModificationInstruction: modificationType === PromptModificationType.Specify ? specificModificationInstruction.trim() : '',
      quality,
      aspectRatio,
      style,
      focalLength, // 传递新增选项
      facialExpression, // 传递新增选项
      consistency, // 传递新增选项
    };

    try {
      const result = await modifyPrompt(options);
      setModifiedPrompt(result);
    } catch (err) {
      console.error('Failed to modify prompt:', err);
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setIsLoading(false);
    }
  }, [originalPrompt, modificationType, specificModificationInstruction, quality, aspectRatio, style, focalLength, facialExpression, consistency]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('修改后的提示词已复制到剪贴板！');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      alert('复制到剪贴板失败。');
    });
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h2 className="text-3xl font-bold text-center text-gray-100 mb-8">修改提示词功能</h2>

      <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg shadow-xl space-y-6">
        <div>
          <label htmlFor="originalPrompt" className="block text-gray-300 text-sm font-bold mb-2">
            原始提示词:
          </label>
          <textarea
            id="originalPrompt"
            className="shadow appearance-none border border-gray-700 rounded w-full py-3 px-4 text-gray-200 bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 custom-scrollbar"
            placeholder="输入您要修改的原始提示词..."
            value={originalPrompt}
            onChange={(e) => setOriginalPrompt(e.target.value)}
            required
          ></textarea>
        </div>

        <ToggleOption<PromptModificationType>
          label="提示词修改"
          name="modificationType"
          options={[
            { value: PromptModificationType.NoSpecific, label: '不指定提示词' },
            { value: PromptModificationType.Specify, label: '指定提示词' },
          ]}
          selectedValue={modificationType}
          onChange={setModificationType}
        />

        {modificationType === PromptModificationType.Specify && (
          <div>
            <label htmlFor="specificModificationInstruction" className="block text-gray-300 text-sm font-bold mb-2">
              具体修改指令:
            </label>
            <textarea
              id="specificModificationInstruction"
              className="shadow appearance-none border border-gray-700 rounded w-full py-3 px-4 text-gray-200 bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 custom-scrollbar"
              placeholder="例如：添加一个赛博朋克风格，让画面更暗沉一些。"
              value={specificModificationInstruction}
              onChange={(e) => setSpecificModificationInstruction(e.target.value)}
            ></textarea>
          </div>
        )}

        <ToggleOption<QualityOption>
          label="画质"
          name="quality"
          options={[
            { value: QualityOption.EightKCineLighting, label: '8K电影打光' },
          ]}
          selectedValue={quality}
          onChange={setQuality}
        />

        <ToggleOption<AspectRatioOption>
          label="比例"
          name="aspectRatio"
          options={[
            { value: AspectRatioOption.None, label: '不指定' },
            { value: AspectRatioOption.Portrait, label: '9:16 (肖像)' },
            { value: AspectRatioOption.Landscape, label: '16:9 (横向)' },
          ]}
          selectedValue={aspectRatio}
          onChange={setAspectRatio}
        />

        <ToggleOption<StyleOption>
          label="风格"
          name="style"
          options={[
            { value: StyleOption.None, label: '不指定' },
            { value: StyleOption.RealisticPhotography, label: '写实写真' },
          ]}
          selectedValue={style}
          onChange={setStyle}
        />

        {/* 新增焦距选项 */}
        <ToggleOption<FocalLengthOption>
          label="焦距"
          name="focalLength"
          options={[
            { value: FocalLengthOption.None, label: '不指定' },
            { value: FocalLengthOption._10mm, label: '10mm' },
            { value: FocalLengthOption._25mm, label: '25mm' },
            { value: FocalLengthOption._35mm, label: '35mm' },
          ]}
          selectedValue={focalLength}
          onChange={setFocalLength}
        />

        {/* 新增面部特写选项 */}
        <ToggleOption<FacialExpressionOption>
          label="面部特写"
          name="facialExpression"
          options={[
            { value: FacialExpressionOption.None, label: '不指定' },
            { value: FacialExpressionOption.ExaggeratedFear, label: '夸张恐惧' },
            { value: FacialExpressionOption.ExaggeratedAnger, label: '夸张愤怒' },
            { value: FacialExpressionOption.ExaggeratedJoy, label: '夸张喜悦' },
            { value: FacialExpressionOption.ExaggeratedCrying, label: '夸张流泪' },
            { value: FacialExpressionOption.ExaggeratedPain, label: '夸张痛苦' },
          ]}
          selectedValue={facialExpression}
          onChange={setFacialExpression}
        />

        {/* 新增镜头提示词一致性选项 */}
        <ToggleOption<ConsistencyOption>
          label="镜头提示词一致性"
          name="consistency"
          options={[
            { value: ConsistencyOption.None, label: '不指定' },
            { value: ConsistencyOption.AbsoluteConsistency, label: '保持人物/动物/角色/场景绝对一致' },
          ]}
          selectedValue={consistency}
          onChange={setConsistency}
        />

        <Button type="submit" fullWidth disabled={isLoading}>
          {isLoading ? <LoadingSpinner /> : '生成修改后的提示词'}
        </Button>

        {error && (
          <div className="bg-red-900/30 text-red-400 p-4 rounded-md mt-4">
            错误: {error}
          </div>
        )}
      </form>

      {modifiedPrompt && (
        <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-xl">
          <h3 className="text-xl font-semibold text-gray-200 mb-3">修改后的提示词:</h3>
          <div className="bg-gray-700 text-gray-200 p-4 rounded-md text-sm mb-4 custom-scrollbar max-h-48 overflow-y-auto">
            {modifiedPrompt}
          </div>
          <Button onClick={() => copyToClipboard(modifiedPrompt)}>
            复制修改后的提示词
          </Button>
        </div>
      )}
    </div>
  );
};

export default PromptModifier;