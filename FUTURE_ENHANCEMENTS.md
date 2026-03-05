# Future Enhancements - SNA Draw Request App

## Multi-Tenant Company Support

### Overview
Add support for multiple companies, each with different file schemas and processing scripts.

### Companies to Support
1. **Arive Homes** (Current - default)
   - Python script: `reorganize_sna_draw_request.py`
   - Schema: Groups by Column G (SN Loan # - Lot Name)
   - Output: One tab per lot with totals

2. **Holmes Homes**
   - Python script: `reorganize_holmes_homes.py`
   - Schema: TBD (different columns/logic)
   - Output: TBD

3. **McArthur Homes**
   - Python script: `reorganize_mcarthur_homes.py`
   - Schema: TBD (different columns/logic)
   - Output: TBD

4. **Fieldstone Homes**
   - Python script: `reorganize_fieldstone_homes.py`
   - Schema: TBD (different columns/logic)
   - Output: TBD

---

## Implementation Plan

### Frontend Changes
```tsx
// app/page.tsx - Add dropdown selector

<select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)}>
  <option value="arive-homes">Arive Homes</option>
  <option value="holmes-homes">Holmes Homes</option>
  <option value="mcarthur-homes">McArthur Homes</option>
  <option value="fieldstone-homes">Fieldstone Homes</option>
</select>
```

### Backend Changes
```typescript
// app/api/upload/route.ts - Route to correct script

const scripts = {
  'arive-homes': 'reorganize_sna_draw_request.py',
  'holmes-homes': 'reorganize_holmes_homes.py',
  'mcarthur-homes': 'reorganize_mcarthur_homes.py',
  'fieldstone-homes': 'reorganize_fieldstone_homes.py',
};

const scriptPath = `/data/.openclaw/workspace/sna-script/${scripts[company]}`;
```

### History Tracking
Add `company` field to history records:
```json
{
  "id": "1234567890",
  "company": "arive-homes",
  "fileName": "organized_file.xlsx",
  "uploadDate": "2026-03-05T06:39:00Z",
  "status": "success"
}
```

### Python Scripts
Each company gets its own script file:
- `/data/.openclaw/workspace/sna-script/reorganize_sna_draw_request.py`
- `/data/.openclaw/workspace/sna-script/reorganize_holmes_homes.py`
- `/data/.openclaw/workspace/sna-script/reorganize_mcarthur_homes.py`
- `/data/.openclaw/workspace/sna-script/reorganize_fieldstone_homes.py`

---

## Development Checklist

### Phase 1: Frontend UI
- [ ] Add company dropdown to upload page
- [ ] Update page header to show selected company
- [ ] Add visual indicator for selected company
- [ ] Test dropdown functionality

### Phase 2: Backend Integration
- [ ] Update API to accept company parameter
- [ ] Map company to correct Python script
- [ ] Update history to track company
- [ ] Error handling for missing scripts

### Phase 3: Python Scripts
- [ ] Create Holmes Homes script
- [ ] Create McArthur Homes script
- [ ] Create Fieldstone Homes script
- [ ] Test each script with sample files

### Phase 4: History & Display
- [ ] Filter history by company
- [ ] Add company column to history table
- [ ] Update download links to use correct company

### Phase 5: Testing & Deployment
- [ ] Test all 4 company flows
- [ ] Verify correct scripts run
- [ ] Test history filtering
- [ ] Deploy to Vercel
- [ ] Get feedback from teams

---

## UI Changes

### Upload Page
```
┌─────────────────────────────────┐
│ SNA Draw Request Reorganizer    │
├─────────────────────────────────┤
│                                 │
│ Select Company:                 │
│ [Arive Homes ▼]                │
│                                 │
│ [Drag-drop upload zone]         │
│                                 │
│ [Submit & Process button]       │
└─────────────────────────────────┘
```

### History Page
```
Company | File Name | Upload Date | Status | Actions
--------|-----------|-------------|--------|--------
Arive   | file1.xlsx| 2026-03-05 | Success| Download
Holmes  | file2.xlsx| 2026-03-05 | Success| Download
```

---

## Configuration File (Future)

Create `/data/.openclaw/workspace/sna-script/companies.json`:
```json
{
  "companies": [
    {
      "id": "arive-homes",
      "name": "Arive Homes",
      "script": "reorganize_sna_draw_request.py",
      "description": "Groups by SN Loan # (Column G)"
    },
    {
      "id": "holmes-homes",
      "name": "Holmes Homes",
      "script": "reorganize_holmes_homes.py",
      "description": "Custom Holmes Homes schema"
    }
  ]
}
```

---

## Current Status

- [x] Base app built with Arive Homes script
- [ ] Multi-company support (future phase)
- [ ] Company dropdown UI (future phase)
- [ ] Holmes Homes script (future phase)
- [ ] McArthur Homes script (future phase)
- [ ] Fieldstone Homes script (future phase)

---

## Notes

- Keep Arive Homes as default for backward compatibility
- Each script can have different logic/algorithms
- History should preserve company info for tracking
- Consider shared utilities across scripts (validation, error handling)

---

**Ready to build?** Message when you have the other Python scripts ready!
