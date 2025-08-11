## Phase 1 — Minimal Task List
 
- [ ] quando un untente chiede ordine devi mandare link con ordine cosi atterra giustamente sempre sull'ordine con tutte le info metti anche nel PRD
Calling Functions for Past Orders (History & Reorder)
  - CFs to list past orders and reorder; integrate with N8N; update Swagger; respect workspace isolation.



- [x] TRACKING NUMBER ANCORA NON FUNZIONA CI VUOLE UNA FUNZIONE N8N CHE FACCIA UNA CALL FUNCTION RITORNO IL CODICE DEL RTACKING NUMBER PRESENTE NELL'ORDINE E RITORNI IL LINK DI DHL (COSA DICE IL PRD ??) ✅ **COMPLETED** - GetShipmentTrackingLink tool added to N8N workflow

- [] GLI ORDNI NON VANNO prima di far partire qualsiasi task ne parliamo

- [] LE MAIL NON VANNO dobbiamo capiro isnieme e' fuori dal codice mi sa inogni modo non so se quando si fa un ordine arriva una mail

- [ ] Clear Cart State After Order (Hidden System Message)
  - In N8N, post-success hidden system message (delay ~5s) to clear cart memory; invisible to end user.