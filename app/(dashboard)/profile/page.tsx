import { getUser } from "@/lib/dal";
import { Card, Pill } from "@/components/dashboard/DashboardScreens";
import ProfileForm from "@/components/dashboard/ProfileForm";

export default async function ProfilePage() {
  const user = await getUser();

  if (!user) return null;

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-5xl font-black tracking-tight">Profile</h1>
        <p className="mt-2 text-xl text-neutral-600">Manage your account details.</p>
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-8">
        <Card title="Account Details">
          <ProfileForm name={user.name} />

          <div className="mt-8 grid grid-cols-2 gap-8 border-t border-[#ececec] pt-8">
            <div>
              <p className="font-mono text-xs uppercase text-neutral-500">Email</p>
              <p className="mt-1 text-lg">{user.email}</p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase text-neutral-500">Company</p>
              <p className="mt-1 text-lg">{user.companyName}</p>
            </div>
          </div>
        </Card>

        <Card title="Role">
          <Pill tone="dark">{user.role}</Pill>
          <p className="mt-4 text-neutral-600">
            {user.role === "ADMIN"
              ? "You can manage company-wide settings and billing."
              : "You have standard member access."}
          </p>
        </Card>
      </div>
    </main>
  );
}
