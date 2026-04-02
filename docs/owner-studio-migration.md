# Owner-Studio Migration

StudioFlow is moving from an owner model inferred through `staff_profile` to a direct `User -> Studio` ownership model.

## Migration phases

### Phase 1
- add `studios.owner_user_id`
- keep `studios.onboarding_completed` as the source of onboarding state

### Phase 2
- backfill `owner_user_id` for legacy studios
- infer the owner from existing `staff_profiles` linked to users with owner-style roles (`OWNER` or legacy `ADMIN`)

### Phase 3
- resolve `/api/auth/me` studio context from `Studio.ownerUser`
- keep a temporary fallback to legacy `staff_profile` lookup for backward compatibility

### Phase 4
- update frontend auth state and route guards to rely on `/api/auth/me`
- stop treating `staff_profile` as the source of owner workspace state

### Phase 5
- create owner account + studio workspace during signup
- onboarding becomes setup for an already-created studio

### Phase 6
- keep `staff_profile` for future team features
- ownership and staffing remain separate concepts

## Backward compatibility

- existing team/staff features remain in place
- legacy admin accounts continue to work during the transition
- startup backfill assigns `owner_user_id` when it can be safely inferred
- workspace resolution still falls back to `staff_profile` only for legacy accounts that have not been migrated yet

## Security expectations

- owner studio access is enforced in the backend
- frontend `studioId` values are treated as optional hints only
- server-side access helpers resolve the authenticated studio and reject cross-studio access
