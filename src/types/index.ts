/**
 * 新闻项的接口定义
 */
export interface NewsItem {
  id: number;
  title: string;
  source: string;
  link: string;
  publishedAt: string;
  tags: string[];
  imageUrl: string;
  content?: string; // 新闻内容摘要或全文
}

// 确保模块有默认导出
// 移除默认导出，因为在启用 verbatimModuleSyntax 时不能默认导出类型
