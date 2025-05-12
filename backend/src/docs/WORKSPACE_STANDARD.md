# Workspace Context Standard

## Overview

Questo documento descrive lo standard da utilizzare in tutto il progetto per la gestione del contesto di workspace.

## Problema

In precedenza, l'identificazione e la validazione del workspace ID avveniva in modo incoerente tra i diversi controller e endpoint, causando:
- Comportamenti imprevedibili
- Duplicazione di codice
- Gestione degli errori incoerente
- Difficoltà di manutenzione

## Soluzione

La soluzione implementata standardizza l'approccio alla gestione del workspace ID attraverso:

1. **DTO per il contesto di workspace**
2. **Middleware centralizzato**
3. **Estensione di Request**
4. **Utility di validazione**

## Componenti

### 1. WorkspaceContextDTO

```typescript
// src/application/dtos/workspace-context.dto.ts
export class WorkspaceContextDTO {
  @IsUUID(4)
  workspaceId: string;

  static fromRequest(req: any): WorkspaceContextDTO | null {
    const workspaceId = req.params?.workspaceId || 
                        req.query?.workspaceId || 
                        req.body?.workspaceId || 
                        req.header?.('x-workspace-id');
    
    return workspaceId ? new WorkspaceContextDTO(workspaceId) : null;
  }
  
  // ...
}
```

### 2. Middleware per il contesto di workspace

```typescript
// src/interfaces/http/middlewares/workspace-context.middleware.ts
export const workspaceContextMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Estrae e valida il workspaceId
  const workspaceContext = WorkspaceContextDTO.fromRequest(req);
  
  // Se manca, restituisce 400
  if (!workspaceContext) {
    return res.status(400).json({ error: 'Workspace ID is required' });
  }
  
  // Aggiunge il contesto alla request
  (req as any).workspaceContext = workspaceContext;
  
  next();
}
```

### 3. Estensione di Request

```typescript
// src/interfaces/http/types/workspace-request.ts
export interface WorkspaceRequest extends Request {
  workspaceContext: WorkspaceContextDTO;
}
```

### 4. Utility di validazione DTO

```typescript
// src/utils/dto-validator.ts
export async function validateDTO<T extends object>(
  dtoClass: new () => T,
  object: object
): Promise<T> {
  // Trasforma e valida l'oggetto
  // ...
}
```

## Come utilizzare il nuovo standard

### 1. In una route

```typescript
// Importa il middleware
import { workspaceContextMiddleware } from '../middlewares/workspace-context.middleware';

// Applica il middleware alla route
router.use(workspaceContextMiddleware);
router.get('/', controller.getItems);
```

### 2. In un controller

```typescript
import { WorkspaceRequest } from '../types/workspace-request';

class MyController {
  async getItems(req: WorkspaceRequest, res: Response) {
    // Access workspace context in a standardized way
    const { workspaceId } = req.workspaceContext;
    
    // Rest of the controller method...
  }
}
```

### 3. Per la validazione dei DTO

```typescript
import { validateDTO } from '../utils/dto-validator';
import { MyEntityDTO } from '../dtos/my-entity.dto';

// Validate against DTO
try {
  const validatedData = await validateDTO(MyEntityDTO, inputData);
  // Process validated data...
} catch (validationError) {
  // Handle validation error...
}
```

## Vantaggi

- **Consistenza**: Tutti gli endpoint utilizzano lo stesso approccio
- **Riusabilità**: Nessun codice duplicato
- **Sicurezza**: Validazione centralizzata
- **Manutenibilità**: Facile da aggiornare
- **Testabilità**: Test centralizzati

## Esempi

Vedere i seguenti file per esempi di implementazione:

- Controller esempio: `src/interfaces/http/controllers/example-ddd.controller.ts`
- Route esempio: `src/interfaces/http/routes/services.routes.ts`
- Test: `src/__tests__/workspace-middleware.spec.ts` 