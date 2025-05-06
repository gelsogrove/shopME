import { expect } from 'chai';
import sinon from 'sinon';
import { CreateWorkspaceDTO } from '../../../../../backend/src/application/dtos/workspace.dto';
import { IWorkspaceRepository } from '../../../../../backend/src/application/interfaces/workspace.repository';
import { CreateWorkspaceUseCase } from '../../../../../backend/src/application/use-cases/workspace/create-workspace.use-case';
import { Workspace } from '../../../../../backend/src/domain/entities/workspace.entity';

describe('CreateWorkspaceUseCase', () => {
  let useCase: CreateWorkspaceUseCase;
  let mockRepository: IWorkspaceRepository;

  beforeEach(() => {
    // Create a mock repository
    mockRepository = {
      create: sinon.stub().resolves(new Workspace('1', 'Test', 'test', 'Test description', null, null, null, true, new Date(), new Date())),
      findById: sinon.stub(),
      findBySlug: sinon.stub().resolves(null), // Default: no existing workspace with same slug
      findAll: sinon.stub(),
      update: sinon.stub(),
      delete: sinon.stub()
    };

    // Create the use case with the mock repository
    useCase = new CreateWorkspaceUseCase(mockRepository);
  });

  it('should generate correct slug from workspace name', async () => {
    // Arrange
    const dto: CreateWorkspaceDTO = {
      name: 'Test Workspace',
      slug: '', // Sarà generato automaticamente dal use case
      description: 'Test description',
      isActive: true
    };

    // Act
    await useCase.execute(dto);

    // Assert
    expect(mockRepository.findBySlug).to.have.been.calledWith('test-workspace');
    expect(mockRepository.create).to.have.been.calledOnce;
  });

  it('should generate slug with special characters removed', async () => {
    // Arrange
    const dto: CreateWorkspaceDTO = {
      name: 'Test & Workspace!',
      slug: '', // Sarà generato automaticamente dal use case
      description: 'Test description',
      isActive: true
    };

    // Act
    await useCase.execute(dto);

    // Assert
    expect(mockRepository.findBySlug).to.have.been.calledWith('test-workspace');
  });

  it('should throw error if workspace with same slug exists', async () => {
    // Arrange
    const dto: CreateWorkspaceDTO = {
      name: 'Test Workspace',
      slug: '', // Sarà generato automaticamente dal use case
      description: 'Test description',
      isActive: true
    };

    // Setup mock to simulate existing workspace
    const existingWorkspace = new Workspace('2', 'Test Workspace', 'test-workspace', 'Existing', null, null, null, true, new Date(), new Date());
    (mockRepository.findBySlug as sinon.SinonStub).resolves(existingWorkspace);

    // Act & Assert
    try {
      await useCase.execute(dto);
      // If we reach here, the test should fail
      expect.fail('Should have thrown an error');
    } catch (error: any) { // Tipo 'any' per gestire l'errore
      expect(error.message).to.equal('Workspace with name "Test Workspace" already exists');
    }
  });
}); 