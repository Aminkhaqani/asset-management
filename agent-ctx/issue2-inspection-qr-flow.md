# Issue #2 - Fix Inspection Flow: Must start with QR Scan

## Summary
Implemented the QR-first inspection flow. Users can no longer select assets from a dropdown; they must scan a QR code (or enter asset code manually) before the inspection form opens.

## Files Created
1. **`src/app/api/assets/lookup/route.ts`** - New API endpoint for asset lookup by code
   - GET /api/assets/lookup?code=... 
   - Searches by assetCode or qrCode
   - Returns asset with category and location info
   - Returns 400 if no code provided, 404 if asset not found

2. **`src/components/shared/AssetQRScanner.tsx`** - Reusable QR scanner component
   - Title: "اسکن کد تجهیز"
   - Description explaining the scan-first flow
   - Text input with placeholder "کد دارایی یا QR را وارد کنید"
   - "جستجوی تجهیز" button with loading state
   - Success: shows asset info card with name, code, category, location, status, criticality
   - Error: shows "تجهیزی با این کد پیدا نشد"
   - onAssetFound callback + "ادامه" continue button

## Files Modified
3. **`src/components/inspections/InspectionList.tsx`** - Major refactor
   - Added 3-state flow: 'list' | 'scan' | 'form'
   - 'list': shows inspection list with "بازدید جدید" button
   - 'scan': shows AssetQRScanner component
   - 'form': shows InspectionForm for the scanned asset
   - Back navigation between steps
   - Removed the Sheet-based form overlay

4. **`src/components/inspections/InspectionForm.tsx`** - Refactored
   - Now requires `asset` prop (no longer fetches assets list)
   - Removed the asset dropdown Select component
   - Added read-only asset info card at top of form
   - Form is not submittable without a scanned asset (assetId pre-set)
   - Added proper error handling on mutation (checks response.ok)

5. **`src/app/api/inspections/route.ts`** - Added validation
   - POST: validates assetId is provided (returns 400)
   - POST: verifies asset exists in database (returns 404)
   - All error messages in Persian
