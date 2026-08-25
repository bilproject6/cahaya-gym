import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Coba fetch profile via user's own session dulu
  let { data: profile } = await supabase
    .from("profiles")
    .select("nama, role")
    .eq("id", user.id)
    .single();

  // Jika gagal (RLS blocking), pakai admin client
  if (!profile) {
    const adminSupabase = createAdminClient();

    // Cek apakah profile ada
    const { data: existingProfile } = await adminSupabase
      .from("profiles")
      .select("nama, role")
      .eq("id", user.id)
      .single();

    if (existingProfile) {
      profile = existingProfile;
    } else {
      // Profile tidak ada — buat baru dari user metadata
      const nama = user.user_metadata?.nama || user.email || "User";
      const role = user.user_metadata?.role || "member";

      await adminSupabase.from("profiles").insert({
        id: user.id,
        nama,
        role,
        no_hp: user.user_metadata?.no_hp || null,
        is_verified: role === "admin",
      });

      const { data: newProfile } = await adminSupabase
        .from("profiles")
        .select("nama, role")
        .eq("id", user.id)
        .single();

      profile = newProfile;
    }
  }

  // Cek role
  if (!profile || profile.role !== "admin") {
    if (profile?.role === "member") {
      redirect("/member/dashboard");
    }
    // Role tidak dikenal — sign out dan redirect ke login
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <AdminLayoutClient profile={profile}>
      {children}
    </AdminLayoutClient>
  );
}
