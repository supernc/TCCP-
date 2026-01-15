
export enum QuestionType {
  SINGLE = 'SINGLE',
  MULTIPLE = 'MULTIPLE'
}

export interface Option {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  topic: string;
  type: QuestionType;
  question: string;
  options: Option[];
  correctAnswers: string[]; // Array of option IDs (e.g., ["A", "B"])
  explanation: string;
  chapter: number;
}

export interface ExamSession {
  id: string;
  questions: Question[];
  userAnswers: Record<string, string[]>;
  startTime: number;
  endTime?: number;
  score?: number;
}

export interface ChapterInfo {
  id: number;
  title: string;
  description: string;
  url: string;
}

export const TCCP_CHAPTERS: ChapterInfo[] = [
  { id: 1, title: '云架构设计概论', description: '高并发、高可用、可扩展性等基本原则', url: 'https://angelsnow1129.github.io/TCCPWiki/chapter1/1.1_%E4%BA%91%E6%9E%B6%E6%9E%84%E8%AE%BE%E8%AE%A1%E6%A6%82%E8%AE%BA/' },
  { id: 2, title: '核心产品与服务', description: 'CVM、VPC、CBS等核心组件最佳实践', url: 'https://angelsnow1129.github.io/TCCPWiki/chapter2/2.1_%E4%BA%91%E6%9C%8D%E5%8A%A1%E5%99%A8CVM%E5%8F%8A%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5/' },
  { id: 3, title: '架构设计实践', description: '云上容灾、混合云、云原生架构演进', url: 'https://angelsnow1129.github.io/TCCPWiki/chapter3/3.1_%E4%BA%91%E4%B8%8A%E5%AE%B9%E7%81%BE/' },
  { id: 4, title: '云安全体系', description: '国家等保、安全合规、云安全产品', url: 'https://angelsnow1129.github.io/TCCPWiki/chapter4/4.1_%E5%9B%BD%E5%AE%B6%E5%AE%89%E5%85%A8%E7%AD%89%E7%BA%A7%E4%BF%9D%E6%8A%A4/' },
  { id: 5, title: '云迁移与成本', description: '迁移方法论、上云成本优化 (FinOps)', url: 'https://angelsnow1129.github.io/TCCPWiki/chapter5/5.1_%E8%BF%81%E7%A7%BB%E6%96%B9%E6%B3%95%E8%AE%BA%E6%A6%82%E8%BF%B0/' },
];
