# 🔍 Comprehensive Investigation Report

## 🚨 **Issues Found**

### **1. Hidden ConnectButton in UniversalLayout**
**Location**: `/packages/app/src/components/UniversalLayout.tsx:53`
```tsx
<ConnectButton client={client} />  // ❌ Missing import
```
**Impact**: Causes JavaScript errors, potential flickering

### **2. Supabase 401 Authentication Errors**
```
beats?select=*&is_active=eq.true&order=created_at.desc&offset=0&limit=8:1 Failed to load resource: 401
```
**Root Cause**: Supabase RLS (Row Level Security) blocking unauthenticated requests

### **3. Data Pipeline Confusion**
- **Web3 Beats**: IPFS + Supabase + Livepeer (currently 0 beats)
- **Sanity Beats**: CMS fallback (only 3 beats)
- **Separation Lost**: Both systems trying to load simultaneously

### **4. Marketplace Flickering**
**Cause**: Multiple data sources loading/failing in sequence:
1. Livepeer provider tries first
2. Falls back to Supabase (401 error)
3. Falls back to Sanity (3 beats)
4. Causes visual flickering

## ✅ **Fixes Required**

### **Fix 1: Remove Hidden ConnectButton**
```tsx
// UniversalLayout.tsx - Remove lines 52-55
// Replace with proper auth flow
```

### **Fix 2: Fix Supabase Authentication**
```sql
-- Disable RLS for public beat reading
ALTER TABLE beats DISABLE ROW LEVEL SECURITY;
-- OR create proper policy for public reads
```

### **Fix 3: Clarify Data Pipeline**
```tsx
// Priority order:
// 1. Web3 beats (IPFS + Supabase + Livepeer) - PRIMARY
// 2. Sanity beats - FALLBACK ONLY when Web3 has 0 beats
```

### **Fix 4: Stop Flickering**
```tsx
// Single data source at a time
// Proper loading states
// Error boundaries
```

## 🎯 **Data Pipeline Architecture**

### **Current State**
- **Web3 Pipeline**: 0 beats (broken)
- **Sanity Pipeline**: 3 beats (working)
- **Result**: Confusion and flickering

### **Intended Architecture**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   IPFS Storage  │───▶│  Supabase DB     │───▶│  Livepeer CDN   │
│   (Audio Files) │    │  (Metadata)      │    │  (Optimized)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   Web3 Beats     │ ◄── PRIMARY SOURCE
                       │   (Live Data)    │
                       └──────────────────┘
                                │
                                ▼ (fallback if 0 beats)
                       ┌──────────────────┐
                       │   Sanity CMS     │ ◄── FALLBACK ONLY
                       │   (Demo Beats)   │
                       └──────────────────┘
```

## 🔧 **Implementation Plan**

### **Step 1**: Fix UniversalLayout
### **Step 2**: Fix Supabase RLS
### **Step 3**: Implement proper data source priority
### **Step 4**: Add loading states and error boundaries
### **Step 5**: Test marketplace stability