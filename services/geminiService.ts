
import { GoogleGenAI, Type } from "@google/genai";
import { Question, QuestionType, TCCP_CHAPTERS } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const questionSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING, description: "题目内容" },
      type: { type: Type.STRING, description: "SINGLE 或 MULTIPLE" },
      options: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: "选项标识，如 A, B, C, D" },
            text: { type: Type.STRING, description: "选项文本" }
          },
          required: ["id", "text"]
        }
      },
      correctAnswers: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "正确选项的ID列表"
      },
      explanation: { 
        type: Type.STRING, 
        description: "详尽的答案解析。必须包含【选项分析】部分，逐一说明 A、B、C、D 各个选项正确或错误的原因，并关联相关的腾讯云知识点。" 
      },
      topic: { type: Type.STRING, description: "具体知识点标签" }
    },
    required: ["question", "type", "options", "correctAnswers", "explanation", "topic"]
  }
};

export const generateQuestions = async (chapterId: number, count: number = 5): Promise<Question[]> => {
  const chapter = TCCP_CHAPTERS.find(c => c.id === chapterId);
  
  const isLargeBatch = count > 5;
  const mixInstruction = isLargeBatch 
    ? `请严格按照约 6:4 的比例生成单选题和多选题（${count} 题中，单选约 ${Math.round(count * 0.6)} 道，多选约 ${Math.round(count * 0.4)} 道）。`
    : `混合包含单选题和多选题。`;

  const prompt = `
    你是一位腾讯云架构高级工程师 (TCCP) 认证专家。
    请基于以下章节及腾讯云全域知识生成 ${count} 道专业考试题目：
    章节名称：${chapter?.title}
    参考Wiki：${chapter?.url}
    
    【核心要求】：
    1. **知识深度与扩展**：题目不应仅限于 Wiki 文本，应扩展至 TCCP 认证要求的深度。例如：
       - 安全合规：腾讯云等保认证等级（等保三级/四级标准细节）。
       - 网络安全：安全组的有状态特性（Stateful）与网络ACL的无状态区别。
       - 数据库：TDSQL 的强一致、半同步、异步模式的底层实现与适用场景。
       - 存储：CBS 各种类型的 IOPS 限制与扩容机制。
    2. **详尽解析**：在 explanation 字段中，**必须** 逐一解释 A、B、C、D 每一个选项。格式建议：
       - 【正确项解析】：说明为什么该选项符合架构设计要求。
       - 【干扰项解析】：逐项说明 A/B/C/D 为什么错误（例如：属于产品限制、概念混淆或非最佳实践）。
    3. **场景化设计**：题目应模拟真实的架构设计挑战，如海量并发处理、混合云网络拓扑优化、异地多活方案选型。
    4. **类型分布**：${mixInstruction}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: questionSchema,
      },
    });

    const results = JSON.parse(response.text || "[]");
    return results.map((q: any, index: number) => ({
      ...q,
      id: `gen-${chapterId}-${Date.now()}-${index}`,
      chapter: chapterId,
      type: q.type === 'SINGLE' ? QuestionType.SINGLE : QuestionType.MULTIPLE
    }));
  } catch (error) {
    console.error("Failed to generate questions:", error);
    throw error;
  }
};
