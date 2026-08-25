import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MemberLayoutClient from "./MemberLayoutClient";

export default async function MemberLayout({
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

  // Coba fetch profile via user's own session
  let { data: profile } = await supabase
    .from("profiles")
    .select("nama, role, is_verified")
    .eq("id", user.id)
    .single();

  // Jika gagal (RLS blocking), pakai admin client
  if (!profile) {
    const adminSupabase = createAdminClient();

    const { data: existingProfile } = await adminSupabase
      .from("profiles")
      .select("nama, role, is_verified")
      .eq("id", user.id)
      .single();

    if (existingProfile) {
      profile = existingProfile;
    } else {
      // Buat profil baru
      const nama = user.user_metadata?.nama || user.email || "User";

      await adminSupabase.from("profiles").insert({
        id: user.id,
        nama,
        role: "member",
        no_hp: user.user_metadata?.no_hp || null,
        is_verified: false,
      });

      const { data: newProfile } = await adminSupabase
        .from("profiles")
        .select("nama, role, is_verified")
        .eq("id", user.id)
        .single();

      profile = newProfile;
    }
  }

  if (!profile || profile.role !== "member") {
    if (profile?.role === "admin") {
      redirect("/admin/dashboard");
    }
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <MemberLayoutClient profile={profile} userEmail={user.email ?? ""}>
      {children}
    </MemberLayoutClient>
  );
}
