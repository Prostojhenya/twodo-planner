# Implementation Plan: Three-Tier Bubble Visualization System

## Overview

This implementation plan breaks down the three-tier bubble visualization system into incremental, testable steps. The approach focuses on building the core hierarchy first (Hub → Cluster → Task), then adding interaction capabilities (gestures, expansion/collapse), and finally implementing collaborative features. Each step builds on previous work and includes testing to validate correctness early.

## Tasks

- [x] 1. Refactor type definitions and extend data models
  - Update types.ts with extended interfaces for ClusterExtended, TaskExtended, ClusterMember, InviteLink
  - Add Position, BubbleSize, ClusterType, MemberRole, Permission types
  - Add GestureState and CollaborationState interfaces
  - _Requirements: 8.1, 8.2, 8.3, 8.5, 8.6_

- [ ]* 1.1 Write property test for type definitions
  - **Property 26: Members Have Roles**
  - **Validates: Requirements 8.3, 8.5**

- [ ] 2. Create BubbleBase component with size hierarchy
  - [x] 2.1 Implement BubbleBase abstract component
    - Create components/BubbleBase.tsx with shared bubble rendering logic
    - Implement size-based styling (small: 48px, medium: 96px, large: 80px)
    - Add position calculation utilities (percentage to pixels)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [ ]* 2.2 Write property tests for bubble sizing
    - **Property 1: Bubble Size Hierarchy**
    - **Property 2: Size Ratio Consistency**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6**

- [ ] 3. Implement HubBubble component
  - [x] 3.1 Create HubBubble component
    - Create components/HubBubble.tsx
    - Render large bubble at center position (50%, 55%)
    - Display workspace context (avatar based on me/partner/couple/group)
    - Add "HUB" label below bubble
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ]* 3.2 Write property tests for Hub behavior
    - **Property 3: Single Hub Per Workspace**
    - **Property 4: Hub Center Positioning**
    - **Property 5: Hub Has No Counter**
    - **Property 6: Hub Cannot Be Removed**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**

- [ ] 4. Implement ClusterBubble component with counter
  - [x] 4.1 Create ClusterBubble component
    - Create components/ClusterBubble.tsx
    - Render medium bubble with type icon
    - Implement counter display logic (calculateTaskCount function)
    - Add collaboration badge when members.length > 1
    - Support collapsed/expanded states
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 11.1, 11.2, 11.3, 11.4, 11.5_
  
  - [ ]* 4.2 Write property tests for cluster counter
    - **Property 11: Counter Accuracy**
    - **Property 12: Counter Respects Completion Preference**
    - **Property 13: Counter Format**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 16.4**
  
  - [ ]* 4.3 Write property tests for cluster icons
    - **Property 34: Cluster Type Icon Mapping**
    - **Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5**

- [ ] 5. Implement TaskBubble component
  - [x] 5.1 Create TaskBubble component
    - Create components/TaskBubble.tsx
    - Render small bubble with type icon only (no text, no counter)
    - Implement ring positioning algorithm (calculateRingPosition function)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_
  
  - [ ]* 5.2 Write property tests for task bubbles
    - **Property 21: Task Bubble Icon Mapping**
    - **Property 22: Task Bubbles Have No Text Labels**
    - **Property 23: Task Bubbles Have No Counters**
    - **Validates: Requirements 7.2, 7.3, 7.4, 7.5, 7.6, 7.7**

- [ ] 6. Checkpoint - Verify bubble rendering
  - Ensure all three bubble types render correctly with proper sizes
  - Verify icons display correctly for all types
  - Verify counter displays on clusters
  - Ask the user if questions arise

- [ ] 7. Implement GestureDetector component
  - [ ] 7.1 Create GestureRecognizer class
    - Create utils/GestureRecognizer.ts
    - Implement gesture state machine (idle → detecting → tap/long-press/drag)
    - Add timing thresholds (LONG_PRESS_THRESHOLD = 1500ms, DRAG_THRESHOLD = 10px)
    - Implement pointer event handlers (onPointerDown, onPointerMove, onPointerUp)
    - _Requirements: 13.1, 13.2, 13.3, 17.1, 17.2, 17.3, 17.4_
  
  - [ ] 7.2 Create GestureDetector component
    - Create components/GestureDetector.tsx
    - Wrap canvas with invisible overlay for gesture capture
    - Integrate GestureRecognizer class
    - Emit gesture events to parent components
    - _Requirements: 13.1, 13.2, 13.3_
  
  - [ ]* 7.3 Write unit tests for gesture recognition
    - Test tap vs long-press distinction (< 1s vs > 1.5s)
    - Test drag vs tap distinction (movement threshold)
    - Test gesture cancellation scenarios
    - _Requirements: 13.1, 13.2, 13.3, 17.1, 17.2_
  
  - [ ]* 7.4 Write property tests for gesture behavior
    - **Property 39: Gesture Event Registration**
    - **Property 40: Tap vs Long-Press Distinction**
    - **Property 41: Drag vs Tap Distinction**
    - **Validates: Requirements 13.1, 13.2, 13.3, 17.1, 17.2**

- [ ] 8. Implement cluster creation from Hub
  - [ ] 8.1 Add long-press handler to HubBubble
    - Detect long-press gesture on Hub
    - Transition to cluster creation mode
    - Display visual feedback during long-press
    - _Requirements: 3.1, 3.2_
  
  - [ ] 8.2 Implement drag-to-create functionality
    - Track drag position from Hub
    - Show preview bubble at drag position
    - Create cluster at release position
    - _Requirements: 3.3, 3.4_
  
  - [ ]* 8.3 Write property tests for cluster creation
    - **Property 7: Long-Press Initiates Cluster Creation**
    - **Property 8: Drag Creates Cluster at Release Position**
    - **Validates: Requirements 3.1, 3.3, 3.4**

- [ ] 9. Implement ClusterTypeSelector component
  - [ ] 9.1 Create ClusterTypeSelector modal
    - Create components/ClusterTypeSelector.tsx
    - Display four type options (Task, Event, Shop, Custom) with icons and descriptions
    - Position near newly created cluster
    - Handle type selection and cancellation
    - _Requirements: 3.5, 3.6, 18.1, 18.2, 18.3, 18.4, 18.5_
  
  - [ ]* 9.2 Write property tests for type selection
    - **Property 9: Cluster Creation Prompts Type Selection**
    - **Property 10: Cancel Aborts Cluster Creation**
    - **Property 46: Type Selection Assignment**
    - **Validates: Requirements 3.5, 3.6, 18.1, 18.3, 18.4**

- [ ] 10. Implement cluster expansion and collapse
  - [ ] 10.1 Add expansion/collapse toggle to ClusterBubble
    - Handle tap gesture on cluster
    - Toggle isExpanded state
    - Show/hide counter based on expansion state
    - Animate transition between states
    - _Requirements: 5.1, 5.2, 5.4, 5.5, 5.6_
  
  - [ ] 10.2 Implement task ring rendering
    - Calculate positions for tasks in circular arrangement
    - Render TaskBubble components when cluster is expanded
    - Hide task bubbles when cluster is collapsed
    - _Requirements: 5.3, 5.5_
  
  - [ ]* 10.3 Write property tests for expansion/collapse
    - **Property 14: Expansion Shows Tasks**
    - **Property 15: Expansion Hides Counter**
    - **Property 16: Collapse Hides Tasks**
    - **Property 17: Expansion-Collapse Round Trip**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 5.6**

- [ ] 11. Checkpoint - Verify interaction flow
  - Test long-press Hub to create cluster
  - Test cluster type selection
  - Test cluster expansion/collapse
  - Verify counter updates correctly
  - Ask the user if questions arise

- [ ] 12. Implement task creation functionality
  - [ ] 12.1 Add task creation UI to expanded clusters
    - Add "+" button or gesture area in expanded cluster
    - Handle task creation action
    - Associate new task with parent cluster
    - Increment cluster counter
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [ ] 12.2 Implement nested task creation
    - Add task creation option to TaskBubble
    - Set parentTaskId when creating from another task
    - Support multiple levels of nesting
    - _Requirements: 6.5, 19.1, 19.2, 19.3_
  
  - [ ]* 12.3 Write property tests for task creation
    - **Property 18: Task Creation Associates with Cluster**
    - **Property 19: Task Creation Increments Counter**
    - **Property 20: Nested Task Relationship**
    - **Property 48: Multi-Level Nesting Allowed**
    - **Validates: Requirements 6.3, 6.4, 6.5, 19.1, 19.2, 19.3**

- [ ] 13. Implement hierarchy enforcement
  - [ ] 13.1 Add hierarchy validation logic
    - Create utils/hierarchyValidator.ts
    - Implement validation for three-tier hierarchy
    - Prevent Task bubbles from containing children
    - Prevent Clusters from containing non-Task children
    - Reject invalid nesting attempts
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [ ]* 13.2 Write property tests for hierarchy rules
    - **Property 35: Task Bubbles Cannot Contain Children**
    - **Property 36: Clusters Contain Only Tasks**
    - **Property 37: Three-Tier Hierarchy Invariant**
    - **Property 38: Invalid Nesting Rejected**
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5**

- [ ] 14. Implement collaboration data structures
  - [ ] 14.1 Add collaboration fields to Cluster type
    - Update Cluster interface with ownerId, members array
    - Implement ClusterMember interface with role and permissions
    - Add role-based permission matrix (ROLE_PERMISSIONS constant)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  
  - [ ] 14.2 Implement permission checking logic
    - Create utils/permissionChecker.ts
    - Implement checkPermission function
    - Handle admin, user, and viewer roles
    - Check granular permissions for user role
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10_
  
  - [ ]* 14.3 Write property tests for collaboration structure
    - **Property 24: Cluster Has Owner and Members**
    - **Property 25: Creator Is Admin**
    - **Validates: Requirements 8.1, 8.2, 8.4**
  
  - [ ]* 14.4 Write unit tests for permission checking
    - Test admin permissions (all operations allowed)
    - Test user permissions (based on granted permissions)
    - Test viewer permissions (view only)
    - Test permission denial scenarios
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10_
  
  - [ ]* 14.5 Write property tests for permissions
    - **Property 27: Admin Permissions**
    - **Property 28: User Permissions**
    - **Property 29: Viewer Permissions**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10**

- [ ] 15. Implement CollaborationOverlay component
  - [ ] 15.1 Create CollaborationOverlay component
    - Create components/CollaborationOverlay.tsx
    - Display modal overlay with semi-transparent backdrop
    - Show list of cluster members with role badges (🔴 Admin, 🔵 User, ⚪ Viewer)
    - Add invite button for admin users
    - Handle role and permission changes for admins
    - Support member removal for admins
    - Close on outside tap
    - _Requirements: 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8_
  
  - [ ] 15.2 Add collaboration badge to ClusterBubble
    - Display "👥" badge when cluster has multiple members
    - Handle tap on badge to open CollaborationOverlay
    - _Requirements: 10.1, 10.2_
  
  - [ ]* 15.3 Write property tests for collaboration UI
    - **Property 30: Collaboration Badge Visibility**
    - **Property 31: Collaboration Overlay Display**
    - **Property 32: Admin Invite Access**
    - **Property 33: Overlay Closes on Outside Tap**
    - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.8**

- [ ] 16. Implement invite link generation and handling
  - [ ] 16.1 Create invite link utilities
    - Create utils/inviteLinks.ts
    - Implement generateInviteLink function (creates unique URL with cluster ID)
    - Implement parseInviteLink function (extracts cluster ID from URL)
    - Implement validateInviteLink function (checks cluster exists)
    - _Requirements: 15.1, 15.2, 15.6_
  
  - [ ] 16.2 Implement invite acceptance flow
    - Handle invite URL opening
    - Display cluster details and join option
    - Add accepting user to cluster members with User role
    - _Requirements: 15.3, 15.4, 15.5_
  
  - [ ]* 16.3 Write property tests for invite links
    - **Property 43: Invite Link Contains Cluster ID**
    - **Property 44: Invite Acceptance Adds Member**
    - **Property 45: Invalid Invite Rejected**
    - **Validates: Requirements 15.1, 15.2, 15.4, 15.5, 15.6**

- [ ] 17. Checkpoint - Verify collaboration features
  - Test collaboration badge display
  - Test opening collaboration overlay
  - Test invite link generation
  - Test permission checking
  - Ask the user if questions arise

- [ ] 18. Implement workspace initialization
  - [ ] 18.1 Create workspace initialization logic
    - Create utils/workspaceInitializer.ts
    - Implement initializeWorkspace function
    - Create Hub bubble at center
    - Create default clusters (Tasks, Shopping, Events)
    - Assign creator as workspace owner
    - _Requirements: 20.1, 20.2, 20.3, 20.4_
  
  - [ ]* 18.2 Write property tests for workspace initialization
    - **Property 50: Workspace Initialization Creates Hub**
    - **Property 51: Workspace Initialization Creates Defaults**
    - **Property 52: Workspace Owner Assignment**
    - **Validates: Requirements 20.1, 20.2, 20.3, 20.4**

- [ ] 19. Implement error handling
  - [ ] 19.1 Create error classes
    - Create utils/errors.ts
    - Implement PermissionDeniedError class
    - Implement InvalidInviteError class
    - Implement SaveError interface
    - _Requirements: Error handling for all operations_
  
  - [ ] 19.2 Add error handling to components
    - Add try-catch blocks for permission checks
    - Display user-friendly error messages
    - Handle gesture recognition errors (ambiguous gestures)
    - Handle state consistency errors (counter mismatch, orphaned tasks)
    - _Requirements: Error handling for all operations_
  
  - [ ]* 19.3 Write unit tests for error scenarios
    - Test permission denied errors
    - Test invalid invite link errors
    - Test hierarchy violation errors
    - Test orphaned task handling

- [ ] 20. Implement persistence layer
  - [ ] 20.1 Create persistence utilities
    - Create utils/persistence.ts
    - Implement PersistenceLayer interface
    - Add debounced save function (500ms debounce)
    - Implement localStorage fallback
    - Handle save failures with retry queue
    - _Requirements: 20.5, persistence for all state changes_
  
  - [ ] 20.2 Integrate persistence with state management
    - Add persistence calls after state mutations
    - Implement retry logic with exponential backoff
    - Display offline indicator when saves fail
    - _Requirements: 20.5, persistence for all state changes_

- [ ] 21. Refactor Dashboard component
  - [ ] 21.1 Update DashboardView to use new bubble components
    - Replace existing cluster rendering with ClusterBubble components
    - Integrate HubBubble component
    - Add GestureDetector wrapper
    - Wire up all event handlers
    - _Requirements: Integration of all components_
  
  - [ ] 21.2 Update state management in App.tsx
    - Add GestureState and CollaborationState to AppState
    - Implement action handlers for cluster creation, expansion, task creation
    - Add collaboration state management
    - _Requirements: Integration of all components_

- [ ] 22. Implement visual consistency checks
  - [ ] 22.1 Add visual consistency utilities
    - Create utils/visualConsistency.ts
    - Implement size ratio validation
    - Implement type-based styling consistency checks
    - _Requirements: 1.6, 14.5_
  
  - [ ]* 22.2 Write property test for visual consistency
    - **Property 42: Visual Consistency Within Type**
    - **Validates: Requirements 14.5**

- [ ] 23. Implement admin type change functionality
  - [ ] 23.1 Add type change UI for admins
    - Add type change option in cluster context menu
    - Restrict to admin users only
    - Update cluster type and icon
    - _Requirements: 18.6_
  
  - [ ]* 23.2 Write property test for type changes
    - **Property 47: Admin Can Change Type**
    - **Validates: Requirements 18.6**

- [ ] 24. Implement parent task deletion handling
  - [ ] 24.1 Add deletion preference configuration
    - Add user preference for child task handling (cascade vs orphan)
    - Implement cascade delete logic
    - Implement orphan logic (move to parent cluster)
    - _Requirements: 19.4_
  
  - [ ]* 24.2 Write property test for parent deletion
    - **Property 49: Parent Deletion Handles Children**
    - **Validates: Requirements 19.4**

- [ ] 25. Final integration and polish
  - [ ] 25.1 Add animations and transitions
    - Implement smooth expansion/collapse animations
    - Add gesture feedback animations
    - Add bubble creation animations
    - _Requirements: 5.7, 13.4_
  
  - [ ] 25.2 Optimize performance
    - Implement React.memo for bubble components
    - Optimize re-renders with useMemo and useCallback
    - Add virtualization if needed for large task counts
  
  - [ ] 25.3 Accessibility improvements
    - Add ARIA labels to all interactive elements
    - Ensure keyboard navigation works
    - Add screen reader support
    - Test with accessibility tools

- [ ] 26. Final checkpoint - End-to-end testing
  - Test complete user flow: create workspace → create cluster → add tasks → expand/collapse → collaborate
  - Verify all gestures work correctly
  - Verify all permissions work correctly
  - Verify error handling works correctly
  - Run all property-based tests (minimum 100 iterations each)
  - Ensure all 52 correctness properties pass
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties with minimum 100 iterations
- Unit tests validate specific examples and edge cases
- The implementation follows a bottom-up approach: data models → components → interactions → collaboration
- All property tests should use the fast-check library for TypeScript
- Each property test must include a comment tag: `// Feature: three-tier-bubble-visualization, Property N: [property text]`
