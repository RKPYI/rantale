import { CommentSection } from "@/components/comment-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvatar, UserInfo } from "@/components/ui/user-avatar";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types/api";

// Example users with different roles for demonstration
const exampleUsers: User[] = [
  {
    id: 1,
    name: "Jane Doe",
    email: "jane@example.com",
    email_verified_at: "2024-01-01T00:00:00Z",
    email_verified: true,
    role: 0, // Regular user
    avatar: null,
    bio: null,
    is_admin: false,
  },
  {
    id: 2,
    name: "John Smith",
    email: "john@example.com",
    email_verified_at: "2024-01-01T00:00:00Z",
    email_verified: true,
    role: 1, // Author
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    bio: "Fantasy author with 5 published novels",
    is_admin: false,
  },
  {
    id: 3,
    name: "Sarah Wilson",
    email: "sarah@example.com",
    email_verified_at: "2024-01-01T00:00:00Z",
    email_verified: true,
    role: 2, // Moderator
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
    bio: "Community moderator",
    is_admin: false,
  },
  {
    id: 4,
    name: "Admin User",
    email: "admin@example.com",
    email_verified_at: "2024-01-01T00:00:00Z",
    email_verified: true,
    role: 3, // Admin
    avatar: null,
    bio: "Platform administrator",
    is_admin: true,
  },
];

export default function UserRolesDemoPage() {
  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">
          User Roles & Profile Pictures Demo
        </h1>
        <p className="text-muted-foreground">
          Demonstrating custom badges for different user roles and enhanced
          profile pictures
        </p>
      </div>

      {/* User Role Examples */}
      <Card>
        <CardHeader>
          <CardTitle>User Role Badges</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {exampleUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-4">
                <UserAvatar user={user} size="lg" showBadge={true} />
                <div>
                  <UserInfo
                    user={user}
                    showRole={true}
                    showVerificationStatus={true}
                  />
                  <p className="text-muted-foreground text-sm">{user.email}</p>
                  {user.bio && (
                    <p className="text-muted-foreground mt-1 text-xs">
                      {user.bio}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Role ID: {user.role}</p>
                <p className="text-muted-foreground text-xs">
                  {user.role === 0 && "Regular User"}
                  {user.role === 1 && "Author"}
                  {user.role === 2 && "Moderator"}
                  {user.role === 3 && "Administrator"}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Avatar Size Variations */}
      <Card>
        <CardHeader>
          <CardTitle>Avatar Sizes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {["sm", "md", "lg"].map((size) => (
              <div key={size} className="space-y-4 text-center">
                <h3 className="text-lg font-medium capitalize">{size} Size</h3>
                <div className="flex flex-col items-center gap-2">
                  {exampleUsers.slice(0, 2).map((user) => (
                    <div key={user.id} className="flex items-center gap-3">
                      <UserAvatar
                        user={user}
                        size={size as "sm" | "md" | "lg"}
                        showBadge={true}
                      />
                      <span className="text-sm">{user.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-2 font-medium">Role Badges</h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>• Crown icon for Administrators</li>
                <li>• Shield icon for Moderators</li>
                <li>• Pen tool icon for Authors</li>
                <li>• No badge for regular users</li>
                <li>• Color-coded badges for each role</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 font-medium">Profile Pictures</h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>• Automatic fallback to user initials</li>
                <li>• Responsive avatar sizes (sm, md, lg)</li>
                <li>• Role badges positioned as overlay</li>
                <li>• Consistent styling across all components</li>
                <li>• Dark/light theme support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comment Section Integration Note */}
      <Card>
        <CardHeader>
          <CardTitle>Comment Section Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              The enhanced user avatars and role badges are now integrated into:
            </p>
            <ul className="text-muted-foreground list-disc space-y-1 pl-6 text-sm">
              <li>
                <strong>Comment Section:</strong> Shows user roles next to
                commenter names
              </li>
              <li>
                <strong>Navigation Bar:</strong> User dropdown with role
                indication
              </li>
              <li>
                <strong>Profile Pictures:</strong> Consistent avatar display
                with role badges
              </li>
              <li>
                <strong>Verification Status:</strong> Email verification badges
                for unverified users
              </li>
            </ul>

            <div className="bg-muted mt-6 rounded-lg p-4">
              <p className="mb-2 text-sm font-medium">
                Technical Implementation:
              </p>
              <ul className="text-muted-foreground list-disc space-y-1 pl-4 text-xs">
                <li>
                  User roles determined by <code>role</code> field (0=user,
                  1=author, 2=moderator, 3=admin)
                </li>
                <li>
                  Role badges only shown for non-regular users (authors,
                  moderators, admins)
                </li>
                <li>
                  Profile pictures with automatic fallback to user initials
                </li>
                <li>
                  Reusable <code>UserAvatar</code> and <code>UserInfo</code>{" "}
                  components
                </li>
                <li>Consistent styling using shadcn/ui design system</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
