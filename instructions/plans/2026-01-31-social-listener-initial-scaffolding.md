# Social Listener App - Initial Scaffolding Plan

**Created:** 2026-01-31
**Status:** Completed
**Summary:** Initial project scaffolding for social listening platform with Next.js, Firestore, and Docker

---

## Overview

Building a social listening, AI content/response generation, and human-approval queue application. This plan covers the initial scaffolding phase: project structure, authentication, and brand management.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Database | Firestore (GCP native) |
| Authentication | NextAuth.js |
| Containerization | Docker + Docker Compose |
| Node Version | 20 LTS |
| Queue System | Firestore-based |
| Cloud Platform | Google Cloud Platform |

---

## Project Structure

```
social-listener/
├── platform/                     # All application code
│   ├── src/                      # Next.js source code
│   │   ├── app/                  # App Router pages
│   │   │   ├── (auth)/           # Auth routes (login, register)
│   │   │   ├── (dashboard)/      # Protected dashboard routes
│   │   │   │   ├── brands/       # Brand management pages
│   │   │   │   └── layout.tsx    # Dashboard layout with nav
│   │   │   ├── api/              # API routes
│   │   │   │   ├── auth/         # NextAuth endpoints
│   │   │   │   └── brands/       # Brand CRUD endpoints
│   │   │   ├── layout.tsx        # Root layout
│   │   │   └── page.tsx          # Landing/home page
│   │   ├── components/           # React components
│   │   │   ├── ui/               # Basic UI components
│   │   │   └── brands/           # Brand-specific components
│   │   ├── lib/                  # Utilities and configurations
│   │   │   ├── auth.ts           # NextAuth configuration
│   │   │   ├── firebase.ts       # Firebase/Firestore connection
│   │   │   └── utils.ts          # Helper functions
│   │   ├── models/               # Type definitions + Firestore helpers
│   │   │   ├── user.ts
│   │   │   ├── brand.ts
│   │   │   └── index.ts
│   │   ├── types/                # TypeScript type definitions
│   │   │   └── index.ts
│   │   └── middleware.ts         # Next.js middleware (auth protection)
│   ├── docker/                   # Docker configuration
│   │   ├── Dockerfile            # Production build
│   │   ├── Dockerfile.dev        # Development with hot reload
│   │   ├── docker-compose.yml    # Local dev (app + Firebase emulator)
│   │   ├── docker-compose.staging.yml
│   │   └── docker-compose.prod.yml
│   ├── firebase/                 # Firebase configuration
│   │   ├── firestore.rules       # Security rules
│   │   ├── firestore.indexes.json # Composite indexes
│   │   ├── firebase.json         # Firebase project config
│   │   └── .firebaserc           # Project aliases (dev/staging/prod)
│   ├── scripts/                  # Platform-specific scripts
│   │   ├── dev.sh                # Start local dev environment
│   │   ├── build.sh              # Build for production
│   │   ├── test.sh               # Run tests
│   │   ├── emulator.sh           # Start Firebase emulator
│   │   └── deploy.sh             # Deploy helpers
│   ├── config/                   # Environment templates
│   │   ├── .env.example          # Base env template with docs
│   │   ├── .env.development      # Dev defaults (non-secret)
│   │   ├── .env.staging          # Staging defaults (non-secret)
│   │   └── .env.production       # Prod defaults (non-secret)
│   ├── public/                   # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.js
├── agents/                       # (existing) Agent specifications
├── context/                      # (existing) Agent context files
├── instructions/                 # (existing) Permissions and policies
│   └── plans/                    # Project plans (this directory)
├── scripts/                      # (existing) Root workflow scripts
├── tools/                        # (existing) MCP configurations
└── CLAUDE.md                     # (existing) Project instructions
```

---

## Data Models

### User
```typescript
interface User {
  id: string;                     // Firestore document ID
  email: string;
  name: string;
  image?: string;
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Brand
```typescript
interface Brand {
  id: string;                     // Firestore document ID
  name: string;
  description?: string;
  ownerId: string;                // Reference to User
  members: BrandMember[];         // Team access
  settings: BrandSettings;
  socialConnections: SocialConnection[]; // Future: connected accounts
  createdAt: Date;
  updatedAt: Date;
}

interface BrandMember {
  userId: string;
  role: 'owner' | 'admin' | 'member';
  addedAt: Date;
}

interface BrandSettings {
  tone: string;                   // Brand voice/tone description
  guidelines: string;             // Content guidelines
  [key: string]: unknown;         // Extensible for future settings
}

interface SocialConnection {
  platform: string;
  accountId: string;
  accountName: string;
  enabled: boolean;
  connectedAt: Date;
  // Credentials stored separately in secure storage
}
```

### QueueItem (for future use)
```typescript
interface QueueItem {
  id: string;
  brandId: string;
  type: 'response' | 'post';
  status: 'pending' | 'approved' | 'rejected' | 'published';
  content: {
    original: string;             // Original content/mention
    generated: string;            // AI-generated response
    edited?: string;              // Human-edited version
  };
  metadata: {
    platform: string;
    sourceUrl?: string;
    [key: string]: unknown;       // Extensible
  };
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Firestore Collections

```
firestore/
├── users/
│   └── {userId}                  # User documents
├── brands/
│   └── {brandId}                 # Brand documents
└── queueItems/
    └── {itemId}                  # Queue item documents (future)
```

**Indexes needed:**
- `brands` by `ownerId` + `createdAt`
- `brands` by `members.userId` (array-contains)
- `queueItems` by `brandId` + `status` + `createdAt`

---

## Environment Configuration

### Development (config/.env.development)
```env
# Firebase Emulator
NEXT_PUBLIC_FIREBASE_USE_EMULATOR=true
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099

# NextAuth
NEXTAUTH_URL=http://localhost:3000

# App
NODE_ENV=development
```

### Staging (config/.env.staging)
```env
# Firebase
NEXT_PUBLIC_FIREBASE_PROJECT_ID=social-listener-staging

# NextAuth
NEXTAUTH_URL=https://staging.your-domain.com

# App
NODE_ENV=staging
```

### Production (config/.env.production)
```env
# Firebase
NEXT_PUBLIC_FIREBASE_PROJECT_ID=social-listener-prod

# NextAuth
NEXTAUTH_URL=https://your-domain.com

# App
NODE_ENV=production
```

### Secrets (.env.local - gitignored)
```env
# Firebase Admin SDK (service account)
FIREBASE_ADMIN_PRIVATE_KEY=
FIREBASE_ADMIN_CLIENT_EMAIL=

# NextAuth
NEXTAUTH_SECRET=

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

## API Routes (Phase 1)

| Method | Route | Description |
|--------|-------|-------------|
| * | `/api/auth/[...nextauth]` | NextAuth handlers |
| GET | `/api/brands` | List user's brands |
| POST | `/api/brands` | Create new brand |
| GET | `/api/brands/[id]` | Get brand details |
| PUT | `/api/brands/[id]` | Update brand |
| DELETE | `/api/brands/[id]` | Delete brand |

---

## UI Pages (Phase 1 - Basic)

| Route | Description |
|-------|-------------|
| `/` | Landing page (redirect to dashboard if logged in) |
| `/login` | Login page |
| `/register` | Registration page |
| `/dashboard` | Main dashboard (brand list) |
| `/dashboard/brands/new` | Create brand form |
| `/dashboard/brands/[id]` | Brand detail/edit page |

---

## Branch/Environment Strategy

| Branch | Environment | Database | Deployment |
|--------|-------------|----------|------------|
| `develop` | Local | Firebase Emulator | localhost:3000 |
| `staging` | Staging | Firestore (staging project) | Auto on merge |
| `main` | Production | Firestore (prod project) | Manual trigger |

---

## Implementation Phases

### Phase 1: Project Setup (Current)
- [ ] Create `platform/` directory structure
- [ ] Initialize Next.js with TypeScript
- [ ] Set up Firebase/Firestore connection
- [ ] Create User and Brand type definitions
- [ ] Create Firestore helper functions
- [ ] Configure NextAuth.js with credentials provider
- [ ] Create basic auth pages (login/register)
- [ ] Create brand CRUD API routes
- [ ] Create basic brand management UI
- [ ] Set up Docker and Docker Compose with Firebase emulator
- [ ] Create platform scripts (dev, build, test, emulator)
- [ ] Set up environment config files
- [ ] Create Firestore security rules
- [ ] Update CI/CD workflows for `platform/` directory

### Phase 2: Brand Management Enhancement (Future)
- Brand settings page
- Team member management
- Brand switching in UI

### Phase 3: Social Connections (Future)
- OAuth flows for social platforms
- Connection management UI
- Secure credential storage

### Phase 4: Social Listening (Future)
- Platform API integrations
- Mention/keyword monitoring
- Real-time updates

### Phase 5: AI Content Generation (Future)
- LLM integration
- Response generation based on brand tone
- Content suggestions

### Phase 6: Approval Queue (Future)
- Queue UI for pending items
- Approve/reject/edit workflow
- Scheduling and auto-publish

---

## Firestore Free Tier Limits

| Resource | Free Quota (per day) |
|----------|---------------------|
| Document reads | 50,000 |
| Document writes | 20,000 |
| Document deletes | 20,000 |
| Storage | 1 GB |
| Network egress | 10 GB/month |

More than sufficient for development and initial launch.

---

## Extensibility Considerations

1. **Type definitions are flexible** - Use index signatures for extensible settings
2. **Social connections are array-based** - Add new platforms without schema changes
3. **Queue items have extensible metadata** - Platform-specific data without rigid schemas
4. **Middleware-based auth** - Easy to add role-based access control later
5. **Firestore rules are document-based** - Fine-grained security per collection
6. **Component architecture** - Separation of UI components for easy styling updates

---

## Next Steps After Approval

1. Create the `platform/` directory structure
2. Initialize Next.js with TypeScript
3. Set up Firebase Admin SDK and Firestore
4. Create type definitions and Firestore helpers
5. Configure NextAuth with Firebase adapter
6. Build basic auth pages
7. Build brand CRUD API and UI
8. Create Docker configuration with Firebase emulator
9. Create platform scripts
10. Set up environment configs
11. Write Firestore security rules
12. Update CI/CD workflows
13. Test locally with Docker Compose
