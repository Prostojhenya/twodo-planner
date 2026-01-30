# Design Document: Three-Tier Bubble Visualization System

## Overview

The three-tier bubble visualization system is a canvas-based task management interface built with React, TypeScript, and Vite. The system enforces a strict three-level hierarchy: Hub (workspace context), Clusters (typed task groups), and Tasks (individual items). The design emphasizes visual clarity through size differentiation, supports collaborative workflows with role-based permissions, and provides intuitive touch-based interactions.

### Key Design Principles

1. **Visual Hierarchy Through Size**: The three bubble sizes (large Hub, medium Cluster, small Task) provide immediate visual understanding of the information architecture
2. **Gesture-Driven Interaction**: Long-press, tap, and drag gestures enable fluid creation and manipulation of bubbles
3. **Contextual Collaboration**: Permissions and roles are scoped to individual clusters, not globally, allowing fine-grained access control
4. **Canvas-First UI**: All interactions occur on the canvas with overlays, avoiding navigation to separate screens
5. **Real-Time Feedback**: Counters, animations, and visual feedback provide immediate response to user actions

## Architecture

### Component Hierarchy

```
App
├── DashboardView (Canvas Container)
│   ├── CanvasLayer (SVG + Absolute Positioning)
│   │   ├── ConnectionLines (SVG)
│   │   ├── HubBubble
│   │   ├── ClusterBubble[]
│   │   │   └── TaskBubble[] (when expanded)
│   │   └── GestureOverlay
│   ├── CollaborationOverlay (Modal)
│   └── ClusterTypeSelector (Modal)
└── State Management (React Context or Props)
```

### State Management Architecture

The application uses React state management with the following structure:

```typescript
interface AppState {
  workspace: Workspace;
  bubbles: BubbleRegistry;
  gestures: GestureState;
  collaboration: CollaborationState;
}

interface Workspace {
  id: string;
  ownerId: string;
  hub: Hub;
  createdAt: number;
}

interface BubbleRegistry {
  hub: Hub;
  clusters: Map<string, Cluster>;
  tasks: Map<string, Task>;
}

interface GestureState {
  activeGesture: 'none' | 'long-press' | 'drag' | 'tap';
  gestureTarget: string | null;
  gestureStartTime: number;
  gestureStartPosition: Position;
  previewBubble: PreviewBubble | null;
}

interface CollaborationState {
  activeOverlay: string | null; // cluster ID
  inviteLinks: Map<string, InviteLink>;
}
```

### Data Flow

1. **User Gesture** → GestureDetector → GestureState Update
2. **GestureState** → Action Dispatcher → State Mutation
3. **State Mutation** → React Re-render → Visual Update
4. **Collaboration Action** → API Call → State Sync → UI Update

## Components and Interfaces

### 1. BubbleBase (Abstract Component)

Base component for all bubble types with shared functionality.

```typescript
interface BubbleBaseProps {
  id: string;
  position: Position;
  size: BubbleSize;
  onTap: (id: string) => void;
  onLongPress: (id: string) => void;
  onDragStart: (id: string, position: Position) => void;
  onDragMove: (id: string, position: Position) => void;
  onDragEnd: (id: string, position: Position) => void;
}

type BubbleSize = 'small' | 'medium' | 'large';

interface Position {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
}
```

**Responsibilities**:
- Render circular SVG or div element
- Detect and dispatch gesture events
- Apply size-based styling
- Handle animation states

### 2. HubBubble Component

The central workspace bubble, always visible and positioned at canvas center.

```typescript
interface HubBubbleProps extends BubbleBaseProps {
  workspace: Workspace;
  isCreatingCluster: boolean;
}

interface Workspace {
  id: string;
  ownerId: string;
  context: 'me' | 'partner' | 'couple' | 'group';
  displayName: string;
}
```

**Responsibilities**:
- Render large bubble with workspace context
- Display avatar(s) based on context type
- Provide visual feedback during cluster creation
- Remain fixed at center position (50%, 55%)

**Visual Specifications**:
- Size: 80px diameter (large)
- Border: 2px solid black
- Background: white
- Shadow: 0 0 30px rgba(0,0,0,0.1)
- Label: "HUB" in uppercase, positioned below bubble

### 3. ClusterBubble Component

Medium-sized bubbles representing typed task groups with counters.

```typescript
interface ClusterBubbleProps extends BubbleBaseProps {
  cluster: Cluster;
  isExpanded: boolean;
  taskCount: number;
  onToggleExpansion: (id: string) => void;
  onShowCollaboration: (id: string) => void;
}

interface Cluster {
  id: string;
  title: string;
  type: ClusterType;
  ownerId: string;
  members: ClusterMember[];
  createdAt: number;
  position: Position;
  isExpanded: boolean;
}

type ClusterType = 'task' | 'event' | 'shop' | 'custom';

interface ClusterMember {
  userId: string;
  role: MemberRole;
  permissions: Permission[];
  joinedAt: number;
}

type MemberRole = 'admin' | 'user' | 'viewer';

type Permission = 
  | 'add_tasks'
  | 'complete_tasks'
  | 'delete_tasks'
  | 'edit_tasks'
  | 'invite_members'
  | 'change_permissions';
```

**Responsibilities**:
- Render medium bubble with type icon
- Display counter when collapsed
- Handle expansion/collapse toggle
- Show collaboration badge when multi-member
- Position child tasks in ring when expanded

**Visual Specifications**:
- Size: 96px diameter (medium)
- Border: 2px solid (color based on type)
- Background: white
- Counter: Centered text, format "N TASKS"
- Type Icon: 24px, positioned at top
- Collaboration Badge: 16px "👥" icon, positioned at top-right

**Counter Calculation**:
```typescript
function calculateTaskCount(
  cluster: Cluster, 
  tasks: Task[], 
  includeCompleted: boolean
): number {
  const clusterTasks = tasks.filter(t => t.clusterId === cluster.id);
  if (includeCompleted) {
    return clusterTasks.length;
  }
  return clusterTasks.filter(t => t.status !== 'done').length;
}
```

### 4. TaskBubble Component

Small bubbles representing individual tasks, displayed only when parent cluster is expanded.

```typescript
interface TaskBubbleProps extends BubbleBaseProps {
  task: Task;
  parentClusterId: string;
  ringPosition: number; // 0-based index in ring
  totalInRing: number;
}

interface Task {
  id: string;
  title: string;
  type: TaskType;
  status: TaskStatus;
  clusterId: string;
  parentTaskId?: string; // for nested tasks
  assignee: string;
  createdAt: number;
  completedAt?: number;
}

type TaskType = 'task' | 'event' | 'shop' | 'custom';
type TaskStatus = 'todo' | 'in_progress' | 'done';
```

**Responsibilities**:
- Render small bubble with type icon only
- Calculate position in ring around parent cluster
- Handle tap for task details
- Support nested task creation

**Visual Specifications**:
- Size: 48px diameter (small)
- Border: 1px solid gray
- Background: white
- Icon: 16px, centered
- No text label
- No counter

**Ring Positioning Algorithm**:
```typescript
function calculateRingPosition(
  clusterCenter: Position,
  ringIndex: number,
  totalInRing: number,
  ringRadius: number = 80 // pixels from cluster center
): Position {
  const angleStep = (2 * Math.PI) / totalInRing;
  const angle = ringIndex * angleStep - (Math.PI / 2); // Start at top
  
  return {
    x: clusterCenter.x + (ringRadius * Math.cos(angle)),
    y: clusterCenter.y + (ringRadius * Math.sin(angle))
  };
}
```

### 5. GestureDetector Component

Invisible overlay that captures and interprets touch/mouse gestures.

```typescript
interface GestureDetectorProps {
  onGestureDetected: (gesture: Gesture) => void;
  children: React.ReactNode;
}

interface Gesture {
  type: GestureType;
  targetId: string | null;
  startPosition: Position;
  currentPosition: Position;
  duration: number;
}

type GestureType = 
  | 'tap'
  | 'long-press'
  | 'drag-start'
  | 'drag-move'
  | 'drag-end';
```

**Gesture Recognition Logic**:

```typescript
const LONG_PRESS_THRESHOLD = 1500; // milliseconds
const DRAG_THRESHOLD = 10; // pixels

class GestureRecognizer {
  private startTime: number = 0;
  private startPos: Position = { x: 0, y: 0 };
  private hasMoved: boolean = false;
  
  onPointerDown(e: PointerEvent): void {
    this.startTime = Date.now();
    this.startPos = { x: e.clientX, y: e.clientY };
    this.hasMoved = false;
    
    // Start long-press timer
    this.longPressTimer = setTimeout(() => {
      if (!this.hasMoved) {
        this.emitGesture('long-press');
      }
    }, LONG_PRESS_THRESHOLD);
  }
  
  onPointerMove(e: PointerEvent): void {
    const distance = this.calculateDistance(
      this.startPos,
      { x: e.clientX, y: e.clientY }
    );
    
    if (distance > DRAG_THRESHOLD) {
      this.hasMoved = true;
      clearTimeout(this.longPressTimer);
      
      if (!this.isDragging) {
        this.emitGesture('drag-start');
        this.isDragging = true;
      } else {
        this.emitGesture('drag-move');
      }
    }
  }
  
  onPointerUp(e: PointerEvent): void {
    clearTimeout(this.longPressTimer);
    
    const duration = Date.now() - this.startTime;
    
    if (this.isDragging) {
      this.emitGesture('drag-end');
    } else if (!this.hasMoved && duration < LONG_PRESS_THRESHOLD) {
      this.emitGesture('tap');
    }
    
    this.reset();
  }
  
  private calculateDistance(p1: Position, p2: Position): number {
    return Math.sqrt(
      Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
    );
  }
}
```

### 6. CollaborationOverlay Component

Modal overlay for managing cluster members and permissions.

```typescript
interface CollaborationOverlayProps {
  cluster: Cluster;
  currentUserId: string;
  onClose: () => void;
  onInvite: (clusterId: string) => Promise<InviteLink>;
  onUpdateRole: (clusterId: string, userId: string, role: MemberRole) => void;
  onUpdatePermissions: (
    clusterId: string, 
    userId: string, 
    permissions: Permission[]
  ) => void;
  onRemoveMember: (clusterId: string, userId: string) => void;
}

interface InviteLink {
  url: string;
  clusterId: string;
  expiresAt: number;
  createdBy: string;
}
```

**Responsibilities**:
- Display list of cluster members with roles
- Show role badges (🔴 Admin, 🔵 User, ⚪ Viewer)
- Provide invite link generation for admins
- Allow role and permission changes for admins
- Handle member removal for admins

**Visual Specifications**:
- Overlay: Semi-transparent backdrop (rgba(0,0,0,0.5))
- Panel: White card, rounded corners, centered
- Width: 90% of canvas, max 400px
- Padding: 24px
- Close button: X icon, top-right corner

### 7. ClusterTypeSelector Component

Modal overlay for selecting cluster type during creation.

```typescript
interface ClusterTypeSelectorProps {
  position: Position;
  onSelect: (type: ClusterType) => void;
  onCancel: () => void;
}

interface ClusterTypeOption {
  type: ClusterType;
  icon: React.ReactNode;
  label: string;
  description: string;
}
```

**Responsibilities**:
- Display four type options with icons
- Handle type selection
- Handle cancellation
- Position near the newly created cluster

**Type Options**:
1. Task: ✓ icon, "Tasks", "General task management"
2. Event: 📅 icon, "Events", "Dates and appointments"
3. Shop: 🛒 icon, "Shopping", "Shopping lists"
4. Custom: 📁 icon, "Custom", "Custom category"

## Data Models

### Extended Type Definitions

```typescript
// Extend existing Cluster type
interface ClusterExtended extends Cluster {
  ownerId: string;
  members: ClusterMember[];
  type: ClusterType;
  isExpanded: boolean;
  position: Position;
}

// Extend existing Task type
interface TaskExtended extends Task {
  type: TaskType;
  clusterId: string;
  parentTaskId?: string;
  position?: Position; // Only when expanded
}

// New types for collaboration
interface ClusterMember {
  userId: string;
  role: MemberRole;
  permissions: Permission[];
  joinedAt: number;
}

interface InviteLink {
  id: string;
  url: string;
  clusterId: string;
  expiresAt: number;
  createdBy: string;
  usedBy: string[];
}

// Permission matrix
const ROLE_PERMISSIONS: Record<MemberRole, Permission[]> = {
  admin: [
    'add_tasks',
    'complete_tasks',
    'delete_tasks',
    'edit_tasks',
    'invite_members',
    'change_permissions'
  ],
  user: [
    'add_tasks',
    'complete_tasks',
    'edit_tasks'
  ],
  viewer: []
};
```

### State Transitions

#### Cluster Expansion State Machine

```
[Collapsed] --tap--> [Expanding] --animation complete--> [Expanded]
[Expanded] --tap--> [Collapsing] --animation complete--> [Collapsed]
```

#### Gesture State Machine

```
[Idle] --pointer down--> [Detecting]
[Detecting] --timer expires--> [LongPress]
[Detecting] --movement--> [Dragging]
[Detecting] --pointer up (quick)--> [Tap] ---> [Idle]
[LongPress] --pointer up--> [Idle]
[Dragging] --pointer up--> [DragEnd] ---> [Idle]
```

### Data Persistence

All state changes should be persisted to localStorage or a backend API:

```typescript
interface PersistenceLayer {
  saveWorkspace(workspace: Workspace): Promise<void>;
  saveClusters(clusters: Cluster[]): Promise<void>;
  saveTasks(tasks: Task[]): Promise<void>;
  saveCollaboration(
    clusterId: string, 
    members: ClusterMember[]
  ): Promise<void>;
}

// Debounced save to avoid excessive writes
const debouncedSave = debounce((state: AppState) => {
  persistenceLayer.saveWorkspace(state.workspace);
  persistenceLayer.saveClusters(Array.from(state.bubbles.clusters.values()));
  persistenceLayer.saveTasks(Array.from(state.bubbles.tasks.values()));
}, 500);
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Bubble Size Hierarchy

*For any* rendered Hub, Cluster, and Task bubble, the Hub size SHALL be greater than the Cluster size, and the Cluster size SHALL be greater than the Task size.

**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**

### Property 2: Size Ratio Consistency

*For any* screen size or viewport dimension, the ratio of Hub:Cluster:Task sizes SHALL remain constant.

**Validates: Requirements 1.6**

### Property 3: Single Hub Per Workspace

*For any* workspace, counting the Hub bubbles SHALL return exactly 1.

**Validates: Requirements 2.1**

### Property 4: Hub Center Positioning

*For any* workspace, the Hub bubble position SHALL be at the canvas center coordinates (50%, 55% or similar center point).

**Validates: Requirements 2.2**

### Property 5: Hub Has No Counter

*For any* Hub bubble, querying for a counter element SHALL return null or false.

**Validates: Requirements 2.3**

### Property 6: Hub Cannot Be Removed

*For any* Hub bubble, attempting to remove or collapse it SHALL fail and the Hub SHALL remain in the workspace.

**Validates: Requirements 2.4**

### Property 7: Long-Press Initiates Cluster Creation

*For any* Hub bubble, simulating a long-press gesture (1-2 seconds) SHALL transition the system to cluster creation mode.

**Validates: Requirements 3.1**

### Property 8: Drag Creates Cluster at Release Position

*For any* drag gesture from Hub to a canvas position, releasing SHALL create a new Cluster bubble at the release coordinates.

**Validates: Requirements 3.3, 3.4**

### Property 9: Cluster Creation Prompts Type Selection

*For any* newly created cluster, a type selector UI SHALL be displayed before the cluster is finalized.

**Validates: Requirements 3.5, 18.1**

### Property 10: Cancel Aborts Cluster Creation

*For any* cluster creation that is cancelled, no new cluster SHALL exist in the workspace and the system SHALL return to idle state.

**Validates: Requirements 3.6, 18.4**

### Property 11: Counter Accuracy

*For any* collapsed cluster, the displayed counter SHALL equal the number of tasks associated with that cluster (filtered by completion status based on user preference).

**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 16.4**

### Property 12: Counter Respects Completion Preference

*For any* cluster with completed tasks, when includeCompleted is true, the counter SHALL include completed tasks; when includeCompleted is false, the counter SHALL exclude completed tasks.

**Validates: Requirements 4.5, 4.6**

### Property 13: Counter Format

*For any* cluster counter value N, the displayed text SHALL match the format "N TASKS" or similar readable pattern.

**Validates: Requirements 4.7**

### Property 14: Expansion Shows Tasks

*For any* collapsed cluster with tasks, tapping SHALL expand the cluster and render all task bubbles in a circular arrangement.

**Validates: Requirements 5.1, 5.3**

### Property 15: Expansion Hides Counter

*For any* expanded cluster, the counter element SHALL not be visible.

**Validates: Requirements 5.2**

### Property 16: Collapse Hides Tasks

*For any* expanded cluster, tapping SHALL collapse the cluster, hide all task bubbles, and restore the counter display.

**Validates: Requirements 5.4, 5.5, 5.6**

### Property 17: Expansion-Collapse Round Trip

*For any* cluster, expanding then immediately collapsing SHALL restore the cluster to its original collapsed state with the same counter value.

**Validates: Requirements 5.1, 5.4**

### Property 18: Task Creation Associates with Cluster

*For any* task created from an expanded cluster, the task's clusterId field SHALL match the parent cluster's ID.

**Validates: Requirements 6.3**

### Property 19: Task Creation Increments Counter

*For any* cluster, creating a task SHALL increment the cluster's counter by 1.

**Validates: Requirements 6.4**

### Property 20: Nested Task Relationship

*For any* task created from another task, the new task's parentTaskId field SHALL contain the parent task's ID.

**Validates: Requirements 6.5, 19.1, 19.2**

### Property 21: Task Bubble Icon Mapping

*For any* task bubble, the displayed icon SHALL correspond to the task's type: checkmark for "task", cart for "shop", calendar for "event", folder for "custom".

**Validates: Requirements 7.2, 7.3, 7.4, 7.5**

### Property 22: Task Bubbles Have No Text Labels

*For any* task bubble, no text label element SHALL be rendered.

**Validates: Requirements 7.6**

### Property 23: Task Bubbles Have No Counters

*For any* task bubble, no counter element SHALL be rendered.

**Validates: Requirements 7.7**

### Property 24: Cluster Has Owner and Members

*For any* cluster, the ownerId field SHALL be populated and the members array SHALL exist.

**Validates: Requirements 8.1, 8.2**

### Property 25: Creator Is Admin

*For any* newly created cluster, the creator SHALL be in the members list with role="admin".

**Validates: Requirements 8.4**

### Property 26: Members Have Roles

*For any* cluster member, a role SHALL be assigned from the set {admin, user, viewer}.

**Validates: Requirements 8.3, 8.5**

### Property 27: Admin Permissions

*For any* cluster member with role="admin", operations for creating/deleting cluster, inviting members, changing permissions, and viewing tasks SHALL succeed.

**Validates: Requirements 9.1, 9.2, 9.3, 9.4**

### Property 28: User Permissions

*For any* cluster member with role="user", viewing tasks SHALL succeed, and add/complete/delete operations SHALL succeed only if the corresponding permission is granted.

**Validates: Requirements 9.5, 9.6, 9.7, 9.8**

### Property 29: Viewer Permissions

*For any* cluster member with role="viewer", only view operations SHALL succeed and all modification operations SHALL fail.

**Validates: Requirements 9.9, 9.10**

### Property 30: Collaboration Badge Visibility

*For any* cluster with more than one member, a collaboration badge ("👥") SHALL be visible on the cluster bubble.

**Validates: Requirements 10.1**

### Property 31: Collaboration Overlay Display

*For any* tap on a collaboration badge, the Collaboration_Overlay SHALL become visible and display all cluster members with their roles.

**Validates: Requirements 10.2, 10.3, 10.4**

### Property 32: Admin Invite Access

*For any* admin user viewing the Collaboration_Overlay, an invite button SHALL be present and functional.

**Validates: Requirements 10.5, 10.6**

### Property 33: Overlay Closes on Outside Tap

*For any* tap outside the Collaboration_Overlay bounds, the overlay SHALL close and become hidden.

**Validates: Requirements 10.8**

### Property 34: Cluster Type Icon Mapping

*For any* cluster bubble, the displayed icon SHALL correspond to the cluster's type: checkmark for "task", calendar for "event", cart for "shop", folder for "custom".

**Validates: Requirements 11.1, 11.2, 11.3, 11.4, 11.5**

### Property 35: Task Bubbles Cannot Contain Children

*For any* task bubble, attempting to add child bubbles SHALL fail or be rejected.

**Validates: Requirements 12.1**

### Property 36: Clusters Contain Only Tasks

*For any* cluster bubble, only Task-type children SHALL be allowed; attempting to add non-Task children SHALL fail.

**Validates: Requirements 12.2**

### Property 37: Three-Tier Hierarchy Invariant

*For any* system state, the bubble hierarchy SHALL have at most 3 levels: Hub at root, Clusters as children of Hub, Tasks as children of Clusters.

**Validates: Requirements 12.3, 12.5**

### Property 38: Invalid Nesting Rejected

*For any* attempt to nest bubbles in violation of the hierarchy rules, the operation SHALL fail and the system state SHALL remain unchanged.

**Validates: Requirements 12.4**

### Property 39: Gesture Event Registration

*For any* tap, long-press, or drag gesture on a bubble, the corresponding event handler SHALL be invoked.

**Validates: Requirements 13.1, 13.2, 13.3**

### Property 40: Tap vs Long-Press Distinction

*For any* quick tap gesture (< 1 second), the system SHALL trigger tap behavior and NOT trigger long-press behavior.

**Validates: Requirements 17.1**

### Property 41: Drag vs Tap Distinction

*For any* drag gesture with movement exceeding the threshold, the system SHALL trigger drag behavior and NOT trigger tap behavior.

**Validates: Requirements 17.2**

### Property 42: Visual Consistency Within Type

*For any* two bubbles of the same type (both Hubs, both Clusters, or both Tasks), their visual properties (size, shape, styling) SHALL match.

**Validates: Requirements 14.5**

### Property 43: Invite Link Contains Cluster ID

*For any* generated invite URL, parsing the URL SHALL extract the correct cluster ID.

**Validates: Requirements 15.1, 15.2**

### Property 44: Invite Acceptance Adds Member

*For any* accepted invitation, the accepting user SHALL appear in the cluster's members list with role="user".

**Validates: Requirements 15.4, 15.5**

### Property 45: Invalid Invite Rejected

*For any* invite URL with an invalid or non-existent cluster ID, the system SHALL reject the invitation and display an error.

**Validates: Requirements 15.6**

### Property 46: Type Selection Assignment

*For any* cluster type selection, the cluster's type field SHALL match the selected type.

**Validates: Requirements 18.3**

### Property 47: Admin Can Change Type

*For any* cluster and admin member, the admin SHALL be able to modify the cluster's type after creation.

**Validates: Requirements 18.6**

### Property 48: Multi-Level Nesting Allowed

*For any* task, creating a child task, then creating a child of that child task SHALL succeed, establishing a nested hierarchy.

**Validates: Requirements 19.3**

### Property 49: Parent Deletion Handles Children

*For any* parent task with children, deleting the parent SHALL handle child tasks according to the configured preference (cascade delete or orphan).

**Validates: Requirements 19.4**

### Property 50: Workspace Initialization Creates Hub

*For any* newly created workspace, a Hub bubble SHALL exist at the canvas center.

**Validates: Requirements 20.1, 20.2**

### Property 51: Workspace Initialization Creates Defaults

*For any* newly created workspace, default cluster categories (Tasks, Shopping, Events) SHALL be created.

**Validates: Requirements 20.3**

### Property 52: Workspace Owner Assignment

*For any* newly created workspace, the ownerId field SHALL match the creating user's ID.

**Validates: Requirements 20.4**

## Error Handling

### Gesture Recognition Errors

**Ambiguous Gestures**:
- When gesture interpretation is ambiguous (e.g., movement near drag threshold), default to tap behavior
- Log ambiguous gestures for analytics and threshold tuning
- Provide visual feedback to help users understand gesture requirements

**Timeout Handling**:
- If long-press timer is interrupted by movement, cancel long-press and switch to drag
- If pointer is released during long-press timer, treat as tap
- Clear all gesture timers on pointer cancel events

### Collaboration Errors

**Permission Denied**:
```typescript
class PermissionDeniedError extends Error {
  constructor(
    public userId: string,
    public action: string,
    public clusterId: string
  ) {
    super(`User ${userId} lacks permission for ${action} on cluster ${clusterId}`);
  }
}
```

**Handling**:
- Display user-friendly error message
- Log permission violation for audit
- Do not modify state
- Provide suggestion for requesting permission

**Invalid Invite Link**:
```typescript
class InvalidInviteError extends Error {
  constructor(
    public inviteUrl: string,
    public reason: 'expired' | 'invalid_cluster' | 'malformed'
  ) {
    super(`Invite link is invalid: ${reason}`);
  }
}
```

**Handling**:
- Display error message explaining the issue
- Suggest requesting a new invite link
- Log invalid invite attempts for security monitoring

### State Consistency Errors

**Counter Mismatch**:
- If counter value doesn't match actual task count, recalculate immediately
- Log mismatch for debugging
- Implement periodic consistency checks

**Orphaned Tasks**:
- If task references non-existent cluster, move to "General" cluster
- Log orphaned task for investigation
- Provide UI to reassign orphaned tasks

**Hierarchy Violation**:
- If hierarchy rules are violated (e.g., Task containing Cluster), reject operation
- Restore previous valid state
- Display error message explaining hierarchy rules

### Network and Persistence Errors

**Save Failure**:
```typescript
interface SaveError {
  operation: 'create' | 'update' | 'delete';
  entityType: 'workspace' | 'cluster' | 'task';
  entityId: string;
  error: Error;
}
```

**Handling**:
- Queue failed operations for retry
- Display offline indicator
- Implement exponential backoff for retries
- Persist operations to localStorage as fallback

**Sync Conflict**:
- When local and remote state conflict, use last-write-wins with timestamp
- Provide conflict resolution UI for critical conflicts
- Log conflicts for analysis

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and integration points
- Specific gesture sequences (tap, long-press, drag)
- Edge cases (empty clusters, single-task clusters, maximum nesting depth)
- Error conditions (permission denied, invalid operations)
- Integration between components (gesture detector → state → UI)

**Property-Based Tests**: Verify universal properties across all inputs
- Generate random workspaces, clusters, and tasks
- Test properties hold for all generated inputs
- Minimum 100 iterations per property test
- Each property test references its design document property

### Property-Based Testing Configuration

**Library Selection**: Use `fast-check` for TypeScript/JavaScript property-based testing

**Test Structure**:
```typescript
import fc from 'fast-check';

// Feature: three-tier-bubble-visualization, Property 11: Counter Accuracy
test('cluster counter equals task count', () => {
  fc.assert(
    fc.property(
      fc.record({
        cluster: clusterArbitrary(),
        tasks: fc.array(taskArbitrary()),
        includeCompleted: fc.boolean()
      }),
      ({ cluster, tasks, includeCompleted }) => {
        const clusterTasks = tasks.filter(t => t.clusterId === cluster.id);
        const expectedCount = includeCompleted
          ? clusterTasks.length
          : clusterTasks.filter(t => t.status !== 'done').length;
        
        const actualCount = calculateTaskCount(cluster, tasks, includeCompleted);
        
        expect(actualCount).toBe(expectedCount);
      }
    ),
    { numRuns: 100 }
  );
});
```

**Arbitraries** (Generators):
```typescript
// Generate random positions
const positionArbitrary = () => fc.record({
  x: fc.integer({ min: 0, max: 100 }),
  y: fc.integer({ min: 0, max: 100 })
});

// Generate random clusters
const clusterArbitrary = () => fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 50 }),
  type: fc.constantFrom('task', 'event', 'shop', 'custom'),
  ownerId: fc.uuid(),
  members: fc.array(memberArbitrary(), { minLength: 1, maxLength: 10 }),
  createdAt: fc.integer({ min: 0 }),
  position: positionArbitrary(),
  isExpanded: fc.boolean()
});

// Generate random tasks
const taskArbitrary = () => fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  type: fc.constantFrom('task', 'event', 'shop', 'custom'),
  status: fc.constantFrom('todo', 'in_progress', 'done'),
  clusterId: fc.uuid(),
  parentTaskId: fc.option(fc.uuid(), { nil: undefined }),
  assignee: fc.uuid(),
  createdAt: fc.integer({ min: 0 })
});

// Generate random members
const memberArbitrary = () => fc.record({
  userId: fc.uuid(),
  role: fc.constantFrom('admin', 'user', 'viewer'),
  permissions: fc.array(
    fc.constantFrom(
      'add_tasks',
      'complete_tasks',
      'delete_tasks',
      'edit_tasks',
      'invite_members',
      'change_permissions'
    )
  ),
  joinedAt: fc.integer({ min: 0 })
});
```

### Unit Test Examples

**Gesture Recognition**:
```typescript
describe('GestureDetector', () => {
  test('tap gesture completes in under 1 second', () => {
    const detector = new GestureRecognizer();
    const gestures: Gesture[] = [];
    
    detector.onGestureDetected = (g) => gestures.push(g);
    
    detector.onPointerDown(mockPointerEvent(100, 100));
    jest.advanceTimersByTime(500);
    detector.onPointerUp(mockPointerEvent(100, 100));
    
    expect(gestures).toHaveLength(1);
    expect(gestures[0].type).toBe('tap');
  });
  
  test('long-press triggers after threshold', () => {
    const detector = new GestureRecognizer();
    const gestures: Gesture[] = [];
    
    detector.onGestureDetected = (g) => gestures.push(g);
    
    detector.onPointerDown(mockPointerEvent(100, 100));
    jest.advanceTimersByTime(1500);
    
    expect(gestures).toHaveLength(1);
    expect(gestures[0].type).toBe('long-press');
  });
});
```

**Permission Checking**:
```typescript
describe('Permission System', () => {
  test('admin can delete cluster', () => {
    const cluster = createMockCluster();
    const admin = createMockMember('admin');
    
    const result = checkPermission(cluster, admin.userId, 'delete_cluster');
    
    expect(result).toBe(true);
  });
  
  test('user without delete permission cannot delete tasks', () => {
    const cluster = createMockCluster();
    const user = createMockMember('user', ['add_tasks', 'complete_tasks']);
    
    const result = checkPermission(cluster, user.userId, 'delete_tasks');
    
    expect(result).toBe(false);
  });
  
  test('viewer cannot perform any modifications', () => {
    const cluster = createMockCluster();
    const viewer = createMockMember('viewer');
    
    const actions = ['add_tasks', 'complete_tasks', 'delete_tasks', 'edit_tasks'];
    
    actions.forEach(action => {
      expect(checkPermission(cluster, viewer.userId, action)).toBe(false);
    });
  });
});
```

### Integration Testing

**Cluster Creation Flow**:
```typescript
describe('Cluster Creation Integration', () => {
  test('long-press hub, drag, release creates cluster', async () => {
    const { getByTestId, findByTestId } = render(<DashboardView {...props} />);
    const hub = getByTestId('hub-bubble');
    
    // Long-press
    fireEvent.pointerDown(hub, { clientX: 200, clientY: 200 });
    await waitFor(() => {
      expect(getByTestId('cluster-creation-mode')).toBeInTheDocument();
    }, { timeout: 1600 });
    
    // Drag
    fireEvent.pointerMove(hub, { clientX: 300, clientY: 150 });
    expect(getByTestId('cluster-preview')).toBeInTheDocument();
    
    // Release
    fireEvent.pointerUp(hub, { clientX: 300, clientY: 150 });
    
    // Type selector appears
    const typeSelector = await findByTestId('cluster-type-selector');
    expect(typeSelector).toBeInTheDocument();
    
    // Select type
    fireEvent.click(getByTestId('type-option-task'));
    
    // Cluster created
    const cluster = await findByTestId('cluster-bubble');
    expect(cluster).toBeInTheDocument();
  });
});
```

### Test Coverage Goals

- **Unit Tests**: 80% code coverage minimum
- **Property Tests**: All 52 correctness properties implemented
- **Integration Tests**: All major user flows covered
- **Edge Cases**: Empty states, maximum limits, error conditions
- **Performance**: Gesture recognition under 16ms, counter updates under 100ms

### Continuous Testing

- Run unit tests on every commit
- Run property tests on every pull request
- Run integration tests before deployment
- Monitor test execution time and optimize slow tests
- Track flaky tests and fix root causes
