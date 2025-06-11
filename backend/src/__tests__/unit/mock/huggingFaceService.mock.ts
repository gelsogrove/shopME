export const mockHuggingFaceService = {
  generateEmbedding: jest.fn().mockImplementation((text: string) => 
    Promise.resolve(
      Array(384).fill(0).map((_, i) => (text.charCodeAt(i % text.length) / 255) * 2 - 1)
    )
  ),
  
  generateEmbeddings: jest.fn().mockImplementation((texts: string[]) => 
    Promise.resolve(
      texts.map(text => Array(384).fill(0).map((_, i) => (text.charCodeAt(i % text.length) / 255) * 2 - 1))
    )
  ),
  
  getModelInfo: jest.fn().mockReturnValue({
    name: 'Xenova/all-MiniLM-L6-v2',
    type: 'Local Transformer Model (Sentence Transformers)',
    local: true,
    dimensions: 384
  }),
  
  isReady: jest.fn().mockResolvedValue(true)
};

export const HuggingFaceService = jest.fn().mockImplementation(() => mockHuggingFaceService); 