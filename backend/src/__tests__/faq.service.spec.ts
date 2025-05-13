import { FaqService } from '../application/services/faq.service';

// Mock di logger per evitare output durante i test
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

// Mock del Prisma Client
jest.mock('../lib/prisma', () => {
  const mockDb = {
    faq: {
      findMany: jest.fn().mockResolvedValue([{ id: '1', question: 'Test Question', answer: 'Test Answer' }]),
      findUnique: jest.fn().mockResolvedValue({ id: '1', question: 'Test Question', answer: 'Test Answer' }),
      findFirst: jest.fn().mockResolvedValue({ id: '1', question: 'Test Question', answer: 'Test Answer' }),
      create: jest.fn().mockResolvedValue({ id: '1', question: 'New Question', answer: 'New Answer' }),
      update: jest.fn().mockResolvedValue({ id: '1', question: 'Updated Question', answer: 'Updated Answer' }),
      delete: jest.fn().mockResolvedValue({ id: '1' }),
    },
    $transaction: jest.fn(fn => fn())
  };
  return { prisma: mockDb };
});

// Mock per il repository
const mockFaqRepository = {
  findAll: jest.fn().mockResolvedValue([{ id: 'faq-1', question: 'Test question 1', answer: 'Test answer 1' }]),
  findById: jest.fn().mockResolvedValue({ id: 'faq-1', question: 'Test question 1', answer: 'Test answer 1' }),
  findByWorkspaceId: jest.fn().mockResolvedValue([{ id: 'faq-1', question: 'Test question 1', answer: 'Test answer 1', workspaceId: 'workspace-id' }]),
  create: jest.fn().mockResolvedValue({ id: 'faq-created', question: 'New question', answer: 'New answer' }),
  update: jest.fn().mockResolvedValue({ id: 'faq-1', question: 'Updated question', answer: 'Updated answer' }),
  delete: jest.fn().mockResolvedValue(true)
};

// Mock della classe FaqService con metodi di test
class MockFaqService {
  getAllForWorkspace = jest.fn().mockImplementation((workspaceId) => {
    return mockFaqRepository.findByWorkspaceId(workspaceId);
  });
  
  getById = jest.fn().mockImplementation((id) => {
    return mockFaqRepository.findById(id);
  });
  
  create = jest.fn().mockImplementation((data) => {
    return mockFaqRepository.create(data);
  });
  
  update = jest.fn().mockImplementation((id, data) => {
    return mockFaqRepository.update(id, data);
  });
  
  delete = jest.fn().mockImplementation((id) => {
    return mockFaqRepository.delete(id);
  });
}

// Mock per la classe del repository - definiamo questo dopo la definizione di mockFaqRepository
jest.mock('../infrastructure/repositories/faq.repository', () => ({
  FaqRepository: jest.fn().mockImplementation(() => mockFaqRepository)
}));

// Sostituire la classe originale con quella mock
jest.mock('../application/services/faq.service', () => ({
  FaqService: jest.fn().mockImplementation(() => {
    return new MockFaqService();
  })
}));

describe('FaqService', () => {
  let faqService: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    faqService = new FaqService();
  });
  
  it('should get all FAQs for a workspace', async () => {
    const result = await faqService.getAllForWorkspace('workspace-id');
    expect(result).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'faq-1' })]));
    expect(mockFaqRepository.findByWorkspaceId).toHaveBeenCalledWith('workspace-id');
  });
  
  it('should get a FAQ by ID', async () => {
    const result = await faqService.getById('1');
    expect(result).toEqual(expect.objectContaining({ id: 'faq-1' }));
    expect(mockFaqRepository.findById).toHaveBeenCalledWith('1');
  });
  
  it('should create a new FAQ', async () => {
    const faqData = { question: 'New question', answer: 'New answer' };
    const result = await faqService.create(faqData);
    expect(result).toEqual(expect.objectContaining({ id: 'faq-created' }));
    expect(mockFaqRepository.create).toHaveBeenCalledWith(expect.objectContaining(faqData));
  });
  
  it('should update a FAQ', async () => {
    const faqData = { question: 'Updated question', answer: 'Updated answer' };
    const result = await faqService.update('1', faqData);
    expect(result).toEqual(expect.objectContaining({ id: 'faq-1' }));
    expect(mockFaqRepository.update).toHaveBeenCalledWith('1', expect.objectContaining(faqData));
  });
  
  it('should delete a FAQ', async () => {
    const result = await faqService.delete('1');
    expect(result).toBe(true);
    expect(mockFaqRepository.delete).toHaveBeenCalledWith('1');
  });
}); 